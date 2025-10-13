import { renderHook, act } from "@testing-library/react";
import { useSettings } from "@/hooks/useSettings";
import type { AppSettings } from "@/types";

// Mock storage class
class MockSettingsStorage {
  private settings = {} as AppSettings;
  private listeners = [] as Array<() => void>;

  getSettings() {
    return this.settings;
  }

  updateSettings(newSettings: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.notifyListeners();
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
  }

  unsubscribe(listener: () => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l());
  }
}

const mockStorage = new MockSettingsStorage();

jest.doMock("@/lib/storage", () => ({
  settingsStorage: mockStorage,
}));

beforeEach(() => {
  mockStorage.updateSettings({
    openRouterApiKey: "test-key",
    customPrompt: "",
    selectedModel: "default-model",
    availableModels: [],
    isValidApiKey: false,
  });
});

describe("useSettings hook", () => {
  test("returns initial settings correctly", () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.settings).toEqual({
      openRouterApiKey: "test-key",
      customPrompt: "",
      selectedModel: "default-model",
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
      mockStorage.updateSettings({ openRouterApiKey: "new-key" });
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
      mockStorage.updateSettings({ isValidApiKey: true });
    });

    expect(result.current.settings.isValidApiKey).toBe(true);
  });
});
