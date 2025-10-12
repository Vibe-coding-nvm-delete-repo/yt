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
 * Batch-related types for multi-model generation
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
  status: 'pending' | 'processing' | 'done' | 'error';
}

export interface BatchEntry {
  id: string; // uuid or timestamp-based id
  timestamp: number;
  imagePreview?: string | null;
  items: BatchItem[];
}

/**
 * Persisted image state now includes batch history for storing multi-model runs.
 */
export interface PersistedImageState {
  preview: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  generatedPrompt: string | null;
  batchHistory?: BatchEntry[];
}

export interface TabState {
  activeTab: 'image-to-prompt' | 'settings';
}

export class ApiError extends Error {
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
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
