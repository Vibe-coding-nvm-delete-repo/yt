/**
 * Type contract tests for validation types
 * These assertions MUST pass to prevent ValidationState drift
 * Any PR that breaks these contracts will fail CI
 */

import { expectType, expectAssignable, expectNotAssignable } from 'tsd';
import {
  ValidationState,
  BaseValidationState,
  ExtendedValidationState,
  ApiValidationState,
  createValidationState,
  createExtendedValidationState,
  isValidationStale,
  canRetryValidation
} from '../src/types';

// CRITICAL: ValidationState must be an alias for BaseValidationState
expectType<ValidationState>({
  isValidating: false,
  isValid: true,
  error: null
});

// CRITICAL: BaseValidationState shape must be exact
expectType<BaseValidationState>({
  isValidating: false,
  isValid: true,
  error: null
});

// CRITICAL: ExtendedValidationState must include metadata
expectType<ExtendedValidationState>({
  isValidating: false,
  isValid: true,
  error: null,
  lastCheckedAt: Date.now(),
  validationAttempts: 0,
  isStale: false
});

// CRITICAL: ApiValidationState must include retry logic
expectType<ApiValidationState>({
  isValidating: false,
  isValid: true,
  error: null,
  lastCheckedAt: Date.now(),
  validationAttempts: 0,
  isStale: false,
  retryCount: 0,
  maxRetries: 3,
  retryable: true,
  nextRetryAt: null
});

// PREVENT REGRESSION: Optional isValid/error should NOT be assignable
type BadValidationState = {
  isValidating: boolean;
  isValid?: boolean; // Optional - this should FAIL
  error?: string | null; // Optional - this should FAIL
};

// This will fail compilation if someone tries to make isValid/error optional again
expectNotAssignable<BaseValidationState>({
  isValidating: false
  // Missing required isValid and error - should fail
} as BadValidationState);

// Factory functions must return correct types
expectType<BaseValidationState>(createValidationState());
expectType<ExtendedValidationState>(createExtendedValidationState());

// Utilities must accept correct types and return expected values
const extendedState: ExtendedValidationState = createExtendedValidationState({
  lastCheckedAt: Date.now() - 600000 // 10 minutes ago
});

expectType<boolean>(isValidationStale(extendedState));
expectType<boolean>(isValidationStale(extendedState, 300000));

const apiState: ApiValidationState = {
  ...extendedState,
  retryCount: 0,
  maxRetries: 3,
  retryable: true,
  nextRetryAt: null
};

expectType<boolean>(canRetryValidation(apiState));

// ExtendedValidationState must be assignable to BaseValidationState
expectAssignable<BaseValidationState>(extendedState);

// ApiValidationState must be assignable to ExtendedValidationState
expectAssignable<ExtendedValidationState>(apiState);