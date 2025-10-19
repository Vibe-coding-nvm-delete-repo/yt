import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useRenderTracker,
  useComponentLifecycle,
  useOperationTimer,
  useMemoryMonitor,
  usePerformanceMonitor,
} from "../usePerformance";

describe("useRenderTracker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should track render count", () => {
    const { result, rerender } = renderHook(() =>
      useRenderTracker("TestComponent", { enabled: true }),
    );

    const initialMetrics = result.current.getMetrics();
    expect(initialMetrics?.renderCount).toBeGreaterThan(0);

    rerender();
    const afterRerender = result.current.getMetrics();
    expect(afterRerender?.renderCount).toBeGreaterThan(
      initialMetrics?.renderCount ?? 0,
    );
  });

  it("should not track when disabled", () => {
    const { result } = renderHook(() =>
      useRenderTracker("TestComponent", { enabled: false }),
    );

    expect(result.current.getMetrics()).toBeNull();
  });

  it("should detect rapid renders", () => {
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

    const { rerender } = renderHook(() =>
      useRenderTracker("TestComponent", {
        enabled: true,
        logThreshold: 2,
        rapidRenderWindowMs: 1000,
      }),
    );

    // Trigger multiple rapid re-renders
    for (let i = 0; i < 5; i++) {
      rerender();
    }

    // Should have warned about excessive re-renders
    expect(consoleWarn).toHaveBeenCalled();
    expect(consoleWarn.mock.calls[0]?.[0]).toContain("Excessive re-renders");

    consoleWarn.mockRestore();
  });

  it("should reset counter periodically", () => {
    jest.useFakeTimers();

    const { result, rerender } = renderHook(() =>
      useRenderTracker("TestComponent", { enabled: true }),
    );

    // Trigger some renders
    rerender();
    rerender();

    const beforeReset = result.current.getMetrics();
    expect(beforeReset?.renderCount).toBeGreaterThan(0);

    // Fast-forward time to trigger reset
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    const afterReset = result.current.getMetrics();
    expect(afterReset?.renderCount).toBe(0);

    jest.useRealTimers();
  });

  it("should calculate average render interval", () => {
    const { result, rerender } = renderHook(() =>
      useRenderTracker("TestComponent", { enabled: true }),
    );

    rerender();
    rerender();

    const metrics = result.current.getMetrics();
    expect(metrics?.averageRenderInterval).toBeGreaterThanOrEqual(0);
  });

  it("should track lifespan", () => {
    const { result } = renderHook(() =>
      useRenderTracker("TestComponent", { enabled: true }),
    );

    const metrics = result.current.getMetrics();
    expect(metrics?.lifespan).toBeGreaterThanOrEqual(0);
  });
});

describe("useComponentLifecycle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should log mount when enabled", () => {
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

    renderHook(() =>
      useComponentLifecycle("TestComponent", {
        enabled: true,
        logMount: true,
      }),
    );

    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("[Lifecycle] TestComponent mounted"),
    );

    consoleWarn.mockRestore();
  });

  it("should log unmount when enabled", () => {
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

    const { unmount } = renderHook(() =>
      useComponentLifecycle("TestComponent", {
        enabled: true,
        logUnmount: true,
      }),
    );

    unmount();

    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("[Lifecycle] TestComponent unmounted"),
    );

    consoleWarn.mockRestore();
  });

  it("should not log when disabled", () => {
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

    const { unmount } = renderHook(() =>
      useComponentLifecycle("TestComponent", { enabled: false }),
    );

    unmount();

    expect(consoleWarn).not.toHaveBeenCalled();

    consoleWarn.mockRestore();
  });

  it("should track lifecycle metrics", () => {
    const { result } = renderHook(() =>
      useComponentLifecycle("TestComponent", { enabled: true }),
    );

    const metrics = result.current.getLifecycleMetrics();
    expect(metrics).toBeTruthy();
    expect(metrics?.mountTime).toBeGreaterThan(0);
    expect(metrics?.currentLifespan).toBeGreaterThanOrEqual(0);
  });

  it("should return null when disabled", () => {
    const { result } = renderHook(() =>
      useComponentLifecycle("TestComponent", { enabled: false }),
    );

    expect(result.current.getLifecycleMetrics()).toBeNull();
  });

  it("should skip logging when logMount is false", () => {
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

    renderHook(() =>
      useComponentLifecycle("TestComponent", {
        enabled: true,
        logMount: false,
      }),
    );

    expect(consoleWarn).not.toHaveBeenCalled();

    consoleWarn.mockRestore();
  });

  it("should skip logging when logUnmount is false", () => {
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

    const { unmount } = renderHook(() =>
      useComponentLifecycle("TestComponent", {
        enabled: true,
        logUnmount: false,
      }),
    );

    consoleWarn.mockClear(); // Clear mount log
    unmount();

    expect(consoleWarn).not.toHaveBeenCalled();

    consoleWarn.mockRestore();
  });
});

