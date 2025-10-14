"use client";

import { useState, useEffect } from "react";

/**
 * Responsive breakpoints matching Tailwind CSS defaults
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

export interface ResponsiveState {
  /** Current window width */
  width: number;
  /** Current window height */
  height: number;
  /** Is mobile device (< sm breakpoint) */
  isMobile: boolean;
  /** Is tablet device (>= sm, < lg) */
  isTablet: boolean;
  /** Is desktop device (>= lg) */
  isDesktop: boolean;
  /** Current active breakpoint */
  breakpoint: BreakpointKey | "xs";
  /** Is touch device */
  isTouchDevice: boolean;
  /** Is landscape orientation */
  isLandscape: boolean;
  /** Is portrait orientation */
  isPortrait: boolean;
}

/**
 * Get the current breakpoint based on width
 */
function getBreakpoint(width: number): BreakpointKey | "xs" {
  if (width >= BREAKPOINTS["2xl"]) return "2xl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
}

/**
 * Detect if device supports touch
 */
function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - legacy support for msMaxTouchPoints
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Hook for responsive design and device detection
 * Provides breakpoint information and device capabilities
 */
export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => {
    // SSR-safe initial state
    if (typeof window === "undefined") {
      return {
        width: 1024, // Default desktop width for SSR
        height: 768,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        breakpoint: "lg",
        isTouchDevice: false,
        isLandscape: true,
        isPortrait: false,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getBreakpoint(width);
    const isMobile = width < BREAKPOINTS.sm;
    const isTablet = width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg;
    const isDesktop = width >= BREAKPOINTS.lg;
    const isLandscape = width > height;
    const isPortrait = height >= width;

    return {
      width,
      height,
      isMobile,
      isTablet,
      isDesktop,
      breakpoint,
      isTouchDevice: isTouchDevice(),
      isLandscape,
      isPortrait,
    };
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const breakpoint = getBreakpoint(width);
      const isMobile = width < BREAKPOINTS.sm;
      const isTablet = width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg;
      const isDesktop = width >= BREAKPOINTS.lg;
      const isLandscape = width > height;
      const isPortrait = height >= width;

      setState((prev) => {
        // Only update if values actually changed to prevent unnecessary re-renders
        if (
          prev.width === width &&
          prev.height === height &&
          prev.breakpoint === breakpoint
        ) {
          return prev;
        }

        return {
          width,
          height,
          isMobile,
          isTablet,
          isDesktop,
          breakpoint,
          isTouchDevice: isTouchDevice(),
          isLandscape,
          isPortrait,
        };
      });
    };

    // Debounced resize handler to prevent excessive re-renders
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateState, 150);
    };

    // Initial update on mount
    updateState();

    // Listen for resize events
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, {
      passive: true,
    });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return state;
};

/**
 * Utility hook to check if current screen matches a breakpoint
 */
export const useBreakpoint = (breakpoint: BreakpointKey): boolean => {
  const { width } = useResponsive();
  return width >= BREAKPOINTS[breakpoint];
};

/**
 * Utility hook for mobile-first responsive design
 */
export const useMobileFirst = () => {
  const responsive = useResponsive();
  return {
    ...responsive,
    /** Show mobile layout */
    showMobile: responsive.isMobile,
    /** Show tablet layout */
    showTablet: responsive.isTablet,
    /** Show desktop layout */
    showDesktop: responsive.isDesktop,
    /** Adaptive touch target size */
    touchTargetSize: responsive.isMobile ? "h-12 min-h-[48px]" : "h-10",
    /** Adaptive padding */
    adaptivePadding: responsive.isMobile ? "p-3" : "p-4",
    /** Adaptive text size */
    adaptiveTextSize: responsive.isMobile ? "text-sm" : "text-base",
  };
};
