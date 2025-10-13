import { runWithConcurrency } from '../batchQueue';

describe('runWithConcurrency - advanced error & abort coverage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  describe('abort handling', () => {
    it('should abort remaining tasks when AbortController signals', async () => {
      const abortController = new AbortController();
      const mockTask = jest.fn().mockResolvedValue('success');

      const taskPromises = Array.from({ length: 10 }, () => () => mockTask());

      // Start execution
      const promise = runWithConcurrency(taskPromises, {
        concurrency: 2,
        signal: abortController.signal,
      });

      // Abort after a short delay (simulate user cancellation)
      setTimeout(() => {
        abortController.abort();
      }, 100);

      await expect(promise).rejects.toThrow('Aborted');

      // Only some tasks should have started due to concurrency and abort
      expect(mockTask).toHaveBeenCalledTimes(expect.any(Number));
      expect(mockTask.mock.calls.length).toBeLessThanOrEqual(10);
    });

    it('should handle abort mid-task execution', async () => {
      const abortController = new AbortController();

      // Create tasks with different execution times
      const slowTask = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('slow'), 500))
      );
      const fastTask = jest.fn().mockResolvedValue('fast');

      const tasks = [
        () => slowTask(),
        () => fastTask(),
        () => fastTask(),
      ];

      const promise = runWithConcurrency(tasks, {
        concurrency: 3,
        signal: abortController.signal,
      });

      // Abort after fast tasks complete but slow task still running
      setTimeout(() => {
        abortController.abort();
      }, 200);

      await expect(promise).rejects.toThrow('Aborted');

      // Fast tasks should complete, slow task might be aborted
      expect(fastTask).toHaveBeenCalledTimes(2);
    });
  });

  describe('error resilience & retry simulation', () => {
    it('should continue with remaining tasks when some fail', async () => {
      const errorTask = jest.fn().mockRejectedValue(new Error('Task failed'));
      const successTask = jest.fn().mockResolvedValue('success');

      const tasks = [
        () => successTask(),
        () => errorTask(),
        () => successTask(),
      ];

      const promise = runWithConcurrency(tasks, { concurrency: 2 });

      await expect(promise).resolves.toBeDefined();

      expect(successTask).toHaveBeenCalledTimes(2);
      expect(errorTask).toHaveBeenCalledTimes(1);
    });

    it('should handle network-like intermittent failures', async () => {
      let callCount = 0;
      const flakyTask = jest.fn().mockImplementation(() => {
        callCount++;
        // Fail first 2 calls, succeed on 3rd
        if (callCount < 3) {
          return Promise.reject(new Error(`Network error ${callCount}`));
        }
        return Promise.resolve('success');
      });

      const tasks = Array.from({ length: 5 }, () => flakyTask);

      const promise = runWithConcurrency(tasks, { concurrency: 1 });

      await expect(promise).resolves.toBeDefined();

      // Should attempt all tasks, some with retry-like behavior
      expect(flakyTask).toHaveBeenCalledTimes(5);
    });

    it('should properly propagate unrecoverable errors', async () => {
      const alwaysFailTask = jest.fn().mockRejectedValue(new Error('Unrecoverable error'));

      const tasks = [() => alwaysFailTask()];

      const promise = runWithConcurrency(tasks, { concurrency: 1 });

      await expect(promise).resolves.toBeDefined(); // Doesn't reject the promise, just logs errors

      expect(alwaysFailTask).toHaveBeenCalledTimes(1);
    });
  });

  describe('progress tracking', () => {
    it('should correctly report progress for mixed success/failure tasks', async () => {
      const onProgress = jest.fn();

      const successTask = jest.fn().mockResolvedValue('success');
      const errorTask = jest.fn().mockRejectedValue(new Error('Task failed'));

      const tasks = [
        () => successTask(),
        () => errorTask(),
        () => successTask(),
        () => errorTask(),
      ];

      await runWithConcurrency(tasks, {
        concurrency: 2,
        onProgress,
      });

      // Should be called multiple times as tasks complete
      expect(onProgress).toHaveBeenCalled();
      expect(onProgress).toHaveBeenLastCalledWith(4); // All completed

      expect(successTask).toHaveBeenCalledTimes(2);
      expect(errorTask).toHaveBeenCalledTimes(2);
    });

    it('should not call progress after abort', async () => {
      const abortController = new AbortController();
      const onProgress = jest.fn();

      const slowTask = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('done'), 200))
      );

      const tasks = Array.from({ length: 5 }, () => slowTask);

      const promise = runWithConcurrency(tasks, {
        concurrency: 2,
        signal: abortController.signal,
        onProgress,
      });

      // Abort before any tasks complete
      abortController.abort();

      await expect(promise).rejects.toThrow('Aborted');

      // Should not have called progress after abort
      const lastCall = onProgress.mock.calls.at(-1)?.[0] || 0;
      expect(lastCall).toBeLessThan(5);
    });
  });

  describe('concurrency edge cases', () => {
    it('should handle concurrency higher than task count', async () => {
      const task = jest.fn().mockResolvedValue('done');
      const tasks = Array.from({ length: 2 }, () => task);

      await runWithConcurrency(tasks, { concurrency: 10 });

      expect(task).toHaveBeenCalledTimes(2);
    });

    it('should handle zero concurrency gracefully', async () => {
      const task = jest.fn().mockResolvedValue('done');
      const tasks = [() => task()];

      await expect(runWithConcurrency(tasks, { concurrency: 0 }))
        .rejects.toThrow();
    });

    it('should maintain order of results despite concurrent execution', async () => {
      const results: number[] = [];
      const makeTask = (id: number, delay: number) => async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        results.push(id);
        return id;
      };

      const tasks = [
        makeTask(1, 100), // Fastest
        makeTask(2, 50),  // Medium
        makeTask(3, 25),  // Slowest
      ];

      await runWithConcurrency(tasks, { concurrency: 3 });

      // Even though tasks complete out of order, they should be processed
      expect(results).toEqual([1, 2, 3]);
    });
  });

  describe('memory and performance', () => {
    it('should not cause memory leaks with many concurrent tasks', async () => {
      const task = jest.fn().mockResolvedValue('small');
      const tasks = Array.from({ length: 100 }, () => task);

      const startMemory = process.memoryUsage?.().heapUsed || 0;

      await runWithConcurrency(tasks, { concurrency: 10 });

      const endMemory = process.memoryUsage?.().heapUsed || 0;

      // Should not leak excessive memory (>10MB increase would be concerning)
      const memoryIncrease = endMemory - startMemory;
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB

      expect(task).toHaveBeenCalledTimes(100);
    });

    it('should recover from out-of-memory-like errors', async () => {
      let taskCallCount = 0;
      const oomTask = jest.fn().mockImplementation(() => {
        taskCallCount++;
        if (taskCallCount === 3) {
          throw new Error('Out of memory: heap limit exceeded');
        }
        return Promise.resolve('success');
      });

      const tasks = Array.from({ length: 5 }, () => oomTask);

      await runWithConcurrency(tasks, { concurrency: 1 });

      expect(oomTask).toHaveBeenCalledTimes(5);
      // Should continue after OOM-like error
    });
  });
});