describe("useOperationTimer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should start and end timer", () => {
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

    const { result } = renderHook(() => useOperationTimer(true));

    act(() => {
      result.current.startTimer("testOperation");
    });

    act(() => {
      const duration = result.current.endTimer("testOperation");
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("[Performance] testOperation:"),
    );

    consoleWarn.mockRestore();
  });

  it("should warn when timer not started", () => {
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

    const { result } = renderHook(() => useOperationTimer(true));

    act(() => {
      const duration = result.current.endTimer("nonExistent");
      expect(duration).toBe(0);
    });

    expect(consoleWarn).toHaveBeenCalledWith(
      "Timer 'nonExistent' was not started",
    );

    consoleWarn.mockRestore();
  });

  it("should not log when logResult is false", () => {
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

    const { result } = renderHook(() => useOperationTimer(true));

    act(() => {
      result.current.startTimer("testOperation");
      result.current.endTimer("testOperation", false);
    });

    expect(consoleWarn).not.toHaveBeenCalled();

    consoleWarn.mockRestore();
  });

  it("should time async operations", async () => {
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

    const { result } = renderHook(() => useOperationTimer(true));

    await act(async () => {
      const operation = async () => {
        return new Promise((resolve) =>
          setTimeout(() => resolve("result"), 10),
        );
      };

      const { result: opResult, duration } = await result.current.timeOperation(
        "asyncOp",
        operation,
      );

      expect(opResult).toBe("result");
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    consoleWarn.mockRestore();
  });

  it("should handle operation errors", async () => {
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation();
    const consoleError = jest.spyOn(console, "error").mockImplementation();

    const { result } = renderHook(() => useOperationTimer(true));

    await act(async () => {
      const operation = async () => {
        throw new Error("Operation failed");
      };

      await expect(
        result.current.timeOperation("failingOp", operation),
      ).rejects.toThrow("Operation failed");
    });

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("[Performance] failingOp failed:"),
      expect.any(Error),
    );

    consoleWarn.mockRestore();
    consoleError.mockRestore();
  });

  it("should time synchronous operations", async () => {
    const { result } = renderHook(() => useOperationTimer(true));

    await act(async () => {
      const operation = () => "sync result";

      const { result: opResult, duration } = await result.current.timeOperation(
        "syncOp",
        operation,
      );

      expect(opResult).toBe("sync result");
      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });

  it("should return zero duration when disabled", async () => {
    const { result } = renderHook(() => useOperationTimer(false));

    await act(async () => {
      const operation = async () => "result";

      const { result: opResult, duration } = await result.current.timeOperation(
        "disabledOp",
        operation,
      );

      expect(opResult).toBe("result");
      expect(duration).toBe(0);
    });
  });

  it("should not track when disabled", () => {
    const { result } = renderHook(() => useOperationTimer(false));

    act(() => {
      result.current.startTimer("test");
      const duration = result.current.endTimer("test");
      expect(duration).toBe(0);
    });
  });
});

describe("useMemoryMonitor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return null when memory API not available", () => {
    const { result } = renderHook(() =>
      useMemoryMonitor("TestComponent", { enabled: true }),
    );

    expect(result.current.getCurrentMemoryUsage()).toBeNull();
  });

  it("should return null when disabled", () => {
    const { result } = renderHook(() =>
      useMemoryMonitor("TestComponent", { enabled: false }),
    );

    expect(result.current.getCurrentMemoryUsage()).toBeNull();
  });

  it("should get current memory usage when available", () => {
    const mockMemory = {
      usedJSHeapSize: 10 * 1024 * 1024,
      totalJSHeapSize: 20 * 1024 * 1024,
      jsHeapSizeLimit: 100 * 1024 * 1024,
    };

    Object.defineProperty(performance, "memory", {
      value: mockMemory,
      configurable: true,
    });

    const { result } = renderHook(() =>
      useMemoryMonitor("TestComponent", { enabled: true }),
    );

    const usage = result.current.getCurrentMemoryUsage();
    expect(usage).toBeTruthy();
    expect(usage?.usedJSMemory).toBe(mockMemory.usedJSHeapSize);
    expect(usage?.totalJSMemory).toBe(mockMemory.totalJSHeapSize);
    expect(usage?.memoryLimit).toBe(mockMemory.jsHeapSizeLimit);

    // Clean up
    delete (performance as any).memory;
  });

  it("should convert bytes to MB", () => {
    const mockMemory = {
      usedJSHeapSize: 10 * 1024 * 1024, // 10MB
      totalJSHeapSize: 20 * 1024 * 1024, // 20MB
      jsHeapSizeLimit: 100 * 1024 * 1024, // 100MB
    };

    Object.defineProperty(performance, "memory", {
      value: mockMemory,
      configurable: true,
    });

    const { result } = renderHook(() =>
      useMemoryMonitor("TestComponent", { enabled: true }),
    );

    const usage = result.current.getCurrentMemoryUsage();
    expect(usage?.usedMB).toBeCloseTo(10);
    expect(usage?.totalMB).toBeCloseTo(20);
    expect(usage?.limitMB).toBeCloseTo(100);

    // Clean up
    delete (performance as any).memory;
  });
});

