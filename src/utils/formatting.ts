/**
 * Utility functions for formatting data across the application
 */

/**
 * Format a timestamp into a human-readable string
 */
export const formatTimestamp = (timestamp: number | null): string => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Format a price value into a currency string
 */
export const formatPrice = (
  price: number | string | null | undefined,
): string => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (typeof numPrice !== "number" || isNaN(numPrice) || !isFinite(numPrice)) {
    return "$0.00";
  }
  return `$${numPrice.toFixed(2)}`;
};

/**
 * Generate a unique ID for entities
 */
export const generateId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};
