"use client";

import { useState, useEffect } from "react";
import type { AppSettings, VisionModel } from "@/types";
import { settingsStorage } from "@/lib/storage";

/**
 * SSR-safe settings hook that prevents hydration mismatches
 * by ensuring consistent initial state between server and client
 */
export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Use default settings during SSR and initial client render
    // This ensures hydration consistency
    return {
      openRouterApiKey: "",
      selectedModel: "",
      selectedVisionModels: [],
      customPrompt:
        "Describe this image in detail and suggest a good prompt for generating similar images.",
      isValidApiKey: false,
      lastApiKeyValidation: null,
      lastModelFetch: null,
      availableModels: [],
      preferredModels: [],
      pinnedModels: [],
    };
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only run this effect on the client after hydration
    const initializeSettings = () => {
      const storedSettings = settingsStorage.getSettings();
      setSettings(storedSettings);
      setIsInitialized(true);
    };

    initializeSettings();

    // Subscribe to storage changes
    const unsubscribe = settingsStorage.subscribe(() => {
      const updatedSettings = settingsStorage.getSettings();
      setSettings(updatedSettings);
    });

    return unsubscribe;
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    if (newSettings.openRouterApiKey !== undefined) {
      settingsStorage.updateApiKey(newSettings.openRouterApiKey);
    }
    if (newSettings.selectedModel !== undefined) {
      settingsStorage.updateSelectedModel(newSettings.selectedModel);
    }
    if (newSettings.customPrompt !== undefined) {
      settingsStorage.updateCustomPrompt(newSettings.customPrompt);
    }
    if (newSettings.isValidApiKey !== undefined) {
      settingsStorage.validateApiKey(newSettings.isValidApiKey);
    }
    if (newSettings.availableModels !== undefined) {
      settingsStorage.updateModels(newSettings.availableModels);
    }
    if (newSettings.pinnedModels !== undefined) {
      settingsStorage.updatePinnedModels(newSettings.pinnedModels);
    }
  };

  return {
    settings,
    isInitialized,
    updateSettings,
    // Expose individual update methods for convenience
    updateApiKey: (apiKey: string) => settingsStorage.updateApiKey(apiKey),
    validateApiKey: (isValid: boolean) =>
      settingsStorage.validateApiKey(isValid),
    updateSelectedModel: (modelId: string) =>
      settingsStorage.updateSelectedModel(modelId),
    updateCustomPrompt: (prompt: string) =>
      settingsStorage.updateCustomPrompt(prompt),
    updateModels: (models: VisionModel[]) =>
      settingsStorage.updateModels(models),
    // Pinning APIs
    updatePinnedModels: (modelIds: string[]) =>
      settingsStorage.updatePinnedModels(modelIds),
    pinModel: (modelId: string) => settingsStorage.pinModel(modelId),
    unpinModel: (modelId: string) => settingsStorage.unpinModel(modelId),
    togglePinnedModel: (modelId: string) => settingsStorage.togglePinnedModel(modelId),
    getPinnedModels: () => settingsStorage.getPinnedModels(),
    clearSettings: () => settingsStorage.clearSettings(),
    shouldRefreshModels: () => settingsStorage.shouldRefreshModels(),
    getModelById: (modelId: string) => settingsStorage.getModelById(modelId),
    getSelectedModel: () => settingsStorage.getSelectedModel(),
    subscribe: settingsStorage.subscribe.bind(settingsStorage),
  };
};
