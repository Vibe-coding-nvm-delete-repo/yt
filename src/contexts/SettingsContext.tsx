"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppSettings } from '@/types';

interface SettingsContextValue {
  settings: AppSettings;
  updateApiKey: (apiKey: string) => void;
  validateApiKey: (isValid: boolean) => void;
  updateSelectedModel: (modelId: string) => void;
  updateCustomPrompt: (prompt: string) => void;
  updateModels: (models: import('@/types').VisionModel[]) => void;
  clearSettings: () => void;
  shouldRefreshModels: () => boolean;
  getModelById: (modelId: string) => import('@/types').VisionModel | null;
  getSelectedModel: () => import('@/types').VisionModel | null;
  subscribe: (listener: () => void) => () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    openRouterApiKey: '',
    selectedModel: '',
    customPrompt: 'Describe this image in detail and suggest a good prompt for generating similar images.',
    isValidApiKey: false,
    lastApiKeyValidation: null,
    lastModelFetch: null,
    availableModels: [],
    preferredModels: [],
  });

  // Load initial settings
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('image-to-prompt-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({
          openRouterApiKey: parsed.openRouterApiKey || '',
          selectedModel: parsed.selectedModel || '',
          customPrompt: parsed.customPrompt || settings.customPrompt,
          isValidApiKey: parsed.isValidApiKey || false,
          lastApiKeyValidation: parsed.lastApiKeyValidation ? Number(parsed.lastApiKeyValidation) : null,
          lastModelFetch: parsed.lastModelFetch ? Number(parsed.lastModelFetch) : null,
          availableModels: Array.isArray(parsed.availableModels) ? parsed.availableModels : [],
          preferredModels: Array.isArray(parsed.preferredModels) ? parsed.preferredModels : [],
        });
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
  }, []);

  // Persist settings to localStorage
  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('image-to-prompt-settings', JSON.stringify(newSettings));
      window.dispatchEvent(new CustomEvent('image-to-prompt-settings-updated', { detail: newSettings }));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  };

  const updateApiKey = (apiKey: string) => {
    saveSettings({ ...settings, openRouterApiKey: apiKey, isValidApiKey: false });
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

  const updateModels = (models: import('@/types').VisionModel[]) => {
    saveSettings({
      ...settings,
      availableModels: models,
      lastModelFetch: Date.now(),
    });
  };

  const clearSettings = () => {
    const defaultSettings = {
      openRouterApiKey: '',
      selectedModel: '',
      customPrompt: 'Describe this image in detail and suggest a good prompt for generating similar images.',
      isValidApiKey: false,
      lastApiKeyValidation: null,
      lastModelFetch: null,
      availableModels: [],
      preferredModels: [],
    };
    saveSettings(defaultSettings);
  };

  const shouldRefreshModels = () => {
    if (!settings.lastModelFetch) return true;
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return Date.now() - settings.lastModelFetch > oneDayInMs;
  };

  const getModelById = (modelId: string) => {
    return settings.availableModels.find(model => model.id === modelId) || null;
  };

  const getSelectedModel = () => {
    if (!settings.selectedModel) return null;
    return getModelById(settings.selectedModel);
  };

  const subscribe = (listener: () => void) => {
    const eventHandler = () => listener();

    window.addEventListener('image-to-prompt-settings-updated', eventHandler);
    return () => window.removeEventListener('image-to-prompt-settings-updated', eventHandler);
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
