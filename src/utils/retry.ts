import { AppError, ErrorType, createErrorFromException, isRetryableError } from '../types/errors';

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: AppError, attempt: number) => boolean;
  onRetry?: (error: AppError, attempt: number) => void;
  signal?: AbortSignal;
}

export interface RetryResult<T> {
  result: T;
  attempts: number;
  totalTime: number;
  errors: AppError[];
}

/**
 * Default retry condition - only retry on retryable errors
 */
const defaultRetryCondition = (error: AppError): boolean => {
  return isRetryableError(error);
};

/**
 * Calculate delay with exponential backoff and jitter
 */
const calculateDelay = (
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number => {
  const exponentialDelay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  const jitter = Math.random() * 0.1 * exponentialDelay; // Add 10% jitter
  return Math.min(exponentialDelay + jitter, maxDelay);
};

/**
 * Sleep utility for delays
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry an async operation with configurable options
 */
export async function retryAsync<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryCondition = defaultRetryCondition,
    onRetry,
    signal
  } = options;

  const errors: AppError[] = [];
  const startTime = Date.now();
  let attempt = 0;

  while (attempt <= maxRetries) {
    attempt++;

    // Check if operation was aborted
    if (signal?.aborted) {
      throw new AppError(
        ErrorType.UNKNOWN,
        'Operation was aborted',
        'The operation was cancelled',
        { context: { operation: 'retryAsync', retryCount: attempt - 1 } }
      );
    }

    try {
      const result = await operation();
      return {
        result,
        attempts: attempt,
        totalTime: Date.now() - startTime,
        errors
      };
    } catch (error) {
      const appError = createErrorFromException(error, {
        operation: 'retryAsync',
        retryCount: attempt - 1
      });
      
      errors.push(appError);

      // If this is the last attempt or error is not retryable, throw
      if (attempt > maxRetries || !retryCondition(appError, attempt)) {
        throw appError.withRetryCount(attempt - 1);
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(appError, attempt);
      }

      // Calculate and apply delay before next retry
      const delay = calculateDelay(attempt, initialDelay, maxDelay, backoffMultiplier);
      
      // Check for abort signal before delay
      if (signal?.aborted) {
        throw new AppError(
          ErrorType.UNKNOWN,
          'Operation was aborted during retry delay',
          'The operation was cancelled',
          { context: { operation: 'retryAsync', retryCount: attempt } }
        );
      }

      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript requires it
  throw errors[errors.length - 1] || new AppError(
    ErrorType.UNKNOWN,
    'Retry operation failed unexpectedly'
  );
}

/**
 * Retry with circuit breaker pattern
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold = 5,
    private recoveryTimeout = 60000
  ) {}

  async execute<T>(
    operation: () => Promise<T>,
    retryOptions?: RetryOptions
  ): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime < this.recoveryTimeout) {
        throw new AppError(
          ErrorType.API,
          'Circuit breaker is open',
          'Service is temporarily unavailable'
        );
      }
      this.state = 'half-open';
    }

    try {
      const result = await retryAsync(operation, retryOptions);
      
      // Reset on success
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }
      
      return result.result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.failureThreshold) {
        this.state = 'open';
      }

      throw error;
    }
  }

  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }

  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'closed';
  }
}

/**
 * Pre-configured retry strategies
 */
export const RetryStrategies = {
  /**
   * Conservative strategy for critical operations
   */
  conservative: {
    maxRetries: 2,
    initialDelay: 2000,
    maxDelay: 8000,
    backoffMultiplier: 2
  },

  /**
   * Aggressive strategy for non-critical operations
   */
  aggressive: {
    maxRetries: 5,
    initialDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 1.5
  },

  /**
   * Network-specific strategy
   */
  network: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryCondition: (error: AppError) => {
      return error.type === ErrorType.NETWORK || 
             error.type === ErrorType.TIMEOUT ||
             (error.type === ErrorType.API && error.context.statusCode && error.context.statusCode >= 500);
    }
  },

  /**
   * API-specific strategy with rate limit handling
   */
  api: {
    maxRetries: 4,
    initialDelay: 1000,
    maxDelay: 15000,
    backoffMultiplier: 2,
    retryCondition: (error: AppError) => {
      return error.type === ErrorType.API || 
             error.type === ErrorType.RATE_LIMIT ||
             error.type === ErrorType.NETWORK;
    }
  },

  /**
   * Quick retry for light operations
   */
  quick: {
    maxRetries: 2,
    initialDelay: 300,
    maxDelay: 1000,
    backoffMultiplier: 1.5
  }
};

/**
 * Utility to create AbortController with timeout
 */
export const createTimeoutController = (timeoutMs: number): AbortController => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller;
};

/**
 * Retry with timeout
 */
export async function retryWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  retryOptions?: RetryOptions
): Promise<T> {
  const controller = createTimeoutController(timeoutMs);
  
  try {
    const result = await retryAsync(operation, {
      ...retryOptions,
      signal: controller.signal
    });
    return result.result;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new AppError(
        ErrorType.TIMEOUT,
        `Operation timed out after ${timeoutMs}ms`,
        'The operation took too long to complete',
        { context: { timeout: timeoutMs } }
      );
    }
    throw error;
  }
};

/**
 * Batch retry operations with concurrency control
 */
export async function retryBatch<T>(
  operations: (() => Promise<T>)[],
  concurrency = 3,
  retryOptions?: RetryOptions
): Promise<Array<{ result?: T; error?: AppError; index: number }>> {
  const results: Array<{ result?: T; error?: AppError; index: number }> = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i];
    
    const executeWithRetry = retryAsync(operation, retryOptions)
      .then(({ result }) => {
        results[i] = { result, index: i };
      })
      .catch(error => {
        results[i] = { error: createErrorFromException(error), index: i };
      });

    executing.push(executeWithRetry);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      // Remove completed promises
      executing.splice(
        executing.findIndex(p => 
          results.some(r => r !== undefined)
        ), 1
      );
    }
  }

  // Wait for remaining operations
  await Promise.all(executing);

  return results.sort((a, b) => a.index - b.index);
}

// Export default retry function for convenience
export default retryAsync;