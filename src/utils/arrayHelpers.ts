/**
 * Common array utilities for type-safe operations
 */

/**
 * Check if an array is empty
 */
export const isEmpty = <T>(array: T[] | null | undefined): boolean => {
  return !array || array.length === 0;
};

/**
 * Check if an array is not empty
 */
export const isNotEmpty = <T>(array: T[] | null | undefined): boolean => {
  return !isEmpty(array);
};

/**
 * Get the first element of an array safely
 */
export const first = <T>(array: T[] | null | undefined): T | undefined => {
  return array && array.length > 0 ? array[0] : undefined;
};

/**
 * Get the last element of an array safely
 */
export const last = <T>(array: T[] | null | undefined): T | undefined => {
  return array && array.length > 0 ? array[array.length - 1] : undefined;
};

/**
 * Remove duplicates from an array
 */
export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

/**
 * Remove duplicates from an array using a key selector
 */
export const uniqueBy = <T, K>(
  array: T[],
  keySelector: (item: T) => K,
): T[] => {
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keySelector(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

/**
 * Chunk an array into smaller arrays of specified size
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  if (size <= 0) {
    throw new Error("Chunk size must be greater than 0");
  }
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Partition an array into two arrays based on a predicate
 */
export const partition = <T>(
  array: T[],
  predicate: (item: T) => boolean,
): [T[], T[]] => {
  const truthy: T[] = [];
  const falsy: T[] = [];
  array.forEach((item) => {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  });
  return [truthy, falsy];
};

/**
 * Safely access an array element by index
 */
export const at = <T>(
  array: T[] | null | undefined,
  index: number,
): T | undefined => {
  if (!array || index < 0 || index >= array.length) {
    return undefined;
  }
  return array[index];
};
