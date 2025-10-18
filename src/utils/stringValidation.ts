/**
 * Common string validation utilities
 */

/**
 * Check if a string is empty or only whitespace
 */
export const isEmpty = (value: string | null | undefined): boolean => {
  return !value || value.trim().length === 0;
};

/**
 * Check if a string is not empty (has content after trimming)
 */
export const isNotEmpty = (value: string | null | undefined): boolean => {
  return !isEmpty(value);
};

/**
 * Check if a string has a minimum length (after trimming)
 */
export const hasMinLength = (
  value: string | null | undefined,
  minLength: number,
): boolean => {
  return value ? value.trim().length >= minLength : false;
};

/**
 * Check if a string has a maximum length (after trimming)
 */
export const hasMaxLength = (
  value: string | null | undefined,
  maxLength: number,
): boolean => {
  return value ? value.trim().length <= maxLength : true;
};

/**
 * Check if a string is within a length range (after trimming)
 */
export const isLengthInRange = (
  value: string | null | undefined,
  minLength: number,
  maxLength: number,
): boolean => {
  if (!value) return minLength === 0;
  const length = value.trim().length;
  return length >= minLength && length <= maxLength;
};

/**
 * Sanitize a string by trimming whitespace
 */
export const sanitize = (value: string | null | undefined): string => {
  return value ? value.trim() : "";
};
