/**
 * Storage Layer - Single Source of Truth
 *
 * This is the ONLY storage implementation. Do not create duplicate implementations.
 * If performance optimizations are needed, add them here.
 *
 * Features:
 * - Singleton pattern for consistent state
 * - Pub/sub subscriptions with selective updates
 * - Debounced writes for performance
 * - Cross-tab synchronization
 * - Deep equality checking to prevent unnecessary re-renders
 */

import type {
  AppSettings,
  VisionModel,
  PersistedImageState,
  BatchEntry,
  ImageBatchEntry,
  ModelResult,
} from "@/types";

const STORAGE_KEY = "image-to-prompt-settings";
const IMAGE_STATE_KEY = "image-to-prompt-image-state";

export const STORAGE_EVENTS = {
  SETTINGS_UPDATED: "image-to-prompt-settings-updated",
  IMAGE_STATE_UPDATED: "image-to-prompt-image-state-updated",
} as const;

type SettingsKey = keyof AppSettings;
type SubscriptionCallback = (
  newValue: AppSettings,
  oldValue: AppSettings,
  changedKeys?: SettingsKey[],
) => void;
type UnsubscribeFunction = () => void;

interface Subscription {
  id: string;
  callback: SubscriptionCallback;
  keys?: SettingsKey[]; // If undefined, subscribe to all changes
  immediate?: boolean; // Call immediately with current value
}

const DEFAULT_SETTINGS: AppSettings = {
  openRouterApiKey: "",
  selectedModel: "",
  selectedVisionModels: [],
  customPrompt:
    "Describe this image in detail and suggest a good prompt for generating similar images.",
  isValidApiKey: false,
  lastApiKeyValidation: null,
  lastModelFetch: null,
  availableModels: [],
  preferredModels: [],
  pinnedModels: [],
};

/**
 * Centralized settings storage with localStorage persistence.
 *
 * This is the ONLY settings storage implementation. All components should use
 * this singleton instance via settingsStorage or the useSettings hook.
 *
 * @example
 * const storage = SettingsStorage.getInstance();
 * storage.subscribe((settings) => console.log(settings), { keys: ['apiKey'] });
 * storage.updateApiKey('new-key');
 */
export class SettingsStorage {
  private static instance: SettingsStorage;
  private settings: AppSettings;
  private subscriptions = new Map<string, Subscription>();
  private subscriptionCounter = 0;
  private lastSettings: AppSettings | null = null;

  // Debounced notification to prevent rapid fire updates
  private notificationTimeout: NodeJS.Timeout | null = null;
  private pendingNotifications = new Set<SettingsKey>();

