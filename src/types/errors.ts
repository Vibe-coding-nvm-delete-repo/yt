/**
 * Comprehensive Error Handling System for Async Operations
 * Provides structured error types, context, and user-friendly messages
 */

export enum ErrorType {
  NETWORK = "NETWORK",
  API = "API",
  VALIDATION = "VALIDATION",
  STORAGE = "STORAGE",
  TIMEOUT = "TIMEOUT",
  PERMISSION = "PERMISSION",
  RATE_LIMIT = "RATE_LIMIT",
  AUTHENTICATION = "AUTHENTICATION",
  UNKNOWN = "UNKNOWN",
}

export enum ErrorSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface ErrorContext {
  component?: string | undefined;
  operation?: string | undefined;
  timestamp: number;
  userId?: string | undefined;
  retryable?: boolean | undefined;
  retryCount?: number | undefined;
  stackTrace?: string | undefined;
  requestId?: string | undefined;
  userAgent?: string | undefined;
  url?: string | undefined;
  statusCode?: number | undefined;
  metadata?: Record<string, unknown> | undefined;
  errorId?: string | undefined;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: AppError) => boolean;
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly code?: string;
  public readonly context: ErrorContext;
  public readonly userMessage: string;
  public readonly retryable: boolean;
  public readonly retryConfig?: RetryConfig;
  public readonly originalError?: Error;

  constructor(
    type: ErrorType,
    message: string,
    userMessage?: string,
    options?: {
      code?: string;
      severity?: ErrorSeverity;
      context?: Partial<ErrorContext>;
      retryable?: boolean;
      retryConfig?: RetryConfig;
      originalError?: Error;
    },
  ) {
    super(message);
    this.name = "AppError";
    this.type = type;
    this.severity = options?.severity || this.getDefaultSeverity(type);
    if (options?.code !== undefined) {
      this.code = options.code;
    }
    this.userMessage = userMessage || this.getDefaultUserMessage(type);
    this.retryable = options?.retryable ?? this.getDefaultRetryable(type);
    if (options?.retryConfig !== undefined) {
      this.retryConfig = options.retryConfig;
    }
    if (options?.originalError !== undefined) {
      this.originalError = options.originalError;
    }

    // Fix for exactOptionalPropertyTypes: Build context carefully without
    // introducing incompatible defaults that force optional properties to concrete types
    const baseContext: ErrorContext = {
      timestamp: Date.now(),
      retryable: this.retryable,
      retryCount: 0,
      stackTrace: this.stack ?? undefined,
    };

    // Only spread provided context if it exists, preserving undefined values
    this.context = options?.context
      ? { ...baseContext, ...options.context }
      : baseContext;

    // Maintain proper stack trace (only available on V8)
    const ErrorConstructor = Error as {
      captureStackTrace?: (target: object, constructor: unknown) => void;
    };
    if (ErrorConstructor.captureStackTrace) {
      ErrorConstructor.captureStackTrace(this, AppError);
    }
  }

  private getDefaultSeverity(type: ErrorType): ErrorSeverity {
    const severityMap: Record<ErrorType, ErrorSeverity> = {
      [ErrorType.NETWORK]: ErrorSeverity.MEDIUM,
      [ErrorType.API]: ErrorSeverity.MEDIUM,
      [ErrorType.VALIDATION]: ErrorSeverity.LOW,
      [ErrorType.STORAGE]: ErrorSeverity.HIGH,
      [ErrorType.TIMEOUT]: ErrorSeverity.MEDIUM,
      [ErrorType.PERMISSION]: ErrorSeverity.HIGH,
      [ErrorType.RATE_LIMIT]: ErrorSeverity.MEDIUM,
      [ErrorType.AUTHENTICATION]: ErrorSeverity.HIGH,
      [ErrorType.UNKNOWN]: ErrorSeverity.MEDIUM,
    };
    return severityMap[type];
  }

  private getDefaultUserMessage(type: ErrorType): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.NETWORK]:
        "Connection issue. Please check your internet and try again.",
      [ErrorType.API]:
        "Service temporarily unavailable. Please try again in a moment.",
      [ErrorType.VALIDATION]:
        "The information provided is invalid. Please check your input.",
      [ErrorType.STORAGE]: "Unable to save your data. Please try again.",
      [ErrorType.TIMEOUT]: "Request timed out. Please try again.",
      [ErrorType.PERMISSION]: "Access denied. Please check your permissions.",
      [ErrorType.RATE_LIMIT]:
        "Too many requests. Please wait a moment and try again.",
      [ErrorType.AUTHENTICATION]: "Authentication failed. Please log in again.",
      [ErrorType.UNKNOWN]: "An unexpected error occurred. Please try again.",
    };
    return messages[type];
  }

  private getDefaultRetryable(type: ErrorType): boolean {
    const retryableTypes = [
      ErrorType.NETWORK,
      ErrorType.API,
      ErrorType.TIMEOUT,
      ErrorType.RATE_LIMIT,
    ];
    return retryableTypes.includes(type);
  }

  public withRetryCount(count: number): AppError {
    return new AppError(this.type, this.message, this.userMessage, {
      ...(this.code !== undefined && { code: this.code }),
      severity: this.severity,
      context: { ...this.context, retryCount: count },
      retryable: this.retryable,
      ...(this.retryConfig !== undefined && { retryConfig: this.retryConfig }),
      ...(this.originalError !== undefined && {
        originalError: this.originalError,
      }),
    });
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      type: this.type,
      severity: this.severity,
      message: this.message,
      userMessage: this.userMessage,
      code: this.code,
      retryable: this.retryable,
      context: this.context,
      stack: this.stack,
    };
  }
}

