"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { AppSettings, VisionModel } from "@/types";
import { settingsStorage } from "@/lib/storage";

/**
 * Optimized settings hook with selective subscriptions and memoization
 * Prevents unnecessary re-renders by only subscribing to specific keys
 */
export const useSettings = (subscribeToKeys?: (keyof AppSettings)[]) => {
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
  const previousSettingsRef = useRef<AppSettings>();
  const settingsHashRef = useRef<string>("");

  // Memoize settings to prevent unnecessary re-renders
  const memoizedSettings = useMemo(() => {
    // Create a hash of the settings to check for actual changes
    const currentHash = JSON.stringify(settings);
    
    // Only return new object if settings actually changed
    if (previousSettingsRef.current && settingsHashRef.current === currentHash) {
      return previousSettingsRef.current;
    }
    
    // Settings changed, update refs and return new object
    settingsHashRef.current = currentHash;
    previousSettingsRef.current = settings;
    return settings;
  }, [settings]);

  useEffect(() => {
    // Initialize settings
    const storedSettings = settingsStorage.getSettings();
    setSettings(storedSettings);
    setIsInitialized(true);

    // Subscribe with selective updates - FIX: Add proper callback function
    const unsubscribe = settingsStorage.subscribe(
      (newSettings, oldSettings, changedKeys) => {
        // Only update if settings actually changed and we care about the keys
        const relevantChange = !subscribeToKeys || 
          (changedKeys && changedKeys.some(key => subscribeToKeys.includes(key)));
        
        if (relevantChange) {
          // Only update state if the JSON representation actually changed
          const newHash = JSON.stringify(newSettings);
          const oldHash = JSON.stringify(oldSettings);
          
          if (newHash !== oldHash) {
            setSettings(newSettings);
          }
        }
      },
      {
        keys: subscribeToKeys, // Only subscribe to specific keys if provided
        immediate: false
      }
    );

    return unsubscribe;
  }, [subscribeToKeys]);

  // Memoized update functions to prevent re-renders in consuming components
  const updateApiKey = useCallback((apiKey: string) => {
    settingsStorage.updateApiKey(apiKey);
  }, []);

  const validateApiKey = useCallback((isValid: boolean) => {
    settingsStorage.validateApiKey(isValid);
  }, []);

  const updateSelectedModel = useCallback((modelId: string) => {
    settingsStorage.updateSelectedModel(modelId);
  }, []);

  const updateCustomPrompt = useCallback((prompt: string) => {
    settingsStorage.updateCustomPrompt(prompt);
  }, []);

  const updateModels = useCallback((models: VisionModel[]) => {
    settingsStorage.updateModels(models);
  }, []);

  const updatePinnedModels = useCallback((modelIds: string[]) => {
    settingsStorage.updatePinnedModels(modelIds);
  }, []);

  const pinModel = useCallback((modelId: string) => {
    settingsStorage.pinModel(modelId);
  }, []);

  const unpinModel = useCallback((modelId: string) => {
    settingsStorage.unpinModel(modelId);
  }, []);

  const togglePinnedModel = useCallback((modelId: string) => {
    settingsStorage.togglePinnedModel(modelId);
  }, []);

  const batchUpdateSettings = useCallback((updates: Partial<AppSettings>) => {
    settingsStorage.batchUpdate(updates);
  }, []);

  const clearSettings = useCallback(() => {
    settingsStorage.clearSettings();
  }, []);

  const shouldRefreshModels = useCallback(() => {
    return settingsStorage.shouldRefreshModels();
  }, []);

  const getModelById = useCallback((modelId: string) => {
    return settingsStorage.getModelById(modelId);
  }, []);

  const getSelectedModel = useCallback(() => {
    return settingsStorage.getSelectedModel();
  }, []);

  const getPinnedModels = useCallback(() => {
    return settingsStorage.getPinnedModels();
  }, []);

  // Simple subscribe function that matches the expected signature
  const subscribe = useCallback((callback: () => void) => {
    return settingsStorage.subscribe(callback);
  }, []);

  // Return memoized values and functions
  return useMemo(() => ({
    settings: memoizedSettings,
    isInitialized,
    updateSettings: batchUpdateSettings,
    updateApiKey,
    validateApiKey,
    updateSelectedModel,
    updateCustomPrompt,
    updateModels,
    updatePinnedModels,
    pinModel,
    unpinModel,
    togglePinnedModel,
    clearSettings,
    shouldRefreshModels,
    getModelById,
    getSelectedModel,
    getPinnedModels,
    subscribe,
  }), [
    memoizedSettings, 
    isInitialized, 
    batchUpdateSettings,
    updateApiKey, 
    validateApiKey, 
    updateSelectedModel, 
    updateCustomPrompt, 
    updateModels,
    updatePinnedModels,
    pinModel,
    unpinModel,
    togglePinnedModel,
    clearSettings,
    shouldRefreshModels,
    getModelById,
    getSelectedModel,
    getPinnedModels,
    subscribe
  ]);
};