  private constructor() {
    this.settings = this.loadSettings();
    this.lastSettings = { ...this.settings };

    // Listen for storage events from other tabs/windows
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorageEvent.bind(this));
    }
  }

  static getInstance(): SettingsStorage {
    if (!SettingsStorage.instance) {
      SettingsStorage.instance = new SettingsStorage();
    }
    return SettingsStorage.instance;
  }

  private loadSettings(): AppSettings {
    if (typeof window === "undefined") {
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
        availableModels: Array.isArray(parsed.availableModels)
          ? parsed.availableModels
          : [],
        preferredModels: Array.isArray(parsed.preferredModels)
          ? parsed.preferredModels
          : [],
        // Ensure numeric values are correct
        lastApiKeyValidation: parsed.lastApiKeyValidation
          ? Number(parsed.lastApiKeyValidation)
          : null,
        lastModelFetch: parsed.lastModelFetch
          ? Number(parsed.lastModelFetch)
          : null,
      };
    } catch (error) {
      console.warn("Failed to load settings from localStorage:", error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Deep equality check for preventing unnecessary updates
   */
  private isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;
      return a.every((item, index) => this.isEqual(item, b[index]));
    }

    if (typeof a === "object") {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every((key) =>
        this.isEqual(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key],
        ),
      );
    }

    return false;
  }

  /**
   * Debounced notification system to prevent excessive updates
   */
  private notifySubscribers(changedKeys: SettingsKey[] = []): void {
    // Add changed keys to pending set
    changedKeys.forEach((key) => this.pendingNotifications.add(key));

    // Clear existing timeout
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    // Debounce notifications
    this.notificationTimeout = setTimeout(() => {
      const currentSettings = { ...this.settings };
      const previousSettings = this.lastSettings || currentSettings;
      const allChangedKeys = Array.from(this.pendingNotifications);

      // Notify relevant subscribers
      this.subscriptions.forEach((subscription) => {
        const { callback, keys } = subscription;

        // Check if this subscription cares about any of the changed keys
        const shouldNotify =
          !keys || keys.some((key) => allChangedKeys.includes(key));

        if (shouldNotify) {
          try {
            callback(currentSettings, previousSettings, allChangedKeys);
          } catch (error) {
            console.error("Error in settings subscription callback:", error);
          }
        }
      });

      // Update last known settings and clear pending notifications
      this.lastSettings = { ...currentSettings };
      this.pendingNotifications.clear();
    }, 50); // 50ms debounce for better performance
  }

  /**
   * Subscribe to specific settings changes with selective updates
   */
  public subscribe(
    callback: SubscriptionCallback,
    options: {
      keys?: SettingsKey[];
      immediate?: boolean;
    } = {},
  ): UnsubscribeFunction {
    const { keys, immediate = false } = options;
    const id = `sub_${++this.subscriptionCounter}`;

    const subscription: Subscription = {
      id,
      callback,
      ...(keys && { keys }),
      ...(immediate && { immediate }),
    };

    this.subscriptions.set(id, subscription);

    // Call immediately if requested
    if (immediate) {
      const currentSettings = { ...this.settings };
      try {
        callback(currentSettings, currentSettings, []);
      } catch (error) {
        console.error("Error in immediate subscription callback:", error);
      }
    }

    return () => {
      this.subscriptions.delete(id);
    };
  }

  /**
   * Subscribe to a single setting key
   */
  public subscribeToKey<K extends SettingsKey>(
    key: K,
    callback: (newValue: AppSettings[K], oldValue: AppSettings[K]) => void,
    immediate = false,
  ): UnsubscribeFunction {
    return this.subscribe(
      (newSettings, oldSettings) => {
        const newValue = newSettings[key];
        const oldValue = oldSettings[key];
        if (!this.isEqual(newValue, oldValue)) {
          callback(newValue, oldValue);
        }
      },
      { keys: [key], immediate },
    );
  }

  /**
   * Batch update multiple settings atomically
   */
  public batchUpdate(updates: Partial<AppSettings>): void {
    const currentSettings = { ...this.settings };
    const newSettings = { ...currentSettings, ...updates };
    const changedKeys: SettingsKey[] = [];

    // Identify what actually changed
    (Object.keys(updates) as SettingsKey[]).forEach((key) => {
      if (!this.isEqual(currentSettings[key], newSettings[key])) {
        changedKeys.push(key);
      }
    });

    // Only update and notify if something actually changed
    if (changedKeys.length > 0) {
      this.settings = newSettings;
      this.saveSettings(changedKeys);
    }
  }

  private saveSettings(changedKeys: SettingsKey[] = []): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));

      // Dispatch custom event for other components
      window.dispatchEvent(
        new CustomEvent(STORAGE_EVENTS.SETTINGS_UPDATED, {
          detail: { settings: this.settings, changedKeys },
        }),
      );

      // Notify subscribers with debouncing
      this.notifySubscribers(changedKeys);
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  }

  private handleStorageEvent(event: StorageEvent): void {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const newSettings = JSON.parse(event.newValue);
        const previousSettings = { ...this.settings };

        this.settings = {
          ...DEFAULT_SETTINGS,
          ...newSettings,
          availableModels: Array.isArray(newSettings.availableModels)
            ? newSettings.availableModels
            : [],
          preferredModels: Array.isArray(newSettings.preferredModels)
            ? newSettings.preferredModels
            : [],
          lastApiKeyValidation: newSettings.lastApiKeyValidation
            ? Number(newSettings.lastApiKeyValidation)
            : null,
          lastModelFetch: newSettings.lastModelFetch
            ? Number(newSettings.lastModelFetch)
            : null,
        };

        // Determine what changed for cross-tab notifications
        const changedKeys: SettingsKey[] = [];
        (Object.keys(this.settings) as SettingsKey[]).forEach((key) => {
          if (!this.isEqual(previousSettings[key], this.settings[key])) {
            changedKeys.push(key);
          }
        });

        this.notifySubscribers(changedKeys);
      } catch (error) {
        console.warn("Failed to handle storage event:", error);
      }
    }
  }

  getSettings(): AppSettings {
    // Always attempt to reload from localStorage to reflect the latest persisted state.
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.settings = {
            ...DEFAULT_SETTINGS,
            ...parsed,
            availableModels: Array.isArray(parsed.availableModels)
              ? parsed.availableModels
              : [],
            preferredModels: Array.isArray(parsed.preferredModels)
              ? parsed.preferredModels
              : [],
            lastApiKeyValidation: parsed.lastApiKeyValidation
              ? Number(parsed.lastApiKeyValidation)
              : null,
            lastModelFetch: parsed.lastModelFetch
              ? Number(parsed.lastModelFetch)
              : null,
          };
        }
      } catch (e) {
        console.warn("Failed to refresh settings from localStorage:", e);
      }
    }
    return { ...this.settings };
  }

  // Individual update methods now use batchUpdate for consistency
  updateApiKey(apiKey: string): void {
    this.batchUpdate({
      openRouterApiKey: apiKey,
      isValidApiKey: false, // Reset validation when API key changes
    });
  }

  validateApiKey(isValid: boolean): void {
    this.batchUpdate({
      isValidApiKey: isValid,
      lastApiKeyValidation: isValid ? Date.now() : null,
    });
  }

  updateSelectedModel(modelId: string): void {
    this.batchUpdate({ selectedModel: modelId });
  }

  updateSelectedVisionModels(modelIds: string[]): void {
    this.batchUpdate({ selectedVisionModels: modelIds.slice(0, 5) });
  }

  updateCustomPrompt(prompt: string): void {
    this.batchUpdate({ customPrompt: prompt });
  }

  updateModels(models: VisionModel[]): void {
    this.batchUpdate({
      availableModels: models,
      lastModelFetch: Date.now(),
    });
  }

  updatePreferredModels(modelIds: string[]): void {
    this.batchUpdate({
      preferredModels: Array.isArray(modelIds) ? modelIds.slice(0, 5) : [],
    });
  }

  updatePinnedModels(modelIds: string[]): void {
    this.batchUpdate({
      pinnedModels: Array.isArray(modelIds)
        ? Array.from(new Set(modelIds)).slice(0, 9)
        : [],
    });
  }

  clearSettings(): void {
    const allKeys = Object.keys(DEFAULT_SETTINGS) as SettingsKey[];
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings(allKeys);
  }

  shouldRefreshModels(): boolean {
    if (!this.settings.lastModelFetch) {
      return true;
    }

    const oneDayInMs = 24 * 60 * 60 * 1000;
    return Date.now() - this.settings.lastModelFetch > oneDayInMs;
  }

  getModelById(modelId: string): VisionModel | null {
    return (
      this.settings.availableModels.find((model) => model.id === modelId) ||
      null
    );
  }

  getSelectedModel(): VisionModel | null {
    if (!this.settings.selectedModel) {
      return null;
    }
    return this.getModelById(this.settings.selectedModel);
  }

  getPreferredModels(): string[] {
    return Array.isArray(this.settings.preferredModels)
      ? [...this.settings.preferredModels]
      : [];
  }

  // Pin/unpin models for quick access favorites (cap 9, add-to-front)
  pinModel(modelId: string): void {
    if (!Array.isArray(this.settings.pinnedModels)) {
      this.settings.pinnedModels = [];
    }

    if (!this.settings.pinnedModels.includes(modelId)) {
      this.settings.pinnedModels = [
        modelId,
        ...this.settings.pinnedModels,
      ].slice(0, 9);
      this.saveSettings();
    }
  }

  unpinModel(modelId: string): void {
    const currentPinned = this.getPinnedModels();
    const newPinned = currentPinned.filter((id) => id !== modelId);
    this.batchUpdate({ pinnedModels: newPinned });
  }

  togglePinnedModel(modelId: string): void {
    if (!modelId) return;
    if (this.isModelPinned(modelId)) {
      this.unpinModel(modelId);
    } else {
      this.pinModel(modelId);
    }
  }

  getPinnedModels(): string[] {
    return Array.isArray(this.settings.pinnedModels)
      ? [...this.settings.pinnedModels]
      : [];
  }

  isModelPinned(modelId: string): boolean {
    return (
      Array.isArray(this.settings.pinnedModels) &&
      this.settings.pinnedModels.includes(modelId)
    );
  }
}

