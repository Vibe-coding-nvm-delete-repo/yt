import { settingsStorage } from '../storage';

describe("SettingsStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("validateApiKey", () => {
    it("should set lastApiKeyValidation timestamp when API key is validated successfully", () => {
      const beforeTimestamp = Date.now();

      settingsStorage.validateApiKey(true);

      const settings = settingsStorage.getSettings();
      const afterTimestamp = Date.now();

      expect(settings.isValidApiKey).toBe(true);
      expect(settings.lastApiKeyValidation).toBeDefined();
      expect(settings.lastApiKeyValidation).toBeGreaterThanOrEqual(
        beforeTimestamp,
      );
      expect(settings.lastApiKeyValidation).toBeLessThanOrEqual(afterTimestamp);
    });

    it("should not set lastApiKeyValidation timestamp when API key validation fails", () => {
      settingsStorage.validateApiKey(false);

      const settings = settingsStorage.getSettings();

      expect(settings.isValidApiKey).toBe(false);
      expect(settings.lastApiKeyValidation).toBeNull();
    });
  });

  describe("updateModels", () => {
    it("should set lastModelFetch timestamp when models are updated", () => {
      const beforeTimestamp = Date.now();
      const mockModels = [
        {
          id: "test-model",
          name: "Test Model",
          pricing: { prompt: 0.001, completion: 0.002 },
        },
      ];

      settingsStorage.updateModels(mockModels);

      const settings = settingsStorage.getSettings();
      const afterTimestamp = Date.now();

      expect(settings.availableModels).toEqual(mockModels);
      expect(settings.lastModelFetch).toBeDefined();
      expect(settings.lastModelFetch).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(settings.lastModelFetch).toBeLessThanOrEqual(afterTimestamp);
    });
  });

  describe("importSettings", () => {
    it("should preserve timestamp fields when importing settings", () => {
      const mockSettings = {
        openRouterApiKey: "test-key",
        selectedModel: "test-model",
        customPrompt: "test prompt",
        isValidApiKey: true,
        lastApiKeyValidation: 1234567890,
        lastModelFetch: 9876543210,
        availableModels: [],
      };

      const success = settingsStorage.importSettings(
        JSON.stringify(mockSettings),
      );

      expect(success).toBe(true);
      const settings = settingsStorage.getSettings();
      expect(settings.lastApiKeyValidation).toBe(1234567890);
      expect(settings.lastModelFetch).toBe(9876543210);
    });
  });

  describe("loadSettings", () => {
    it("should handle missing timestamp fields in stored settings", () => {
      const legacySettings = {
        openRouterApiKey: "test-key",
        selectedModel: "test-model",
        customPrompt: "test prompt",
        isValidApiKey: true,
        availableModels: [],
        // Missing lastApiKeyValidation and lastModelFetch
      };

      localStorage.setItem(
        "image-to-prompt-settings",
        JSON.stringify(legacySettings),
      );

      // Create new instance to trigger loadSettings
      const newSettings = settingsStorage.getSettings();

      expect(newSettings.lastApiKeyValidation).toBeNull();
      expect(newSettings.lastModelFetch).toBeNull();
    });
  });
});
