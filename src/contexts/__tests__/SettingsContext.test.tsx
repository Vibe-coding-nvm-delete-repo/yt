import React from "react";
import { renderHook, act } from "@testing-library/react";
import { SettingsProvider, useSettingsContext } from "../SettingsContext";
import type { VisionModel } from "@/types";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
);

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

describe("useSettingsContext", () => {
  it("should throw error when used outside provider", () => {
    // Suppress console.error for this test
    const consoleError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderHook(() => useSettingsContext());
    }).toThrow("useSettingsContext must be used within a SettingsProvider");

    console.error = consoleError;
  });

  it("should provide initial default settings", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    expect(result.current.settings).toEqual({
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
    });
  });

  it("should load settings from localStorage", () => {
    const storedSettings = {
      openRouterApiKey: "test-key",
      selectedModel: "model-1",
      customPrompt: "Custom prompt text",
      isValidApiKey: true,
    };

    localStorageMock.setItem(
      "image-to-prompt-settings",
      JSON.stringify(storedSettings),
    );

    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    expect(result.current.settings.openRouterApiKey).toBe("test-key");
    expect(result.current.settings.selectedModel).toBe("model-1");
    expect(result.current.settings.customPrompt).toBe("Custom prompt text");
    expect(result.current.settings.isValidApiKey).toBe(true);
  });

  it("should handle corrupted localStorage data", () => {
    const consoleWarn = console.warn;
    console.warn = jest.fn();

    localStorageMock.setItem("image-to-prompt-settings", "invalid json");

    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    expect(console.warn).toHaveBeenCalledWith(
      "Failed to load settings from localStorage:",
      expect.any(Error),
    );
    expect(result.current.settings.openRouterApiKey).toBe("");

    console.warn = consoleWarn;
  });
});

describe("SettingsProvider - API Key Management", () => {
  it("should update API key", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    act(() => {
      result.current.updateApiKey("new-api-key");
    });

    expect(result.current.settings.openRouterApiKey).toBe("new-api-key");
    expect(result.current.settings.isValidApiKey).toBe(false);
  });

  it("should validate API key", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    act(() => {
      result.current.validateApiKey(true);
    });

    expect(result.current.settings.isValidApiKey).toBe(true);
    expect(result.current.settings.lastApiKeyValidation).toBeGreaterThan(0);
  });

  it("should invalidate API key", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    act(() => {
      result.current.validateApiKey(true);
    });

    expect(result.current.settings.isValidApiKey).toBe(true);

    act(() => {
      result.current.validateApiKey(false);
    });

    expect(result.current.settings.isValidApiKey).toBe(false);
    expect(result.current.settings.lastApiKeyValidation).toBeNull();
  });
});

describe("SettingsProvider - Model Management", () => {
  const mockModels: VisionModel[] = [
    {
      id: "model-1",
      name: "Model 1",
      context_length: 4096,
      pricing: { prompt: 0.001, completion: 0.002 },
    },
    {
      id: "model-2",
      name: "Model 2",
      context_length: 8192,
      pricing: { prompt: 0.002, completion: 0.004 },
    },
  ];

  it("should update selected model", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    act(() => {
      result.current.updateSelectedModel("model-1");
    });

    expect(result.current.settings.selectedModel).toBe("model-1");
  });

  it("should update available models", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    act(() => {
      result.current.updateModels(mockModels);
    });

    expect(result.current.settings.availableModels).toEqual(mockModels);
    expect(result.current.settings.lastModelFetch).toBeGreaterThan(0);
  });

  it("should get model by id", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    act(() => {
      result.current.updateModels(mockModels);
    });

    const model = result.current.getModelById("model-1");
    expect(model).toEqual(mockModels[0]);
  });

  it("should return null for non-existent model", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    const model = result.current.getModelById("non-existent");
    expect(model).toBeNull();
  });

  it("should get selected model", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    act(() => {
      result.current.updateModels(mockModels);
    });

    act(() => {
      result.current.updateSelectedModel("model-2");
    });

    const selectedModel = result.current.getSelectedModel();
    expect(selectedModel).toEqual(mockModels[1]);
  });

  it("should return null when no model is selected", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    const selectedModel = result.current.getSelectedModel();
    expect(selectedModel).toBeNull();
  });

  it("should determine if models need refresh", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    // Initially should need refresh
    expect(result.current.shouldRefreshModels()).toBe(true);

    act(() => {
      result.current.updateModels(mockModels);
    });

    // After update, should not need refresh
    expect(result.current.shouldRefreshModels()).toBe(false);
  });

  it("should need refresh after one day", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    act(() => {
      result.current.updateModels(mockModels);
    });

    expect(result.current.shouldRefreshModels()).toBe(false);

    // Mock time passing (more than 1 day)
    const oldDate = Date.now;
    Date.now = jest.fn(() => oldDate() + 25 * 60 * 60 * 1000);

    expect(result.current.shouldRefreshModels()).toBe(true);

    Date.now = oldDate;
  });
});

