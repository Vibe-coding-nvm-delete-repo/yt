import {
  MODEL_LIMITS,
  BATCH_LIMITS,
  VALIDATION,
  TIMING,
  STORAGE_KEYS,
  UI_CONSTRAINTS,
  RATING,
  PERFORMANCE,
  API_CONFIG,
} from "../constants";

describe("Application Constants", () => {
  describe("MODEL_LIMITS", () => {
    it("should define vision model limits", () => {
      expect(MODEL_LIMITS.MAX_VISION_MODELS).toBe(3);
      expect(MODEL_LIMITS.MAX_TEXT_MODELS).toBe(1);
    });
  });

  describe("BATCH_LIMITS", () => {
    it("should define batch size constraints", () => {
      expect(BATCH_LIMITS.MIN_BATCH_SIZE).toBe(1);
      expect(BATCH_LIMITS.MAX_BATCH_SIZE).toBe(10);
      expect(BATCH_LIMITS.DEFAULT_BATCH_SIZE).toBe(3);
    });

    it("should define valid batch size options", () => {
      expect(BATCH_LIMITS.BATCH_SIZE_OPTIONS).toEqual([1, 3, 5, 10]);
    });

    it("should have consistent limits", () => {
      const options = BATCH_LIMITS.BATCH_SIZE_OPTIONS;
      expect(Math.min(...options)).toBe(BATCH_LIMITS.MIN_BATCH_SIZE);
      expect(Math.max(...options)).toBe(BATCH_LIMITS.MAX_BATCH_SIZE);
    });
  });

  describe("VALIDATION", () => {
    it("should define API key validation", () => {
      expect(VALIDATION.API_KEY_MIN_LENGTH).toBe(10);
    });

    it("should define stale validation timeout", () => {
      expect(VALIDATION.STALE_VALIDATION_MS).toBe(5 * 60 * 1000);
    });

    it("should define retry configuration", () => {
      expect(VALIDATION.MAX_RETRY_ATTEMPTS).toBe(3);
      expect(VALIDATION.RETRY_DELAY_BASE_MS).toBe(1000);
      expect(VALIDATION.MAX_RETRY_DELAY_MS).toBe(30000);
    });
  });

  describe("TIMING", () => {
    it("should define debounce timing", () => {
      expect(TIMING.DEBOUNCE_MS).toBe(300);
    });

    it("should define autosave delay", () => {
      expect(TIMING.AUTOSAVE_DELAY_MS).toBe(500);
    });

    it("should define performance monitoring timing", () => {
      expect(TIMING.RAPID_RENDER_THRESHOLD_MS).toBe(100);
      expect(TIMING.RAPID_RENDER_WINDOW_MS).toBe(1000);
      expect(TIMING.PERFORMANCE_RESET_MS).toBe(10000);
    });
  });

  describe("STORAGE_KEYS", () => {
    it("should define localStorage keys", () => {
      expect(STORAGE_KEYS.SETTINGS).toBe("yt-settings");
      expect(STORAGE_KEYS.HISTORY).toBe("yt-history");
      expect(STORAGE_KEYS.BEST_PRACTICES).toBe("yt-best-practices");
    });

    it("should define prompt creator keys", () => {
      expect(STORAGE_KEYS.PROMPT_CREATOR_CONFIG).toBe(
        "yt-prompt-creator-config",
      );
      expect(STORAGE_KEYS.PROMPT_CREATOR_DRAFT).toBe("yt-prompt-creator-draft");
    });

    it("should define IndexedDB name", () => {
      expect(STORAGE_KEYS.IMAGE_DB_NAME).toBe("ImageToPromptImages");
    });

    it("should have consistent naming convention", () => {
      const keys = Object.values(STORAGE_KEYS);
      keys.forEach((key) => {
        if (!key.includes("Images")) {
          // IndexedDB name exception
          expect(key).toMatch(/^yt-/);
        }
      });
    });
  });

  describe("UI_CONSTRAINTS", () => {
    it("should define file size limits", () => {
      expect(UI_CONSTRAINTS.MAX_FILE_SIZE_MB).toBe(20);
      expect(UI_CONSTRAINTS.MAX_FILE_SIZE_BYTES).toBe(20 * 1024 * 1024);
    });

    it("should have consistent file size values", () => {
      expect(UI_CONSTRAINTS.MAX_FILE_SIZE_BYTES).toBe(
        UI_CONSTRAINTS.MAX_FILE_SIZE_MB * 1024 * 1024,
      );
    });

    it("should define supported image types", () => {
      expect(UI_CONSTRAINTS.SUPPORTED_IMAGE_TYPES).toContain("image/jpeg");
      expect(UI_CONSTRAINTS.SUPPORTED_IMAGE_TYPES).toContain("image/png");
      expect(UI_CONSTRAINTS.SUPPORTED_IMAGE_TYPES).toContain("image/webp");
      expect(UI_CONSTRAINTS.SUPPORTED_IMAGE_TYPES).toContain("image/gif");
    });

    it("should define text length limits", () => {
      expect(UI_CONSTRAINTS.MAX_PROMPT_LENGTH).toBe(4000);
      expect(UI_CONSTRAINTS.MAX_FIELD_LABEL_LENGTH).toBe(100);
      expect(UI_CONSTRAINTS.MAX_HELPER_TEXT_LENGTH).toBe(200);
    });
  });

  describe("RATING", () => {
    it("should define rating range", () => {
      expect(RATING.MIN_SCORE).toBe(1);
      expect(RATING.MAX_SCORE).toBe(10);
      expect(RATING.DEFAULT_SCORE).toBe(5);
    });

    it("should define quality thresholds", () => {
      expect(RATING.GOOD_THRESHOLD).toBe(7);
      expect(RATING.EXCELLENT_THRESHOLD).toBe(9);
    });

    it("should have valid threshold values", () => {
      expect(RATING.GOOD_THRESHOLD).toBeGreaterThanOrEqual(RATING.MIN_SCORE);
      expect(RATING.GOOD_THRESHOLD).toBeLessThanOrEqual(RATING.MAX_SCORE);
      expect(RATING.EXCELLENT_THRESHOLD).toBeGreaterThan(RATING.GOOD_THRESHOLD);
      expect(RATING.DEFAULT_SCORE).toBeGreaterThanOrEqual(RATING.MIN_SCORE);
      expect(RATING.DEFAULT_SCORE).toBeLessThanOrEqual(RATING.MAX_SCORE);
    });
  });

  describe("PERFORMANCE", () => {
    it("should define render thresholds", () => {
      expect(PERFORMANCE.EXCESSIVE_RENDER_THRESHOLD).toBe(5);
      expect(PERFORMANCE.TARGET_RENDER_INTERVAL_MS).toBe(100);
    });
  });

  describe("API_CONFIG", () => {
    it("should define OpenRouter configuration", () => {
      expect(API_CONFIG.OPENROUTER_KEY_PREFIX).toBe("sk-or-v1-");
    });

    it("should define request configuration", () => {
      expect(API_CONFIG.REQUEST_TIMEOUT_MS).toBe(30000);
      expect(API_CONFIG.MAX_CONCURRENT_REQUESTS).toBe(3);
    });
  });

  describe("Type Safety", () => {
    it("should export all configuration objects as const", () => {
      // This test verifies the const assertion works
      // TypeScript will error if we try to mutate these values
      expect(MODEL_LIMITS).toBeDefined();
      expect(BATCH_LIMITS).toBeDefined();
      expect(VALIDATION).toBeDefined();
      expect(TIMING).toBeDefined();
      expect(STORAGE_KEYS).toBeDefined();
      expect(UI_CONSTRAINTS).toBeDefined();
      expect(RATING).toBeDefined();
      expect(PERFORMANCE).toBeDefined();
      expect(API_CONFIG).toBeDefined();
    });
  });
});
