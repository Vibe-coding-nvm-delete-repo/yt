// Domain facade for settings - encapsulates storage + business logic (no behavior change)
import { settingsStorage } from "@/lib/storage";
import type { AppSettings } from "./types";
import { selectors } from "./selectors";

export function getSettings(): AppSettings {
  return settingsStorage.getSettings();
}

export function updateApiKey(apiKey: string): void {
  settingsStorage.updateApiKey(apiKey);
}

export function updateCustomPrompt(customPrompt: string): void {
  settingsStorage.updateCustomPrompt(customPrompt);
}

export function updateSelectedModel(selectedModel: string): void {
  settingsStorage.updateSelectedModel(selectedModel);
}

export function updateModels(models: AppSettings['availableModels']): void {
  settingsStorage.updateModels(models);
}

export function validateApiKeySync(isValid: boolean): void {
  settingsStorage.validateApiKey(isValid);
}

export function subscribe(listener: () => void): () => void {
  return settingsStorage.subscribe(listener);
}

// Static exports
export { validateApiKey } from "./validate";
export { selectors };
export type { ValidationResult } from "./types";
