/**
 * Integration tests for the complete error handling system
 */
import {
  AppError,
  ErrorType,
  ErrorSeverity,
  createErrorFromException,
} from "../types/errors";
import { retryAsync, CircuitBreaker } from "../utils/retry";

describe("Error Handling Integration", () => {
  it("should integrate error types with retry logic", async () => {
    let attempts = 0;
    const operation = jest.fn(async () => {
      attempts++;
      if (attempts < 3) {
        throw new AppError(
          ErrorType.NETWORK,
          "Network failed",
          "Connection issue",
          { retryable: true },
        );
      }
      return "success";
    });

    const result = await retryAsync(operation, {
      maxRetries: 3,
      initialDelay: 1,
      retryCondition: (error) => error.retryable,
    });

    expect(result.result).toBe("success");
    expect(result.attempts).toBe(3);
  });

  it("should handle non-retryable errors immediately", async () => {
    const operation = jest.fn(() => {
      throw new AppError(
        ErrorType.VALIDATION,
        "Invalid input",
        "Please check your data",
        { retryable: false },
      );
    });

    await expect(retryAsync(operation, { maxRetries: 3 })).rejects.toThrow(
      "Invalid input",
    );

    expect(operation).toHaveBeenCalledTimes(1); // No retries
  });

  it("should work with circuit breaker pattern", async () => {
    const breaker = new CircuitBreaker(2, 1000);
    const operation = jest
      .fn()
      .mockRejectedValue(new AppError(ErrorType.API, "API failed"));

    // First failure
    try {
      await breaker.execute(operation, {
        maxRetries: 0,
        initialDelay: 0,
        maxDelay: 0,
      });
    } catch (error: unknown) {
      // Expected to fail - testing circuit breaker failure detection
      expect(error).toBeDefined();
    }
    expect(breaker.getState()).toBe("closed");

    // Second failure - opens circuit
    try {
      await breaker.execute(operation, {
        maxRetries: 0,
        initialDelay: 0,
        maxDelay: 0,
      });
    } catch (error: unknown) {
      // Expected to fail - second failure should open the circuit
      expect(error).toBeDefined();
    }
    expect(breaker.getState()).toBe("open");

    // Third attempt should fail immediately
    await expect(
      breaker.execute(operation, {
        maxRetries: 0,
        initialDelay: 0,
        maxDelay: 0,
      }),
    ).rejects.toThrow("Circuit breaker is open");

    expect(operation).toHaveBeenCalledTimes(2); // Third call blocked
  });

  it("should create appropriate errors from exceptions", () => {
    // Network error
    const networkError = createErrorFromException(
      new TypeError("fetch failed"),
    );
    expect(networkError.type).toBe(ErrorType.NETWORK);

    // Generic error
    const genericError = createErrorFromException(new Error("Something broke"));
    expect(genericError.type).toBe(ErrorType.UNKNOWN);

    // Already AppError
    const existingError = new AppError(ErrorType.API, "API error");
    const wrappedError = createErrorFromException(existingError);
    expect(wrappedError).toBe(existingError); // Same instance
  });

  it("should handle error context properly", () => {
    const error = new AppError(ErrorType.API, "Test error", "User message", {
      context: {
        component: "TestComponent",
        operation: "testOperation",
        metadata: { key: "value" },
      },
    });

    expect(error.context.component).toBe("TestComponent");
    expect(error.context.operation).toBe("testOperation");
    expect(error.context.metadata?.key).toBe("value");
    expect(error.context.timestamp).toBeGreaterThan(0);
  });

  it("should serialize errors correctly", () => {
    const error = new AppError(
      ErrorType.VALIDATION,
      "Validation failed",
      "Invalid data",
    );

    const json = error.toJSON();

    expect(json.name).toBe("AppError");
    expect(json.type).toBe(ErrorType.VALIDATION);
    expect(json.severity).toBe(ErrorSeverity.LOW);
    expect(json.message).toBe("Validation failed");
    expect(json.userMessage).toBe("Invalid data");
    expect(json.retryable).toBe(false);
    expect(json.context).toBeDefined();
  });
});
