/**
 * Comprehensive tests for promptCreatorStorage to achieve high coverage
 */

import {
  PromptCreatorConfigStorage,
  PromptCreatorDraftStorage,
  PromptCreatorResultsStorage,
} from "../promptCreatorStorage";
import type {
  PromptCreatorConfig,
  PromptCreatorDraft,
  PromptCreatorField,
  PromptCreatorResult,
} from "@/types/promptCreator";

describe("PromptCreatorConfigStorage - Comprehensive Coverage", () => {
  let storage: PromptCreatorConfigStorage;

  beforeEach(() => {
    localStorage.clear();
    storage = PromptCreatorConfigStorage.getInstance();
  });

  describe("Field operations", () => {
    it("should add a field to config", () => {
      const field: PromptCreatorField = {
        id: "test-field",
        label: "Test Field",
        type: "text",
      };

      storage.addField(field);
      const config = storage.load();

      const addedField = config.fields.find((f) => f.id === "test-field");
      expect(addedField).toBeDefined();
      expect(addedField?.label).toBe("Test Field");
    });

    it("should update a field", () => {
      const field: PromptCreatorField = {
        id: "update-me",
        label: "Original",
        type: "text",
      };

      storage.addField(field);
      storage.updateField("update-me", { label: "Updated" });

      const config = storage.load();
      const updatedField = config.fields.find((f) => f.id === "update-me");
      expect(updatedField?.label).toBe("Updated");
    });

    it("should not crash when updating non-existent field", () => {
      expect(() => {
        storage.updateField("non-existent", { label: "Test" });
      }).not.toThrow();
    });

    it("should delete a field (hard delete)", () => {
      storage.addField({ id: "delete-me", label: "Delete", type: "text" });
      storage.deleteField("delete-me", true);

      const config = storage.load();
      const deletedField = config.fields.find((f) => f.id === "delete-me");
      expect(deletedField).toBeUndefined();
    });

    it("should soft delete a field (hide)", () => {
      storage.addField({ id: "hide-me", label: "Hide", type: "text" });
      storage.deleteField("hide-me", false);

      const config = storage.load();
      const hiddenField = config.fields.find((f) => f.id === "hide-me");
      expect(hiddenField?.hidden).toBe(true);
    });

    it("should handle deleting non-existent field", () => {
      expect(() => {
        storage.deleteField("non-existent", true);
      }).not.toThrow();
    });
  });

  describe("Config updates", () => {
    it("should update instructions and rubric", () => {
      storage.updateInstructions("New instructions", "New rubric");

      const config = storage.load();
      expect(config.promptGenInstructions).toBe("New instructions");
      expect(config.ratingRubric).toBe("New rubric");
    });

    it("should update model config", () => {
      storage.updateModelConfig("new-model-id");

      const config = storage.load();
      expect(config.openRouterModelId).toBe("new-model-id");
    });

    it("should update locked-in prompt", () => {
      storage.updateLockedInPrompt("New locked prompt");

      const config = storage.load();
      expect(config.lockedInPrompt).toBe("New locked prompt");
    });
  });

  describe("Complex field types", () => {
    it("should handle fields with all optional properties", () => {
      const field: PromptCreatorField = {
        id: "complex",
        label: "Complex Field",
        type: "number",
        defaultValue: 50,
        helperText: "Helper text",
        min: 0,
        max: 100,
        step: 5,
        hidden: false,
      };

      storage.addField(field);
      const config = storage.load();

      const addedField = config.fields.find((f) => f.id === "complex");
      expect(addedField).toMatchObject({
        id: "complex",
        label: "Complex Field",
        type: "number",
      });
    });

    it("should handle select fields with options", () => {
      const field: PromptCreatorField = {
        id: "select",
        label: "Select Field",
        type: "select",
        options: ["option1", "option2", "option3"],
        defaultValue: "option1",
      };

      storage.addField(field);
      const config = storage.load();

      const addedField = config.fields.find((f) => f.id === "select");
      expect(addedField?.options).toEqual(["option1", "option2", "option3"]);
    });
  });

  describe("Storage persistence", () => {
    it("should persist config to localStorage", () => {
      storage.updateInstructions("Persist test", "Rubric test");

      const stored = localStorage.getItem("prompt-creator-config");
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.promptGenInstructions).toBe("Persist test");
    });

    it("should load config from localStorage", () => {
      const config: PromptCreatorConfig = {
        fields: [{ id: "preload", label: "Preload", type: "text" }],
        promptGenInstructions: "Preloaded",
        ratingRubric: "Rubric",
        openRouterModelId: "model",
        defaultPromptCount: 7,
        lockedInPrompt: "locked",
        schemaVersion: 1,
      };

      localStorage.setItem("prompt-creator-config", JSON.stringify(config));

      const newStorage = PromptCreatorConfigStorage.getInstance();
      const retrieved = newStorage.load();

      expect(retrieved.promptGenInstructions).toBe("Preloaded");
      expect(retrieved.defaultPromptCount).toBe(7);
    });

    it("should handle corrupted config data", () => {
      localStorage.setItem("prompt-creator-config", "invalid{json");

      const newStorage = PromptCreatorConfigStorage.getInstance();
      const config = newStorage.load();

      expect(config).toBeDefined();
      expect(config.fields).toBeDefined();
    });

    it("should handle missing localStorage data", () => {
      const config = storage.load();
      expect(config).toBeDefined();
      expect(config.schemaVersion).toBe(1);
    });
  });

  describe("Field normalization", () => {
    it("should normalize fields on load", () => {
      const config: PromptCreatorConfig = {
        fields: [
          {
            id: "f1",
            label: "Field 1",
            type: "text",
            maxLength: 100,
          },
          {
            id: "f2",
            label: "Field 2",
            type: "select",
            options: ["a", "b"],
          },
        ],
        promptGenInstructions: "Test",
        ratingRubric: "Test",
        openRouterModelId: "",
        defaultPromptCount: 3,
        lockedInPrompt: "",
        schemaVersion: 1,
      };

      storage.save(config);
      const loaded = storage.load();

      expect(loaded.fields).toHaveLength(2);
      expect(loaded.fields[0]?.id).toBe("f1");
      expect(loaded.fields[1]?.options).toEqual(["a", "b"]);
    });
  });
});

