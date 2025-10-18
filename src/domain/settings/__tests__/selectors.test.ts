import { selectors } from "../selectors";
import type { AppSettings } from "../types";

const createMockSettings = (
  overrides: Partial<AppSettings> = {},
): AppSettings => ({
  openRouterApiKey: "",
  isValidApiKey: false,
  customPrompt: "",
  selectedModel: "",
  availableModels: [],
  pinnedModelIds: [],
  usageStats: [],
  schemaVersion: 1,
  ...overrides,
});

describe("selectors", () => {
  describe("hasApiKey", () => {
    it("should return false when API key is empty", () => {
      const settings = createMockSettings({ openRouterApiKey: "" });
      expect(selectors.hasApiKey(settings)).toBe(false);
    });

    it("should return false when API key is whitespace only", () => {
      const settings = createMockSettings({ openRouterApiKey: "   " });
      expect(selectors.hasApiKey(settings)).toBe(false);
    });

    it("should return true when API key exists", () => {
      const settings = createMockSettings({
        openRouterApiKey: "sk-or-v1-test",
      });
      expect(selectors.hasApiKey(settings)).toBe(true);
    });

    it("should return true when API key has leading/trailing spaces", () => {
      const settings = createMockSettings({
        openRouterApiKey: "  sk-or-v1-test  ",
      });
      expect(selectors.hasApiKey(settings)).toBe(true);
    });
  });

  describe("hasValidApiKey", () => {
    it("should return false when isValidApiKey is false", () => {
      const settings = createMockSettings({ isValidApiKey: false });
      expect(selectors.hasValidApiKey(settings)).toBe(false);
    });

    it("should return true when isValidApiKey is true", () => {
      const settings = createMockSettings({ isValidApiKey: true });
      expect(selectors.hasValidApiKey(settings)).toBe(true);
    });
  });

  describe("hasCustomPrompt", () => {
    it("should return false when custom prompt is empty", () => {
      const settings = createMockSettings({ customPrompt: "" });
      expect(selectors.hasCustomPrompt(settings)).toBe(false);
    });

    it("should return false when custom prompt is whitespace only", () => {
      const settings = createMockSettings({ customPrompt: "   " });
      expect(selectors.hasCustomPrompt(settings)).toBe(false);
    });

    it("should return true when custom prompt exists", () => {
      const settings = createMockSettings({ customPrompt: "My custom prompt" });
      expect(selectors.hasCustomPrompt(settings)).toBe(true);
    });

    it("should return true when custom prompt has leading/trailing spaces", () => {
      const settings = createMockSettings({ customPrompt: "  My prompt  " });
      expect(selectors.hasCustomPrompt(settings)).toBe(true);
    });
  });

  describe("hasSelectedModel", () => {
    it("should return false when selected model is empty", () => {
      const settings = createMockSettings({ selectedModel: "" });
      expect(selectors.hasSelectedModel(settings)).toBe(false);
    });

    it("should return false when selected model is whitespace only", () => {
      const settings = createMockSettings({ selectedModel: "   " });
      expect(selectors.hasSelectedModel(settings)).toBe(false);
    });

    it("should return true when selected model exists", () => {
      const settings = createMockSettings({ selectedModel: "gpt-4" });
      expect(selectors.hasSelectedModel(settings)).toBe(true);
    });

    it("should return true when selected model has leading/trailing spaces", () => {
      const settings = createMockSettings({ selectedModel: "  gpt-4  " });
      expect(selectors.hasSelectedModel(settings)).toBe(true);
    });
  });

  describe("hasAvailableModels", () => {
    it("should return false when available models array is empty", () => {
      const settings = createMockSettings({ availableModels: [] });
      expect(selectors.hasAvailableModels(settings)).toBe(false);
    });

    it("should return true when available models array has one model", () => {
      const settings = createMockSettings({
        availableModels: [{ id: "model-1", name: "Model 1" }],
      });
      expect(selectors.hasAvailableModels(settings)).toBe(true);
    });

    it("should return true when available models array has multiple models", () => {
      const settings = createMockSettings({
        availableModels: [
          { id: "model-1", name: "Model 1" },
          { id: "model-2", name: "Model 2" },
        ],
      });
      expect(selectors.hasAvailableModels(settings)).toBe(true);
    });
  });
});
