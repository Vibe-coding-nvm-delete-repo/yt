/**
 * Utility functions for parsing and processing text data
 */

/**
 * Parse a multi-line or comma-separated list into an array of strings
 * @param text - The text to parse
 * @returns Array of trimmed, non-empty strings
 */
export const parseOptionList = (text: string): string[] =>
  text
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

/**
 * Join an array of options into a newline-separated string
 * @param options - The options to join
 * @returns Newline-separated string
 */
export const joinOptionList = (options: string[]): string => options.join("\n");
