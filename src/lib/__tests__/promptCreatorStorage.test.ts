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
    promptCreatorConfigStorage.save({
      fields: [],
      promptGenInstructions: "Default instructions",
      ratingRubric: "Default rubric",
      openRouterModelId: "",
      defaultPromptCount: 3,
      schemaVersion: 1,
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
});