describe("PromptCreatorDraftStorage - Comprehensive Coverage", () => {
  let storage: PromptCreatorDraftStorage;

  beforeEach(() => {
    localStorage.clear();
    storage = PromptCreatorDraftStorage.getInstance();
  });

  describe("Draft operations", () => {
    it("should load draft from storage", () => {
      const draft = storage.load();
      expect(draft).toHaveProperty("selections");
      expect(draft).toHaveProperty("lastModified");
      expect(draft).toHaveProperty("schemaVersion");
    });

    it("should save draft to localStorage", () => {
      const draft: PromptCreatorDraft = {
        selections: { field1: "value1", field2: 42 },
        lastModified: Date.now(),
        schemaVersion: 1,
      };

      storage.save(draft);

      const stored = localStorage.getItem("prompt-creator-draft");
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.selections.field1).toBe("value1");
      expect(parsed.selections.field2).toBe(42);
    });

    it("should clear draft from storage", () => {
      const draft: PromptCreatorDraft = {
        selections: { test: "value" },
        lastModified: Date.now(),
        schemaVersion: 1,
      };

      storage.save(draft);
      storage.clear();

      const retrieved = storage.load();
      expect(Object.keys(retrieved.selections)).toHaveLength(0);
    });

    it("should load default draft when nothing stored", () => {
      const draft = storage.load();
      expect(draft.selections).toEqual({});
      expect(draft.schemaVersion).toBe(1);
    });

    it("should handle corrupted draft data", () => {
      localStorage.setItem("prompt-creator-draft", "invalid{json");

      const draft = storage.load();
      expect(draft.selections).toEqual({});
    });
  });

  describe("Complex selection values", () => {
    it("should handle all value types in selections", () => {
      const draft: PromptCreatorDraft = {
        selections: {
          string: "value",
          number: 42,
          boolean: true,
          array: ["a", "b", "c"],
          null: null,
        },
        lastModified: Date.now(),
        schemaVersion: 1,
      };

      storage.save(draft);
      const retrieved = storage.load();

      expect(retrieved.selections.string).toBe("value");
      expect(retrieved.selections.number).toBe(42);
      expect(retrieved.selections.boolean).toBe(true);
      expect(retrieved.selections.array).toEqual(["a", "b", "c"]);
      expect(retrieved.selections.null).toBeNull();
    });

    it("should preserve draft across multiple saves", () => {
      const draft1: PromptCreatorDraft = {
        selections: { field1: "value1" },
        lastModified: Date.now(),
        schemaVersion: 1,
      };

      storage.save(draft1);

      const draft2: PromptCreatorDraft = {
        selections: { field1: "value1", field2: "value2" },
        lastModified: Date.now() + 1000,
        schemaVersion: 1,
      };

      storage.save(draft2);
      const retrieved = storage.load();

      expect(retrieved.selections.field1).toBe("value1");
      expect(retrieved.selections.field2).toBe("value2");
    });
  });
});

