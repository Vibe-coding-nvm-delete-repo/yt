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
  lastModelFetch: number | null;
  availableModels: VisionModel[];
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
