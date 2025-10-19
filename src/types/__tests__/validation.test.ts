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
    it("should create default base validation state", () => {
      const state = createValidationState();

      expect(state).toEqual({
        isValidating: false,
        isValid: false,
        error: null,
      });
    });

    it("should create validation state with overrides", () => {
      const state = createValidationState({
        isValidating: true,
        isValid: true,
        error: "Test error",
      });

      expect(state).toEqual({
        isValidating: true,
        isValid: true,
        error: "Test error",
      });
    });

    it("should allow partial overrides", () => {
      const state = createValidationState({
        isValid: true,
      });

      expect(state.isValid).toBe(true);
      expect(state.isValidating).toBe(false);
      expect(state.error).toBeNull();
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

    it("should create extended validation state with overrides", () => {
      const now = Date.now();
      const state = createExtendedValidationState({
        isValid: true,
        lastCheckedAt: now,
        validationAttempts: 5,
        isStale: true,
      });

      expect(state.isValid).toBe(true);
      expect(state.lastCheckedAt).toBe(now);
      expect(state.validationAttempts).toBe(5);
      expect(state.isStale).toBe(true);
    });

    it("should inherit from base validation state", () => {
      const state = createExtendedValidationState({
        error: "Test error",
      });

      expect(state.error).toBe("Test error");
      expect(state.isValidating).toBe(false);
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

    it("should create field validation state with overrides", () => {
      const state = createFieldValidationState({
        isDirty: true,
        isTouched: true,
        warnings: ["Warning 1", "Warning 2"],
        isValid: true,
      });

      expect(state.isDirty).toBe(true);
      expect(state.isTouched).toBe(true);
      expect(state.warnings).toEqual(["Warning 1", "Warning 2"]);
      expect(state.isValid).toBe(true);
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

    it("should create API validation state with overrides", () => {
      const now = Date.now();
      const state = createApiValidationState({
        retryCount: 2,
        maxRetries: 5,
        retryable: false,
        nextRetryAt: now,
        isValid: true,
      });

      expect(state.retryCount).toBe(2);
      expect(state.maxRetries).toBe(5);
      expect(state.retryable).toBe(false);
      expect(state.nextRetryAt).toBe(now);
      expect(state.isValid).toBe(true);
    });
  });
});

describe("Validation Utilities", () => {
  describe("isValidationStale", () => {
    it("should return true when lastCheckedAt is null", () => {
      const state: ExtendedValidationState = {
        isValidating: false,
        isValid: true,
        error: null,
        lastCheckedAt: null,
        validationAttempts: 0,
        isStale: false,
      };

      expect(isValidationStale(state)).toBe(true);
    });

    it("should return false when validation is fresh", () => {
      const state: ExtendedValidationState = {
        isValidating: false,
        isValid: true,
        error: null,
        lastCheckedAt: Date.now() - 60000, // 1 minute ago
        validationAttempts: 0,
        isStale: false,
      };

      expect(isValidationStale(state)).toBe(false);
    });

    it("should return true when validation is stale (default 5 minutes)", () => {
      const state: ExtendedValidationState = {
        isValidating: false,
        isValid: true,
        error: null,
        lastCheckedAt: Date.now() - 400000, // 6.67 minutes ago
        validationAttempts: 0,
        isStale: false,
      };

      expect(isValidationStale(state)).toBe(true);
    });

    it("should use custom max age", () => {
      const state: ExtendedValidationState = {
        isValidating: false,
        isValid: true,
        error: null,
        lastCheckedAt: Date.now() - 120000, // 2 minutes ago
        validationAttempts: 0,
        isStale: false,
      };

      // Not stale with default 5 minutes
      expect(isValidationStale(state, 300000)).toBe(false);

      // Stale with custom 1 minute
      expect(isValidationStale(state, 60000)).toBe(true);
    });
  });

  describe("canRetryValidation", () => {
    it("should return true when retry is possible", () => {
      const state: ApiValidationState = {
        isValidating: false,
        isValid: false,
        error: "Error",
        lastCheckedAt: Date.now(),
        validationAttempts: 0,
        isStale: false,
        retryCount: 0,
        maxRetries: 3,
        retryable: true,
        nextRetryAt: null,
      };

      expect(canRetryValidation(state)).toBe(true);
    });

    it("should return false when not retryable", () => {
      const state: ApiValidationState = {
        isValidating: false,
        isValid: false,
        error: "Error",
        lastCheckedAt: Date.now(),
        validationAttempts: 0,
        isStale: false,
        retryCount: 0,
        maxRetries: 3,
        retryable: false,
        nextRetryAt: null,
      };

      expect(canRetryValidation(state)).toBe(false);
    });

    it("should return false when max retries reached", () => {
      const state: ApiValidationState = {
        isValidating: false,
        isValid: false,
        error: "Error",
        lastCheckedAt: Date.now(),
        validationAttempts: 0,
        isStale: false,
        retryCount: 3,
        maxRetries: 3,
        retryable: true,
        nextRetryAt: null,
      };

      expect(canRetryValidation(state)).toBe(false);
    });

    it("should return false when nextRetryAt is in the future", () => {
      const state: ApiValidationState = {
        isValidating: false,
        isValid: false,
        error: "Error",
        lastCheckedAt: Date.now(),
        validationAttempts: 0,
        isStale: false,
        retryCount: 1,
        maxRetries: 3,
        retryable: true,
        nextRetryAt: Date.now() + 5000, // 5 seconds from now
      };

      expect(canRetryValidation(state)).toBe(false);
    });

    it("should return true when nextRetryAt has passed", () => {
      const state: ApiValidationState = {
        isValidating: false,
        isValid: false,
        error: "Error",
        lastCheckedAt: Date.now(),
        validationAttempts: 0,
        isStale: false,
        retryCount: 1,
        maxRetries: 3,
        retryable: true,
        nextRetryAt: Date.now() - 1000, // 1 second ago
      };

      expect(canRetryValidation(state)).toBe(true);
    });
  });

  describe("getNextRetryDelay", () => {
    it("should calculate exponential backoff", () => {
      expect(getNextRetryDelay(0)).toBe(1000); // 2^0 * 1000 = 1s
      expect(getNextRetryDelay(1)).toBe(2000); // 2^1 * 1000 = 2s
      expect(getNextRetryDelay(2)).toBe(4000); // 2^2 * 1000 = 4s
      expect(getNextRetryDelay(3)).toBe(8000); // 2^3 * 1000 = 8s
      expect(getNextRetryDelay(4)).toBe(16000); // 2^4 * 1000 = 16s
    });

    it("should cap delay at 30 seconds", () => {
      expect(getNextRetryDelay(5)).toBe(30000); // Would be 32s, capped at 30s
      expect(getNextRetryDelay(10)).toBe(30000); // Would be 1024s, capped at 30s
      expect(getNextRetryDelay(100)).toBe(30000); // Would be huge, capped at 30s
    });
  });
});

describe("Type Guards and Type Safety", () => {
  it("should maintain type safety for BaseValidationState", () => {
    const state: BaseValidationState = createValidationState();

    expect(state).toHaveProperty("isValidating");
    expect(state).toHaveProperty("isValid");
    expect(state).toHaveProperty("error");
  });

  it("should maintain type safety for ExtendedValidationState", () => {
    const state: ExtendedValidationState = createExtendedValidationState();

    expect(state).toHaveProperty("isValidating");
    expect(state).toHaveProperty("isValid");
    expect(state).toHaveProperty("error");
    expect(state).toHaveProperty("lastCheckedAt");
    expect(state).toHaveProperty("validationAttempts");
    expect(state).toHaveProperty("isStale");
  });

  it("should maintain type safety for FieldValidationState", () => {
    const state: FieldValidationState = createFieldValidationState();

    expect(state).toHaveProperty("isDirty");
    expect(state).toHaveProperty("isTouched");
    expect(state).toHaveProperty("warnings");
    expect(Array.isArray(state.warnings)).toBe(true);
  });

  it("should maintain type safety for ApiValidationState", () => {
    const state: ApiValidationState = createApiValidationState();

    expect(state).toHaveProperty("retryCount");
    expect(state).toHaveProperty("maxRetries");
    expect(state).toHaveProperty("retryable");
    expect(state).toHaveProperty("nextRetryAt");
  });
});
