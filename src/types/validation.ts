/**
 * Standardized validation types for consistent component interfaces
 * Eliminates type conflicts and provides unified validation patterns
 */

/**
 * Base validation state for simple validation scenarios
 */
export interface BaseValidationState {
  isValidating: boolean;
  isValid: boolean;
  error: string | null;
}

/**
 * Extended validation state with metadata for API keys and complex scenarios
 */
export interface ExtendedValidationState extends BaseValidationState {
  lastCheckedAt: number | null;
  validationAttempts: number;
  isStale: boolean;
}

/**
 * Field-level validation for form inputs
 */
export interface FieldValidationState extends BaseValidationState {
  isDirty: boolean;
  isTouched: boolean;
  warnings: string[];
}

/**
 * API-specific validation with retry logic
 */
export interface ApiValidationState extends ExtendedValidationState {
  retryCount: number;
  maxRetries: number;
  retryable: boolean;
  nextRetryAt: number | null;
}

/**
 * Validation state factory functions
 */
export const createValidationState = (
  overrides?: Partial<BaseValidationState>
): BaseValidationState => ({
  isValidating: false,
  isValid: false,
  error: null,
  ...overrides,
});

export const createExtendedValidationState = (
  overrides?: Partial<ExtendedValidationState>
): ExtendedValidationState => ({
  ...createValidationState(overrides),
  lastCheckedAt: null,
  validationAttempts: 0,
  isStale: false,
  ...overrides,
});

export const createFieldValidationState = (
  overrides?: Partial<FieldValidationState>
): FieldValidationState => ({
  ...createValidationState(overrides),
  isDirty: false,
  isTouched: false,
  warnings: [],
  ...overrides,
});

export const createApiValidationState = (
  overrides?: Partial<ApiValidationState>
): ApiValidationState => ({
  ...createExtendedValidationState(overrides),
  retryCount: 0,
  maxRetries: 3,
  retryable: true,
  nextRetryAt: null,
  ...overrides,
});

/**
 * Validation utilities
 */
export const isValidationStale = (
  state: ExtendedValidationState,
  maxAgeMs = 300000 // 5 minutes
): boolean => {
  if (!state.lastCheckedAt) return true;
  return Date.now() - state.lastCheckedAt > maxAgeMs;
};

export const canRetryValidation = (state: ApiValidationState): boolean => {
  return (
    state.retryable &&
    state.retryCount < state.maxRetries &&
    (!state.nextRetryAt || Date.now() >= state.nextRetryAt)
  );
};

export const getNextRetryDelay = (retryCount: number): number => {
  return Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
};
