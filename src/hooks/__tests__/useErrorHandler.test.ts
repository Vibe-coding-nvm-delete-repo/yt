import { renderHook, act } from "@testing-library/react";
import { useErrorHandler } from "../useErrorHandler";
import { ErrorType } from "../../types/errors";

jest.useFakeTimers();

describe("useErrorHandler", () => {
  const defaultTestRetryOptions = {
    maxRetries: 0,
    initialDelay: 0,
    maxDelay: 0,
    backoffMultiplier: 1,
  };

  afterEach(() => {
    jest.clearAllTimers();
  });

  it("should handle errors correctly", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error("Test error"), "TestComponent");
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error?.message).toBe("Test error");
    expect(result.current.error?.context.component).toBe("TestComponent");
  });

  it("should clear errors", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error("Test error"));
    });

    expect(result.current.isError).toBe(true);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should track error history", () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error("Error 1"));
      result.current.handleError(new Error("Error 2"));
    });

    expect(result.current.errorHistory).toHaveLength(2);
    expect(result.current.errorHistory[0]?.message).toBe("Error 1");
    expect(result.current.errorHistory[1]?.message).toBe("Error 2");
  });

  it("should execute async operations with error handling", async () => {
    const { result } = renderHook(() =>
      useErrorHandler({ defaultRetryOptions: defaultTestRetryOptions }),
    );

    const asyncOperation = jest.fn().mockResolvedValue("success");

    let resultValue;
    await act(async () => {
      resultValue = await result.current.executeWithErrorHandling(
        asyncOperation,
        "TestContext",
      );
    });

    expect(resultValue).toBe("success");
    expect(asyncOperation).toHaveBeenCalledTimes(1);
  });

  it("should handle async operation failures", async () => {
    const { result } = renderHook(() =>
      useErrorHandler({ defaultRetryOptions: defaultTestRetryOptions }),
    );

    const failingOperation = jest
      .fn()
      .mockRejectedValue(new Error("Async error"));

    await act(async () => {
      try {
        await result.current.executeWithErrorHandling(
          failingOperation,
          "TestContext",
        );
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error?.message).toBe("Async error");
  });

  it("should call onError callback", () => {
    const onError = jest.fn();
    const { result } = renderHook(() =>
      useErrorHandler({
        onError,
        defaultRetryOptions: defaultTestRetryOptions,
      }),
    );

    act(() => {
      result.current.handleError(new Error("Test error"));
    });

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("should track retry attempts", async () => {
    const { result } = renderHook(() =>
      useErrorHandler({ defaultRetryOptions: defaultTestRetryOptions }),
    );

    // First add an error with retryable option
    act(() => {
      const error = new Error("Retryable error");
      Object.defineProperty(error, "retryable", {
        value: true,
        writable: true,
      });
      result.current.handleError(error);
    });

    const retryOperation = jest.fn().mockResolvedValue(undefined);

    await act(async () => {
      await result.current.retry(retryOperation);
    });

    expect(retryOperation).toHaveBeenCalledTimes(1);
  });
});
