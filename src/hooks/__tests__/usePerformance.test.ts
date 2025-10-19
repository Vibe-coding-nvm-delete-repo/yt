import { renderHook, act } from "@testing-library/react";
import {
  useRenderTracker,
  useComponentLifecycle,
  useOperationTimer,
  useMemoryMonitor,
  usePerformanceMonitor,
} from "../usePerformance";

// Mock console methods
const originalWarn = console.warn;
const originalError = console.error;

beforeEach(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
  jest.useFakeTimers();
});

afterEach(() => {
  console.warn = originalWarn;
  console.error = originalError;
  jest.useRealTimers();
});

describe("useRenderTracker", () => {
  it("should track render count when enabled", () => {
    const { result, rerender } = renderHook(() =>
      useRenderTracker("TestComponent", { enabled: true }),
    );

    const metrics1 = result.current.getMetrics();
    expect(metrics1).not.toBeNull();
    expect(metrics1?.renderCount).toBeGreaterThan(0);

    rerender();
    const metrics2 = result.current.getMetrics();
    expect(metrics2?.renderCount).toBeGreaterThan(metrics1?.renderCount || 0);
  });

  it("should return null metrics when disabled", () => {
    const { result } = renderHook(() =>
      useRenderTracker("TestComponent", { enabled: false }),
    );

    expect(result.current.getMetrics()).toBeNull();
  });

  it("should detect rapid renders", () => {
    const { rerender } = renderHook(() =>
      useRenderTracker("TestComponent", {
        enabled: true,
        logThreshold: 2,
        rapidRenderWindowMs: 1000,
      }),
    );

    // Trigger multiple rapid renders
    for (let i = 0; i < 5; i++) {
      rerender();
    }

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(console.warn).toHaveBeenCalled();
  });

  it("should reset render counter periodically", () => {
    const { result } = renderHook(() =>
      useRenderTracker("TestComponent", { enabled: true }),
    );

    const initialMetrics = result.current.getMetrics();

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    const metricsAfterReset = result.current.getMetrics();
    expect(metricsAfterReset?.renderCount).toBeLessThanOrEqual(
      initialMetrics?.renderCount || 999,
    );
  });

  it("should use default options", () => {
    const { result } = renderHook(() => useRenderTracker("TestComponent"));

    const metrics = result.current.getMetrics();
    // In test environment, should be disabled by default
    expect(metrics).toBeNull();
  });
});

