"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type {
  AppSettings,
  ValidationState,
  ModelState,
  VisionModel,
} from "@/types";
import { settingsStorage } from "@/lib/storage";
import { createOpenRouterClient, isValidApiKeyFormat } from "@/lib/openrouter";
import {
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  Key,
  CheckCircle,
  Eye,
  EyeOff,
  XCircle,
  Pin,
  PinOff,
} from "lucide-react";
import { Tooltip } from "@/components/common/Tooltip";
import { useSettings as useSettingsHook } from "@/hooks/useSettings";

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
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatPrice = (price: number | string | null | undefined) => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (typeof numPrice !== "number" || isNaN(numPrice) || !isFinite(numPrice)) {
    return "$0.000000";
  }
  return `$${numPrice.toFixed(6)}`;
};

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onSettingsUpdate,
}) => {
  const settingsHook = useSettingsHook();
  const {
    updateApiKey: hookUpdateApiKey,
    validateApiKey: hookValidateApiKey,
    updateCustomPrompt: hookUpdateCustomPrompt,
    updateModels: hookUpdateModels,
    togglePinnedModel: hookTogglePinnedModel,
    subscribe: hookSubscribe,
  } = settingsHook;

  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>("api-keys");
  const [apiKey, setApiKey] = useState(settings.openRouterApiKey);
  const [customPrompt, setCustomPrompt] = useState(settings.customPrompt);
  const [selectedVisionModels, setSelectedVisionModels] = useState<string[]>(
    settings.selectedVisionModels || [],
  );
  const [expandedModels, setExpandedModels] = useState<Set<number>>(new Set());
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
    searchTerm: "",
  });

  // Dropdown states for the 5 individual model selectors
  const [dropdownStates, setDropdownStates] = useState<
    Record<number, { isOpen: boolean; search: string }>
  >({
    0: { isOpen: false, search: "" },
    1: { isOpen: false, search: "" },
    2: { isOpen: false, search: "" },
    3: { isOpen: false, search: "" },
    4: { isOpen: false, search: "" },
  });
  const dropdownRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Handle settings updates from storage
  useEffect(() => {
    const unsubscribe = hookSubscribe(() => {
      const updatedSettings = settingsStorage.getSettings();
      onSettingsUpdate(updatedSettings);

      setApiKey(updatedSettings.openRouterApiKey);
      setCustomPrompt(updatedSettings.customPrompt);
      setSelectedVisionModels(updatedSettings.selectedVisionModels || []);
      setValidationState((prev: { isValid: boolean; lastChecked: number | null }) => ({
        ...prev,
        isValid: updatedSettings.isValidApiKey,
      }));
      setModelState((prev: ModelState) => ({
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

  // Auto-save selected vision models
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (
        JSON.stringify(selectedVisionModels) !==
        JSON.stringify(settings.selectedVisionModels)
      ) {
        settingsStorage.updateSelectedVisionModels(selectedVisionModels);
        onSettingsUpdate(settingsStorage.getSettings());
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedVisionModels, settings.selectedVisionModels, onSettingsUpdate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      Object.keys(dropdownRefs.current).forEach((key) => {
        const index = Number(key);
        const ref = dropdownRefs.current[index];
        if (ref && !ref.contains(target) && dropdownStates[index]?.isOpen) {
          setDropdownStates((prev) => ({
            ...prev,
            [index]: { isOpen: false, search: prev[index]?.search || "" },
          }));
        }
      });
    };
    // eslint-disable-next-line no-restricted-syntax
    document.addEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line no-restricted-syntax
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownStates]);

  const handleApiKeyChange = useCallback(
    (value: string) => {
      setApiKey(value);
      hookUpdateApiKey(value);

      if (value !== settings.openRouterApiKey) {
        setValidationState({
          isValidating: false,
          isValid: false,
          error: null,
        });
      }
    },
    [hookUpdateApiKey, settings.openRouterApiKey],
  );

  const validateApiKey = useCallback(async () => {
    if (!apiKey.trim()) {
      setValidationState({
        isValidating: false,
        isValid: false,
        error: "API key is required",
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

    setValidationState((prev: ValidationState) => ({
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
      console.error("API validation error:", error);
      setValidationState({
        isValidating: false,
        isValid: false,
        error:
          error instanceof Error ? error.message : "Failed to validate API key",
      });
    }
  }, [apiKey, hookValidateApiKey]);

  const fetchModels = useCallback(async () => {
    if (!validationState.isValid) {
      setModelState((prev: ModelState) => ({
        ...prev,
        error: "Please validate your API key first",
      }));
      return;
    }

    setModelState((prev: ModelState) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const client = createOpenRouterClient(apiKey);
      const models = await client.getVisionModels();

      setModelState((prev: ModelState) => ({
        ...prev,
        isLoading: false,
        models,
        error: null,
      }));

      hookUpdateModels(models);
    } catch (error) {
      console.error("Model fetch error:", error);
      setModelState((prev: ModelState) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch models",
      }));
    }
  }, [apiKey, validationState.isValid, hookUpdateModels]);

  const toggleModelExpansion = useCallback((index: number) => {
    setExpandedModels((prev: Set<number>) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // Helper function to extract provider/company from model ID
  const getModelProvider = useCallback((modelId: string): string => {
    const parts = modelId.split("/");
    return parts.length > 0 ? parts[0] || "Other" : "Other";
  }, []);

  // Helper function to calculate average cost per token for sorting/comparison
  // Uses average of prompt and completion pricing since both are used in vision tasks
  const getModelAverageCost = useCallback((model: VisionModel): number => {
    const promptCost = model.pricing.prompt || 0;
    const completionCost = model.pricing.completion || 0;
    return (promptCost + completionCost) / 2;
  }, []);

  const renderApiKeysTab = useCallback(
    () => (
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
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label={showApiKey ? "Hide API key" : "Show API key"}
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
                      (validated{" "}
                      {formatTimestamp(settings.lastApiKeyValidation)})
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
      </div>
    ),
    [
      apiKey,
      showApiKey,
      validationState,
      settings.lastApiKeyValidation,
      handleApiKeyChange,
      validateApiKey,
    ],
  );

  const renderCustomPromptsTab = useCallback(
    () => (
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
    ),
    [customPrompt],
  );

  const renderCategoriesTab = useCallback(
    () => (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
          Categories
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 italic">
          This feature is coming soon.
        </p>
      </div>
    ),
    [],
  );

  const renderModelSelectionTab = useCallback(
    () => (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            Vision Models (Select up to 5)
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

        {/* Legacy single dropdown - removed (dead code with undefined variables)
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-left flex items-center justify-between"
            aria-label="Select model"
          >
            <span className="text-gray-900 dark:text-white">
              {selectedModel
                ? modelState.models.find((m) => m.id === selectedModel)?.name ||
                  "Select a model..."
                : "Select a model..."}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? "transform rotate-180" : ""}`}
            />
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg maxh-80 overflow-hidden flex flex-col">
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
                {(() => {
                  const query = dropdownSearch.toLowerCase();
                  const filtered = modelState.models.filter(
                    (m) =>
                      m.name.toLowerCase().includes(query) ||
                      m.id.toLowerCase().includes(query),
                  );
                  const pinnedSet = new Set(settings.pinnedModels || []);
                  const pinnedList = filtered.filter((m) =>
                    pinnedSet.has(m.id),
                  );
                  const otherList = filtered.filter(
                    (m) => !pinnedSet.has(m.id),
                  );

                  const renderRow = (model: (typeof filtered)[number]) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(model.id);
                        setIsDropdownOpen(false);
                        setDropdownSearch("");
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                        selectedModel === model.id
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">
                            {model.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatPrice(
                              model.pricing.prompt + model.pricing.completion,
                            )}
                            /token
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label={
                            pinnedSet.has(model.id)
                              ? "Unpin model"
                              : "Pin model"
                          }
                          className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Re-implement pinned model toggle functionality
                            console.warn('Pinned model toggle not yet implemented');
                          }}
                        >
                          {pinnedSet.has(model.id) ? (
                            <Pin className="h-4 w-4 text-blue-600" />
                          ) : (
                            <PinOff className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </button>
                  );

                  return (
                    <>
                      {pinnedList.length > 0 && (
                        <>
                          <div className="px-4 py-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Pinned
                          </div>
                          {pinnedList.map((m) => renderRow(m))}
                          <div className="my-1 border-t border-gray-200 dark:border-gray-600" />
                        </>
                      )}
                      {otherList.map((m) => renderRow(m))}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
        */}
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

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Selected: {selectedVisionModels.length} / 5
            </div>

            {/* Vision Model Selectors */}
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((index) => {
                const selectedModelId = selectedVisionModels[index];
                const selectedModelData = selectedModelId
                  ? modelState.models.find((m) => m.id === selectedModelId)
                  : null;
                const isExpanded = expandedModels.has(index);

                return (
                  <div
                    key={index}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Vision Model {index + 1}
                        </h4>
                        {selectedModelData && (
                          <button
                            onClick={() => toggleModelExpansion(index)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Enhanced Dropdown with Search, Pricing, Pinning, Grouping, and Sorting */}
                      <div
                        className="relative"
                        ref={(el) => {
                          if (el) dropdownRefs.current[index] = el;
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownStates((prev) => ({
                              ...prev,
                              [index]: {
                                isOpen: !prev[index]?.isOpen,
                                search: prev[index]?.search || "",
                              },
                            }));
                          }}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-left flex items-center justify-between"
                        >
                          <span className="text-gray-900 dark:text-white truncate">
                            {selectedModelId
                              ? modelState.models.find(
                                  (m) => m.id === selectedModelId,
                                )?.name || "Select a model..."
                              : "Select a model..."}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${dropdownStates[index]?.isOpen ? "transform rotate-180" : ""}`}
                          />
                        </button>
                        {dropdownStates[index]?.isOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
                            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Search models..."
                                  value={dropdownStates[index]?.search || ""}
                                  onChange={(e) => {
                                    setDropdownStates((prev) => ({
                                      ...prev,
                                      [index]: {
                                        isOpen: prev[index]?.isOpen || false,
                                        search: e.target.value,
                                      },
                                    }));
                                  }}
                                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>

                            <div className="overflow-y-auto flex-1">
                              {(() => {
                                const query = (
                                  dropdownStates[index]?.search || ""
                                ).toLowerCase();
                                const filtered = modelState.models.filter(
                                  (m) =>
                                    m.name.toLowerCase().includes(query) ||
                                    m.id.toLowerCase().includes(query) ||
                                    getModelProvider(m.id)
                                      .toLowerCase()
                                      .includes(query),
                                );

                                const pinnedSet = new Set(
                                  settings.pinnedModels || [],
                                );
                                const pinnedList = filtered.filter((m) =>
                                  pinnedSet.has(m.id),
                                );
                                const otherList = filtered.filter(
                                  (m) => !pinnedSet.has(m.id),
                                );

                                // Group by provider and sort by cost (highest to lowest)
                                const groupByProvider = (
                                  models: VisionModel[],
                                ) => {
                                  const groups: Record<string, VisionModel[]> =
                                    {};
                                  models.forEach((model) => {
                                    const provider = getModelProvider(model.id);
                                    if (!groups[provider]) {
                                      groups[provider] = [];
                                    }
                                    groups[provider].push(model);
                                  });
                                  // Sort models within each group by cost (highest to lowest)
                                  Object.keys(groups).forEach((provider) => {
                                    const providerModels = groups[provider];
                                    if (providerModels) {
                                      providerModels.sort(
                                        (a, b) =>
                                          getModelAverageCost(b) -
                                          getModelAverageCost(a),
                                      );
                                    }
                                  });
                                  return groups;
                                };

                                const renderRow = (model: VisionModel) => (
                                  <button
                                    key={model.id}
                                    type="button"
                                    onClick={() => {
                                      const newModels = [
                                        ...selectedVisionModels,
                                      ];
                                      if (newModels[index] === model.id) {
                                        newModels.splice(index, 1);
                                      } else {
                                        newModels[index] = model.id;
                                      }
                                      setSelectedVisionModels(newModels);
                                      setDropdownStates((prev) => ({
                                        ...prev,
                                        [index]: {
                                          ...prev[index],
                                          isOpen: false,
                                          search: "",
                                        },
                                      }));
                                    }}
                                    disabled={
                                      selectedVisionModels.includes(model.id) &&
                                      selectedVisionModels[index] !== model.id
                                    }
                                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                      selectedModelId === model.id
                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                        : "text-gray-900 dark:text-white"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 min-w-0 mr-2">
                                        <div className="text-sm font-medium truncate">
                                          {model.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          ~{formatPrice(
                                            getModelAverageCost(model),
                                          )}
                                          /token avg
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        aria-label={
                                          pinnedSet.has(model.id)
                                            ? "Unpin model"
                                            : "Pin model"
                                        }
                                        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          hookTogglePinnedModel(model.id);
                                        }}
                                      >
                                        {pinnedSet.has(model.id) ? (
                                          <Pin className="h-4 w-4 text-blue-600" />
                                        ) : (
                                          <PinOff className="h-4 w-4" />
                                        )}
                                      </button>
                                    </div>
                                  </button>
                                );

                                const pinnedGroups =
                                  groupByProvider(pinnedList);
                                const otherGroups = groupByProvider(otherList);

                                return (
                                  <>
                                    {pinnedList.length > 0 && (
                                      <>
                                        <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                                          Pinned Models
                                        </div>
                                        {Object.keys(pinnedGroups)
                                          .sort()
                                          .map((provider) => {
                                            const providerModels =
                                              pinnedGroups[provider];
                                            if (!providerModels) return null;
                                            return (
                                              <div key={`pinned-${provider}`}>
                                                <div className="px-4 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-750">
                                                  {provider}
                                                </div>
                                                {providerModels.map((m) =>
                                                  renderRow(m),
                                                )}
                                              </div>
                                            );
                                          })}
                                        <div className="my-1 border-t-2 border-gray-300 dark:border-gray-600" />
                                      </>
                                    )}
                                    {Object.keys(otherGroups)
                                      .sort()
                                      .map((provider) => {
                                        const providerModels =
                                          otherGroups[provider];
                                        if (!providerModels) return null;
                                        return (
                                          <div key={provider}>
                                            <div className="px-4 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-750">
                                              {provider}
                                            </div>
                                            {providerModels.map((m) =>
                                              renderRow(m),
                                            )}
                                          </div>
                                        );
                                      })}
                                    {filtered.length === 0 && (
                                      <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No models found
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Collapsible Model Info */}
                      {selectedModelData && isExpanded && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                Model:
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {selectedModelData.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                Prompt Price:
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {formatPrice(selectedModelData.pricing.prompt)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                Completion Price:
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {formatPrice(
                                  selectedModelData.pricing.completion,
                                )}
                              </span>
                            </div>
                            {selectedModelData.description && (
                              <div>
                                <span className="font-medium text.gray-700 dark:text-gray-300">
                                  Description:
                                </span>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                  {selectedModelData.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    ),
    [
      modelState,
      validationState.isValid,
      selectedVisionModels,
      expandedModels,
      settings.lastModelFetch,
      fetchModels,
      toggleModelExpansion,
      getModelProvider,
      getModelAverageCost,
      hookTogglePinnedModel,
    ],
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h1>

      {/* Sub-tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4" aria-label="Settings sections">
          <button
            onClick={() => setActiveSubTab("api-keys")}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeSubTab === "api-keys"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveSubTab("model-selection")}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeSubTab === "model-selection"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover.text-gray-300"
            }`}
          >
            Model Selection
          </button>
          <button
            onClick={() => setActiveSubTab("custom-prompts")}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeSubTab === "custom-prompts"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Custom Prompt Templates
          </button>
          <button
            onClick={() => setActiveSubTab("categories")}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeSubTab === "categories"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-400 dark:text-gray-500"
            }`}
            disabled
          >
            Categories
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeSubTab === "api-keys" && renderApiKeysTab()}
        {activeSubTab === "model-selection" && renderModelSelectionTab()}
        {activeSubTab === "custom-prompts" && renderCustomPromptsTab()}
        {activeSubTab === "categories" && renderCategoriesTab()}
      </div>
    </div>
  );
};
