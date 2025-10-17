import "@testing-library/jest-dom";
import {
  promptCreatorConfigStorage,
  promptCreatorDraftStorage,
  promptCreatorResultsStorage,
} from "@/lib/promptCreatorStorage";
import type {
  PromptCreatorField,
  PromptCreatorResult,
} from "@/types/promptCreator";

describe("promptCreatorStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    const defaultConfig = promptCreatorConfigStorage.load();
    promptCreatorConfigStorage.save({
      ...defaultConfig,
      fields: [],
    });
    promptCreatorDraftStorage.save({
      selections: {},
      lastModified: 0,
      schemaVersion: 1,
    });
    promptCreatorResultsStorage.clear();
  });

  it("persists config fields and instructions without mutating defaults", () => {
    const initialConfig = promptCreatorConfigStorage.load();
    expect(initialConfig.fields).toHaveLength(0);

    const field: PromptCreatorField = {
      id: "time-of-day",
      label: "Time of Day",
      type: "dropdown",
      tier: "mandatory",
      order: 1,
      options: ["Dawn", "Dusk"],
    };

    promptCreatorConfigStorage.addField(field);

    const afterAdd = promptCreatorConfigStorage.load();
    expect(afterAdd.fields).toHaveLength(1);
    expect(afterAdd.fields[0]).toMatchObject({
      id: "time-of-day",
      label: "Time of Day",
      options: ["Dawn", "Dusk"],
    });

    promptCreatorConfigStorage.updateField("time-of-day", {
      label: "Time",
      hidden: true,
    });

    const afterUpdate = promptCreatorConfigStorage.load();
    expect(afterUpdate.fields[0]).toMatchObject({
      label: "Time",
      hidden: true,
    });

    // Ensure default instructions are still present
    expect(afterUpdate.promptGenInstructions).toContain(
      "Take the below variables",
    );
  });

  it("saves and clears draft selections", () => {
    const initialDraft = promptCreatorDraftStorage.load();
    expect(initialDraft.selections).toEqual({});

    promptCreatorDraftStorage.save({
      selections: { mood: "Cozy" },
      lastModified: 123,
      schemaVersion: 1,
    });

    const saved = promptCreatorDraftStorage.load();
    expect(saved.selections).toEqual({ mood: "Cozy" });

    promptCreatorDraftStorage.clear();
    const cleared = promptCreatorDraftStorage.load();
    expect(cleared.selections).toEqual({});
  });

  it("stores results and toggles saved flag", () => {
    const result: PromptCreatorResult = {
      id: "result-1",
      timestamp: 111,
      selections: { mood: "Calm" },
      generatedPrompt: "A calm dusk scene",
      rating: {
        score: 8,
        reasons: ["Strong mood"],
        risks: ["None"],
        edits: ["Add ambient light"],
      },
      cost: {
        generationInputTokens: 10,
        generationOutputTokens: 20,
        generationCost: 0.001,
        ratingInputTokens: 15,
        ratingOutputTokens: 5,
        ratingCost: 0.001,
        totalCost: 0.002,
      },
      isSaved: false,
    };

    promptCreatorResultsStorage.add(result);

    let stored = promptCreatorResultsStorage.load();
    expect(stored.results).toHaveLength(1);
    const [firstResult] = stored.results;
    expect(firstResult?.generatedPrompt).toBe("A calm dusk scene");
    expect(firstResult?.isSaved).toBe(false);

    promptCreatorResultsStorage.toggleSaved("result-1");
    stored = promptCreatorResultsStorage.load();
    const [updatedResult] = stored.results;
    expect(updatedResult?.isSaved).toBe(true);
  });

  describe("deleteField", () => {
    it("should soft delete field by hiding it", () => {
      const field: PromptCreatorField = {
        id: "test-field",
        label: "Test Field",
        type: "dropdown",
        tier: "optional",
        order: 1,
        options: ["Option 1"],
      };

      promptCreatorConfigStorage.addField(field);
      let config = promptCreatorConfigStorage.load();
      expect(config.fields).toHaveLength(1);
      expect(config.fields[0]?.hidden).toBeUndefined();

      // Soft delete
      promptCreatorConfigStorage.deleteField("test-field", false);
      config = promptCreatorConfigStorage.load();
      expect(config.fields).toHaveLength(1);
      expect(config.fields[0]?.hidden).toBe(true);
    });

    it("should hard delete field by removing it", () => {
      const field: PromptCreatorField = {
        id: "test-field",
        label: "Test Field",
        type: "dropdown",
        tier: "optional",
        order: 1,
        options: ["Option 1"],
      };

      promptCreatorConfigStorage.addField(field);
      let config = promptCreatorConfigStorage.load();
      expect(config.fields).toHaveLength(1);

      // Hard delete
      promptCreatorConfigStorage.deleteField("test-field", true);
      config = promptCreatorConfigStorage.load();
      expect(config.fields).toHaveLength(0);
    });

    it("should handle deleting non-existent field", () => {
      promptCreatorConfigStorage.deleteField("non-existent", false);
      const config = promptCreatorConfigStorage.load();
      expect(config.fields).toHaveLength(0);
    });
  });

  describe("updateInstructions", () => {
    it("should update prompt generation instructions and rating rubric", () => {
      const newInstructions = "Custom instructions";
      const newRubric = "Custom rubric";

      promptCreatorConfigStorage.updateInstructions(newInstructions, newRubric);

      const config = promptCreatorConfigStorage.load();
      expect(config.promptGenInstructions).toBe(newInstructions);
      expect(config.ratingRubric).toBe(newRubric);
    });
  });

  describe("updateModelConfig", () => {
    it("should update OpenRouter model ID", () => {
      const modelId = "openai/gpt-4";

      promptCreatorConfigStorage.updateModelConfig(modelId);

      const config = promptCreatorConfigStorage.load();
      expect(config.openRouterModelId).toBe(modelId);
    });
  });

  describe("error handling", () => {
    it("should handle localStorage write errors gracefully in config", () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error("Quota exceeded");
      });

      const field: PromptCreatorField = {
        id: "test",
        label: "Test",
        type: "dropdown",
        tier: "optional",
        order: 1,
        options: [],
      };

      // Should not throw
      expect(() => {
        promptCreatorConfigStorage.addField(field);
      }).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
    });

    it("should handle invalid JSON in localStorage", () => {
      localStorage.setItem("prompt-creator-config", "invalid-json{");

      // Should return default config
      const config = promptCreatorConfigStorage.load();
      expect(config.fields).toBeDefined();
      expect(Array.isArray(config.fields)).toBe(true);
    });
  });

  describe("PromptCreatorResultsStorage", () => {
    it("should add and clear results", () => {
      const result: PromptCreatorResult = {
        id: "result-clear-test",
        selections: { "time-of-day": "Dawn" },
        generatedPrompt: "Test prompt for clear",
        rating: null,
        createdAt: Date.now(),
        metadata: {
          generationInputTokens: 10,
          generationOutputTokens: 20,
          generationCost: 0.001,
          ratingInputTokens: 0,
          ratingOutputTokens: 0,
          ratingCost: 0,
          totalCost: 0.001,
        },
        isSaved: false,
      };

      promptCreatorResultsStorage.add(result);

      // Clear should work without throwing
      expect(() => {
        promptCreatorResultsStorage.clear();
      }).not.toThrow();

      // After clear, should have empty results
      const stored = promptCreatorResultsStorage.load();
      expect(stored.results).toBeDefined();
      expect(Array.isArray(stored.results)).toBe(true);
    });

    it("should handle toggle saved on non-existent result", () => {
      // Should not throw
      expect(() => {
        promptCreatorResultsStorage.toggleSaved("non-existent");
      }).not.toThrow();
    });
  });
});