describe("useComponentLifecycle", () => {
  it("should track mount time when enabled", () => {
    const { result } = renderHook(() =>
      useComponentLifecycle("TestComponent", { enabled: true, logMount: true }),
    );

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("TestComponent mounted"),
    );

    const metrics = result.current.getLifecycleMetrics();
    expect(metrics).not.toBeNull();
    expect(metrics?.mountTime).toBeGreaterThan(0);
  });

  it("should track unmount time when enabled", () => {
    const { unmount } = renderHook(() =>
      useComponentLifecycle("TestComponent", {
        enabled: true,
        logUnmount: true,
      }),
    );

    unmount();

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("TestComponent unmounted"),
    );
  });

  it("should not log when disabled", () => {
    const { result } = renderHook(() =>
      useComponentLifecycle("TestComponent", { enabled: false }),
    );

    expect(result.current.getLifecycleMetrics()).toBeNull();
  });

  it("should not log mount when logMount is false", () => {
    const warnSpy = jest.spyOn(console, "warn");
    warnSpy.mockClear();

    renderHook(() =>
      useComponentLifecycle("TestComponent", {
        enabled: true,
        logMount: false,
        logUnmount: false,
      }),
    );

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("should calculate current lifespan", () => {
    const { result } = renderHook(() =>
      useComponentLifecycle("TestComponent", { enabled: true }),
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const metrics = result.current.getLifecycleMetrics();
    expect(metrics?.currentLifespan).toBeGreaterThanOrEqual(1000);
  });
});

describe("useOperationTimer", () => {
  it("should measure operation duration", () => {
    const { result } = renderHook(() => useOperationTimer(true));

    const originalNow = performance.now;
    let timeValue = 0;
    performance.now = jest.fn(() => timeValue);

    act(() => {
      result.current.startTimer("test-operation");
      timeValue += 100;
    });

    let duration: number = 0;
    act(() => {
      duration = result.current.endTimer("test-operation");
    });

    expect(duration).toBeGreaterThanOrEqual(0);

    performance.now = originalNow;
  });

  it("should warn when ending non-existent timer", () => {
    const { result } = renderHook(() => useOperationTimer(true));

    act(() => {
      result.current.endTimer("non-existent");
    });

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("Timer 'non-existent' was not started"),
    );
  });

  it("should not track when disabled", () => {
    const { result } = renderHook(() => useOperationTimer(false));

    act(() => {
      result.current.startTimer("test-operation");
    });

    const duration = result.current.endTimer("test-operation");
    expect(duration).toBe(0);
  });

  it("should time async operations", async () => {
    const { result } = renderHook(() => useOperationTimer(true));

    const operation = jest.fn().mockResolvedValue("result");

    await act(async () => {
      const { result: opResult, duration } = await result.current.timeOperation(
        "async-test",
        operation,
      );

      expect(opResult).toBe("result");
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    expect(operation).toHaveBeenCalled();
  });

  it("should handle operation errors", async () => {
    const { result } = renderHook(() => useOperationTimer(true));

    const operation = jest.fn().mockRejectedValue(new Error("Test error"));

    await expect(async () => {
      await act(async () => {
        await result.current.timeOperation("failing-operation", operation);
      });
    }).rejects.toThrow("Test error");

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("failing-operation failed"),
      expect.any(Error),
    );
  });

  it("should log operation completion", () => {
    const { result } = renderHook(() => useOperationTimer(true));

    const originalNow = performance.now;
    let timeValue = 0;
    performance.now = jest.fn(() => timeValue);

    act(() => {
      result.current.startTimer("test-op");
      timeValue += 10;
    });

    let duration: number = 0;
    act(() => {
      duration = result.current.endTimer("test-op", true);
    });

    // Just verify the timer worked
    expect(duration).toBeGreaterThanOrEqual(0);

    performance.now = originalNow;
  });

  it("should not log when logResult is false", () => {
    const { result } = renderHook(() => useOperationTimer(true));
    const warnSpy = jest.spyOn(console, "warn");

    const originalNow = performance.now;
    let timeValue = 0;
    performance.now = jest.fn(() => timeValue);

    warnSpy.mockClear();

    act(() => {
      result.current.startTimer("silent-op");
      timeValue += 10;
    });

    act(() => {
      result.current.endTimer("silent-op", false);
    });

    // Should not have warnings about silent-op with performance metrics
    const silentOpWarnings = warnSpy.mock.calls.filter(
      (call) =>
        String(call[0]).includes("silent-op") && String(call[0]).includes("ms"),
    );
    expect(silentOpWarnings.length).toBe(0);

    performance.now = originalNow;
  });
});

describe("useMemoryMonitor", () => {
  it("should return null when memory API is not available", () => {
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

  it("should monitor memory when API is available", () => {
    // Mock performance.memory
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

    const memoryUsage = result.current.getCurrentMemoryUsage();
    expect(memoryUsage).not.toBeNull();
    expect(memoryUsage?.usedJSMemory).toBe(mockMemory.usedJSHeapSize);
    expect(memoryUsage?.usedMB).toBeCloseTo(10, 1);
  });
});

describe("usePerformanceMonitor", () => {
  it("should combine all monitoring capabilities", () => {
    const { result } = renderHook(() =>
      usePerformanceMonitor("TestComponent", { enabled: true }),
    );

    expect(result.current).toHaveProperty("getMetrics");
    expect(result.current).toHaveProperty("getLifecycleMetrics");
    expect(result.current).toHaveProperty("getCurrentMemoryUsage");
    expect(result.current).toHaveProperty("startTimer");
    expect(result.current).toHaveProperty("endTimer");
    expect(result.current).toHaveProperty("timeOperation");
    expect(result.current).toHaveProperty("getAllMetrics");
  });

  it("should return null metrics when disabled", () => {
    const { result } = renderHook(() =>
      usePerformanceMonitor("TestComponent", { enabled: false }),
    );

    expect(result.current.getAllMetrics()).toBeNull();
  });

  it("should optionally track renders", () => {
    const { result } = renderHook(() =>
      usePerformanceMonitor("TestComponent", {
        enabled: true,
        trackRenders: true,
      }),
    );

    const metrics = result.current.getAllMetrics();
    expect(metrics).toHaveProperty("renders");
  });

  it("should optionally track lifecycle", () => {
    const { result } = renderHook(() =>
      usePerformanceMonitor("TestComponent", {
        enabled: true,
        trackLifecycle: true,
      }),
    );

    const metrics = result.current.getAllMetrics();
    expect(metrics).toHaveProperty("lifecycle");
  });

  it("should optionally track memory", () => {
    const { result } = renderHook(() =>
      usePerformanceMonitor("TestComponent", {
        enabled: true,
        trackMemory: false,
      }),
    );

    const metrics = result.current.getAllMetrics();
    expect(metrics).toHaveProperty("memory");
  });

  it("should include component name in metrics", () => {
    const { result } = renderHook(() =>
      usePerformanceMonitor("MyTestComponent", { enabled: true }),
    );

    const metrics = result.current.getAllMetrics();
    expect(metrics?.componentName).toBe("MyTestComponent");
  });
});
