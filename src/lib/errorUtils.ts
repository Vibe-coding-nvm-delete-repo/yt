import { ApiError } from '@/types';

/**
 * Normalize any thrown value into an ApiError so callers can rely on structure.
 * - If already an ApiError, return as-is.
 * - If an Error, preserve its message and stack.
 * - Otherwise wrap the value into an ApiError with safe details.
 */
export const normalizeToApiError = (err: unknown): ApiError => {
  if (err instanceof ApiError) return err;
  if (err instanceof Error) {
    return new ApiError(err.message || 'Error', undefined, { stack: err.stack });
  }
  // Non-error thrown value (string, object, etc.)
  const payload = typeof err === 'string' ? { value: err } : err;
  return new ApiError(typeof err === 'string' ? err : 'Unknown error', undefined, { value: payload });
};
