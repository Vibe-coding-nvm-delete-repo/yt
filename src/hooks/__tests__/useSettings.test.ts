import { renderHook, act } from "@testing-library/react";
import type { AppSettings } from "@/types";

// Mock storage class
const DEFAULT_SETTINGS: AppSettings = {
  openRouterApiKey: "",
  customPrompt:
    "Describe this image in detail and suggest a good prompt for generating similar images.",
  selectedModel: "",
  selectedVisionModels: [],
  availableModels: [],
  preferredModels: [],
  pinnedModels: [],
  isValidApiKey: false,
  lastApiKeyValidation: null,
  lastModelFetch: null,
};

class MockSettingsStorage {
  private settings: AppSettings = { ...DEFAULT_SETTINGS };
  private listeners: Array<
    (
      newSettings: AppSettings,
      oldSettings: AppSettings,
      changedKeys: (keyof AppSettings)[],
    ) => void
  > = [];

  getSettings() {
    return this.settings;
  }

  private emit(prev: AppSettings, changedKeys: (keyof AppSettings)[]) {
    const snapshot = { ...this.settings };
    const previousSnapshot = { ...prev };
    this.listeners.forEach((listener) =>
      listener(snapshot, previousSnapshot, changedKeys),
    );
  }

  batchUpdate(newSettings: Partial<AppSettings>) {
    const prev = this.settings;
    this.settings = { ...this.settings, ...newSettings };
    const changedKeys = Object.keys(newSettings) as (keyof AppSettings)[];
    this.emit(prev, changedKeys);
    return prev;
  }

  updateApiKey(apiKey: string) {
    this.batchUpdate({ openRouterApiKey: apiKey, isValidApiKey: false });
  }

  validateApiKey(isValid: boolean) {
    this.batchUpdate({ isValidApiKey: isValid });
  }

  updateSelectedModel(modelId: string) {
    this.batchUpdate({ selectedModel: modelId });
  }

  updateCustomPrompt(prompt: string) {
    this.batchUpdate({ customPrompt: prompt });
  }

  updateModels(models: AppSettings["availableModels"]) {
    this.batchUpdate({ availableModels: models });
  }

  updatePinnedModels(pinned: string[]) {
    this.batchUpdate({ pinnedModels: pinned });
  }

  pinModel(modelId: string) {
    this.batchUpdate({
      pinnedModels: [...(this.settings.pinnedModels ?? []), modelId],
    });
  }

  unpinModel(modelId: string) {
    this.batchUpdate({
      pinnedModels: (this.settings.pinnedModels ?? []).filter(
        (id) => id !== modelId,
      ),
    });
  }

  togglePinnedModel(modelId: string) {
    const pinned = new Set(this.settings.pinnedModels ?? []);
    if (pinned.has(modelId)) {
      pinned.delete(modelId);
    } else {
      pinned.add(modelId);
    }
    this.batchUpdate({ pinnedModels: Array.from(pinned) });
  }

  clearSettings() {
    const prev = this.settings;
    this.settings = { ...DEFAULT_SETTINGS };
    this.emit(prev, []);
  }

  shouldRefreshModels() {
    return false;
  }

  getModelById() {
    return undefined;
  }

  getSelectedModel() {
    return this.settings.selectedModel;
  }

  getPinnedModels() {
    return this.settings.pinnedModels ?? [];
  }

  subscribe(
    listener: (
      newSettings: AppSettings,
      oldSettings: AppSettings,
      changedKeys: (keyof AppSettings)[],
    ) => void,
  ) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== listener);
    };
  }

  subscribeToKey() {
    return () => {};
  }
}

const mockStorage = new MockSettingsStorage();

jest.mock("@/lib/storage", () => ({
  settingsStorage: mockStorage,
}));

import { useSettings } from "@/hooks/useSettings";

beforeEach(() => {
  mockStorage.clearSettings();
});

describe("useSettings hook", () => {
  test("returns initial settings correctly", () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.settings).toEqual({
      openRouterApiKey: "",
      customPrompt:
        "Describe this image in detail and suggest a good prompt for generating similar images.",
      selectedModel: "",
      selectedVisionModels: [],
      availableModels: [],
      preferredModels: [],
      pinnedModels: [],
      isValidApiKey: false,
      lastApiKeyValidation: null,
      lastModelFetch: null,
    });
  });

  test("subscribes to storage updates", async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      result.current.updateSettings({ openRouterApiKey: "new-key" });
    });

    expect(result.current.settings.openRouterApiKey).toBe("new-key");
  });

  test("can update API key and validate", async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      result.current.updateSettings({ openRouterApiKey: "new-valid-key" });
    });

    expect(result.current.settings.openRouterApiKey).toBe("new-valid-key");
  });

  test("handles validation state correctly", async () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.settings.isValidApiKey).toBe(false);

    await act(async () => {
      result.current.updateSettings({ isValidApiKey: true });
    });

    expect(result.current.settings.isValidApiKey).toBe(true);
  });
});
