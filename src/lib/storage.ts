import { AppSettings, VisionModel, PersistedImageState } from '@/types';

const STORAGE_KEY = 'image-to-prompt-settings';
const IMAGE_STATE_KEY = 'image-to-prompt-image-state';

export const STORAGE_EVENTS = {
  SETTINGS_UPDATED: 'image-to-prompt-settings-updated',
  IMAGE_STATE_UPDATED: 'image-to-prompt-image-state-updated',
} as const;

const DEFAULT_SETTINGS: AppSettings = {
  openRouterApiKey: '',
  selectedModel: '',
  customPrompt: 'Describe this image in detail and suggest a good prompt for generating similar images.',
  isValidApiKey: false,
  lastApiKeyValidation: null,
  lastModelFetch: null,
  availableModels: [],
  preferredModels: [],
};

export class SettingsStorage {
  private static instance: SettingsStorage;
  private settings: AppSettings;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.settings = this.loadSettings();
    
    // Listen for storage events from other tabs/windows
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }

  static getInstance(): SettingsStorage {
    if (!SettingsStorage.instance) {
      SettingsStorage.instance = new SettingsStorage();
    }
    return SettingsStorage.instance;
  }

  private loadSettings(): AppSettings {
    if (typeof window === 'undefined') {
      return DEFAULT_SETTINGS;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return DEFAULT_SETTINGS;
      }

      const parsed = JSON.parse(stored);
      
      // Validate and merge with defaults to ensure all properties exist
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        // Ensure arrays are properly initialized
        availableModels: Array.isArray(parsed.availableModels) ? parsed.availableModels : [],
        preferredModels: Array.isArray(parsed.preferredModels) ? parsed.preferredModels : [],
        // Ensure numeric values are correct
        lastApiKeyValidation: parsed.lastApiKeyValidation ? Number(parsed.lastApiKeyValidation) : null,
        lastModelFetch: parsed.lastModelFetch ? Number(parsed.lastModelFetch) : null,
      };
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
      return DEFAULT_SETTINGS;
    }
  }

  private saveSettings(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      this.notifyListeners();
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent(STORAGE_EVENTS.SETTINGS_UPDATED, {
        detail: this.settings,
      }));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }

  private handleStorageEvent(event: StorageEvent): void {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const newSettings = JSON.parse(event.newValue);
          this.settings = {
            ...DEFAULT_SETTINGS,
            ...newSettings,
            availableModels: Array.isArray(newSettings.availableModels) ? newSettings.availableModels : [],
            preferredModels: Array.isArray(newSettings.preferredModels) ? newSettings.preferredModels : [],
            lastApiKeyValidation: newSettings.lastApiKeyValidation ? Number(newSettings.lastApiKeyValidation) : null,
            lastModelFetch: newSettings.lastModelFetch ? Number(newSettings.lastModelFetch) : null,
          };
        this.notifyListeners();
      } catch (error) {
        console.warn('Failed to handle storage event:', error);
      }
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getSettings(): AppSettings {
    // Always attempt to reload from localStorage to reflect the latest persisted state.
    // This helps tests that modify localStorage directly and expect the storage singleton
    // to pick up changes without recreating the instance.
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.settings = {
            ...DEFAULT_SETTINGS,
            ...parsed,
            availableModels: Array.isArray(parsed.availableModels) ? parsed.availableModels : [],
            preferredModels: Array.isArray(parsed.preferredModels) ? parsed.preferredModels : [],
            lastApiKeyValidation: parsed.lastApiKeyValidation ? Number(parsed.lastApiKeyValidation) : null,
            lastModelFetch: parsed.lastModelFetch ? Number(parsed.lastModelFetch) : null,
          };
        }
      } catch (e) {
        // If parsing fails, fall back to the in-memory settings
        console.warn('Failed to refresh settings from localStorage:', e);
      }
    }

    return { ...this.settings };
  }

  updateApiKey(apiKey: string): void {
    this.settings.openRouterApiKey = apiKey;
    this.settings.isValidApiKey = false; // Reset validation on key change
    this.saveSettings();
  }

  validateApiKey(isValid: boolean): void {
    this.settings.isValidApiKey = isValid;
    // Set timestamp when valid, clear when invalid
    this.settings.lastApiKeyValidation = isValid ? Date.now() : null;
    this.saveSettings();
  }

  updateSelectedModel(modelId: string): void {
    this.settings.selectedModel = modelId;
    this.saveSettings();
  }

  updateCustomPrompt(prompt: string): void {
    this.settings.customPrompt = prompt;
    this.saveSettings();
  }

  updateModels(models: VisionModel[]): void {
    this.settings.availableModels = models;
    this.settings.lastModelFetch = Date.now();
    this.saveSettings();
  }

  updatePreferredModels(modelIds: string[]): void {
    this.settings.preferredModels = Array.isArray(modelIds) ? modelIds.slice(0, 5) : [];
    this.saveSettings();
  }

  clearSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
  }



  // Utility method to check if models need refreshing
  shouldRefreshModels(): boolean {
    if (!this.settings.lastModelFetch) {
      return true;
    }
    
    // Refresh if older than 24 hours
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return Date.now() - this.settings.lastModelFetch > oneDayInMs;
  }

  // Get a specific model by ID
  getModelById(modelId: string): VisionModel | null {
    return this.settings.availableModels.find(model => model.id === modelId) || null;
  }

  // Get the currently selected model
  getSelectedModel(): VisionModel | null {
    if (!this.settings.selectedModel) {
      return null;
    }
    return this.getModelById(this.settings.selectedModel);
  }

  getPreferredModels(): string[] {
    return Array.isArray(this.settings.preferredModels) ? [...this.settings.preferredModels] : [];
  }
}