describe("SettingsProvider - Custom Prompt", () => {
  it("should update custom prompt", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    const newPrompt = "My custom prompt";

    act(() => {
      result.current.updateCustomPrompt(newPrompt);
    });

    expect(result.current.settings.customPrompt).toBe(newPrompt);
  });
});

describe("SettingsProvider - Clear Settings", () => {
  it("should clear all settings to defaults", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    // Set some custom values
    act(() => {
      result.current.updateApiKey("test-key");
    });

    act(() => {
      result.current.updateSelectedModel("model-1");
    });

    act(() => {
      result.current.updateCustomPrompt("Custom prompt");
    });

    expect(result.current.settings.openRouterApiKey).toBe("test-key");

    // Clear settings
    act(() => {
      result.current.clearSettings();
    });

    expect(result.current.settings.openRouterApiKey).toBe("");
    expect(result.current.settings.selectedModel).toBe("");
    expect(result.current.settings.customPrompt).toBe(
      "Describe this image in detail and suggest a good prompt for generating similar images.",
    );
  });
});

describe("SettingsProvider - Persistence", () => {
  it("should persist settings to localStorage", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    act(() => {
      result.current.updateApiKey("persisted-key");
    });

    const stored = localStorageMock.getItem("image-to-prompt-settings");
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.openRouterApiKey).toBe("persisted-key");
  });

  it("should dispatch custom event on settings update", () => {
    const eventListener = jest.fn();
    window.addEventListener("image-to-prompt-settings-updated", eventListener);

    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    act(() => {
      result.current.updateApiKey("test-key");
    });

    expect(eventListener).toHaveBeenCalled();

    window.removeEventListener(
      "image-to-prompt-settings-updated",
      eventListener,
    );
  });

  it("should handle localStorage save errors", () => {
    const consoleError = console.error;
    console.error = jest.fn();

    // Mock localStorage to throw error
    const originalSetItem = localStorageMock.setItem;
    localStorageMock.setItem = jest.fn(() => {
      throw new Error("Storage quota exceeded");
    });

    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    act(() => {
      result.current.updateApiKey("test-key");
    });

    expect(console.error).toHaveBeenCalledWith(
      "Failed to save settings to localStorage:",
      expect.any(Error),
    );

    // Restore
    localStorageMock.setItem = originalSetItem;
    console.error = consoleError;
  });
});

describe("SettingsProvider - Subscription", () => {
  it("should allow subscribing to settings changes", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });
    const listener = jest.fn();

    let unsubscribe: () => void;
    act(() => {
      unsubscribe = result.current.subscribe(listener);
    });

    act(() => {
      result.current.updateApiKey("new-key");
    });

    expect(listener).toHaveBeenCalled();

    act(() => {
      unsubscribe();
    });
  });

  it("should unsubscribe from settings changes", () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper });
    const listener = jest.fn();

    let unsubscribe: () => void;
    act(() => {
      unsubscribe = result.current.subscribe(listener);
    });

    act(() => {
      unsubscribe();
    });

    listener.mockClear();

    act(() => {
      result.current.updateApiKey("new-key");
    });

    // Should not be called after unsubscribe
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("SettingsProvider - Array Field Handling", () => {
  it("should handle selectedVisionModels array", () => {
    const storedSettings = {
      selectedVisionModels: ["model-1", "model-2"],
    };

    localStorageMock.setItem(
      "image-to-prompt-settings",
      JSON.stringify(storedSettings),
    );

    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    expect(result.current.settings.selectedVisionModels).toEqual([
      "model-1",
      "model-2",
    ]);
  });

  it("should handle invalid selectedVisionModels", () => {
    const storedSettings = {
      selectedVisionModels: "not-an-array",
    };

    localStorageMock.setItem(
      "image-to-prompt-settings",
      JSON.stringify(storedSettings),
    );

    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    expect(result.current.settings.selectedVisionModels).toEqual([]);
  });

  it("should handle availableModels array", () => {
    const mockModels: VisionModel[] = [
      {
        id: "model-1",
        name: "Model 1",
        context_length: 4096,
        pricing: { prompt: 0.001, completion: 0.002 },
      },
    ];

    const storedSettings = {
      availableModels: mockModels,
    };

    localStorageMock.setItem(
      "image-to-prompt-settings",
      JSON.stringify(storedSettings),
    );

    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    expect(result.current.settings.availableModels).toEqual(mockModels);
  });

  it("should handle preferredModels and pinnedModels arrays", () => {
    const storedSettings = {
      preferredModels: ["pref-1", "pref-2"],
      pinnedModels: ["pin-1"],
    };

    localStorageMock.setItem(
      "image-to-prompt-settings",
      JSON.stringify(storedSettings),
    );

    const { result } = renderHook(() => useSettingsContext(), { wrapper });

    expect(result.current.settings.preferredModels).toEqual([
      "pref-1",
      "pref-2",
    ]);
    expect(result.current.settings.pinnedModels).toEqual(["pin-1"]);
  });
});
