/**
 * Type definitions for validation-types.test-d.ts
 * This file exists only to satisfy tsd's requirement for type contract testing.
 * This is NOT a library, so these exports are only used for testing.
 */

export type {
  ValidationState,
  BaseValidationState,
  ExtendedValidationState,
  ApiValidationState,
} from "./src/types";

export {
  createValidationState,
  createExtendedValidationState,
  isValidationStale,
  canRetryValidation,
} from "./src/types";

export type { ErrorContext, AppError } from "./src/types/errors";
export { createErrorFromException } from "./src/types/errors";
