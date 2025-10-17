"use client";

import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { AppSettings, VisionModel } from "@/types";

interface SettingsContextValue {
  settings: AppSettings;
  updateApiKey: (apiKey: string) => void;
  validateApiKey: (isValid: boolean) => void;
  updateSelectedModel: (modelId: string) => void;
  updateCustomPrompt: (prompt: string) => void;
  updateModels: (models: VisionModel[]) => void;
  clearSettings: () => void;
  shouldRefreshModels: () => boolean;
  getModelById: (modelId: string) => VisionModel | null;
  getSelectedModel: () => VisionModel | null;
  subscribe: (listener: () => void) => () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error(
      "useSettingsContext must be used within a SettingsProvider",
    );
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

const DEFAULT_SETTINGS: AppSettings = {
  openRouterApiKey: "",
  selectedModel: "",
  selectedVisionModels: [],
  activeModels: [],
  customPrompt:
    "Describe this image in detail and suggest a good prompt for generating similar images.",
  isValidApiKey: false,
  lastApiKeyValidation: null,
  lastModelFetch: null,
  availableModels: [],
  preferredModels: [],
  pinnedModels: [],
};

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Initialize from localStorage if available
    if (typeof window === "undefined") return DEFAULT_SETTINGS;

    try {
      const stored = localStorage.getItem("image-to-prompt-settings");
      if (!stored) return DEFAULT_SETTINGS;

      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        openRouterApiKey: parsed.openRouterApiKey || "",
        selectedModel: parsed.selectedModel || "",
        selectedVisionModels: Array.isArray(parsed.selectedVisionModels)
          ? parsed.selectedVisionModels
          : [],
        customPrompt: parsed.customPrompt || DEFAULT_SETTINGS.customPrompt,
        isValidApiKey: Boolean(parsed.isValidApiKey),
        lastApiKeyValidation: parsed.lastApiKeyValidation
          ? Number(parsed.lastApiKeyValidation)
          : null,
        lastModelFetch: parsed.lastModelFetch
          ? Number(parsed.lastModelFetch)
          : null,
        availableModels: Array.isArray(parsed.availableModels)
          ? parsed.availableModels
          : [],
        preferredModels: Array.isArray(parsed.preferredModels)
          ? parsed.preferredModels
          : [],
        pinnedModels: Array.isArray(parsed.pinnedModels)
          ? parsed.pinnedModels
          : [],
      };
    } catch (error) {
      console.warn("Failed to load settings from localStorage:", error);
      return DEFAULT_SETTINGS;
    }
  });

  // Persist settings to localStorage
  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(
        "image-to-prompt-settings",
        JSON.stringify(newSettings),
      );
      window.dispatchEvent(
        new CustomEvent("image-to-prompt-settings-updated", {
          detail: newSettings,
        }),
      );
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  };

  const updateApiKey = (apiKey: string) => {
    saveSettings({
      ...settings,
      openRouterApiKey: apiKey,
      isValidApiKey: false,
    });
  };

  const validateApiKey = (isValid: boolean) => {
    saveSettings({
      ...settings,
      isValidApiKey: isValid,
      lastApiKeyValidation: isValid ? Date.now() : null,
    });
  };

  const updateSelectedModel = (modelId: string) => {
    saveSettings({ ...settings, selectedModel: modelId });
  };

  const updateCustomPrompt = (prompt: string) => {
    saveSettings({ ...settings, customPrompt: prompt });
  };

  const updateModels = (models: VisionModel[]) => {
    saveSettings({
      ...settings,
      availableModels: models,
      lastModelFetch: Date.now(),
    });
  };

  const clearSettings = () => {
    saveSettings({ ...DEFAULT_SETTINGS });
  };

  const shouldRefreshModels = () => {
    if (!settings.lastModelFetch) return true;
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return Date.now() - settings.lastModelFetch > oneDayInMs;
  };

  const getModelById = (modelId: string) => {
    return (
      settings.availableModels.find((model) => model.id === modelId) || null
    );
  };

  const getSelectedModel = () => {
    if (!settings.selectedModel) return null;
    return getModelById(settings.selectedModel);
  };

  const subscribe = (listener: () => void) => {
    const eventHandler = () => listener();

    window.addEventListener("image-to-prompt-settings-updated", eventHandler);
    return () =>
      window.removeEventListener(
        "image-to-prompt-settings-updated",
        eventHandler,
      );
  };

  const contextValue: SettingsContextValue = {
    settings,
    updateApiKey,
    validateApiKey,
    updateSelectedModel,
    updateCustomPrompt,
    updateModels,
    clearSettings,
    shouldRefreshModels,
    getModelById,
    getSelectedModel,
    subscribe,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};
