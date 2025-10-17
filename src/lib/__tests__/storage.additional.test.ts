/**
 * Additional Storage Tests for Coverage Improvement
 * Focusing on uncovered lines in storage.ts
 */

import {
  settingsStorage,
  imageStateStorage,
  SettingsStorage,
  ImageStateStorage,
} from "../storage";

describe("SettingsStorage - Additional Coverage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // Reset the singleton instance for clean tests
    (SettingsStorage as any).instance = undefined;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Error Handling in loadSettings", () => {
    it("should return default settings when JSON parsing fails", () => {
      // Set invalid JSON in localStorage
      localStorage.setItem("image-to-prompt-settings", "invalid-json{");

      const storage = SettingsStorage.getInstance();
      const settings = storage.getSettings();

      // Should return default settings
      expect(settings.openRouterApiKey).toBe("");
      expect(settings.customPrompt).toContain("Describe this image");
    });

    it("should handle non-array availableModels in stored data", () => {
      const badData = {
        openRouterApiKey: "test",
        availableModels: "not-an-array",
        preferredModels: null,
      };

      localStorage.setItem("image-to-prompt-settings", JSON.stringify(badData));

      const storage = SettingsStorage.getInstance();
      const settings = storage.getSettings();

      // Should convert to empty arrays
      expect(Array.isArray(settings.availableModels)).toBe(true);
      expect(settings.availableModels).toEqual([]);
      expect(Array.isArray(settings.preferredModels)).toBe(true);
      expect(settings.preferredModels).toEqual([]);
    });

    it("should handle missing numeric timestamp fields", () => {
      const dataWithoutTimestamps = {
        openRouterApiKey: "test-key",
        isValidApiKey: true,
        // Missing lastApiKeyValidation and lastModelFetch
      };

      localStorage.setItem(
        "image-to-prompt-settings",
        JSON.stringify(dataWithoutTimestamps),
      );

      const storage = SettingsStorage.getInstance();
      const settings = storage.getSettings();

      expect(settings.lastApiKeyValidation).toBeNull();
      expect(settings.lastModelFetch).toBeNull();
    });

    it("should convert string timestamps to numbers", () => {
      const now = Date.now();
      const dataWithStringTimestamps = {
        openRouterApiKey: "test-key",
        lastApiKeyValidation: String(now),
        lastModelFetch: String(now - 1000),
      };

      localStorage.setItem(
        "image-to-prompt-settings",
        JSON.stringify(dataWithStringTimestamps),
      );

      const storage = SettingsStorage.getInstance();
      const settings = storage.getSettings();

      expect(typeof settings.lastApiKeyValidation).toBe("number");
      expect(settings.lastApiKeyValidation).toBe(now);
      expect(typeof settings.lastModelFetch).toBe("number");
      expect(settings.lastModelFetch).toBe(now - 1000);
    });
  });

  describe("Deep Equality Checking", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it("should detect changes in nested objects", () => {
      const storage = SettingsStorage.getInstance();
      const callback = jest.fn();

      storage.subscribe(callback);

      // Update with nested structure (models have nested pricing)
      const model1 = {
        id: "model-1",
        name: "Test Model",
        pricing: { prompt: 0.001, completion: 0.002 },
      };

      storage.updateModels([model1]);

      // Allow debounced notification to fire
      jest.runAllTimers();

      expect(callback).toHaveBeenCalled();
    });

    it("should not trigger notification for identical values", () => {
      const storage = SettingsStorage.getInstance();
      const callback = jest.fn();

      // Set initial value
      storage.updateApiKey("test-key");
      jest.runAllTimers();

      // Subscribe after initial update
      storage.subscribe(callback);

      // Update with same value
      storage.updateApiKey("test-key");
      jest.runAllTimers();

      // Should not call callback for unchanged value
      expect(callback).not.toHaveBeenCalled();
    });

    it("should handle array comparison correctly", () => {
      const storage = SettingsStorage.getInstance();
      const callback = jest.fn();

      storage.subscribe(callback, { keys: ["selectedVisionModels"] });

      // Set initial array
      storage.updateSelectedVisionModels(["model-1", "model-2"]);
      jest.runAllTimers();

      expect(callback).toHaveBeenCalled();
      callback.mockClear();

      // Set same array (different reference)
      storage.updateSelectedVisionModels(["model-1", "model-2"]);
      jest.runAllTimers();

      // Should not call callback for identical array content
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("Subscription with immediate flag", () => {
    beforeEach(() => {
      localStorage.clear();
      (SettingsStorage as any).instance = undefined;
    });

    it("should call callback immediately when immediate=true", () => {
      const storage = SettingsStorage.getInstance();
      const callback = jest.fn();

      // Set some initial data
      storage.updateApiKey("test-key");

      // Subscribe with immediate flag
      storage.subscribe(callback, { immediate: true });

      // Should be called immediately (before any debounce)
      expect(callback).toHaveBeenCalled();

      const callArgs = callback.mock.calls[0];
      expect(callArgs[0]).toBeDefined(); // newValue
      expect(callArgs[1]).toBeDefined(); // oldValue
    });

    it("should handle error in immediate callback gracefully", () => {
      const storage = SettingsStorage.getInstance();
      const badCallback = jest.fn(() => {
        throw new Error("Callback error");
      });

      // Should not throw
      expect(() => {
        storage.subscribe(badCallback, { immediate: true });
      }).not.toThrow();

      expect(badCallback).toHaveBeenCalled();
    });
  });

  describe("subscribeToKey specific key subscription", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      localStorage.clear();
      (SettingsStorage as any).instance = undefined;
    });

    it("should only notify for specific key changes", () => {
      const storage = SettingsStorage.getInstance();
      const apiKeyCallback = jest.fn();

      // Subscribe to only API key changes
      storage.subscribeToKey("openRouterApiKey", apiKeyCallback);

      // Change a different key
      storage.updateCustomPrompt("new prompt");
      jest.runAllTimers();

      // Should not be called
      expect(apiKeyCallback).not.toHaveBeenCalled();

      // Change the subscribed key
      storage.updateApiKey("new-key");
      jest.runAllTimers();

      // Should be called
      expect(apiKeyCallback).toHaveBeenCalled();
      expect(apiKeyCallback).toHaveBeenCalledWith("new-key", "");
    });

    it("should use deep equality for key-specific changes", () => {
      const storage = SettingsStorage.getInstance();
      const modelsCallback = jest.fn();

      storage.subscribeToKey("availableModels", modelsCallback);

      const models = [
        {
          id: "m1",
          name: "Model 1",
          pricing: { prompt: 0.001, completion: 0.002 },
        },
      ];

      // Update with new models
      storage.updateModels(models);
      jest.runAllTimers();

      expect(modelsCallback).toHaveBeenCalledTimes(1);
      modelsCallback.mockClear();

      // Update with identical models (different reference)
      storage.updateModels([...models]);
      jest.runAllTimers();

      // Should not be called due to deep equality
      expect(modelsCallback).not.toHaveBeenCalled();
    });
  });

  describe("Error handling in callbacks", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      localStorage.clear();
      (SettingsStorage as any).instance = undefined;
    });

    it("should handle errors in subscription callbacks gracefully", () => {
      const storage = SettingsStorage.getInstance();
      const goodCallback = jest.fn();
      const badCallback = jest.fn(() => {
        throw new Error("Subscription error");
      });

      storage.subscribe(goodCallback);
      storage.subscribe(badCallback);

      // Update should not throw even with bad callback
      expect(() => {
        storage.updateApiKey("test-key");
        jest.runAllTimers();
      }).not.toThrow();

      // Good callback should still be called
      expect(goodCallback).toHaveBeenCalled();
      expect(badCallback).toHaveBeenCalled();
    });
  });

  describe("Model helper methods", () => {
    beforeEach(() => {
      localStorage.clear();
      (SettingsStorage as any).instance = undefined;
    });

    it("should get model by ID", () => {
      const storage = SettingsStorage.getInstance();
      const models = [
        {
          id: "model-1",
          name: "Model 1",
          pricing: { prompt: 0.001, completion: 0.002 },
        },
        {
          id: "model-2",
          name: "Model 2",
          pricing: { prompt: 0.003, completion: 0.004 },
        },
      ];
      storage.updateModels(models);

      const model = storage.getModelById("model-1");

      expect(model).toBeDefined();
      expect(model?.name).toBe("Model 1");
    });

    it("should return null for non-existent model ID", () => {
      const storage = SettingsStorage.getInstance();
      const models = [
        {
          id: "model-1",
          name: "Model 1",
          pricing: { prompt: 0.001, completion: 0.002 },
        },
      ];
      storage.updateModels(models);

      const model = storage.getModelById("non-existent");

      expect(model).toBeNull();
    });

    it("should get selected model", () => {
      const storage = SettingsStorage.getInstance();
      const models = [
        {
          id: "model-2",
          name: "Model 2",
          pricing: { prompt: 0.003, completion: 0.004 },
        },
      ];
      storage.updateModels(models);
      storage.updateSelectedModel("model-2");

      const model = storage.getSelectedModel();

      expect(model).toBeDefined();
      expect(model?.id).toBe("model-2");
    });

    it("should return null when no model is selected", () => {
      const storage = SettingsStorage.getInstance();
      storage.updateSelectedModel("");

      const model = storage.getSelectedModel();

      expect(model).toBeNull();
    });

    it("should get preferred models as array copy", () => {
      const storage = SettingsStorage.getInstance();
      storage.updatePreferredModels(["model-1", "model-2"]);

      const preferred = storage.getPreferredModels();

      expect(Array.isArray(preferred)).toBe(true);
      expect(preferred).toEqual(["model-1", "model-2"]);

      // Verify it's a copy
      preferred.push("model-3");
      const preferred2 = storage.getPreferredModels();
      expect(preferred2).toEqual(["model-1", "model-2"]);
    });

    it("should handle non-array preferredModels gracefully", () => {
      const storage = SettingsStorage.getInstance();

      // First set preferred models to test the getter works with arrays
      storage.updatePreferredModels(["model-1", "model-2"]);

      // Then manually set to null to simulate corruption
      localStorage.setItem(
        "image-to-prompt-settings",
        JSON.stringify({ preferredModels: null }),
      );

      // Create new instance to load corrupted data
      (SettingsStorage as any).instance = undefined;
      const newStorage = SettingsStorage.getInstance();

      const preferred = newStorage.getPreferredModels();

      expect(Array.isArray(preferred)).toBe(true);
      expect(preferred).toEqual([]);
    });
  });

  describe("shouldRefreshModels", () => {
    beforeEach(() => {
      localStorage.clear();
      (SettingsStorage as any).instance = undefined;
    });

    it("should return true when no models have been fetched", () => {
      const storage = SettingsStorage.getInstance();
      const shouldRefresh = storage.shouldRefreshModels();

      expect(shouldRefresh).toBe(true);
    });

    it("should return false when models were fetched recently", () => {
      const storage = SettingsStorage.getInstance();
      // Update models (sets lastModelFetch to now)
      storage.updateModels([
        {
          id: "test",
          name: "Test",
          pricing: { prompt: 0.001, completion: 0.002 },
        },
      ]);

      const shouldRefresh = storage.shouldRefreshModels();

      expect(shouldRefresh).toBe(false);
    });

    it("should return true when models are older than 24 hours", () => {
      const storage = SettingsStorage.getInstance();
      const oldTimestamp = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago

      // Manually set old timestamp
      const settings = storage.getSettings();
      (settings as any).lastModelFetch = oldTimestamp;

      const shouldRefresh = storage.shouldRefreshModels();

      expect(shouldRefresh).toBe(true);
    });
  });
});

