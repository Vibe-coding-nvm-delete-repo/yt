import type {
  PromptCreatorConfig,
  PromptCreatorDraft,
  PromptCreatorField,
  PromptCreatorResult,
  PromptCreatorResults,
  PromptCreatorValue,
} from "@/types/promptCreator";

const clone = <T>(value: T): T => {
  const cloner = (
    globalThis as typeof globalThis & {
      structuredClone?: <U>(input: U) => U;
    }
  ).structuredClone;
  if (typeof cloner === "function") {
    return cloner(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const normalizeField = (field: PromptCreatorField): PromptCreatorField => {
  const normalized: PromptCreatorField = {
    ...field,
  };

  if (field.options && Array.isArray(field.options)) {
    normalized.options = [...field.options];
  } else {
    delete (normalized as { options?: string[] }).options;
  }

  if (field.defaultValue === undefined) {
    delete (normalized as { defaultValue?: PromptCreatorValue }).defaultValue;
  }
  if (field.helperText === undefined) {
    delete (normalized as { helperText?: string }).helperText;
  }
  if (field.maxSelections === undefined) {
    delete (normalized as { maxSelections?: number }).maxSelections;
  }
  if (field.min === undefined) {
    delete (normalized as { min?: number }).min;
  }
  if (field.max === undefined) {
    delete (normalized as { max?: number }).max;
  }
  if (field.step === undefined) {
    delete (normalized as { step?: number }).step;
  }
  if (field.maxLength === undefined) {
    delete (normalized as { maxLength?: number }).maxLength;
  }
  if (field.hidden === undefined) {
    delete (normalized as { hidden?: boolean }).hidden;
  }

  return normalized;
};

const CONFIG_KEY = "prompt-creator-config";
const DRAFT_KEY = "prompt-creator-draft";
const RESULTS_KEY = "prompt-creator-results";
const MAX_RESULTS = 500;

const DEFAULT_CONFIG: PromptCreatorConfig = {
  fields: [],
  promptGenInstructions:
    "Take the below variables and create a detailed prompt that follows best practices for image generation. Use the exact wording from the variables in your output.",
  ratingRubric:
    'Rate this prompt on a scale of 1-10 based on clarity, descriptive quality, and effectiveness. Return your response as JSON with this exact format: {"score": <number>, "reasons": [<string>], "risks": [<string>], "edits": [<string>]}',
  openRouterModelId: "",
  defaultPromptCount: 3,
  schemaVersion: 1,
};

const DEFAULT_DRAFT: PromptCreatorDraft = {
  selections: {},
  lastModified: 0,
  schemaVersion: 1,
};

const DEFAULT_RESULTS: PromptCreatorResults = {
  results: [],
  schemaVersion: 1,
};

// Config Storage
export class PromptCreatorConfigStorage {
  private static instance: PromptCreatorConfigStorage;

  static getInstance(): PromptCreatorConfigStorage {
    if (!PromptCreatorConfigStorage.instance) {
      PromptCreatorConfigStorage.instance = new PromptCreatorConfigStorage();
    }
    return PromptCreatorConfigStorage.instance;
  }

  load(): PromptCreatorConfig {
    if (typeof window === "undefined") return clone(DEFAULT_CONFIG);
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (!raw) return clone(DEFAULT_CONFIG);
      const parsed = JSON.parse(raw) as Partial<PromptCreatorConfig>;
      const base = clone(DEFAULT_CONFIG);
      const fields = Array.isArray(parsed.fields)
        ? parsed.fields
            .filter((candidate): candidate is PromptCreatorField =>
              Boolean(candidate),
            )
            .map((field) => normalizeField(field))
        : base.fields.map((field) => normalizeField(field));
      return {
        ...base,
        ...parsed,
        fields,
      };
    } catch (error) {
      console.error("Failed to load prompt creator config:", error);
      return clone(DEFAULT_CONFIG);
    }
  }

  save(config: PromptCreatorConfig): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error("Failed to save prompt creator config:", error);
      throw new Error("Storage quota exceeded or storage unavailable");
    }
  }

  addField(field: PromptCreatorField): void {
    const config = this.load();
    config.fields.push(field);
    this.save(config);
  }

  updateField(id: string, updates: Partial<PromptCreatorField>): void {
    const config = this.load();
    const index = config.fields.findIndex((f) => f.id === id);
    if (index === -1) {
      return;
    }

    const existing = config.fields[index];
    if (!existing) {
      return;
    }

    const merged: PromptCreatorField = {
      ...existing,
      ...updates,
      id: existing.id,
    };

    config.fields[index] = merged;
    this.save(config);
  }

  deleteField(id: string, hardDelete: boolean): void {
    const config = this.load();
    if (hardDelete) {
      config.fields = config.fields.filter((f) => f.id !== id);
    } else {
      const index = config.fields.findIndex((f) => f.id === id);
      if (index !== -1) {
        const existing = config.fields[index];
        if (existing) {
          config.fields[index] = {
            ...existing,
            hidden: true,
            id: existing.id,
          };
        }
      }
    }
    this.save(config);
  }

  updateInstructions(
    promptGenInstructions: string,
    ratingRubric: string,
  ): void {
    const config = this.load();
    config.promptGenInstructions = promptGenInstructions;
    config.ratingRubric = ratingRubric;
    this.save(config);
  }

  updateModelConfig(modelId: string): void {
    const config = this.load();
    config.openRouterModelId = modelId;
    this.save(config);
  }
}

