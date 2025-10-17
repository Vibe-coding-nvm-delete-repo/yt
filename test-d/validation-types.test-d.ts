/**
 * Type contract tests for validation types
 * These assertions MUST pass to prevent ValidationState drift
 * Any PR that breaks these contracts will fail CI
 */

import { expectType, expectAssignable, expectNotAssignable } from "tsd";
import type {
  ValidationState,
  BaseValidationState,
  ExtendedValidationState,
  ApiValidationState,
} from "../src/types";
import {
  createValidationState,
  createExtendedValidationState,
  isValidationStale,
  canRetryValidation,
} from "../src/types";

// Import error types for contract testing
import type { ErrorContext, AppError } from "../src/types/errors";
import { createErrorFromException } from "../src/types/errors";

// CRITICAL: ValidationState must be an alias for BaseValidationState
const validationState: ValidationState = {
  isValidating: false,
  isValid: true,
  error: null,
};
expectType<ValidationState>(validationState);

// CRITICAL: BaseValidationState shape must be exact
const baseValidationState: BaseValidationState = {
  isValidating: false,
  isValid: true,
  error: null,
};
expectType<BaseValidationState>(baseValidationState);

// CRITICAL: ExtendedValidationState must include metadata
const extendedValidationState: ExtendedValidationState = {
  isValidating: false,
  isValid: true,
  error: null,
  lastCheckedAt: Date.now(),
  validationAttempts: 0,
  isStale: false,
};
expectType<ExtendedValidationState>(extendedValidationState);

// CRITICAL: ApiValidationState must include retry logic
const apiValidationState: ApiValidationState = {
  isValidating: false,
  isValid: true,
  error: null,
  lastCheckedAt: Date.now(),
  validationAttempts: 0,
  isStale: false,
  retryCount: 0,
  maxRetries: 3,
  retryable: true,
  nextRetryAt: null,
};
expectType<ApiValidationState>(apiValidationState);

// PREVENT REGRESSION: Optional isValid/error should NOT be assignable
type BadValidationState = {
  isValidating: boolean;
  isValid?: boolean; // Optional - this should FAIL
  error?: string | null; // Optional - this should FAIL
};

// This will fail compilation if someone tries to make isValid/error optional again
expectNotAssignable<BaseValidationState>({
  isValidating: false,
  // Missing required isValid and error - should fail
} as BadValidationState);

// Factory functions must return correct types
expectType<BaseValidationState>(createValidationState());
expectType<ExtendedValidationState>(createExtendedValidationState());

// Utilities must accept correct types and return expected values
const extendedState: ExtendedValidationState = createExtendedValidationState({
  lastCheckedAt: Date.now() - 600000, // 10 minutes ago
});

expectType<boolean>(isValidationStale(extendedState));
expectType<boolean>(isValidationStale(extendedState, 300000));

const apiState: ApiValidationState = {
  ...extendedState,
  retryCount: 0,
  maxRetries: 3,
  retryable: true,
  nextRetryAt: null,
};

expectType<boolean>(canRetryValidation(apiState));

// ExtendedValidationState must be assignable to BaseValidationState
expectAssignable<BaseValidationState>(extendedState);

// ApiValidationState must be assignable to ExtendedValidationState
expectAssignable<ExtendedValidationState>(apiState);

// ===========================================================================
// ERROR CONTEXT TYPE CONTRACTS - CRITICAL for exactOptionalPropertyTypes
// ===========================================================================

// CRITICAL: ErrorContext must accept all optional fields as undefined
expectAssignable<ErrorContext>({
  timestamp: Date.now(),
  component: undefined,
  operation: undefined,
  userId: undefined,
  retryable: undefined,
  retryCount: undefined,
  stackTrace: undefined,
  requestId: undefined,
  userAgent: undefined,
  url: undefined,
  statusCode: undefined,
  metadata: undefined,
  errorId: undefined,
});

// CRITICAL: Partial<ErrorContext> must accept mixed undefined and concrete values
expectAssignable<Partial<ErrorContext>>({
  component: "TestComponent",
  operation: undefined,
  stackTrace: "test stack trace",
});

// CRITICAL: createErrorFromException must accept undefined optionals
// This prevents the exactOptionalPropertyTypes build failure in issue #112
declare const componentName: string | undefined;
declare const stackTrace: string | undefined;

// Should compile without errors under exactOptionalPropertyTypes
expectType<AppError>(
  createErrorFromException(new Error("test"), {
    component: componentName,
    operation: "render",
    stackTrace: stackTrace,
  }),
);

// Should handle fully undefined context without compilation errors
expectType<AppError>(createErrorFromException(new Error("test"), undefined));

// Should accept context with only some fields defined
expectType<AppError>(
  createErrorFromException(new Error("test"), {
    component: "ErrorBoundary",
    operation: "render",
    // Other optional fields omitted - should be fine
  }),
);

// PREVENT REGRESSION: Ensure ErrorContext optional fields remain explicit
// Extract only the required (non-optional) keys from ErrorContext
type RequiredKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type StrictErrorContext = Pick<ErrorContext, RequiredKeys<ErrorContext>>;

// Only timestamp should be required in strict mode
expectType<StrictErrorContext>({
  timestamp: Date.now(),
  // All other fields should be filtered out since they're optional
});
