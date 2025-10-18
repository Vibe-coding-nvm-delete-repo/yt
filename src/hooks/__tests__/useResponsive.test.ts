import { renderHook, act } from "@testing-library/react";
import {
  useResponsive,
  useBreakpoint,
  useMobileFirst,
  BREAKPOINTS,
} from "../useResponsive";

// Mock window dimensions
const mockWindowSize = (width: number, height: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: height,
  });
};

// Mock touch device detection
const mockTouchDevice = (isTouch: boolean) => {
  if (isTouch) {
    Object.defineProperty(window, "ontouchstart", {
      writable: true,
      configurable: true,
      value: {},
    });
    Object.defineProperty(navigator, "maxTouchPoints", {
      writable: true,
      configurable: true,
      value: 5,
    });
  } else {
    Object.defineProperty(window, "ontouchstart", {
      writable: true,
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "maxTouchPoints", {
      writable: true,
      configurable: true,
      value: 0,
    });
  }
};

beforeEach(() => {
  jest.useFakeTimers();
  mockWindowSize(1024, 768);
  mockTouchDevice(false);
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useResponsive", () => {
  it("should return initial desktop state", () => {
    mockWindowSize(1024, 768);
    const { result } = renderHook(() => useResponsive());

    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.breakpoint).toBe("lg");
    expect(result.current.isLandscape).toBe(true);
    expect(result.current.isPortrait).toBe(false);
  });

  it("should detect mobile breakpoint", () => {
    mockWindowSize(480, 800);
    const { result } = renderHook(() => useResponsive());

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.breakpoint).toBe("xs");
  });

  it("should detect tablet breakpoint", () => {
    mockWindowSize(768, 1024);
    const { result } = renderHook(() => useResponsive());

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.breakpoint).toBe("md");
  });

  it("should detect portrait orientation", () => {
    mockWindowSize(768, 1024);
    const { result } = renderHook(() => useResponsive());

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isPortrait).toBe(true);
    expect(result.current.isLandscape).toBe(false);
  });

  it("should update on window resize", () => {
    mockWindowSize(1024, 768);
    const { result } = renderHook(() => useResponsive());

    expect(result.current.width).toBe(1024);
    expect(result.current.isDesktop).toBe(true);

    act(() => {
      mockWindowSize(480, 800);
      window.dispatchEvent(new Event("resize"));
      jest.advanceTimersByTime(200);
    });

    expect(result.current.width).toBe(480);
    expect(result.current.isMobile).toBe(true);
  });

  it("should debounce resize events", () => {
    const { result } = renderHook(() => useResponsive());
    const initialWidth = result.current.width;

    act(() => {
      mockWindowSize(800, 600);
      window.dispatchEvent(new Event("resize"));
      jest.advanceTimersByTime(100); // Less than 150ms
    });

    expect(result.current.width).toBe(initialWidth);

    act(() => {
      jest.advanceTimersByTime(100); // Total 200ms
    });

    expect(result.current.width).toBe(800);
  });

  it("should handle orientation change", () => {
    mockWindowSize(768, 1024);
    const { result } = renderHook(() => useResponsive());

    act(() => {
      mockWindowSize(1024, 768);
      window.dispatchEvent(new Event("orientationchange"));
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isLandscape).toBe(true);
    expect(result.current.isPortrait).toBe(false);
  });

  it("should detect touch device", () => {
    mockTouchDevice(true);
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isTouchDevice).toBe(true);
  });

  it("should not detect touch on non-touch device", () => {
    // Reset touch properties
    delete (window as { ontouchstart?: unknown }).ontouchstart;
    Object.defineProperty(navigator, "maxTouchPoints", {
      writable: true,
      configurable: true,
      value: 0,
    });

    const { result } = renderHook(() => useResponsive());

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isTouchDevice).toBe(false);
  });

  it("should detect all breakpoints correctly", () => {
    const testCases = [
      { width: 400, expected: "xs" },
      { width: 640, expected: "sm" },
      { width: 768, expected: "md" },
      { width: 1024, expected: "lg" },
      { width: 1280, expected: "xl" },
      { width: 1536, expected: "2xl" },
    ];

    testCases.forEach(({ width, expected }) => {
      mockWindowSize(width, 768);
      const { result } = renderHook(() => useResponsive());

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current.breakpoint).toBe(expected);
    });
  });

  it("should prevent unnecessary re-renders when size does not change", () => {
    const { result } = renderHook(() => useResponsive());
    const initialState = result.current;

    act(() => {
      // Trigger resize with same dimensions
      window.dispatchEvent(new Event("resize"));
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe(initialState); // Should be same reference
  });

  it("should clean up event listeners on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useResponsive());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "orientationchange",
      expect.any(Function),
    );
  });
});

describe("useBreakpoint", () => {
  it("should return true when width is above breakpoint", () => {
    mockWindowSize(1024, 768);
    const { result } = renderHook(() => useBreakpoint("md"));

    expect(result.current).toBe(true);
  });

  it("should return false when width is below breakpoint", () => {
    mockWindowSize(600, 800);
    const { result } = renderHook(() => useBreakpoint("lg"));

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe(false);
  });

  it("should update when breakpoint changes", () => {
    mockWindowSize(700, 600);
    const { result } = renderHook(() => useBreakpoint("md"));

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe(false);

    act(() => {
      mockWindowSize(800, 600);
      window.dispatchEvent(new Event("resize"));
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe(true);
  });
});

describe("useMobileFirst", () => {
  it("should return responsive state with utility properties", () => {
    mockWindowSize(768, 1024);
    const { result } = renderHook(() => useMobileFirst());

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toHaveProperty("isMobile");
    expect(result.current).toHaveProperty("isTablet");
    expect(result.current).toHaveProperty("isDesktop");
    expect(result.current).toHaveProperty("width");
    expect(result.current).toHaveProperty("height");
  });

  it("should work with mobile dimensions", () => {
    mockWindowSize(375, 667);
    const { result } = renderHook(() => useMobileFirst());

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isMobile).toBe(true);
  });

  it("should work with tablet dimensions", () => {
    mockWindowSize(768, 1024);
    const { result } = renderHook(() => useMobileFirst());

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isTablet).toBe(true);
  });

  it("should work with desktop dimensions", () => {
    mockWindowSize(1920, 1080);
    const { result } = renderHook(() => useMobileFirst());

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isDesktop).toBe(true);
  });
});

describe("BREAKPOINTS", () => {
  it("should export correct breakpoint values", () => {
    expect(BREAKPOINTS.sm).toBe(640);
    expect(BREAKPOINTS.md).toBe(768);
    expect(BREAKPOINTS.lg).toBe(1024);
    expect(BREAKPOINTS.xl).toBe(1280);
    expect(BREAKPOINTS["2xl"]).toBe(1536);
  });
});