// Draft Storage
export class PromptCreatorDraftStorage {
  private static instance: PromptCreatorDraftStorage;

  static getInstance(): PromptCreatorDraftStorage {
    if (!PromptCreatorDraftStorage.instance) {
      PromptCreatorDraftStorage.instance = new PromptCreatorDraftStorage();
    }
    return PromptCreatorDraftStorage.instance;
  }

  load(): PromptCreatorDraft {
    if (typeof window === "undefined") return clone(DEFAULT_DRAFT);
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return clone(DEFAULT_DRAFT);
      const parsed = JSON.parse(raw) as PromptCreatorDraft;
      return {
        ...clone(DEFAULT_DRAFT),
        ...parsed,
        selections: { ...parsed.selections },
      };
    } catch (error) {
      console.error("Failed to load prompt creator draft:", error);
      return clone(DEFAULT_DRAFT);
    }
  }

  save(draft: PromptCreatorDraft): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error("Failed to save prompt creator draft:", error);
    }
  }

  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(DRAFT_KEY);
  }
}

// Results Storage
export class PromptCreatorResultsStorage {
  private static instance: PromptCreatorResultsStorage;

  static getInstance(): PromptCreatorResultsStorage {
    if (!PromptCreatorResultsStorage.instance) {
      PromptCreatorResultsStorage.instance = new PromptCreatorResultsStorage();
    }
    return PromptCreatorResultsStorage.instance;
  }

  load(): PromptCreatorResults {
    if (typeof window === "undefined") return clone(DEFAULT_RESULTS);
    try {
      const raw = localStorage.getItem(RESULTS_KEY);
      if (!raw) return clone(DEFAULT_RESULTS);
      const parsed = JSON.parse(raw) as PromptCreatorResults;
      return {
        ...clone(DEFAULT_RESULTS),
        ...parsed,
        results: Array.isArray(parsed.results)
          ? parsed.results.map((result) => ({
              ...result,
              selections: { ...result.selections },
              rating: {
                ...result.rating,
                reasons: [...result.rating.reasons],
                risks: [...result.rating.risks],
                edits: [...result.rating.edits],
              },
              cost: { ...result.cost },
            }))
          : [],
      };
    } catch (error) {
      console.error("Failed to load prompt creator results:", error);
      return clone(DEFAULT_RESULTS);
    }
  }

  private save(results: PromptCreatorResults): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
    } catch (error) {
      console.error("Failed to save prompt creator results:", error);
      throw new Error("Storage quota exceeded");
    }
  }

  add(result: PromptCreatorResult): void {
    const history = this.load();
    history.results.unshift(result);

    // Keep saved + recent unsaved (up to MAX_RESULTS)
    const saved = history.results.filter((r) => r.isSaved);
    const unsaved = history.results
      .filter((r) => !r.isSaved)
      .slice(0, MAX_RESULTS);

    history.results = [...saved, ...unsaved];
    this.save(history);
  }

  toggleSaved(id: string): void {
    const history = this.load();
    const result = history.results.find((r) => r.id === id);
    if (result) {
      result.isSaved = !result.isSaved;
      this.save(history);
    }
  }

  list(filter?: {
    minScore?: number;
    onlySaved?: boolean;
  }): PromptCreatorResult[] {
    const history = this.load();
    let results = history.results;

    if (filter) {
      const { minScore, onlySaved } = filter;
      if (typeof minScore === "number") {
        results = results.filter((r) => r.rating.score >= minScore);
      }

      if (onlySaved) {
        results = results.filter((r) => r.isSaved);
      }
    }

    return results;
  }

  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(RESULTS_KEY);
  }
}

// Singleton exports
export const promptCreatorConfigStorage =
  PromptCreatorConfigStorage.getInstance();
export const promptCreatorDraftStorage =
  PromptCreatorDraftStorage.getInstance();
export const promptCreatorResultsStorage =
  PromptCreatorResultsStorage.getInstance();