/**
 * Hook for subscribing to specific setting keys only
 * Use this when components only need one or two specific settings
 */
export const useSettingsKey = <K extends keyof AppSettings>(
  key: K
): [AppSettings[K], (value: AppSettings[K]) => void] => {
  const [value, setValue] = useState<AppSettings[K]>(() => {
    const settings = settingsStorage.getSettings();
    return settings[key];
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize with current value
    if (!isInitialized) {
      const settings = settingsStorage.getSettings();
      setValue(settings[key]);
      setIsInitialized(true);
    }

    // Subscribe only to this specific key
    const unsubscribe = settingsStorage.subscribeToKey(
      key,
      (newValue) => setValue(newValue),
      false // Don't call immediately since we already initialized
    );

    return unsubscribe;
  }, [key, isInitialized]);

  const updateValue = useCallback((newValue: AppSettings[K]) => {
    settingsStorage.batchUpdate({ [key]: newValue } as Partial<AppSettings>);
  }, [key]);

  return [value, updateValue];
};

/**
 * Hook for components that only need API key
 * Optimized to prevent re-renders when other settings change
 */
export const useApiKey = () => {
  return useSettingsKey('openRouterApiKey');
};

/**
 * Hook for components that only need API key validation state
 */
export const useApiKeyValidation = () => {
  const { settings } = useSettings(['isValidApiKey', 'lastApiKeyValidation']);
  
  const validateApiKey = useCallback((isValid: boolean) => {
    settingsStorage.validateApiKey(isValid);
  }, []);
  
  return {
    isValidApiKey: settings.isValidApiKey,
    lastApiKeyValidation: settings.lastApiKeyValidation,
    validateApiKey
  };
};

/**
 * Hook for components that only need model selection
 */
export const useModelSelection = () => {
  const { settings } = useSettings(['selectedModel', 'availableModels']);
  
  const updateSelectedModel = useCallback((modelId: string) => {
    settingsStorage.updateSelectedModel(modelId);
  }, []);
  
  return {
    selectedModel: settings.selectedModel,
    availableModels: settings.availableModels,
    setSelectedModel: updateSelectedModel,
    getModelById: settingsStorage.getModelById.bind(settingsStorage),
    getSelectedModel: settingsStorage.getSelectedModel.bind(settingsStorage)
  };
};

/**
 * Hook for components that manage pinned models
 */
export const usePinnedModels = () => {
  const { settings } = useSettings(['pinnedModels', 'availableModels']);
  
  const pinModel = useCallback((modelId: string) => {
    settingsStorage.pinModel(modelId);
  }, []);
  
  const unpinModel = useCallback((modelId: string) => {
    settingsStorage.unpinModel(modelId);
  }, []);
  
  const togglePinnedModel = useCallback((modelId: string) => {
    settingsStorage.togglePinnedModel(modelId);
  }, []);
  
  const isModelPinned = useCallback((modelId: string) => {
    return settingsStorage.isModelPinned(modelId);
  }, []);
  
  // Get actual model objects for pinned models
  const pinnedModels = useMemo(() => {
    return settings.pinnedModels
      .map(id => settings.availableModels.find(model => model.id === id))
      .filter(Boolean) as VisionModel[];
  }, [settings.pinnedModels, settings.availableModels]);
  
  return {
    pinnedModelIds: settings.pinnedModels,
    pinnedModels,
    pinModel,
    unpinModel,
    togglePinnedModel,
    isModelPinned
  };
};

/**
 * Hook for components that need custom prompt
 */
export const useCustomPrompt = () => {
  const [customPrompt, updateCustomPrompt] = useSettingsKey('customPrompt');
  return { customPrompt, updateCustomPrompt };
};

/**
 * Hook for components that need model management
 */
export const useModelManagement = () => {
  const { settings } = useSettings(['availableModels', 'lastModelFetch']);
  
  const updateModels = useCallback((models: VisionModel[]) => {
    settingsStorage.updateModels(models);
  }, []);
  
  const shouldRefreshModels = useCallback(() => {
    return settingsStorage.shouldRefreshModels();
  }, []);
  
  return {
    availableModels: settings.availableModels,
    lastModelFetch: settings.lastModelFetch,
    updateModels,
    shouldRefreshModels,
    getModelById: settingsStorage.getModelById.bind(settingsStorage)
  };
};
