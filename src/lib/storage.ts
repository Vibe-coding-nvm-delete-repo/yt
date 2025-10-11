import { AppSettings, VisionModel } from '@/types';

const STORAGE_KEY = 'image-to-prompt-settings';

export const STORAGE_EVENTS = {
  SETTINGS_UPDATED: 'image-to-prompt-settings-updated',
} as const;

const DEFAULT_SETTINGS: AppSettings = {
  openRouterApiKey: '',
  selectedModel: '',
  customPrompt: 'Describe this image in detail and suggest a good prompt for generating similar images.',
  isValidApiKey: false,
  lastApiKeyValidation: null,
  lastModelFetch: null,
  availableModels: [],
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
    return { ...this.settings };
  }

  updateApiKey(apiKey: string): void {
    this.settings.openRouterApiKey = apiKey;
    this.settings.isValidApiKey = false; // Reset validation on key change
    this.saveSettings();
  }

  validateApiKey(isValid: boolean): void {
    this.settings.isValidApiKey = isValid;
    if (isValid) {
      this.settings.lastApiKeyValidation = Date.now();
    }
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

  clearSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
  }

  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  importSettings(settingsJson: string): boolean {
    try {
      const imported = JSON.parse(settingsJson);
      
      // Validate imported settings
      if (typeof imported !== 'object' || imported === null) {
        throw new Error('Invalid settings format');
      }

      this.settings = {
        ...DEFAULT_SETTINGS,
        ...imported,
        availableModels: Array.isArray(imported.availableModels) ? imported.availableModels : [],
        lastApiKeyValidation: imported.lastApiKeyValidation ? Number(imported.lastApiKeyValidation) : null,
        lastModelFetch: imported.lastModelFetch ? Number(imported.lastModelFetch) : null,
      };
      
      this.saveSettings();
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
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
}

// Export singleton instance
export const settingsStorage = SettingsStorage.getInstance();

// React hook for using settings
export const useSettings = () => {
  const getSettings = () => settingsStorage.getSettings();
  
  const updateApiKey = (apiKey: string) => settingsStorage.updateApiKey(apiKey);
  const validateApiKey = (isValid: boolean) => settingsStorage.validateApiKey(isValid);
  const updateSelectedModel = (modelId: string) => settingsStorage.updateSelectedModel(modelId);
  const updateCustomPrompt = (prompt: string) => settingsStorage.updateCustomPrompt(prompt);
  const updateModels = (models: VisionModel[]) => settingsStorage.updateModels(models);
  const clearSettings = () => settingsStorage.clearSettings();
  const exportSettings = () => settingsStorage.exportSettings();
  const importSettings = (settingsJson: string) => settingsStorage.importSettings(settingsJson);
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
    clearSettings,
    exportSettings,
    importSettings,
    shouldRefreshModels,
    getModelById,
    getSelectedModel,
    subscribe: settingsStorage.subscribe.bind(settingsStorage),
  };
};
