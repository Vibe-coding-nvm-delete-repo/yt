/**
 * Truncation utilities for displaying long strings with middle-ellipsis
 * @module utils/truncation
 */

/**
 * Truncates a string using middle-ellipsis to preserve both start and end context
 * @param str - The string to truncate
 * @param maxLen - Maximum length including the ellipsis
 * @returns The truncated string with middle ellipsis, or the original if shorter than maxLen
 * 
 * @example
 * middleEllipsis("anthropic/claude-3-opus-20240229-v1:0", 30)
 * // Returns: "anthropic/cl...9-v1:0"
 */
export function middleEllipsis(str: string, maxLen: number): string {
  if (!str || str.length <= maxLen) {
    return str;
  }

  if (maxLen < 4) {
    // If maxLen is too small, just return the beginning
    return str.slice(0, Math.max(0, maxLen));
  }

  // Reserve 3 characters for "..."
  const availableChars = maxLen - 3;
  const start = Math.ceil(availableChars / 2);
  const end = Math.floor(availableChars / 2);

  return `${str.slice(0, start)}...${str.slice(-end)}`;
}

/**
 * Gets responsive max length based on screen width
 * @param screenWidth - Current screen width in pixels
 * @returns Appropriate maxLen value
 */
export function getResponsiveMaxLength(screenWidth: number): number {
  if (screenWidth < 640) {
    // Mobile: sm breakpoint
    return 20;
  } else if (screenWidth < 768) {
    // Tablet: md breakpoint
    return 30;
  } else if (screenWidth < 1024) {
    // Desktop: lg breakpoint
    return 40;
  } else {
    // Large desktop: xl+ breakpoint
    return 50;
  }
}

/**
 * Hook-friendly function to get current responsive max length
 * Uses window.innerWidth, safe to call in browser only
 */
export function getCurrentResponsiveMaxLength(): number {
  if (typeof window === 'undefined') {
    return 40; // Default for SSR
  }
  return getResponsiveMaxLength(window.innerWidth);
}
