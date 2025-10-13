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
  selectedModel: string;
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
 * Enhanced Persisted Image State with Multi-Image Support
 */
export interface PersistedImageState {
  preview: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  generatedPrompt: string | null;
  batchHistory?: BatchEntry[]; // Legacy multi-model batches
  imageBatchHistory?: ImageBatchEntry[]; // New multi-image batches
  schemaVersion: 1; // For storage migrations
}

export interface TabState {
  activeTab: "image-to-prompt" | "settings";
}

export class ApiError extends Error {
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;

    // Maintain proper stack trace (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

export interface ValidationState {
  isValidating: boolean;
  isValid: boolean;
  error: string | null;
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