describe("ImageStateStorage - Additional Coverage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // Reset the singleton instance for clean tests
    (ImageStateStorage as any).instance = undefined;
  });

  describe("Error Handling in loadImageState", () => {
    it("should return default state when JSON parsing fails", () => {
      localStorage.setItem("image-to-prompt-image-state", "invalid-json{");

      const storage = ImageStateStorage.getInstance();
      const state = storage.getImageState();

      expect(state.preview).toBeNull();
      expect(state.generatedPrompt).toBeNull();
      expect(state.isGenerating).toBe(false);
    });

    it("should handle corrupt data gracefully", () => {
      const badData = { preview: 123, modelResults: "not-array" };
      localStorage.setItem(
        "image-to-prompt-image-state",
        JSON.stringify(badData),
      );

      const storage = ImageStateStorage.getInstance();
      // Should not throw
      expect(() => {
        storage.getImageState();
      }).not.toThrow();
    });
  });

  describe("Error handling in saveImageState", () => {
    it("should handle localStorage write errors gracefully", () => {
      const storage = ImageStateStorage.getInstance();

      // Mock localStorage.setItem to throw
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error("Quota exceeded");
      });

      // Should not throw
      expect(() => {
        storage.saveUploadedImage(
          "preview-url",
          "test.jpg",
          1024,
          "image/jpeg",
        );
      }).not.toThrow();

      // Restore
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe("updateSingleModelResult", () => {
    beforeEach(() => {
      localStorage.clear();
      (ImageStateStorage as any).instance = undefined;
    });

    it("should update specific model result at index", () => {
      const storage = ImageStateStorage.getInstance();
      const initialResults = [
        {
          modelId: "model-1",
          modelName: "Model 1",
          prompt: "Initial prompt",
          isLoading: false,
          cost: null,
        },
        {
          modelId: "model-2",
          modelName: "Model 2",
          prompt: "Initial prompt 2",
          isLoading: false,
          cost: null,
        },
      ];

      storage.saveModelResults(initialResults);

      // Update first result
      storage.updateSingleModelResult(0, {
        prompt: "Updated prompt",
        isLoading: true,
      });

      const state = storage.getImageState();
      expect(state.modelResults?.[0]?.prompt).toBe("Updated prompt");
      expect(state.modelResults?.[0]?.isLoading).toBe(true);
      // Other fields should remain
      expect(state.modelResults?.[0]?.modelId).toBe("model-1");
      // Second result should be unchanged
      expect(state.modelResults?.[1]?.prompt).toBe("Initial prompt 2");
    });

    it("should handle invalid index gracefully", () => {
      const storage = ImageStateStorage.getInstance();
      const results = [
        {
          modelId: "model-1",
          modelName: "Model 1",
          prompt: "Test",
          isLoading: false,
          cost: null,
        },
      ];

      storage.saveModelResults(results);

      // Try to update out-of-bounds index
      expect(() => {
        storage.updateSingleModelResult(5, { prompt: "Updated" });
      }).not.toThrow();

      // Original result should be unchanged
      const state = storage.getImageState();
      expect(state.modelResults?.[0]?.prompt).toBe("Test");
    });

    it("should handle negative index gracefully", () => {
      const storage = ImageStateStorage.getInstance();
      const results = [
        {
          modelId: "model-1",
          modelName: "Model 1",
          prompt: "Test",
          isLoading: false,
          cost: null,
        },
      ];

      storage.saveModelResults(results);

      expect(() => {
        storage.updateSingleModelResult(-1, { prompt: "Updated" });
      }).not.toThrow();
    });

    it("should handle empty modelResults array", () => {
      const storage = ImageStateStorage.getInstance();
      storage.saveModelResults([]);

      expect(() => {
        storage.updateSingleModelResult(0, { prompt: "Updated" });
      }).not.toThrow();

      const state = storage.getImageState();
      expect(state.modelResults).toEqual([]);
    });

    it("should handle non-array modelResults", () => {
      const storage = ImageStateStorage.getInstance();
      // Manually corrupt state
      const state = storage.getImageState();
      (state as any).modelResults = null;

      expect(() => {
        storage.updateSingleModelResult(0, { prompt: "Updated" });
      }).not.toThrow();
    });
  });

  describe("saveGenerationStatus", () => {
    it("should update isGenerating flag", () => {
      const storage = ImageStateStorage.getInstance();
      storage.saveGenerationStatus(true);

      const state = storage.getImageState();
      expect(state.isGenerating).toBe(true);

      storage.saveGenerationStatus(false);

      const state2 = storage.getImageState();
      expect(state2.isGenerating).toBe(false);
    });
  });

  describe("Error handling in listeners", () => {
    it("should handle errors in listeners gracefully", () => {
      const storage = ImageStateStorage.getInstance();
      const goodListener = jest.fn();
      const badListener = jest.fn(() => {
        throw new Error("Listener error");
      });

      storage.subscribe(goodListener);
      storage.subscribe(badListener);

      // Update should not throw
      expect(() => {
        storage.saveUploadedImage(
          "preview-url",
          "test.jpg",
          1024,
          "image/jpeg",
        );
      }).not.toThrow();

      // Good listener should still be called
      expect(goodListener).toHaveBeenCalled();
      expect(badListener).toHaveBeenCalled();
    });
  });
});
