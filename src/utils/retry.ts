import {
  AppError,
  ErrorType,
  createErrorFromException,
  isRetryableError,
} from "../types/errors";

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

const defaultRetryCondition = (error: AppError): boolean => {
  return isRetryableError(error);
};

const calculateDelay = (
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number,
): number => {
  const exponentialDelay =
    initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  const jitter = Math.random() * 0.1 * exponentialDelay;
  return Math.min(exponentialDelay + jitter, maxDelay);
};

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export async function retryAsync<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<RetryResult<T>> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryCondition = defaultRetryCondition,
    onRetry,
    signal,
  } = options;

  const errors: AppError[] = [];
  const startTime = Date.now();
  let attempt = 0;

  try {
    while (attempt <= maxRetries) {
      attempt++;

      if (signal?.aborted) {
        throw new AppError(
          ErrorType.UNKNOWN,
          "Operation was aborted",
          "The operation was cancelled",
          { context: { operation: "retryAsync", retryCount: attempt - 1 } },
        );
      }

      try {
        const operationPromise = operation();
        type OperationResult = Awaited<ReturnType<typeof operation>>;
        const result = signal
          ? await new Promise<OperationResult>((resolve, reject) => {
              const abortHandler = () => {
                signal.removeEventListener("abort", abortHandler);
                reject(
                  new AppError(
                    ErrorType.UNKNOWN,
                    "Operation was aborted",
                    "The operation was cancelled",
                    {
                      context: {
                        operation: "retryAsync",
                        retryCount: attempt - 1,
                      },
                    },
                  ),
                );
              };

              if (signal.aborted) {
                abortHandler();
                return;
              }

              signal.addEventListener("abort", abortHandler, { once: true });

              operationPromise
                .then((value) => {
                  signal.removeEventListener("abort", abortHandler);
                  resolve(value as OperationResult);
                })
                .catch((err) => {
                  signal.removeEventListener("abort", abortHandler);
                  reject(err);
                });
            })
          : await operationPromise;
        return {
          result,
          attempts: attempt,
          totalTime: Date.now() - startTime,
          errors,
        };
      } catch (error) {
        const appError = createErrorFromException(error, {
          operation: "retryAsync",
          retryCount: attempt - 1,
        });

        errors.push(appError);

        if (attempt > maxRetries || !retryCondition(appError, attempt)) {
          throw appError.withRetryCount(attempt - 1);
        }

        if (onRetry) {
          onRetry(appError, attempt);
        }

        const delay = calculateDelay(
          attempt,
          initialDelay,
          maxDelay,
          backoffMultiplier,
        );

        if (delay > 0) {
          if (signal?.aborted) {
            throw new AppError(
              ErrorType.UNKNOWN,
              "Operation was aborted during retry delay",
              "The operation was cancelled",
              { context: { operation: "retryAsync", retryCount: attempt } },
            );
          }

          await sleep(delay);
        }
      }
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }

  throw (
    errors[errors.length - 1] ||
    new AppError(ErrorType.UNKNOWN, "Retry operation failed unexpectedly")
  );
}

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(
    private failureThreshold = 5,
    private recoveryTimeout = 60000,
  ) {}

  async execute<T>(
    operation: () => Promise<T>,
    retryOptions?: RetryOptions,
  ): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime < this.recoveryTimeout) {
        throw new AppError(
          ErrorType.API,
          "Circuit breaker is open",
          "Service is temporarily unavailable",
        );
      }
      this.state = "half-open";
    }

    try {
      const result = await retryAsync(operation, retryOptions);

      if (this.state === "half-open") {
        this.state = "closed";
        this.failures = 0;
      }

      return result.result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.failureThreshold) {
        this.state = "open";
      }

      throw error;
    }
  }

  getState(): "closed" | "open" | "half-open" {
    return this.state;
  }

  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = "closed";
  }
}

export const RetryStrategies = {
  conservative: {
    maxRetries: 2,
    initialDelay: 2000,
    maxDelay: 8000,
    backoffMultiplier: 2,
  },
  aggressive: {
    maxRetries: 5,
    initialDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 1.5,
  },
  network: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryCondition: (error: AppError) => {
      return (
        error.type === ErrorType.NETWORK ||
        error.type === ErrorType.TIMEOUT ||
        (error.type === ErrorType.API &&
          error.context.statusCode &&
          error.context.statusCode >= 500)
      );
    },
  },
  api: {
    maxRetries: 4,
    initialDelay: 1000,
    maxDelay: 15000,
    backoffMultiplier: 2,
    retryCondition: (error: AppError) => {
      return (
        error.type === ErrorType.API ||
        error.type === ErrorType.RATE_LIMIT ||
        error.type === ErrorType.NETWORK
      );
    },
  },
  quick: {
    maxRetries: 2,
    initialDelay: 300,
    maxDelay: 1000,
    backoffMultiplier: 1.5,
  },
};

export default retryAsync;
