import type {
  PromptCreatorConfig,
  PromptCreatorDraft,
  PromptCreatorField,
  PromptCreatorResult,
  PromptCreatorResults,
} from "@/types/promptCreator";

const CONFIG_KEY = "prompt-creator-config";
const DRAFT_KEY = "prompt-creator-draft";
const RESULTS_KEY = "prompt-creator-results";
const MAX_RESULTS = 500;

const DEFAULT_CONFIG: PromptCreatorConfig = {
  fields: [],
  promptGenInstructions: "Take the below variables and create a detailed prompt that follows best practices for image generation. Use the exact wording from the variables in your output.",
  ratingRubric: "Rate this prompt on a scale of 1-10 based on clarity, descriptive quality, and effectiveness. Return your response as JSON with this exact format: {\"score\": <number>, \"reasons\": [<string>], \"risks\": [<string>], \"edits\": [<string>]}",
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
    if (typeof window === "undefined") return DEFAULT_CONFIG;
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (!raw) return DEFAULT_CONFIG;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONFIG, ...parsed };
    } catch (error) {
      console.error("Failed to load prompt creator config:", error);
      return DEFAULT_CONFIG;
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
    if (index !== -1) {
      config.fields[index] = { ...config.fields[index], ...updates };
      this.save(config);
    }
  }

  deleteField(id: string, hardDelete: boolean): void {
    const config = this.load();
    if (hardDelete) {
      config.fields = config.fields.filter((f) => f.id !== id);
    } else {
      const index = config.fields.findIndex((f) => f.id === id);
      if (index !== -1) {
        config.fields[index] = { ...config.fields[index], hidden: true };
      }
    }
    this.save(config);
  }

  updateInstructions(promptGenInstructions: string, ratingRubric: string): void {
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
    if (typeof window === "undefined") return DEFAULT_DRAFT;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return DEFAULT_DRAFT;
      return JSON.parse(raw);
    } catch (error) {
      console.error("Failed to load prompt creator draft:", error);
      return DEFAULT_DRAFT;
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
    if (typeof window === "undefined") return DEFAULT_RESULTS;
    try {
      const raw = localStorage.getItem(RESULTS_KEY);
      if (!raw) return DEFAULT_RESULTS;
      return JSON.parse(raw);
    } catch (error) {
      console.error("Failed to load prompt creator results:", error);
      return DEFAULT_RESULTS;
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
    const unsaved = history.results.filter((r) => !r.isSaved).slice(0, MAX_RESULTS);
    
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

  list(filter?: { minScore?: number; onlySaved?: boolean }): PromptCreatorResult[] {
    const history = this.load();
    let results = history.results;
    
    if (filter?.minScore) {
      results = results.filter((r) => r.rating.score >= filter.minScore);
    }
    
    if (filter?.onlySaved) {
      results = results.filter((r) => r.isSaved);
    }
    
    return results;
  }

  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(RESULTS_KEY);
  }
}

// Singleton exports
export const promptCreatorConfigStorage = PromptCreatorConfigStorage.getInstance();
export const promptCreatorDraftStorage = PromptCreatorDraftStorage.getInstance();
export const promptCreatorResultsStorage = PromptCreatorResultsStorage.getInstance();