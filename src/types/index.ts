export interface VisionModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: number;
    completion: number;
  };
  context_length?: number;
  supports_image?: boolean;
  supports_vision?: boolean;
}

export interface AppSettings {
  openRouterApiKey: string;
  selectedModel: string; // Deprecated: keeping for backward compatibility
  selectedVisionModels: string[]; // Up to 3 selected vision models
  customPrompt: string;
  isValidApiKey: boolean;
  lastApiKeyValidation: number | null;
  lastModelFetch: number | null;
  availableModels: VisionModel[];
  // List of preferred/pinned model ids for quick access (persisted)
  preferredModels: string[];
  // List of user-pinned favorite models for quick access in dropdown
  pinnedModels: string[];
}

export interface ImageUploadState {
  file: File | null;
  preview: string | null;
  isUploading: boolean;
  error: string | null;
}

export interface GenerationState {
  isGenerating: boolean;
  generatedPrompt: string | null;
  error: string | null;
}

/**
 * Multi-Image Batch Processing Types
 */

export interface MultiImageUploadState {
  id: string; // Unique identifier for this image
  file?: File | null;
  preview: string;
  isUploading: boolean;
  error: string | null;
  assignedModelId: string; // Model assigned to this specific image
  processingStatus: "idle" | "queued" | "processing" | "done" | "error";
  generatedPrompt: string | null;
  cost: {
    inputCost: number;
    outputCost: number;
    totalCost: number;
  } | null;
  processingError: string | null;
  uploadTimestamp: Date;
}

export interface ImageBatchItem {
  imageId: string;
  fileName: string;
  modelId: string;
  modelName?: string;
  prompt?: string | null;
  error?: string | null;
  cost?: {
    inputCost: number;
    outputCost: number;
    totalCost: number;
  } | null;
  status: "queued" | "processing" | "done" | "error";
  processingStartTime?: number;
  processingEndTime?: number;
}

export interface ImageBatchEntry {
  id: string; // timestamp-based unique id
  createdAt: number;
  imagePreview?: string | null; // First image preview for thumbnail
  items: ImageBatchItem[];
  totalCost?: number;
  schemaVersion: 1; // For future migrations
  processingMode: "single" | "multi"; // Track processing mode
}

/**
 * Legacy Multi-Model Batch Types (for backward compatibility)
 */
export interface BatchItem {
  modelId: string;
  modelName?: string;
  prompt?: string | null;
  error?: string | null;
  cost?: {
    inputCost: number;
    outputCost: number;
    totalCost: number;
  } | null;
  status: "pending" | "processing" | "done" | "error";
}

export interface BatchEntry {
  id: string; // uuid or timestamp-based id
  timestamp: number;
  imagePreview?: string | null;
  items: BatchItem[];
}

/**
 * Model Result for Single-Image Multi-Model Generation
 */
export interface ModelResult {
  modelId: string;
  modelName: string;
  prompt: string | null;
  cost: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  inputCost: number | null;
  outputCost: number | null;
  isProcessing: boolean;
  error: string | null;
}

/**
 * Enhanced Persisted Image State with Multi-Image Support
 */
export interface PersistedImageState {
  preview: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  generatedPrompt: string | null;
  modelResults?: ModelResult[]; // Current generation results
  isGenerating?: boolean; // Track if generation is in progress
  batchHistory?: BatchEntry[]; // Legacy multi-model batches
  imageBatchHistory?: ImageBatchEntry[]; // New multi-image batches
  schemaVersion: 1; // For storage migrations
}

export interface TabState {
  activeTab: "image-to-prompt" | "settings" | "best-practices" | "usage";
}

/**
 * Best Practices Types
 */
export type BestPracticeType = "mandatory" | "optional" | "conditional";
export type BestPracticeCategory =
  | "words-phrases"
  | "photography"
  | "youtube-engagement"
  | "youtube-thumbnail"
  | "our-unique-channel";

export interface BestPractice {
  id: string;
  name: string;
  description: string;
  leonardoAiLanguage: string;
  images: string[]; // Array of base64 image data URLs
  importance: number; // 1-10 scale
  type: BestPracticeType;
  typeExplanation: string;
  category: BestPracticeCategory;
  createdAt: number;
  updatedAt: number;
}

export interface BestPracticesState {
  practices: BestPractice[];
}

export class ApiError extends Error {
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    if (code !== undefined) {
      this.code = code;
    }
    if (details !== undefined) {
      this.details = details;
    }

    // Maintain proper stack trace (only available on V8)
    const ErrorConstructor = Error as {
      captureStackTrace?: (target: object, constructor: unknown) => void;
    };
    if (ErrorConstructor.captureStackTrace) {
      ErrorConstructor.captureStackTrace(this, ApiError);
    }
  }
}

export interface ModelState {
  isLoading: boolean;
  models: VisionModel[];
  error: string | null;
  searchTerm: string;
}

/**
 * Queue Management Types
 */
export interface QueueTask<T> {
  id: string;
  execute: () => Promise<T>;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onSuccess?: (result: T) => void;
}

export interface QueueOptions {
  concurrency?: number;
  signal?: AbortSignal;
  onProgress?: (completed: number, total: number) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface QueueResult<T> {
  results: (T | Error)[];
  completed: number;
  total: number;
  errors: Error[];
}

/**
 * Rating System Types
 */
export type RatingValue = 1 | 2 | 3 | 4 | 5;
export type ThumbsRating = "up" | "down" | null;

export interface Rating {
  id: string; // unique rating id (e.g., "rating-{historyId}-{timestamp}")
  historyEntryId: string; // Links to HistoryEntry.id
  modelId: string;
  modelName: string;
  stars: RatingValue | null; // 1-5 star rating
  thumbs: ThumbsRating; // Quick thumbs up/down
  comment: string | null; // Optional user feedback
  imagePreview: string | null; // For display
  prompt: string | null; // The prompt that was rated
  createdAt: number; // When rating was created
  updatedAt: number; // When rating was last modified
}

export interface RatingFilter {
  modelId?: string;
  minStars?: RatingValue;
  maxStars?: RatingValue;
  thumbs?: ThumbsRating;
  fromDate?: number;
  toDate?: number;
}

export interface RatingStats {
  totalRatings: number;
  averageStars: number;
  thumbsUp: number;
  thumbsDown: number;
  byModel: Record<
    string,
    {
      modelName: string;
      count: number;
      averageStars: number;
      thumbsUp: number;
      thumbsDown: number;
    }
  >;
}

// Export standardized validation types
export * from "./validation";

// Provide backward compatibility alias
import type { BaseValidationState } from "./validation";
export type { BaseValidationState as ValidationState };
