import type { AppSettings, VisionModel } from "@/types";

const STORAGE_KEY = "image-to-prompt-settings";

type SettingsKey = keyof AppSettings;
// Pin the public callback contract to AppSettings to prevent drift
type SubscriptionCallback = (
  newValue: AppSettings,
  oldValue: AppSettings,
  changedKeys?: SettingsKey[],
) => void;
type UnsubscribeFunction = () => void;

interface Subscription {
  id: string;
  callback: SubscriptionCallback;
  keys?: SettingsKey[];
  immediate?: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  openRouterApiKey: "",
  selectedModel: "",
  selectedVisionModels: [],
  activeModels: [],
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
 * Performance-optimized settings storage with selective subscriptions
 * Eliminates excessive re-renders by only notifying relevant subscribers
 */
export class PerformanceSettingsStorage {
  private static instance: PerformanceSettingsStorage;
  private settings: AppSettings;
  private subscriptions = new Map<string, Subscription>();
  private subscriptionCounter = 0;
  private lastSettings: AppSettings | null = null;
  private notificationTimeout: NodeJS.Timeout | null = null;
  private pendingNotifications = new Set<SettingsKey>();

  private constructor() {
    this.settings = this.loadSettings();
    this.lastSettings = { ...this.settings };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorageEvent.bind(this));
    }
  }

  static getInstance(): PerformanceSettingsStorage {
    if (!PerformanceSettingsStorage.instance) {
      PerformanceSettingsStorage.instance = new PerformanceSettingsStorage();
    }
    return PerformanceSettingsStorage.instance;
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
      return {
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
    } catch (error) {
      console.warn("Failed to load settings from localStorage:", error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Deep equality check to prevent unnecessary updates
   */
  private isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;
      return a.every((item, index) =>
        this.isEqual(item, (b as unknown[])[index]),
      );
    }

    if (typeof a === "object") {
      const A = a as Record<string, unknown>;
      const B = b as Record<string, unknown>;
      const keysA = Object.keys(A);
      const keysB = Object.keys(B);
      if (keysA.length !== keysB.length) return false;
      return keysA.every((key) => this.isEqual(A[key], B[key]));
    }

    return false;
  }

  /**
   * Debounced notification system (50ms) to prevent excessive updates
   */
  private notifySubscribers(changedKeys: SettingsKey[] = []): void {
    changedKeys.forEach((key) => this.pendingNotifications.add(key));

    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    this.notificationTimeout = setTimeout(() => {
      const currentSettings = { ...this.settings };
      const previousSettings = this.lastSettings || currentSettings;
      const allChangedKeys = Array.from(this.pendingNotifications);

      // Only notify relevant subscribers
      this.subscriptions.forEach((subscription) => {
        const { callback, keys } = subscription;
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

      this.lastSettings = { ...currentSettings };
      this.pendingNotifications.clear();
    }, 50);
  }

  /**
   * Subscribe to specific settings changes - KEY PERFORMANCE FEATURE
   */
  public subscribe(
    callback: SubscriptionCallback,
    options: { keys?: SettingsKey[]; immediate?: boolean } = {},
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
   * Subscribe to a single setting key - MOST PERFORMANT
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
   * Batch update multiple settings atomically - PREVENTS MULTIPLE NOTIFICATIONS
   */
  public batchUpdate(updates: Partial<AppSettings>): void {
    const currentSettings = { ...this.settings };
    const newSettings = { ...currentSettings, ...updates };
    const changedKeys: SettingsKey[] = [];

    (Object.keys(updates) as SettingsKey[]).forEach((key) => {
      if (!this.isEqual(currentSettings[key], newSettings[key])) {
        changedKeys.push(key);
      }
    });

    if (changedKeys.length > 0) {
      this.settings = newSettings;
      this.saveSettings(changedKeys);
    }
  }

  private saveSettings(changedKeys: SettingsKey[] = []): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
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

        this.settings = { ...DEFAULT_SETTINGS, ...newSettings };

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
    return Object.freeze({ ...this.settings });
  }

  // Optimized individual update methods
  updateApiKey(apiKey: string): void {
    this.batchUpdate({
      openRouterApiKey: apiKey,
      isValidApiKey: false,
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

  updateCustomPrompt(prompt: string): void {
    this.batchUpdate({ customPrompt: prompt });
  }

  updateModels(models: VisionModel[]): void {
    this.batchUpdate({
      availableModels: models,
      lastModelFetch: Date.now(),
    });
  }

  pinModel(modelId: string): void {
    const currentPinned = Array.isArray(this.settings.pinnedModels)
      ? [...this.settings.pinnedModels]
      : [];

    if (!currentPinned.includes(modelId)) {
      const newPinned = [modelId, ...currentPinned].slice(0, 9);
      this.batchUpdate({ pinnedModels: newPinned });
    }
  }

  unpinModel(modelId: string): void {
    const currentPinned = Array.isArray(this.settings.pinnedModels)
      ? [...this.settings.pinnedModels]
      : [];

    const newPinned = currentPinned.filter((id) => id !== modelId);
    this.batchUpdate({ pinnedModels: newPinned });
  }
}

export const performanceStorage = PerformanceSettingsStorage.getInstance();
