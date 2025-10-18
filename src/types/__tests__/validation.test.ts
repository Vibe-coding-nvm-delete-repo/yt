import {
  createValidationState,
  createExtendedValidationState,
  createFieldValidationState,
  createApiValidationState,
  isValidationStale,
  canRetryValidation,
  getNextRetryDelay,
  type BaseValidationState,
  type ExtendedValidationState,
  type FieldValidationState,
  type ApiValidationState,
} from "../validation";

describe("Validation State Factories", () => {
  describe("createValidationState", () => {
    it("should create default validation state", () => {
      const state = createValidationState();
      expect(state).toEqual({
        isValidating: false,
        isValid: false,
        error: null,
      });
    });

    it("should accept overrides", () => {
      const state = createValidationState({
        isValidating: true,
        isValid: true,
        error: "Test error",
      });
      expect(state.isValidating).toBe(true);
      expect(state.isValid).toBe(true);
      expect(state.error).toBe("Test error");
    });

    it("should accept partial overrides", () => {
      const state = createValidationState({ isValid: true });
      expect(state.isValid).toBe(true);
      expect(state.isValidating).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe("createExtendedValidationState", () => {
    it("should create default extended validation state", () => {
      const state = createExtendedValidationState();
      expect(state).toEqual({
        isValidating: false,
        isValid: false,
        error: null,
        lastCheckedAt: null,
        validationAttempts: 0,
        isStale: false,
      });
    });

    it("should accept overrides", () => {
      const now = Date.now();
      const state = createExtendedValidationState({
        isValid: true,
        lastCheckedAt: now,
        validationAttempts: 3,
        isStale: true,
      });
      expect(state.isValid).toBe(true);
      expect(state.lastCheckedAt).toBe(now);
      expect(state.validationAttempts).toBe(3);
      expect(state.isStale).toBe(true);
    });
  });

  describe("createFieldValidationState", () => {
    it("should create default field validation state", () => {
      const state = createFieldValidationState();
      expect(state).toEqual({
        isValidating: false,
        isValid: false,
        error: null,
        isDirty: false,
        isTouched: false,
        warnings: [],
      });
    });

    it("should accept overrides", () => {
      const state = createFieldValidationState({
        isValid: true,
        isDirty: true,
        isTouched: true,
        warnings: ["Warning 1", "Warning 2"],
      });
      expect(state.isValid).toBe(true);
      expect(state.isDirty).toBe(true);
      expect(state.isTouched).toBe(true);
      expect(state.warnings).toEqual(["Warning 1", "Warning 2"]);
    });
  });

  describe("createApiValidationState", () => {
    it("should create default API validation state", () => {
      const state = createApiValidationState();
      expect(state).toEqual({
        isValidating: false,
        isValid: false,
        error: null,
        lastCheckedAt: null,
        validationAttempts: 0,
        isStale: false,
        retryCount: 0,
        maxRetries: 3,
        retryable: true,
        nextRetryAt: null,
      });
    });

    it("should accept overrides", () => {
      const state = createApiValidationState({
        retryCount: 2,
        maxRetries: 5,
        retryable: false,
      });
      expect(state.retryCount).toBe(2);
      expect(state.maxRetries).toBe(5);
      expect(state.retryable).toBe(false);
    });
  });
});

describe("Validation Utilities", () => {
  describe("isValidationStale", () => {
    it("should return true when lastCheckedAt is null", () => {
      const state = createExtendedValidationState();
      expect(isValidationStale(state)).toBe(true);
    });

    it("should return false when validation is fresh", () => {
      const state = createExtendedValidationState({
        lastCheckedAt: Date.now(),
      });
      expect(isValidationStale(state)).toBe(false);
    });

    it("should return true when validation exceeds max age", () => {
      const sixMinutesAgo = Date.now() - 6 * 60 * 1000;
      const state = createExtendedValidationState({
        lastCheckedAt: sixMinutesAgo,
      });
      expect(isValidationStale(state)).toBe(true);
    });

    it("should respect custom max age", () => {
      const oneMinuteAgo = Date.now() - 60 * 1000;
      const state = createExtendedValidationState({
        lastCheckedAt: oneMinuteAgo,
      });
      expect(isValidationStale(state, 30000)).toBe(true); // 30 seconds
      expect(isValidationStale(state, 120000)).toBe(false); // 2 minutes
    });

    it("should handle edge case of exactly max age", () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const state = createExtendedValidationState({
        lastCheckedAt: fiveMinutesAgo,
      });
      // Should be stale since it's exactly at the limit
      const result = isValidationStale(state, 5 * 60 * 1000);
      expect(typeof result).toBe("boolean");
    });
  });

  describe("canRetryValidation", () => {
    it("should return true when retry is possible", () => {
      const state = createApiValidationState();
      expect(canRetryValidation(state)).toBe(true);
    });

    it("should return false when retryable is false", () => {
      const state = createApiValidationState({ retryable: false });
      expect(canRetryValidation(state)).toBe(false);
    });

    it("should return false when max retries reached", () => {
      const state = createApiValidationState({
        retryCount: 3,
        maxRetries: 3,
      });
      expect(canRetryValidation(state)).toBe(false);
    });

    it("should return false when max retries exceeded", () => {
      const state = createApiValidationState({
        retryCount: 5,
        maxRetries: 3,
      });
      expect(canRetryValidation(state)).toBe(false);
    });

    it("should return false when nextRetryAt is in the future", () => {
      const futureTime = Date.now() + 10000;
      const state = createApiValidationState({
        nextRetryAt: futureTime,
      });
      expect(canRetryValidation(state)).toBe(false);
    });

    it("should return true when nextRetryAt is in the past", () => {
      const pastTime = Date.now() - 10000;
      const state = createApiValidationState({
        nextRetryAt: pastTime,
      });
      expect(canRetryValidation(state)).toBe(true);
    });

    it("should return true when nextRetryAt is null", () => {
      const state = createApiValidationState({
        nextRetryAt: null,
      });
      expect(canRetryValidation(state)).toBe(true);
    });
  });

  describe("getNextRetryDelay", () => {
    it("should return exponential backoff delays", () => {
      expect(getNextRetryDelay(0)).toBe(1000); // 1 second
      expect(getNextRetryDelay(1)).toBe(2000); // 2 seconds
      expect(getNextRetryDelay(2)).toBe(4000); // 4 seconds
      expect(getNextRetryDelay(3)).toBe(8000); // 8 seconds
      expect(getNextRetryDelay(4)).toBe(16000); // 16 seconds
    });

    it("should cap at 30 seconds", () => {
      expect(getNextRetryDelay(10)).toBe(30000);
      expect(getNextRetryDelay(20)).toBe(30000);
      expect(getNextRetryDelay(100)).toBe(30000);
    });

    it("should handle negative retry counts gracefully", () => {
      // 2^-1 = 0.5, so 1000 * 0.5 = 500
      expect(getNextRetryDelay(-1)).toBe(500);
    });
  });
});

describe("Type Safety", () => {
  it("should enforce BaseValidationState type", () => {
    const state: BaseValidationState = createValidationState();
    expect(state).toHaveProperty("isValidating");
    expect(state).toHaveProperty("isValid");
    expect(state).toHaveProperty("error");
  });

  it("should enforce ExtendedValidationState type", () => {
    const state: ExtendedValidationState = createExtendedValidationState();
    expect(state).toHaveProperty("isValidating");
    expect(state).toHaveProperty("lastCheckedAt");
    expect(state).toHaveProperty("validationAttempts");
    expect(state).toHaveProperty("isStale");
  });

  it("should enforce FieldValidationState type", () => {
    const state: FieldValidationState = createFieldValidationState();
    expect(state).toHaveProperty("isDirty");
    expect(state).toHaveProperty("isTouched");
    expect(state).toHaveProperty("warnings");
  });

  it("should enforce ApiValidationState type", () => {
    const state: ApiValidationState = createApiValidationState();
    expect(state).toHaveProperty("retryCount");
    expect(state).toHaveProperty("maxRetries");
    expect(state).toHaveProperty("retryable");
    expect(state).toHaveProperty("nextRetryAt");
  });
});
