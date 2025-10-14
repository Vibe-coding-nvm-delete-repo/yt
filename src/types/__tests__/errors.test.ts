import {
  ErrorType,
  ErrorSeverity,
  AppError,
  NetworkError,
  APIError,
  ValidationError,
  createErrorFromResponse,
  createErrorFromException,
  isAppError,
  isRetryableError
} from '../errors';

describe('Error Types', () => {
  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError(
        ErrorType.API,
        'Test error',
        'User friendly message'
      );

      expect(error.type).toBe(ErrorType.API);
      expect(error.message).toBe('Test error');
      expect(error.userMessage).toBe('User friendly message');
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.context.timestamp).toBeGreaterThan(0);
    });

    it('should have default user messages', () => {
      const error = new AppError(ErrorType.NETWORK, 'Network failed');
      expect(error.userMessage).toBe('Connection issue. Please check your internet and try again.');
    });

    it('should determine retryable status', () => {
      const networkError = new AppError(ErrorType.NETWORK, 'Failed');
      const validationError = new AppError(ErrorType.VALIDATION, 'Invalid');
      
      expect(networkError.retryable).toBe(true);
      expect(validationError.retryable).toBe(false);
    });

    it('should serialize to JSON correctly', () => {
      const error = new AppError(ErrorType.API, 'Test', 'User message');
      const json = error.toJSON();
      
      expect(json.type).toBe(ErrorType.API);
      expect(json.message).toBe('Test');
      expect(json.userMessage).toBe('User message');
    });
  });

  describe('Specific Error Classes', () => {
    it('should create NetworkError with retry config', () => {
      const error = new NetworkError('Network failed');
      
      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.retryable).toBe(true);
      expect(error.retryConfig?.maxRetries).toBe(3);
    });

    it('should create APIError with status code', () => {
      const error = new APIError('API failed', 500);
      
      expect(error.type).toBe(ErrorType.API);
      expect(error.context.statusCode).toBe(500);
      expect(error.code).toBe('HTTP_500');
    });

    it('should create ValidationError as non-retryable', () => {
      const error = new ValidationError('Invalid input', 'email');
      
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.retryable).toBe(false);
      expect(error.context.metadata?.field).toBe('email');
    });
  });

  describe('Factory Functions', () => {
    it('should create error from Response', () => {
      const mockResponse = {
        status: 401,
        statusText: 'Unauthorized',
        url: 'https://api.example.com'
      } as Response;

      const error = createErrorFromResponse(mockResponse);
      
      expect(error.type).toBe(ErrorType.AUTHENTICATION);
      expect(error.context.statusCode).toBe(401);
    });

    it('should create error from exception', () => {
      const exception = new TypeError('fetch failed');
      const error = createErrorFromException(exception);
      
      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.originalError).toBe(exception);
    });

    it('should handle unknown exceptions', () => {
      const error = createErrorFromException('string error');
      expect(error.type).toBe(ErrorType.UNKNOWN);
    });

    // Test for exactOptionalPropertyTypes compatibility
    it('should accept undefined optional fields with exactOptionalPropertyTypes', () => {
      // This test reproduces the build failure scenario
      const componentName: string | undefined = undefined;
      const stackTrace: string | undefined = undefined;
      
      // This should not cause TypeScript compilation errors
      const error = createErrorFromException(new Error('test'), {
        component: componentName,
        operation: 'render',
        stackTrace: stackTrace
      });
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.context.component).toBe(undefined);
      expect(error.context.stackTrace).toBe(undefined);
    });
  });

  describe('Type Guards', () => {
    it('should identify AppError instances', () => {
      const appError = new AppError(ErrorType.API, 'Test');
      const regularError = new Error('Test');
      
      expect(isAppError(appError)).toBe(true);
      expect(isAppError(regularError)).toBe(false);
    });

    it('should identify retryable errors', () => {
      const retryable = new AppError(ErrorType.NETWORK, 'Test');
      const nonRetryable = new AppError(ErrorType.VALIDATION, 'Test');
      
      expect(isRetryableError(retryable)).toBe(true);
      expect(isRetryableError(nonRetryable)).toBe(false);
    });
  });
});