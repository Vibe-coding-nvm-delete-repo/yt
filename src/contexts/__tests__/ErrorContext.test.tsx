import React from "react";
import { renderHook, act } from "@testing-library/react";
import { ErrorProvider, useErrorContext } from "../ErrorContext";
import { AppError, ErrorType, ErrorSeverity } from "../../types/errors";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorProvider>{children}</ErrorProvider>
);

describe("ErrorContext", () => {
  it("should provide error context", () => {
    const { result } = renderHook(() => useErrorContext(), { wrapper });

    expect(result.current.errors).toEqual([]);
    expect(result.current.hasErrors).toBe(false);
    expect(result.current.hasCriticalErrors).toBe(false);
  });

  it("should add errors", () => {
    const { result } = renderHook(() => useErrorContext(), { wrapper });

    act(() => {
      result.current.addError(new Error("Test error"), "TestComponent");
    });

    expect(result.current.hasErrors).toBe(true);
    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0]?.message).toBe("Test error");
  });

  it("should remove errors by ID", () => {
    const { result } = renderHook(() => useErrorContext(), { wrapper });

    let errorId: string;

    act(() => {
      const error = result.current.addError(new Error("Test error"));
      errorId = error.context.errorId!;
    });

    expect(result.current.hasErrors).toBe(true);

    act(() => {
      result.current.removeError(errorId);
    });

    expect(result.current.hasErrors).toBe(false);
  });

  it("should clear all errors", () => {
    const { result } = renderHook(() => useErrorContext(), { wrapper });

    act(() => {
      result.current.addError(new Error("Error 1"));
      result.current.addError(new Error("Error 2"));
    });

    expect(result.current.errors).toHaveLength(2);

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toHaveLength(0);
    expect(result.current.hasErrors).toBe(false);
  });

  it("should handle critical errors as global", () => {
    const { result } = renderHook(() => useErrorContext(), { wrapper });

    act(() => {
      result.current.addError(
        new AppError(ErrorType.API, "Critical error", "System failure", {
          severity: ErrorSeverity.CRITICAL,
        }),
      );
    });

    expect(result.current.hasCriticalErrors).toBe(true);
    expect(result.current.globalError).toBeTruthy();
  });

  it("should maintain error history", () => {
    const { result } = renderHook(() => useErrorContext(), { wrapper });

    act(() => {
      result.current.addError(new Error("Error 1"));
      result.current.addError(new Error("Error 2"));
      result.current.clearErrors();
    });

    // Errors cleared but history preserved
    expect(result.current.errors).toHaveLength(0);
    expect(result.current.errorHistory).toHaveLength(2);
  });

  it("should call onError callback", () => {
    const onError = jest.fn();

    const WrapperWithCallback = ({
      children,
    }: {
      children: React.ReactNode;
    }) => <ErrorProvider onError={onError}>{children}</ErrorProvider>;

    const { result } = renderHook(() => useErrorContext(), {
      wrapper: WrapperWithCallback,
    });

    act(() => {
      result.current.addError(new Error("Test error"));
    });

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("should throw error when used outside provider", () => {
    expect(() => {
      renderHook(() => useErrorContext());
    }).toThrow("useErrorContext must be used within an ErrorProvider");
  });
});