// Image State Storage for persisting uploaded images and generated prompts
const DEFAULT_IMAGE_STATE: PersistedImageState = {
  preview: null,
  fileName: null,
  fileSize: null,
  fileType: null,
  generatedPrompt: null,
};

export class ImageStateStorage {
  private static instance: ImageStateStorage;
  private imageState: PersistedImageState;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.imageState = this.loadImageState();
  }

  static getInstance(): ImageStateStorage {
    if (!ImageStateStorage.instance) {
      ImageStateStorage.instance = new ImageStateStorage();
    }
    return ImageStateStorage.instance;
  }

  private loadImageState(): PersistedImageState {
    if (typeof window === 'undefined') {
      return DEFAULT_IMAGE_STATE;
    }

    try {
      const stored = localStorage.getItem(IMAGE_STATE_KEY);
      if (!stored) {
        return DEFAULT_IMAGE_STATE;
      }

      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_IMAGE_STATE,
        ...parsed,
      };
    } catch (error) {
      console.warn('Failed to load image state from localStorage:', error);
      return DEFAULT_IMAGE_STATE;
    }
  }

  private saveImageState(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(IMAGE_STATE_KEY, JSON.stringify(this.imageState));
      this.notifyListeners();
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent(STORAGE_EVENTS.IMAGE_STATE_UPDATED, {
        detail: this.imageState,
      }));
    } catch (error) {
      console.error('Failed to save image state to localStorage:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getImageState(): PersistedImageState {
    return { ...this.imageState };
  }

  saveUploadedImage(preview: string, fileName: string, fileSize: number, fileType: string): void {
    this.imageState = {
      ...this.imageState,
      preview,
      fileName,
      fileSize,
      fileType,
    };
    this.saveImageState();
  }

  saveGeneratedPrompt(prompt: string): void {
    this.imageState = {
      ...this.imageState,
      generatedPrompt: prompt,
    };
    this.saveImageState();
  }

  clearImageState(): void {
    this.imageState = { ...DEFAULT_IMAGE_STATE };
    this.saveImageState();
  }

  clearGeneratedPrompt(): void {
    this.imageState = {
      ...this.imageState,
      generatedPrompt: null,
    };
    this.saveImageState();
  }
}

// Export singleton instance
export const settingsStorage = SettingsStorage.getInstance();
export const imageStateStorage = ImageStateStorage.getInstance();

// React hook for using settings
export const useSettings = () => {
  const getSettings = () => settingsStorage.getSettings();
  
  const updateApiKey = (apiKey: string) => settingsStorage.updateApiKey(apiKey);
  const validateApiKey = (isValid: boolean) => settingsStorage.validateApiKey(isValid);
  const updateSelectedModel = (modelId: string) => settingsStorage.updateSelectedModel(modelId);
  const updateCustomPrompt = (prompt: string) => settingsStorage.updateCustomPrompt(prompt);
  const updateModels = (models: VisionModel[]) => settingsStorage.updateModels(models);
  const clearSettings = () => settingsStorage.clearSettings();
  const shouldRefreshModels = () => settingsStorage.shouldRefreshModels();
  const getModelById = (modelId: string) => settingsStorage.getModelById(modelId);
  const getSelectedModel = () => settingsStorage.getSelectedModel();

  return {
    getSettings,
    updateApiKey,
    validateApiKey,
    updateSelectedModel,
    updateCustomPrompt,
    updateModels,
    updatePreferredModels: (modelIds: string[]) => settingsStorage.updatePreferredModels(modelIds),
    clearSettings,
    shouldRefreshModels,
    getModelById,
    getSelectedModel,
    getPreferredModels: () => settingsStorage.getPreferredModels(),
    subscribe: settingsStorage.subscribe.bind(settingsStorage),
  };
};