// Image State Storage for persisting uploaded images and generated prompts
const DEFAULT_IMAGE_STATE: PersistedImageState = {
  preview: null,
  fileName: null,
  fileSize: null,
  fileType: null,
  generatedPrompt: null,
  modelResults: [],
  isGenerating: false,
  schemaVersion: 1,
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
    if (typeof window === "undefined") {
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
      console.warn("Failed to load image state from localStorage:", error);
      return DEFAULT_IMAGE_STATE;
    }
  }

  private saveImageState(): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(IMAGE_STATE_KEY, JSON.stringify(this.imageState));
      this.notifyListeners();

      // Dispatch custom event for other components
      window.dispatchEvent(
        new CustomEvent(STORAGE_EVENTS.IMAGE_STATE_UPDATED, {
          detail: this.imageState,
        }),
      );
    } catch (error) {
      console.error("Failed to save image state to localStorage:", error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("Error in image state listener:", error);
      }
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getImageState(): PersistedImageState {
    return { ...this.imageState };
  }

  saveUploadedImage(
    preview: string,
    fileName: string,
    fileSize: number,
    fileType: string,
  ): void {
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

  saveModelResults(modelResults: ModelResult[]): void {
    this.imageState = {
      ...this.imageState,
      modelResults,
    };
    this.saveImageState();
  }

  saveGenerationStatus(isGenerating: boolean): void {
    this.imageState = {
      ...this.imageState,
      isGenerating,
    };
    this.saveImageState();
  }

  updateSingleModelResult(index: number, updates: Partial<ModelResult>): void {
    const currentResults = Array.isArray(this.imageState.modelResults)
      ? [...this.imageState.modelResults]
      : [];

    if (index >= 0 && index < currentResults.length && currentResults[index]) {
      currentResults[index] = {
        ...currentResults[index]!,
        ...updates,
      };
      this.saveModelResults(currentResults);
    }
  }

  clearGeneratedPrompt(): void {
    this.imageState = {
      ...this.imageState,
      generatedPrompt: null,
    };
    this.saveImageState();
  }

  clearImageState(): void {
    this.imageState = { ...DEFAULT_IMAGE_STATE };
    this.saveImageState();
  }

  saveBatchEntry(batchEntry: BatchEntry): void {
    const currentHistory = Array.isArray(this.imageState.batchHistory)
      ? this.imageState.batchHistory
      : [];
    this.imageState = {
      ...this.imageState,
      batchHistory: [batchEntry, ...currentHistory].slice(0, 50),
    };
    this.saveImageState();
  }

  getBatchHistory(): BatchEntry[] {
    return Array.isArray(this.imageState.batchHistory)
      ? [...this.imageState.batchHistory]
      : [];
  }

  clearBatchHistory(): void {
    this.imageState = {
      ...this.imageState,
      batchHistory: [],
    };
    this.saveImageState();
  }

  saveImageBatchEntry(entry: ImageBatchEntry): void {
    const current = Array.isArray(this.imageState.imageBatchHistory)
      ? this.imageState.imageBatchHistory
      : [];
    this.imageState = {
      ...this.imageState,
      imageBatchHistory: [entry, ...current].slice(0, 50),
    };
    this.saveImageState();
  }

  getImageBatchHistory(): ImageBatchEntry[] {
    return Array.isArray(this.imageState.imageBatchHistory)
      ? [...this.imageState.imageBatchHistory]
      : [];
  }

  clearImageBatchHistory(): void {
    this.imageState = {
      ...this.imageState,
      imageBatchHistory: [],
    };
    this.saveImageState();
  }
}

export const settingsStorage = SettingsStorage.getInstance();
export const imageStateStorage = ImageStateStorage.getInstance();

export const useSettings = () => {
  const getSettings = () => settingsStorage.getSettings();

  const updateApiKey = (apiKey: string) => settingsStorage.updateApiKey(apiKey);
  const validateApiKey = (isValid: boolean) =>
    settingsStorage.validateApiKey(isValid);
  const updateSelectedModel = (modelId: string) =>
    settingsStorage.updateSelectedModel(modelId);
  const updateCustomPrompt = (prompt: string) =>
    settingsStorage.updateCustomPrompt(prompt);
  const updateModels = (models: VisionModel[]) =>
    settingsStorage.updateModels(models);
  const clearSettings = () => settingsStorage.clearSettings();
  const shouldRefreshModels = () => settingsStorage.shouldRefreshModels();
  const getModelById = (modelId: string) =>
    settingsStorage.getModelById(modelId);
  const getSelectedModel = () => settingsStorage.getSelectedModel();

  return {
    getSettings,
    updateApiKey,
    validateApiKey,
    updateSelectedModel,
    updateCustomPrompt,
    updateModels,
    clearSettings,
    shouldRefreshModels,
    getModelById,
    getSelectedModel,
    subscribe: settingsStorage.subscribe.bind(settingsStorage),
  };
};
