// Pure readonly helpers for settings (no behavior change)
import { AppSettings } from "./types";

export const selectors = {
  hasApiKey: (settings: AppSettings): boolean => Boolean(settings.openRouterApiKey?.trim()),
  hasValidApiKey: (settings: AppSettings): boolean => Boolean(settings.isValidApiKey),
  hasCustomPrompt: (settings: AppSettings): boolean => Boolean(settings.customPrompt?.trim()),
  hasSelectedModel: (settings: AppSettings): boolean => Boolean(settings.selectedModel?.trim()),
  hasAvailableModels: (settings: AppSettings): boolean => settings.availableModels.length > 0,
};
