import { renderHook, act, waitFor } from "@testing-library/react";
import { useDebounce } from "../useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("should debounce value changes", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 300 } },
    );

    expect(result.current).toBe("initial");

    // Change value
    rerender({ value: "changed", delay: 300 });

    // Value should still be initial before delay
    expect(result.current).toBe("initial");

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Now value should be updated
    await waitFor(() => {
      expect(result.current).toBe("changed");
    });
  });

  it("should cancel previous timeout on rapid changes", async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } },
    );

    // Make rapid changes
    rerender({ value: "change1" });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: "change2" });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: "final" });

    // Value should still be initial
    expect(result.current).toBe("initial");

    // Fast-forward full delay from last change
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should update to final value, skipping intermediate changes
    await waitFor(() => {
      expect(result.current).toBe("final");
    });
  });

  it("should handle different delay values", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } },
    );

    rerender({ value: "changed", delay: 500 });

    act(() => {
      jest.advanceTimersByTime(400);
    });

    // Should not update yet
    expect(result.current).toBe("initial");

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Now should update
    await waitFor(() => {
      expect(result.current).toBe("changed");
    });
  });

  it("should use default delay of 300ms when not specified", async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "changed" });

    act(() => {
      jest.advanceTimersByTime(299);
    });

    expect(result.current).toBe("initial");

    act(() => {
      jest.advanceTimersByTime(1);
    });

    await waitFor(() => {
      expect(result.current).toBe("changed");
    });
  });

  it("should handle non-string values", async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 42 } },
    );

    expect(result.current).toBe(42);

    rerender({ value: 100 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current).toBe(100);
    });
  });

  it("should handle object values", async () => {
    const initialObj = { name: "test", count: 1 };
    const changedObj = { name: "updated", count: 2 };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: initialObj } },
    );

    expect(result.current).toBe(initialObj);

    rerender({ value: changedObj });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current).toBe(changedObj);
    });
  });
});
