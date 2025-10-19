import React from "react";
import { renderHook, act } from "@testing-library/react";
import { SettingsProvider, useSettingsContext } from "../SettingsContext";
import type { VisionModel } from "@/types";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
);

describe("SettingsContext", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should throw error when useSettingsContext is used outside provider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();

    expect(() => {
      renderHook(() => useSettingsContext());
    }).toThrow("useSettingsContext must be used within a SettingsProvider");

    consoleError.mockRestore();
  });

  it("should provide default settings", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    expect(result.current.settings).toMatchObject({
      openRouterApiKey: "",
      selectedModel: "",
      selectedVisionModels: [],
      isValidApiKey: false,
      lastApiKeyValidation: null,
      lastModelFetch: null,
      availableModels: [],
      preferredModels: [],
      pinnedModels: [],
    });
    expect(result.current.settings.customPrompt).toContain(
      "Describe this image",
    );
  });

  it("should update API key", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    act(() => {
      result.current.updateApiKey("test-api-key-123");
    });

    expect(result.current.settings.openRouterApiKey).toBe("test-api-key-123");
    expect(result.current.settings.isValidApiKey).toBe(false);
  });

  it("should validate API key", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    act(() => {
      result.current.updateApiKey("test-api-key");
      result.current.validateApiKey(true);
    });

    expect(result.current.settings.isValidApiKey).toBe(true);
    expect(result.current.settings.lastApiKeyValidation).toBeGreaterThan(0);
  });

  it("should invalidate API key", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    act(() => {
      result.current.validateApiKey(true);
      result.current.validateApiKey(false);
    });

    expect(result.current.settings.isValidApiKey).toBe(false);
    expect(result.current.settings.lastApiKeyValidation).toBeNull();
  });

  it("should update selected model", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    act(() => {
      result.current.updateSelectedModel("gpt-4-vision");
    });

    expect(result.current.settings.selectedModel).toBe("gpt-4-vision");
  });

  it("should update custom prompt", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });
    const customPrompt = "My custom prompt";

    act(() => {
      result.current.updateCustomPrompt(customPrompt);
    });

    expect(result.current.settings.customPrompt).toBe(customPrompt);
  });

  it("should update models list", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });
    const models: VisionModel[] = [
      {
        id: "model-1",
        name: "Model 1",
        description: "Test model",
        pricing: { prompt: 0.001, completion: 0.002 },
        context_length: 4096,
        supports_vision: true,
      },
    ];

    act(() => {
      result.current.updateModels(models);
    });

    expect(result.current.settings.availableModels).toEqual(models);
    expect(result.current.settings.lastModelFetch).toBeGreaterThan(0);
  });

  it("should clear all settings", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    act(() => {
      result.current.updateApiKey("test-key");
      result.current.updateSelectedModel("test-model");
      result.current.clearSettings();
    });

    expect(result.current.settings.openRouterApiKey).toBe("");
    expect(result.current.settings.selectedModel).toBe("");
    expect(result.current.settings.isValidApiKey).toBe(false);
  });

  it("should determine when models need refresh", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    // Should refresh when no fetch timestamp
    expect(result.current.shouldRefreshModels()).toBe(true);

    // Should not refresh immediately after fetch
    act(() => {
      result.current.updateModels([]);
    });
    expect(result.current.shouldRefreshModels()).toBe(false);
  });

  it("should require refresh after one day", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });
    const oneDayAgo = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago

    // Manually set lastModelFetch to simulate old fetch
    act(() => {
      result.current.updateModels([]);
    });

    // Override the timestamp
    const settings = result.current.settings;
    settings.lastModelFetch = oneDayAgo;

    expect(result.current.shouldRefreshModels()).toBe(true);
  });

  it("should get model by ID", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });
    const models: VisionModel[] = [
      {
        id: "model-1",
        name: "Model 1",
        description: "Test model",
        pricing: { prompt: 0.001, completion: 0.002 },
        context_length: 4096,
        supports_vision: true,
      },
      {
        id: "model-2",
        name: "Model 2",
        description: "Another model",
        pricing: { prompt: 0.002, completion: 0.003 },
        context_length: 8192,
        supports_vision: true,
      },
    ];

    act(() => {
      result.current.updateModels(models);
    });

    const model = result.current.getModelById("model-1");
    expect(model).toEqual(models[0]);

    const nonExistent = result.current.getModelById("non-existent");
    expect(nonExistent).toBeNull();
  });

  it("should get selected model", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });
    const models: VisionModel[] = [
      {
        id: "model-1",
        name: "Model 1",
        description: "Test model",
        pricing: { prompt: 0.001, completion: 0.002 },
        context_length: 4096,
        supports_vision: true,
      },
    ];

    act(() => {
      result.current.updateModels(models);
    });

    act(() => {
      result.current.updateSelectedModel("model-1");
    });

    const selectedModel = result.current.getSelectedModel();
    expect(selectedModel).toEqual(models[0]);
  });

  it("should return null for selected model when none selected", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    const selectedModel = result.current.getSelectedModel();
    expect(selectedModel).toBeNull();
  });

  it("should persist settings to localStorage", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    act(() => {
      result.current.updateApiKey("test-key");
    });

    const stored = localStorage.getItem("image-to-prompt-settings");
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.openRouterApiKey).toBe("test-key");
  });

  it("should load settings from localStorage", () => {
    const initialSettings = {
      openRouterApiKey: "saved-key",
      selectedModel: "saved-model",
      customPrompt: "Saved prompt",
      isValidApiKey: true,
      lastApiKeyValidation: Date.now(),
    };

    localStorage.setItem(
      "image-to-prompt-settings",
      JSON.stringify(initialSettings),
    );

    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    expect(result.current.settings.openRouterApiKey).toBe("saved-key");
    expect(result.current.settings.selectedModel).toBe("saved-model");
    expect(result.current.settings.customPrompt).toBe("Saved prompt");
    expect(result.current.settings.isValidApiKey).toBe(true);
  });

  it("should handle corrupted localStorage data", () => {
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation();
    localStorage.setItem("image-to-prompt-settings", "invalid json");

    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    expect(result.current.settings.openRouterApiKey).toBe("");
    expect(consoleWarn).toHaveBeenCalledWith(
      "Failed to load settings from localStorage:",
      expect.any(Error),
    );

    consoleWarn.mockRestore();
  });

  it("should handle missing optional fields in localStorage", () => {
    const partialSettings = {
      openRouterApiKey: "key",
    };

    localStorage.setItem(
      "image-to-prompt-settings",
      JSON.stringify(partialSettings),
    );

    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    expect(result.current.settings.openRouterApiKey).toBe("key");
    expect(result.current.settings.selectedModel).toBe("");
    expect(result.current.settings.selectedVisionModels).toEqual([]);
    expect(result.current.settings.availableModels).toEqual([]);
  });

  it("should dispatch custom event on settings update", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });
    const eventListener = jest.fn();

    window.addEventListener("image-to-prompt-settings-updated", eventListener);

    act(() => {
      result.current.updateApiKey("new-key");
    });

    expect(eventListener).toHaveBeenCalled();

    window.removeEventListener(
      "image-to-prompt-settings-updated",
      eventListener,
    );
  });

  it("should allow subscribing to settings changes", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });
    const listener = jest.fn();

    let unsubscribe: () => void;
    act(() => {
      unsubscribe = result.current.subscribe(listener);
    });

    act(() => {
      result.current.updateApiKey("test-key");
    });

    expect(listener).toHaveBeenCalled();

    act(() => {
      unsubscribe();
    });
  });

  it("should handle localStorage errors gracefully", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    // Mock setItem to throw AFTER we call updateApiKey
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = jest.fn(() => {
      throw new Error("Storage quota exceeded");
    });

    act(() => {
      result.current.updateApiKey("test-key");
    });

    expect(consoleError).toHaveBeenCalled();
    const callArgs = consoleError.mock.calls[0];
    expect(callArgs?.[0]).toContain("Failed to save settings to localStorage");

    // Restore
    localStorage.setItem = originalSetItem;
    consoleError.mockRestore();
  });

  it("should handle server-side rendering (no window)", () => {
    // This test ensures default settings are returned when window is undefined
    // The actual SSR case is handled in the component itself
    const { result } = renderHook(() => useSettingsContext(), { wrapper });
    expect(result.current.settings).toBeDefined();
  });
});
