"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { AppSettings, VisionModel } from "@/types";
import { optimizedSettingsStorage } from "@/lib/storage-optimized";

/**
 * Optimized settings hook with selective subscriptions and memoization
 * Prevents unnecessary re-renders by only subscribing to specific keys
 */
export const useOptimizedSettings = (subscribeToKeys?: (keyof AppSettings)[]) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Use default settings during SSR and initial client render
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
    const storedSettings = optimizedSettingsStorage.getSettings();
    setSettings(storedSettings);
    setIsInitialized(true);

    // Subscribe with selective updates
    const unsubscribe = optimizedSettingsStorage.subscribe(
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
    optimizedSettingsStorage.updateApiKey(apiKey);
  }, []);

  const validateApiKey = useCallback((isValid: boolean) => {
    optimizedSettingsStorage.validateApiKey(isValid);
  }, []);

  const updateSelectedModel = useCallback((modelId: string) => {
    optimizedSettingsStorage.updateSelectedModel(modelId);
  }, []);

  const updateCustomPrompt = useCallback((prompt: string) => {
    optimizedSettingsStorage.updateCustomPrompt(prompt);
  }, []);

  const updateModels = useCallback((models: VisionModel[]) => {
    optimizedSettingsStorage.updateModels(models);
  }, []);

  const pinModel = useCallback((modelId: string) => {
    optimizedSettingsStorage.pinModel(modelId);
  }, []);

  const unpinModel = useCallback((modelId: string) => {
    optimizedSettingsStorage.unpinModel(modelId);
  }, []);

  const batchUpdateSettings = useCallback((updates: Partial<AppSettings>) => {
    optimizedSettingsStorage.batchUpdate(updates);
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
    pinModel,
    unpinModel,
    subscribe: optimizedSettingsStorage.subscribe.bind(optimizedSettingsStorage),
  }), [
    memoizedSettings, 
    isInitialized, 
    batchUpdateSettings,
    updateApiKey, 
    validateApiKey, 
    updateSelectedModel, 
    updateCustomPrompt, 
    updateModels,
    pinModel,
    unpinModel
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
    const settings = optimizedSettingsStorage.getSettings();
    return settings[key];
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize with current value
    if (!isInitialized) {
      const settings = optimizedSettingsStorage.getSettings();
      setValue(settings[key]);
      setIsInitialized(true);
    }

    // Subscribe only to this specific key
    const unsubscribe = optimizedSettingsStorage.subscribeToKey(
      key,
      (newValue) => setValue(newValue),
      false // Don't call immediately since we already initialized
    );

    return unsubscribe;
  }, [key, isInitialized]);

  const updateValue = useCallback((newValue: AppSettings[K]) => {
    optimizedSettingsStorage.batchUpdate({ [key]: newValue } as Partial<AppSettings>);
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
  const { settings } = useOptimizedSettings(['isValidApiKey', 'lastApiKeyValidation']);
  
  const validateApiKey = useCallback((isValid: boolean) => {
    optimizedSettingsStorage.validateApiKey(isValid);
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
  const { settings } = useOptimizedSettings(['selectedModel', 'availableModels']);
  
  const updateSelectedModel = useCallback((modelId: string) => {
    optimizedSettingsStorage.updateSelectedModel(modelId);
  }, []);
  
  return {
    selectedModel: settings.selectedModel,
    availableModels: settings.availableModels,
    setSelectedModel: updateSelectedModel,
  };
};

/**
 * Hook for components that manage pinned models
 */
export const usePinnedModels = () => {
  const { settings } = useOptimizedSettings(['pinnedModels', 'availableModels']);
  
  const pinModel = useCallback((modelId: string) => {
    optimizedSettingsStorage.pinModel(modelId);
  }, []);
  
  const unpinModel = useCallback((modelId: string) => {
    optimizedSettingsStorage.unpinModel(modelId);
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
    unpinModel
  };
};

/**
 * Hook for components that need custom prompt
 */
export const useCustomPrompt = () => {
  const [customPrompt, updateCustomPrompt] = useSettingsKey('customPrompt');
  return { customPrompt, updateCustomPrompt };
};