describe("usePerformanceMonitor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should combine all monitoring capabilities", () => {
    const { result } = renderHook(() =>
      usePerformanceMonitor("TestComponent", { enabled: true }),
    );

    expect(result.current.getMetrics).toBeDefined();
    expect(result.current.getLifecycleMetrics).toBeDefined();
    expect(result.current.getCurrentMemoryUsage).toBeDefined();
    expect(result.current.startTimer).toBeDefined();
    expect(result.current.endTimer).toBeDefined();
    expect(result.current.timeOperation).toBeDefined();
  });

  it("should allow selective monitoring", () => {
    const { result } = renderHook(() =>
      usePerformanceMonitor("TestComponent", {
        enabled: true,
        trackRenders: true,
        trackLifecycle: false,
        trackMemory: false,
      }),
    );

    expect(result.current.getMetrics).toBeDefined();
  });

  it("should return null for getAllMetrics when disabled", () => {
    const { result } = renderHook(() =>
      usePerformanceMonitor("TestComponent", { enabled: false }),
    );

    expect(result.current.getAllMetrics()).toBeNull();
  });

  it("should get all metrics when enabled", () => {
    const { result } = renderHook(() =>
      usePerformanceMonitor("TestComponent", { enabled: true }),
    );

    const metrics = result.current.getAllMetrics();
    expect(metrics).toBeTruthy();
    expect(metrics?.componentName).toBe("TestComponent");
    expect(metrics?.renders).toBeDefined();
    expect(metrics?.lifecycle).toBeDefined();
  });

  it("should respect trackRenders option", () => {
    const { result: withRenders } = renderHook(() =>
      usePerformanceMonitor("TestComponent", {
        enabled: true,
        trackRenders: true,
      }),
    );

    const { result: withoutRenders } = renderHook(() =>
      usePerformanceMonitor("TestComponent", {
        enabled: true,
        trackRenders: false,
      }),
    );

    const metricsWithRenders = withRenders.current.getAllMetrics();
    const metricsWithoutRenders = withoutRenders.current.getAllMetrics();

    expect(metricsWithRenders?.renders).toBeDefined();
    expect(metricsWithoutRenders?.renders).toBeNull();
  });

  it("should respect trackLifecycle option", () => {
    const { result: withLifecycle } = renderHook(() =>
      usePerformanceMonitor("TestComponent", {
        enabled: true,
        trackLifecycle: true,
      }),
    );

    const { result: withoutLifecycle } = renderHook(() =>
      usePerformanceMonitor("TestComponent", {
        enabled: true,
        trackLifecycle: false,
      }),
    );

    const metricsWithLifecycle = withLifecycle.current.getAllMetrics();
    const metricsWithoutLifecycle = withoutLifecycle.current.getAllMetrics();

    expect(metricsWithLifecycle?.lifecycle).toBeDefined();
    expect(metricsWithoutLifecycle?.lifecycle).toBeNull();
  });

  it("should default trackMemory to false", () => {
    const { result } = renderHook(() =>
      usePerformanceMonitor("TestComponent", { enabled: true }),
    );

    const metrics = result.current.getAllMetrics();
    expect(metrics?.memory).toBeNull();
  });

  it("should track memory when enabled", () => {
    const { result } = renderHook(() =>
      usePerformanceMonitor("TestComponent", {
        enabled: true,
        trackMemory: true,
      }),
    );

    const metrics = result.current.getAllMetrics();
    // Memory will be null unless the browser supports it
    expect(metrics?.memory).toBeDefined();
  });
});
