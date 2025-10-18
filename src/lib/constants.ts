/**
 * Application-wide constants and configuration values
 * Centralized location for magic numbers and configuration
 */

/**
 * Model selection limits
 */
export const MODEL_LIMITS = {
  MAX_VISION_MODELS: 3,
  MAX_TEXT_MODELS: 1,
} as const;

/**
 * Batch processing limits
 */
export const BATCH_LIMITS = {
  MIN_BATCH_SIZE: 1,
  MAX_BATCH_SIZE: 10,
  DEFAULT_BATCH_SIZE: 3,
  BATCH_SIZE_OPTIONS: [1, 3, 5, 10],
} as const;

/**
 * Validation timeouts and thresholds
 */
export const VALIDATION = {
  API_KEY_MIN_LENGTH: 10,
  STALE_VALIDATION_MS: 5 * 60 * 1000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE_MS: 1000,
  MAX_RETRY_DELAY_MS: 30000,
} as const;

/**
 * UI debounce and timing
 */
export const TIMING = {
  DEBOUNCE_MS: 300,
  AUTOSAVE_DELAY_MS: 500,
  RAPID_RENDER_THRESHOLD_MS: 100,
  RAPID_RENDER_WINDOW_MS: 1000,
  PERFORMANCE_RESET_MS: 10000,
} as const;

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  SETTINGS: "image-to-prompt-settings", // Main settings key (legacy name)
  IMAGE_STATE: "image-to-prompt-image-state",
  HISTORY: "yt-history",
  BEST_PRACTICES: "yt-best-practices",
  PROMPT_CREATOR_CONFIG: "yt-prompt-creator-config",
  PROMPT_CREATOR_DRAFT: "yt-prompt-creator-draft",
  RATING_FAVORITES: "yt-rating-favorites",
  IMAGE_DB_NAME: "ImageToPromptImages",
} as const;

/**
 * UI constraints
 */
export const UI_CONSTRAINTS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  SUPPORTED_IMAGE_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
  MAX_PROMPT_LENGTH: 4000,
  MAX_FIELD_LABEL_LENGTH: 100,
  MAX_HELPER_TEXT_LENGTH: 200,
} as const;

/**
 * Rating system
 */
export const RATING = {
  MIN_SCORE: 1,
  MAX_SCORE: 10,
  DEFAULT_SCORE: 5,
  GOOD_THRESHOLD: 7,
  EXCELLENT_THRESHOLD: 9,
} as const;

/**
 * Performance thresholds
 */
export const PERFORMANCE = {
  EXCESSIVE_RENDER_THRESHOLD: 5,
  TARGET_RENDER_INTERVAL_MS: 100,
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
  OPENROUTER_KEY_PREFIX: "sk-or-v1-",
  REQUEST_TIMEOUT_MS: 30000,
  MAX_CONCURRENT_REQUESTS: 3,
} as const;

/**
 * Type exports for const assertions
 */
export type ModelLimits = typeof MODEL_LIMITS;
export type BatchLimits = typeof BATCH_LIMITS;
export type ValidationConfig = typeof VALIDATION;
export type TimingConfig = typeof TIMING;
export type StorageKeys = typeof STORAGE_KEYS;
export type UIConstraints = typeof UI_CONSTRAINTS;
export type RatingConfig = typeof RATING;
export type PerformanceConfig = typeof PERFORMANCE;
export type APIConfig = typeof API_CONFIG;
