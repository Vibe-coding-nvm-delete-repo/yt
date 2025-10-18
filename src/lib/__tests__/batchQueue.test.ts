import runWithConcurrency from "@/lib/batchQueue";

describe("runWithConcurrency", () => {
  beforeEach(() => {
    // Don't use fake timers - causes deadlocks
    jest.resetAllMocks();
  });

  afterEach(() => {});

  test("runs tasks with concurrency limit", async () => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(3),
      () => Promise.resolve(4),
    ];

    const results = await runWithConcurrency(tasks, { concurrency: 2 });
    expect(results.results).toEqual([1, 2, 3, 4]);
  });

  test("handles task failures gracefully", async () => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.reject(new Error("Task failed")),
      () => Promise.resolve(3),
    ];

    const results = await runWithConcurrency(tasks, { concurrency: 2 });
    expect(results.results).toHaveLength(3);
    expect(results.results[0]).toBe(1);
    expect(results.results[1]).toBeInstanceOf(Error);
    expect(results.results[2]).toBe(3);
  });

  test("respects concurrency limit", async () => {
    const running: number[] = [];
    const completed: number[] = [];

    const tasks = Array.from({ length: 4 }, (_, i) => async () => {
      running.push(i);
      await new Promise((resolve) => setTimeout(resolve, 100));
      completed.push(i);
      running.splice(running.indexOf(i), 1);
      return i;
    });

    const promise = runWithConcurrency(tasks, { concurrency: 2 });

    // After starting, only 2 tasks should be running
    await Promise.resolve(); // Let the first batch start
    expect(running).toHaveLength(2);

    jest.advanceTimersByTime(100);
    await promise;

    expect(completed).toEqual([0, 1, 2, 3]);
  });

  test("cancels tasks when signal is aborted", async () => {
    const controller = new AbortController();
    // Abort before starting
    controller.abort();

    const tasks = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(3),
    ];

    try {
      await runWithConcurrency(tasks, {
        concurrency: 2,
        signal: controller.signal,
      });
      fail("Should have thrown AbortError");
    } catch (err) {
      expect((err as DOMException).name).toBe("AbortError");
    }
  }, 10000);

  test("retries failed tasks", async () => {
    let attempts = 0;
    const task = () => {
      attempts++;
      if (attempts <= 2) {
        return Promise.reject(new Error("Temporary failure"));
      }
      return Promise.resolve("success");
    };

    const results = await runWithConcurrency([task], {
      concurrency: 1,
      retryAttempts: 3,
      retryDelay: 100,
    });

    expect(results.results[0]).toBe("success");
    expect(attempts).toBe(3);
  });

  test("calls progress callback", async () => {
    const progressCallback = jest.fn();
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
      () => Promise.resolve(3),
    ];

    await runWithConcurrency(tasks, {
      concurrency: 2,
      onProgress: progressCallback,
    });

    // Progress is called with (completed, total)
    expect(progressCallback).toHaveBeenCalledTimes(3);
    expect(progressCallback).toHaveBeenCalledWith(1, 3);
    expect(progressCallback).toHaveBeenCalledWith(2, 3);
    expect(progressCallback).toHaveBeenCalledWith(3, 3);
  });

  test("handles AbortSignal to cancel tasks", async () => {
    const abortController = new AbortController();
    const tasks = [
      () => Promise.resolve(1),
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return 2;
      },
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return 3;
      },
    ];

    // Abort after a short delay
    setTimeout(() => abortController.abort(), 20);

    await expect(
      runWithConcurrency(tasks, {
        concurrency: 1,
        signal: abortController.signal,
      }),
    ).rejects.toThrow("Aborted");
  });

  test("handles abort during delay", async () => {
    const abortController = new AbortController();
    const tasks = [() => Promise.resolve(1)];

    // Abort before running
    abortController.abort();

    await expect(
      runWithConcurrency(tasks, {
        concurrency: 1,
        retryDelay: 100,
        signal: abortController.signal,
      }),
    ).rejects.toThrow("Aborted");
  });

  test("handles non-Error exceptions gracefully", async () => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.reject("string error"),
      () => Promise.resolve(3),
    ];

    const results = await runWithConcurrency(tasks, { concurrency: 2 });

    expect(results.results).toHaveLength(3);
    expect(results.results[0]).toBe(1);
    expect(results.results[1]).toBeInstanceOf(Error);
    expect(results.results[2]).toBe(3);
  });
});
