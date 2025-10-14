import { retryAsync, CircuitBreaker, RetryStrategies } from '../retry';
import { AppError, ErrorType } from '../../types/errors';

// Mock timers
jest.useFakeTimers();

describe('Retry Utility', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('retryAsync', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await retryAsync(operation);
      
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');
      
      const promise = retryAsync(operation, { maxRetries: 3, initialDelay: 10 });
      
      // Fast forward timers
      jest.runAllTimers();
      
      const result = await promise;
      
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(3);
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should respect max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Always fails'));
      
      const promise = retryAsync(operation, { maxRetries: 2, initialDelay: 10 });
      jest.runAllTimers();
      
      await expect(promise).rejects.toThrow();
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should respect retry condition', async () => {
      const operation = jest.fn().mockRejectedValue(new AppError(ErrorType.VALIDATION, 'Invalid'));
      
      const promise = retryAsync(operation, {
        maxRetries: 3,
        retryCondition: (error) => error.type !== ErrorType.VALIDATION
      });
      
      await expect(promise).rejects.toThrow();
      expect(operation).toHaveBeenCalledTimes(1); // No retries for validation errors
    });

    it('should handle abort signal', async () => {
      const controller = new AbortController();
      const operation = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );
      
      const promise = retryAsync(operation, { signal: controller.signal });
      
      controller.abort();
      
      await expect(promise).rejects.toThrow('Operation was aborted');
    });

    it('should call onRetry callback', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');
      
      const onRetry = jest.fn();
      
      const promise = retryAsync(operation, { onRetry, initialDelay: 10 });
      jest.runAllTimers();
      
      await promise;
      
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('CircuitBreaker', () => {
    it('should start in closed state', () => {
      const breaker = new CircuitBreaker();
      expect(breaker.getState()).toBe('closed');
    });

    it('should open after failure threshold', async () => {
      const breaker = new CircuitBreaker(2, 1000);
      const operation = jest.fn().mockRejectedValue(new Error('Always fails'));
      
      // First failure
      try { await breaker.execute(operation); } catch {}
      expect(breaker.getState()).toBe('closed');
      
      // Second failure - should open
      try { await breaker.execute(operation); } catch {}
      expect(breaker.getState()).toBe('open');
    });

    it('should reject immediately when open', async () => {
      const breaker = new CircuitBreaker(1, 1000);
      const operation = jest.fn().mockRejectedValue(new Error('Fail'));
      
      // Trigger failure to open circuit
      try { await breaker.execute(operation); } catch {}
      
      // Next call should fail immediately
      await expect(breaker.execute(operation)).rejects.toThrow('Circuit breaker is open');
      expect(operation).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should reset on manual reset', () => {
      const breaker = new CircuitBreaker();
      breaker.reset();
      expect(breaker.getState()).toBe('closed');
    });
  });

  describe('RetryStrategies', () => {
    it('should have predefined strategies', () => {
      expect(RetryStrategies.conservative).toBeDefined();
      expect(RetryStrategies.aggressive).toBeDefined();
      expect(RetryStrategies.network).toBeDefined();
      expect(RetryStrategies.api).toBeDefined();
    });

    it('should have different retry counts', () => {
      expect(RetryStrategies.conservative.maxRetries).toBe(2);
      expect(RetryStrategies.aggressive.maxRetries).toBe(5);
    });
  });
});