// Specific error classes unchanged...
export class NetworkError extends AppError {
  constructor(
    message: string,
    userMessage?: string,
    context?: Partial<ErrorContext>,
    options?: { originalError?: Error },
  ) {
    super(ErrorType.NETWORK, message, userMessage, {
      ...(context !== undefined && { context }),
      retryable: true,
      retryConfig: {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
      },
      ...(options?.originalError !== undefined && {
        originalError: options.originalError,
      }),
    });
  }
}

export class APIError extends AppError {
  constructor(
    message: string,
    statusCode?: number,
    userMessage?: string,
    context?: Partial<ErrorContext>,
  ) {
    super(ErrorType.API, message, userMessage, {
      context: { ...context, statusCode },
      retryable: statusCode ? statusCode >= 500 : true,
      ...(statusCode && { code: `HTTP_${statusCode}` }),
    });
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    field?: string,
    userMessage?: string,
    context?: Partial<ErrorContext>,
  ) {
    const metadata = field !== undefined ? { field } : undefined;
    const mergedContext = context ? { ...context } : {};

    if (metadata) {
      mergedContext.metadata = {
        ...(context?.metadata ?? {}),
        ...metadata,
      };
    }

    super(ErrorType.VALIDATION, message, userMessage, {
      ...(Object.keys(mergedContext).length > 0 && { context: mergedContext }),
      retryable: false,
    });
  }
}

export class StorageError extends AppError {
  constructor(
    message: string,
    operation?: string,
    context?: Partial<ErrorContext>,
  ) {
    super(ErrorType.STORAGE, message, undefined, {
      ...(context !== undefined || operation !== undefined
        ? { context: { ...context, operation } }
        : {}),
      retryable: true,
      severity: ErrorSeverity.HIGH,
    });
  }
}

export class TimeoutError extends AppError {
  constructor(
    message: string,
    timeout?: number,
    context?: Partial<ErrorContext>,
  ) {
    super(ErrorType.TIMEOUT, message, undefined, {
      ...(context !== undefined || timeout !== undefined
        ? { context: { ...context, metadata: { timeout } } }
        : {}),
      retryable: true,
    });
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string,
    retryAfter?: number,
    context?: Partial<ErrorContext>,
  ) {
    super(ErrorType.RATE_LIMIT, message, undefined, {
      ...(context !== undefined || retryAfter !== undefined
        ? { context: { ...context, metadata: { retryAfter } } }
        : {}),
      retryable: true,
      retryConfig: {
        maxRetries: 3,
        initialDelay: retryAfter ? retryAfter * 1000 : 5000,
        maxDelay: 60000,
        backoffMultiplier: 1.5,
      },
    });
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, context?: Partial<ErrorContext>) {
    super(ErrorType.AUTHENTICATION, message, undefined, {
      ...(context !== undefined && { context }),
      retryable: false,
      severity: ErrorSeverity.HIGH,
    });
  }
}

// Error factory functions
export const createErrorFromResponse = (
  response: Response,
  message?: string,
): AppError => {
  const status = response.status;
  const statusText = response.statusText;
  const url = response.url;

  if (status === 401 || status === 403) {
    return new AuthenticationError(
      message || `Authentication failed: ${statusText}`,
      { url, statusCode: status },
    );
  }

  if (status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    return new RateLimitError(
      message || `Rate limit exceeded: ${statusText}`,
      retryAfter ? parseInt(retryAfter, 10) : undefined,
      { url, statusCode: status },
    );
  }

  if (status >= 400 && status < 500) {
    return new ValidationError(
      message || `Client error: ${statusText}`,
      undefined,
      undefined,
      { url, statusCode: status },
    );
  }

  if (status >= 500) {
    return new APIError(
      message || `Server error: ${statusText}`,
      status,
      undefined,
      { url },
    );
  }

  return new NetworkError(
    message || `Network error: ${statusText}`,
    undefined,
    { url, statusCode: status },
  );
};

export const createErrorFromException = (
  error: unknown,
  context?: Partial<ErrorContext>,
): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    return new NetworkError(
      "Network connection failed",
      "Unable to connect to the server. Please check your connection.",
      context,
      { originalError: error },
    );
  }

  if (error instanceof Error) {
    return new AppError(ErrorType.UNKNOWN, error.message, undefined, {
      // Fix for exactOptionalPropertyTypes: only include context if defined
      ...(context !== undefined && { context }),
      retryable: true,
      originalError: error,
    });
  }

  return new AppError(
    ErrorType.UNKNOWN,
    "An unknown error occurred",
    undefined,
    {
      // Fix for exactOptionalPropertyTypes: only include context if defined
      ...(context !== undefined && { context }),
    },
  );
};

// Type guards unchanged...
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const isRetryableError = (error: unknown): boolean => {
  return isAppError(error) && error.retryable;
};

export const getErrorSeverity = (error: unknown): ErrorSeverity => {
  if (isAppError(error)) {
    return error.severity;
  }
  return ErrorSeverity.MEDIUM;
};

export const getErrorType = (error: unknown): ErrorType => {
  if (isAppError(error)) {
    return error.type;
  }
  return ErrorType.UNKNOWN;
};
