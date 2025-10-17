// Prompt Creator Types

export type FieldType =
  | "dropdown"
  | "multiselect"
  | "slider"
  | "number"
  | "text";
export type FieldTier = "mandatory" | "optional" | "free";

export type PromptCreatorValue = string | number | string[] | null;

export interface PromptCreatorField {
  id: string;
  label: string;
  type: FieldType;
  tier: FieldTier;
  order: number;
  helperText?: string;
  defaultValue?: PromptCreatorValue;
  hidden?: boolean; // For soft delete

  // Type-specific config
  options?: string[];
  maxSelections?: number;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
}

export interface PromptCreatorConfig {
  fields: PromptCreatorField[];
  promptGenInstructions: string;
  ratingRubric: string;
  openRouterModelId: string;
  defaultPromptCount: 1 | 3 | 5 | 10;
  lockedInPrompt: string;
  schemaVersion: 1;
}

export interface PromptCreatorDraft {
  selections: Record<string, PromptCreatorValue>;
  lastModified: number;
  schemaVersion: 1;
}

export interface PromptRating {
  score: number;
  reasons: string[];
  risks: string[];
  edits: string[];
}

export interface PromptCost {
  generationInputTokens: number;
  generationOutputTokens: number;
  generationCost: number;
  ratingInputTokens: number;
  ratingOutputTokens: number;
  ratingCost: number;
  totalCost: number;
}

export interface PromptCreatorResult {
  id: string;
  timestamp: number;
  selections: Record<string, PromptCreatorValue>;
  generatedPrompt: string;
  rating: PromptRating;
  cost: PromptCost;
  isSaved: boolean;
}

export interface PromptCreatorResults {
  results: PromptCreatorResult[];
  schemaVersion: 1;
}
