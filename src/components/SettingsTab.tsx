"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppSettings, ValidationState, ModelState } from '@/types';
import { settingsStorage } from '@/lib/storage';
import { createOpenRouterClient, isValidApiKeyFormat } from '@/lib/openrouter';
import { RefreshCw, Search, ChevronDown, Key, CheckCircle, Eye, EyeOff, Download, Upload, XCircle } from 'lucide-react';
import { Tooltip } from '@/components/common/Tooltip';
import { SettingsApiKeys } from '@/components/settings/SettingsApiKeys';
import { useSettings as useSettingsHook } from '@/hooks/useSettings';

interface SettingsTabProps {
  settings: AppSettings;
  onSettingsUpdate: (updatedSettings: AppSettings) => void;
}

type SettingsSubTab =
  | "api-keys"
  | "model-selection"
  | "custom-prompts"
  | "categories";

const formatTimestamp = (timestamp: number | null): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onSettingsUpdate,
}) => {
  // Use the canonical settings hook for update operations and subscription.
  // We keep the existing props-based settings for backwards compatibility with parent components.
  const settingsHook = useSettingsHook();
  const {
    updateApiKey: hookUpdateApiKey,
    validateApiKey: hookValidateApiKey,
    updateSelectedModel: hookUpdateSelectedModel,
    updateCustomPrompt: hookUpdateCustomPrompt,
    updateModels: hookUpdateModels,
    subscribe: hookSubscribe,
  } = settingsHook;

  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>('api-keys');
  const [apiKey, setApiKey] = useState(settings.openRouterApiKey);
  const [customPrompt, setCustomPrompt] = useState(settings.customPrompt);
  const [selectedModel, setSelectedModel] = useState(settings.selectedModel);
  const [showApiKey, setShowApiKey] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    isValid: settings.isValidApiKey,
    error: null,
  });
  const [modelState, setModelState] = useState<ModelState>({
    isLoading: false,
    models: settings.availableModels,
    error: null,
    searchTerm: '',
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle settings updates from storage
  useEffect(() => {
    const unsubscribe = hookSubscribe(() => {
      const updatedSettings = settingsStorage.getSettings();
      onSettingsUpdate(updatedSettings);

      setApiKey(updatedSettings.openRouterApiKey);
      setCustomPrompt(updatedSettings.customPrompt);
      setSelectedModel(updatedSettings.selectedModel);
      setValidationState((prev) => ({
        ...prev,
        isValid: updatedSettings.isValidApiKey,
      }));
      setModelState((prev) => ({
        ...prev,
        models: updatedSettings.availableModels,
      }));
    });

    return unsubscribe;
  }, [onSettingsUpdate, hookSubscribe]);

  // Auto-save custom prompt
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (customPrompt !== settings.customPrompt) {
        hookUpdateCustomPrompt(customPrompt);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [customPrompt, settings.customPrompt, hookUpdateCustomPrompt]);

  // Auto-save selected model
  useEffect(() => {
    if (selectedModel !== settings.selectedModel) {
      hookUpdateSelectedModel(selectedModel);
    }
  }, [selectedModel, settings.selectedModel, hookUpdateSelectedModel]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setDropdownSearch('');
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    hookUpdateApiKey(value);

    // Reset validation when API key changes
    if (value !== settings.openRouterApiKey) {
      setValidationState({
        isValidating: false,
        isValid: false,
        error: null,
      });
    }
  };

  const validateApiKey = useCallback(async () => {
    if (!apiKey.trim()) {
      setValidationState({
        isValidating: false,
        isValid: false,
        error: 'API key is required',
      });
      return;
    }

    if (!isValidApiKeyFormat(apiKey)) {
      setValidationState({
        isValidating: false,
        isValid: false,
        error: 'Invalid API key format. OpenRouter keys start with "sk-or-v1-"',
      });
      return;
    }

    setValidationState((prev) => ({
      ...prev,
      isValidating: true,
      error: null,
    }));

    try {
      const client = createOpenRouterClient(apiKey);
      const isValid = await client.validateApiKey();

      setValidationState({
        isValidating: false,
        isValid,
        error: null,
      });

      hookValidateApiKey(isValid);
    } catch (error) {
      console.error('API validation error:', error);
      setValidationState({
        isValidating: false,
        isValid: false,
        error:
          error instanceof Error ? error.message : 'Failed to validate API key',
      });
    }
  }, [apiKey, hookValidateApiKey]);

  const fetchModels = useCallback(async () => {
    // Use the most recent validation state instead of props
    if (!validationState.isValid) {
      setModelState((prev) => ({
        ...prev,
        error: 'Please validate your API key first',
      }));
      return;
    }

    setModelState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const client = createOpenRouterClient(apiKey);
      const models = await client.getVisionModels();

      setModelState((prev) => ({
        ...prev,
        isLoading: false,
        models,
        error: null,
      }));

      hookUpdateModels(models);

      // Auto-select first model if none selected
      if (!selectedModel && models.length > 0) {
        setSelectedModel(models[0].id);
      }
    } catch (error) {
      console.error('Model fetch error:', error);
      setModelState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch models',
      }));
    }
  }, [apiKey, validationState.isValid, selectedModel, hookUpdateModels]);

  const exportSettings = useCallback(() => {
    const settingsJson = settingsStorage.exportSettings();
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image-to-prompt-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const importSettings = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settingsJson = e.target?.result as string;
        const success = settingsStorage.importSettings(settingsJson);

        if (!success) {
          alert('Failed to import settings. Please check the file format.');
        }
      } catch {
        alert('Failed to import settings. Please check the file format.');
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  }, []);

  const formatPrice = useCallback((price: number | string | null | undefined) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (
      typeof numPrice !== 'number' ||
      isNaN(numPrice) ||
      !isFinite(numPrice)
    ) {
      return '$0.000000';
    }
    return `$${numPrice.toFixed(6)}`;
  }, []);

  const renderApiKeysTab = useCallback(() => (
    <div className="space-y-4">
      <div className="flex items-center text-gray-900 dark:text-white">
        <Key className="mr-2 h-5 w-5" />
        <h3 className="text-lg font-semibold">OpenRouter API Key</h3>
        <Tooltip
          id="settings-openrouter-api-key"
          label="More information about the OpenRouter API key"
          message="Paste your OpenRouter API key (starts with sk-or-v1-). Toggle visibility as needed, then click Validate to confirm before fetching models."
        />
        {validationState.isValid && (
          <CheckCircle
            className="ml-2 h-4 w-4 text-green-600"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="sk-or-v1-..."
            className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
          >
            {showApiKey ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={validateApiKey}
            disabled={validationState.isValidating || !apiKey.trim()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {validationState.isValidating ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Validate API Key
          </button>

          {validationState.isValid && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircle className="mr-1 h-4 w-4" />
              <span className="text-sm">
                API key is valid
                {settings.lastApiKeyValidation && (
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    (validated {formatTimestamp(settings.lastApiKeyValidation)})
                  </span>
                )}
              </span>
            </div>
          )}

          {validationState.error && (
            <div className="flex items-center text-red-600 dark:text-red-400">
              <XCircle className="mr-1 h-4 w-4" />
              <span className="text-sm">{validationState.error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Import/Export Section */}
      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Import/Export Settings
        </h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportSettings}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Settings
          </button>

          <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Import Settings
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  ), [apiKey, showApiKey, validationState, settings.lastApiKeyValidation, customPrompt, selectedModel, modelState]);

  const renderCustomPromptsTab = useCallback(() => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Custom Prompt Templates
      </h3>
      <textarea
        value={customPrompt}
        onChange={(e) => setCustomPrompt(e.target.value)}
        rows={4}
        placeholder="Enter your custom prompt template..."
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
      />
      <p className="text-sm text-gray-500 dark:text-gray-400">
        This prompt will be used when generating prompts from images. Changes
        are saved automatically.
      </p>
    </div>
  ), [customPrompt]);

  const renderCategoriesTab = useCallback(() => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
        Categories
      </h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
        This feature is coming soon.
      </p>
    </div>
  ), []);

  const renderModelSelectionTab = useCallback(() => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          Vision Model
        </h3>
        <button
          onClick={fetchModels}
          disabled={modelState.isLoading || !validationState.isValid}
          className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {modelState.isLoading ? (
            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-3 w-3" />
          )}
          Fetch Models
        </button>
      </div>

      {modelState.error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            {modelState.error}
          </p>
        </div>
      )}

      {modelState.models.length > 0 && (
        <>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✓ Successfully fetched {modelState.models.length} vision models
              {settings.lastModelFetch && (
                <span className="text-green-600 dark:text-green-400 ml-1">
                  ({formatTimestamp(settings.lastModelFetch)})
                </span>
              )}
            </p>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-left flex items-center justify-between"
              aria-label="Select model"
            >
              <span className="text-gray-900 dark:text-white">
                {selectedModel
                  ? modelState.models.find((m) => m.id === selectedModel)
                      ?.name || 'Select a model...'
                  : 'Select a model...'}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
              />
            </button>
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search models..."
                      value={dropdownSearch}
                      onChange={(e) => setDropdownSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <div className="overflow-y-auto flex-1">
                  {modelState.models
                    .filter(
                      (model) =>
                        model.name
                          .toLowerCase()
                          .includes(dropdownSearch.toLowerCase()) ||
                        model.id
                          .toLowerCase()
                          .includes(dropdownSearch.toLowerCase()),
                    )
                    .map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          setSelectedModel(model.id);
                          setIsDropdownOpen(false);
                          setDropdownSearch('');
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                          selectedModel === model.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        <div className="text-sm font-medium">{model.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatPrice(
                            model.pricing.prompt + model.pricing.completion,
                          )}
                          /token
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Model Info */}
              {selectedModel && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                  {(() => {
                    const model = modelState.models.find(m => m.id === selectedModel);
                    if (!model) return null;

                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Model:</span>
                          <span className="text-gray-900 dark:text-white">{model.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Prompt Price:</span>
                          <span className="text-gray-900 dark:text-white">{formatPrice(model.pricing.prompt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Completion Price:</span>
                          <span className="text-gray-900 dark:text-white">{formatPrice(model.pricing.completion)}</span>
                        </div>
                        {model.description && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Description:</span>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{model.description}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Import/Export Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Import/Export Settings
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportSettings}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Settings
              </button>

              <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Import Settings
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

      {/* Import/Export Section */}
      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Import/Export Settings
        </h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportSettings}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Settings
          </button>

          <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Import Settings
          </label>
        </div>
      </div>
    </div>
  ), [apiKey, showApiKey, validationState, settings.lastApiKeyValidation, customPrompt, selectedModel, modelState]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h1>

      {/* Sub-tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4" aria-label="Settings sections">
          <button
            onClick={() => setActiveSubTab('api-keys')}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeSubTab === 'api-keys'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveSubTab('model-selection')}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeSubTab === 'model-selection'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Model Selection
          </button>
          <button
            onClick={() => setActiveSubTab('custom-prompts')}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeSubTab === 'custom-prompts'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Custom Prompt Templates
          </button>
          <button
            onClick={() => setActiveSubTab('categories')}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeSubTab === 'categories'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-400 dark:text-gray-500'
            }`}
            disabled
          >
            Categories
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeSubTab === 'api-keys' && renderApiKeysTab()}
        {activeSubTab === 'model-selection' && renderModelSelectionTab()}
        {activeSubTab === 'custom-prompts' && renderCustomPromptsTab()}
        {activeSubTab === 'categories' && renderCategoriesTab()}
      </div>
    </div>
  );
};