describe("PromptCreatorResultsStorage - Comprehensive Coverage", () => {
  let storage: PromptCreatorResultsStorage;

  beforeEach(() => {
    localStorage.clear();
    storage = PromptCreatorResultsStorage.getInstance();
  });

  describe("Results operations", () => {
    it("should add a single result", () => {
      const result: PromptCreatorResult = {
        id: "r1",
        timestamp: Date.now(),
        selections: {},
        rating: {
          score: 8,
          reasons: ["good"],
          risks: [],
          edits: [],
        },
        cost: { promptTokens: 10, completionTokens: 20, totalCost: 0.001 },
        isSaved: false,
      };

      storage.add(result);
      const results = storage.list();

      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe("r1");
    });

    it("should add multiple results", () => {
      const result1: PromptCreatorResult = {
        id: "r1",
        timestamp: Date.now(),
        selections: {},
        rating: { score: 7, reasons: [], risks: [], edits: [] },
        cost: { promptTokens: 10, completionTokens: 20, totalCost: 0.001 },
        isSaved: false,
      };
      const result2: PromptCreatorResult = {
        id: "r2",
        timestamp: Date.now() + 1,
        selections: { field1: "value1" },
        rating: { score: 8, reasons: [], risks: [], edits: [] },
        cost: { promptTokens: 15, completionTokens: 25, totalCost: 0.002 },
        isSaved: false,
      };

      storage.add(result1);
      storage.add(result2);
      const results = storage.list();

      expect(results).toHaveLength(2);
    });

    it("should respect MAX_RESULTS limit (500) for unsaved", () => {
      // Add saved results (should not be limited)
      for (let i = 0; i < 10; i++) {
        storage.add({
          id: `saved-${i}`,
          timestamp: Date.now() + i,
          selections: {},
          rating: { score: 5, reasons: [], risks: [], edits: [] },
          cost: { promptTokens: 10, completionTokens: 20, totalCost: 0.001 },
          isSaved: true,
        });
      }

      // Add 501 unsaved results
      for (let i = 0; i < 501; i++) {
        storage.add({
          id: `unsaved-${i}`,
          timestamp: Date.now() + 1000 + i,
          selections: {},
          rating: { score: 6, reasons: [], risks: [], edits: [] },
          cost: { promptTokens: 10, completionTokens: 20, totalCost: 0.001 },
          isSaved: false,
        });
      }

      const results = storage.list();
      // Should have all saved + 500 unsaved
      expect(results.length).toBeLessThanOrEqual(510);
    });

    it("should toggle saved status", () => {
      const id = "toggle-test";
      storage.add({
        id,
        timestamp: Date.now(),
        selections: {},
        rating: { score: 7, reasons: [], risks: [], edits: [] },
        cost: { promptTokens: 10, completionTokens: 20, totalCost: 0.001 },
        isSaved: false,
      });

      storage.toggleSaved(id);
      const results = storage.list();
      expect(results[0]?.isSaved).toBe(true);

      storage.toggleSaved(id);
      const results2 = storage.list();
      expect(results2[0]?.isSaved).toBe(false);
    });

    it("should filter by minimum score", () => {
      storage.add({
        id: "low",
        timestamp: Date.now(),
        selections: {},
        rating: { score: 3, reasons: [], risks: [], edits: [] },
        cost: { promptTokens: 10, completionTokens: 20, totalCost: 0.001 },
        isSaved: false,
      });
      storage.add({
        id: "high",
        timestamp: Date.now() + 1,
        selections: {},
        rating: { score: 9, reasons: [], risks: [], edits: [] },
        cost: { promptTokens: 10, completionTokens: 20, totalCost: 0.001 },
        isSaved: false,
      });

      const filtered = storage.list({ minScore: 5 });
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.id).toBe("high");
    });

    it("should filter by saved only", () => {
      storage.add({
        id: "saved",
        timestamp: Date.now(),
        selections: {},
        rating: { score: 7, reasons: [], risks: [], edits: [] },
        cost: { promptTokens: 10, completionTokens: 20, totalCost: 0.001 },
        isSaved: true,
      });
      storage.add({
        id: "unsaved",
        timestamp: Date.now() + 1,
        selections: {},
        rating: { score: 8, reasons: [], risks: [], edits: [] },
        cost: { promptTokens: 10, completionTokens: 20, totalCost: 0.001 },
        isSaved: false,
      });

      const filtered = storage.list({ onlySaved: true });
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.id).toBe("saved");
    });

    it("should clear all results", () => {
      storage.add({
        id: "r1",
        timestamp: Date.now(),
        selections: {},
        rating: { score: 7, reasons: [], risks: [], edits: [] },
        cost: { promptTokens: 10, completionTokens: 20, totalCost: 0.001 },
        isSaved: false,
      });

      storage.clear();
      const results = storage.list();

      expect(results).toHaveLength(0);
    });
  });

  describe("Result persistence", () => {
    it("should persist results to localStorage", () => {
      storage.add({
        id: "persist",
        timestamp: 12345,
        selections: { key: "value" },
        rating: { score: 7, reasons: ["reason1"], risks: [], edits: [] },
        cost: { promptTokens: 10, completionTokens: 20, totalCost: 0.001 },
        isSaved: true,
      });

      const stored = localStorage.getItem("prompt-creator-results");
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.results[0].id).toBe("persist");
    });

    it("should load results from localStorage on initialization", () => {
      const resultsData = {
        results: [
          {
            id: "preloaded",
            timestamp: 12345,
            selections: {},
            rating: { score: 6, reasons: [], risks: [], edits: [] },
            cost: { promptTokens: 10, completionTokens: 20, totalCost: 0.001 },
            isSaved: true,
          },
        ],
        schemaVersion: 1,
      };

      localStorage.setItem(
        "prompt-creator-results",
        JSON.stringify(resultsData),
      );

      const newStorage = PromptCreatorResultsStorage.getInstance();
      const retrieved = newStorage.list();

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0]?.id).toBe("preloaded");
    });

    it("should handle corrupted results data", () => {
      localStorage.setItem("prompt-creator-results", "invalid{json");

      const newStorage = PromptCreatorResultsStorage.getInstance();
      const results = newStorage.list();

      expect(results).toHaveLength(0);
    });
  });
});
