/**
 * Time and date utility functions
 */

/**
 * Get current timestamp in milliseconds
 */
export const now = (): number => Date.now();

/**
 * Get current timestamp in seconds
 */
export const nowInSeconds = (): number => Math.floor(Date.now() / 1000);

/**
 * Check if a timestamp is expired based on a TTL (time to live)
 * @param timestamp - The timestamp to check (in milliseconds)
 * @param ttlMs - Time to live in milliseconds
 * @returns true if expired, false otherwise
 */
export const isExpired = (timestamp: number, ttlMs: number): boolean => {
  return Date.now() - timestamp > ttlMs;
};

/**
 * Check if a timestamp is still fresh (not expired)
 * @param timestamp - The timestamp to check (in milliseconds)
 * @param ttlMs - Time to live in milliseconds
 * @returns true if fresh, false otherwise
 */
export const isFresh = (timestamp: number, ttlMs: number): boolean => {
  return !isExpired(timestamp, ttlMs);
};

/**
 * Get time difference between now and a timestamp
 * @param timestamp - The past timestamp (in milliseconds)
 * @returns difference in milliseconds
 */
export const getAge = (timestamp: number): number => {
  return Date.now() - timestamp;
};

/**
 * Add milliseconds to a timestamp
 * @param timestamp - The base timestamp
 * @param ms - Milliseconds to add
 * @returns new timestamp
 */
export const addMilliseconds = (timestamp: number, ms: number): number => {
  return timestamp + ms;
};

/**
 * Add seconds to a timestamp
 * @param timestamp - The base timestamp
 * @param seconds - Seconds to add
 * @returns new timestamp
 */
export const addSeconds = (timestamp: number, seconds: number): number => {
  return timestamp + seconds * 1000;
};

/**
 * Add minutes to a timestamp
 * @param timestamp - The base timestamp
 * @param minutes - Minutes to add
 * @returns new timestamp
 */
export const addMinutes = (timestamp: number, minutes: number): number => {
  return timestamp + minutes * 60 * 1000;
};

/**
 * Convert milliseconds to seconds
 */
export const msToSeconds = (ms: number): number => {
  return Math.floor(ms / 1000);
};

/**
 * Convert seconds to milliseconds
 */
export const secondsToMs = (seconds: number): number => {
  return seconds * 1000;
};

/**
 * Sleep for a specified duration
 * @param ms - Duration in milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
