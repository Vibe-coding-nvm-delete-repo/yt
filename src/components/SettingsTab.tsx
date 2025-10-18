"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import type { AppSettings, ValidationState, ModelState } from "@/types";
import { settingsStorage } from "@/lib/storage";
import {
  createOpenRouterClient,
  isValidApiKeyFormat,
  type TextModel,
} from "@/lib/openrouter";
import {
  promptCreatorConfigStorage,
  promptCreatorDraftStorage,
} from "@/lib/promptCreatorStorage";
import type {
  PromptCreatorConfig,
  PromptCreatorField,
} from "@/types/promptCreator";
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
import { useToast } from "@/contexts/ToastContext";
import { middleEllipsis } from "@/utils/truncation";
import { useDebounce } from "@/hooks/useDebounce";

interface SettingsTabProps {
  settings: AppSettings;
  onSettingsUpdate: (updatedSettings: AppSettings) => void;
}

type SettingsSubTab =
  | "api-keys"
  | "model-selection"
  | "custom-prompts"
  | "prompt-creator"
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
    return "$0.00";
  }
  return `$${numPrice.toFixed(2)}`;
};

const createPromptCreatorId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

type PromptCreatorFieldForm = {
  label: string;
  tier: PromptCreatorField["tier"];
  type: PromptCreatorField["type"];
  order: number;
  helperText: string;
  defaultValue: string;
  optionsText: string;
  maxSelections: number;
  min: number;
  max: number;
  step: number;
  maxLength: number;
};

const createEmptyFieldForm = (
  config: PromptCreatorConfig,
): PromptCreatorFieldForm => ({
  label: "",
  tier: "mandatory",
  type: "dropdown",
  order: config.fields.length + 1,
  helperText: "",
  defaultValue: "",
  optionsText: "",
  maxSelections: 1,
  min: 0,
  max: 100,
  step: 1,
  maxLength: 60,
});

const parseOptionList = (text: string): string[] =>
  text
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const buildModelDrivenInstructions = (model: TextModel): string =>
  [
    `You are ${model.name}, an advanced text generation model that specializes in high quality prompt construction.`,
    model.description ? `Model context: ${model.description.trim()}` : null,
    "Use the provided variables to synthesize a complete creative brief. The prompt must be production ready, richly descriptive, and stay faithful to every variable.",
    "Respond with a single prompt that can be executed directly without further editing.",
  ]
    .filter(Boolean)
    .join("\n");

const buildModelDrivenRubric = (model: TextModel): string =>
  [
    `Evaluate how well the generated prompt would perform when executed by ${model.name}.`,
    "Score from 1-10 based on clarity, alignment with the supplied variables, actionable detail, and readiness for immediate use.",
    "Call out missing variables, vague language, or risky phrasing. Provide specific improvement guidance when the score is below 8.",
  ].join("\n");

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
  const { addToast } = useToast();

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

  const [promptCreatorConfigState, setPromptCreatorConfigState] =
    useState<PromptCreatorConfig>(() => promptCreatorConfigStorage.load());
  const [fieldForm, setFieldForm] = useState<PromptCreatorFieldForm>(() =>
    createEmptyFieldForm(promptCreatorConfigStorage.load()),
  );
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [promptInstructions, setPromptInstructions] = useState(
    promptCreatorConfigState.promptGenInstructions,
  );
  const [ratingRubric, setRatingRubric] = useState(
    promptCreatorConfigState.ratingRubric,
  );
  const [pcModelId, setPcModelId] = useState(
    promptCreatorConfigState.openRouterModelId,
  );
  const [lockedInPrompt, setLockedInPrompt] = useState(
    promptCreatorConfigState.lockedInPrompt,
  );
  const [textModels, setTextModels] = useState<TextModel[]>([]);
  const [isFetchingTextModels, setIsFetchingTextModels] = useState(false);
  const [textModelError, setTextModelError] = useState<string | null>(null);
  const [isTextModelDropdownOpen, setIsTextModelDropdownOpen] = useState(false);
  const [textModelSearch, setTextModelSearch] = useState("");
  const debouncedTextModelSearch = useDebounce(textModelSearch, 200);
  const textModelDropdownRef = useRef<HTMLDivElement>(null);
  const textModelSearchInputRef = useRef<HTMLInputElement>(null);

  const orderedPromptCreatorFields = useMemo(
    () =>
      [...promptCreatorConfigState.fields].sort((a, b) => {
        if (a.tier !== b.tier) {
          const order = { mandatory: 0, optional: 1, free: 2 } as const;
          return order[a.tier] - order[b.tier];
        }
        return a.order - b.order;
      }),
    [promptCreatorConfigState.fields],
  );

  const selectedTextModel = useMemo(
    () => textModels.find((model) => model.id === pcModelId) || null,
    [pcModelId, textModels],
  );

  // Memoize text model filtering
  const filteredTextModels = useMemo(() => {
    const query = debouncedTextModelSearch.toLowerCase();
    return textModels.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.id.toLowerCase().includes(query),
    );
  }, [textModels, debouncedTextModelSearch]);

  // Memoize pinned/unpinned separation for text model dropdown
  const { pinnedTextModels, unpinnedTextModels } = useMemo(() => {
    const pinnedSet = new Set(settings.pinnedModels || []);
    const pinned = filteredTextModels.filter((m) => pinnedSet.has(m.id));
    const unpinned = filteredTextModels.filter((m) => !pinnedSet.has(m.id));
    return { pinnedTextModels: pinned, unpinnedTextModels: unpinned };
  }, [filteredTextModels, settings.pinnedModels]);

  // Handle settings updates from storage
  useEffect(() => {
    const unsubscribe = hookSubscribe(() => {
      const updatedSettings = settingsStorage.getSettings();
      onSettingsUpdate(updatedSettings);

      setApiKey(updatedSettings.openRouterApiKey);
      setCustomPrompt(updatedSettings.customPrompt);
      setSelectedVisionModels(updatedSettings.selectedVisionModels || []);
      setValidationState((prev) => ({
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

  useEffect(() => {
    if (activeSubTab === "prompt-creator") {
      const config = promptCreatorConfigStorage.load();
      setPromptCreatorConfigState(config);
      setFieldForm(createEmptyFieldForm(config));
      setEditingFieldId(null);
      setPromptInstructions(config.promptGenInstructions);
      setRatingRubric(config.ratingRubric);
      setPcModelId(config.openRouterModelId);
      setLockedInPrompt(config.lockedInPrompt);
    }
  }, [activeSubTab]);

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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      promptCreatorConfigStorage.updateInstructions(
        promptInstructions,
        ratingRubric,
      );
      setPromptCreatorConfigState((prev) => ({
        ...prev,
        promptGenInstructions: promptInstructions,
        ratingRubric,
      }));
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [promptInstructions, ratingRubric]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      promptCreatorConfigStorage.updateModelConfig(pcModelId);
      setPromptCreatorConfigState((prev) => ({
        ...prev,
        openRouterModelId: pcModelId,
      }));
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [pcModelId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      promptCreatorConfigStorage.updateLockedInPrompt(lockedInPrompt);
      setPromptCreatorConfigState((prev) => ({
        ...prev,
        lockedInPrompt,
      }));
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [lockedInPrompt]);

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

      // Close text model dropdown when clicking outside
      if (
        textModelDropdownRef.current &&
        !textModelDropdownRef.current.contains(target) &&
        isTextModelDropdownOpen
      ) {
        setIsTextModelDropdownOpen(false);
        setTextModelSearch("");
      }
    };
    // eslint-disable-next-line no-restricted-syntax
    document.addEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line no-restricted-syntax
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownStates, isTextModelDropdownOpen]);

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

      // Show success toast
      addToast(
        `Successfully fetched ${models.length} vision models`,
        "success",
        4000,
      );
    } catch (error) {
      console.error("Model fetch error:", error);
      setModelState((prev: ModelState) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch models",
      }));
    }
  }, [apiKey, validationState.isValid, hookUpdateModels, addToast]);

  const fetchTextModels = useCallback(async () => {
    if (!validationState.isValid) {
      setTextModelError("Please validate your API key first");
      return;
    }

    setIsFetchingTextModels(true);
    setTextModelError(null);
    try {
      const client = createOpenRouterClient(apiKey);
      const models = await client.getTextModels();
      setTextModels(models);
    } catch (error) {
      console.error("Text model fetch error:", error);
      setTextModelError(
        error instanceof Error ? error.message : "Failed to fetch text models",
      );
    } finally {
      setIsFetchingTextModels(false);
    }
  }, [apiKey, validationState.isValid]);

  const handleTextModelSelect = useCallback(
    (modelId: string) => {
      setPcModelId(modelId);
      setTextModelError(null);
      if (!modelId) {
        return;
      }

      const model = textModels.find((candidate) => candidate.id === modelId);
      if (!model) {
        return;
      }

      setPromptInstructions(buildModelDrivenInstructions(model));
      setRatingRubric(buildModelDrivenRubric(model));
    },
    [textModels],
  );

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

  const resetFieldForm = useCallback(
    (config: PromptCreatorConfig = promptCreatorConfigState) => {
      setFieldForm(createEmptyFieldForm(config));
      setEditingFieldId(null);
    },
    [promptCreatorConfigState],
  );

  const handleFieldFormChange = (
    key: keyof PromptCreatorFieldForm,
    value: string | number,
  ) => {
    setFieldForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditField = (field: PromptCreatorField) => {
    setEditingFieldId(field.id);
    setFieldForm({
      label: field.label,
      tier: field.tier,
      type: field.type,
      order: field.order,
      helperText: field.helperText ?? "",
      defaultValue:
        typeof field.defaultValue === "string"
          ? field.defaultValue
          : field.defaultValue !== undefined
            ? String(field.defaultValue)
            : "",
      optionsText: (field.options ?? []).join("\n"),
      maxSelections: field.maxSelections ?? 1,
      min: field.min ?? 0,
      max: field.max ?? 100,
      step: field.step ?? 1,
      maxLength: field.maxLength ?? 60,
    });
  };

  const handleFieldSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fieldForm.label.trim()) {
      addToast("Field label is required", "error");
      return;
    }

    const fieldId = editingFieldId ?? createPromptCreatorId();
    const baseField: PromptCreatorField = {
      id: fieldId,
      label: fieldForm.label.trim(),
      type: fieldForm.type,
      tier: fieldForm.tier,
      order: Number.isFinite(fieldForm.order) ? fieldForm.order : 1,
    };

    const helperText = fieldForm.helperText.trim();
    if (helperText) {
      baseField.helperText = helperText;
    }

    const defaultValue = fieldForm.defaultValue.trim();
    if (defaultValue) {
      baseField.defaultValue = defaultValue;
    }

    if (fieldForm.type === "dropdown" || fieldForm.type === "multiselect") {
      const options = parseOptionList(fieldForm.optionsText);
      if (options.length === 0) {
        addToast("Provide at least one option", "error");
        return;
      }
      baseField.options = options;
      if (fieldForm.type === "multiselect") {
        baseField.maxSelections = Math.max(
          1,
          Math.floor(fieldForm.maxSelections),
        );
      }
    }

    if (fieldForm.type === "slider" || fieldForm.type === "number") {
      baseField.min = fieldForm.min;
      baseField.max = fieldForm.max;
      baseField.step = fieldForm.step;
    }

    if (fieldForm.type === "text") {
      baseField.maxLength = Math.max(1, Math.floor(fieldForm.maxLength));
    }

    if (editingFieldId) {
      const updates: Partial<PromptCreatorField> = { ...baseField };
      delete (updates as { id?: string }).id;
      promptCreatorConfigStorage.updateField(editingFieldId, updates);
      addToast("Field updated", "success");
    } else {
      promptCreatorConfigStorage.addField(baseField);
      addToast("Field added", "success");
    }

    const fresh = promptCreatorConfigStorage.load();
    setPromptCreatorConfigState(fresh);
    resetFieldForm(fresh);
  };

  const handleDeleteField = (
    field: PromptCreatorField,
    hardDelete: boolean,
  ) => {
    if (hardDelete) {
      if (
        !window.confirm("Hard delete removes this field everywhere. Continue?")
      ) {
        return;
      }
    }

    promptCreatorConfigStorage.deleteField(field.id, hardDelete);

    if (hardDelete) {
      const draft = promptCreatorDraftStorage.load();
      if (field.id in draft.selections) {
        delete draft.selections[field.id];
        promptCreatorDraftStorage.save({ ...draft, lastModified: Date.now() });
      }
    }

    const fresh = promptCreatorConfigStorage.load();
    setPromptCreatorConfigState(fresh);
    if (editingFieldId === field.id) {
      resetFieldForm(fresh);
    }

    addToast(hardDelete ? "Field hard deleted" : "Field hidden", "success");
  };

  const handleRestoreField = (field: PromptCreatorField) => {
    promptCreatorConfigStorage.updateField(field.id, { hidden: false });
    const fresh = promptCreatorConfigStorage.load();
    setPromptCreatorConfigState(fresh);
    addToast("Field restored", "success");
  };

  const renderApiKeysTab = useCallback(
    () => (
      <div className="bg-[#151A21] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)] space-y-4">
        <div className="flex items-center text-white">
          <Key className="mr-2 h-5 w-5" />
          <h3 className="text-lg font-semibold">OpenRouter API Key</h3>
          <Tooltip
            id="settings-openrouter-api-key"
            label="More information about the OpenRouter API key"
            message="Paste your OpenRouter API key (starts with sk-or-v1-). Toggle visibility as needed, then click Validate to confirm before fetching models."
          />
          {validationState.isValid && (
            <CheckCircle
              className="ml-2 h-4 w-4 text-green-400"
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
              className="w-full px-4 py-2 pr-12 border-none rounded-lg focus:ring-2 focus:ring-blue-500/50 bg-white/5 focus:bg-white/10 text-white placeholder:text-gray-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
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
              <div className="flex items-center text-green-400">
                <CheckCircle className="mr-1 h-4 w-4" />
                <span className="text-sm">
                  API key is valid
                  {settings.lastApiKeyValidation && (
                    <span className="text-gray-400 ml-1">
                      (validated{" "}
                      {formatTimestamp(settings.lastApiKeyValidation)})
                    </span>
                  )}
                </span>
              </div>
            )}

            {validationState.error && (
              <div className="flex items-center text-red-400">
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
      <div className="bg-[#151A21] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)] space-y-4">
        <h3 className="text-lg font-semibold text-white">
          Custom Prompt Templates
        </h3>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          rows={4}
          placeholder="Enter your custom prompt template..."
          className="w-full px-4 py-2 border-none rounded-lg focus:ring-2 focus:ring-blue-500/50 bg-white/5 focus:bg-white/10 text-white placeholder:text-gray-500 resize-none transition-colors"
        />
        <p className="text-sm text-gray-400">
          This prompt will be used when generating prompts from images. Changes
          are saved automatically.
        </p>
      </div>
    ),
    [customPrompt],
  );

  const renderPromptCreatorTab = () => (
    <div className="space-y-6">
      <section className="space-y-4 rounded-xl bg-[#151A21] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        <header>
          <h3 className="text-lg font-semibold text-white">
            Prompt Creator Configuration
          </h3>
          <p className="text-sm text-gray-400">
            Define how the builder assembles prompts and how results are rated.
            Each generation will produce 3 prompt variations.
          </p>
        </header>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white">
              Locked-in prompt
            </label>
            <p className="text-xs text-gray-400">
              This prompt will always be prepended to generated prompts,
              regardless of field selections. It remains constant unless changed
              here.
            </p>
            <textarea
              value={lockedInPrompt}
              onChange={(event) => setLockedInPrompt(event.target.value)}
              rows={8}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none font-mono"
              placeholder="Enter locked-in prompt..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">
                Prompt generation instructions
              </label>
              <textarea
                value={promptInstructions}
                onChange={(event) => setPromptInstructions(event.target.value)}
                rows={6}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="Take the below variables and create a prompt..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">
                Rating rubric
              </label>
              <textarea
                value={ratingRubric}
                onChange={(event) => setRatingRubric(event.target.value)}
                rows={6}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="Explain how the rater should score prompts and return JSON"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1 space-y-3">
            <label className="text-sm font-semibold text-white">
              OpenRouter text generation model
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <button
                type="button"
                onClick={fetchTextModels}
                disabled={isFetchingTextModels || !validationState.isValid}
                className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    isFetchingTextModels ? "animate-spin" : ""
                  }`}
                />
                {isFetchingTextModels ? "Fetching…" : "Fetch"}
              </button>
              <div className="relative flex-1" ref={textModelDropdownRef}>
                <button
                  type="button"
                  onClick={() =>
                    setIsTextModelDropdownOpen(!isTextModelDropdownOpen)
                  }
                  className="w-full px-4 py-2 border-none rounded-lg focus:ring-2 focus:ring-blue-500/50 bg-white/5 hover:bg-white/10 text-left flex items-center justify-between transition-colors"
                  aria-label="Select OpenRouter text model"
                >
                  <span
                    className="text-white text-sm"
                    title={
                      selectedTextModel
                        ? selectedTextModel.name
                        : pcModelId || "Select a text model…"
                    }
                  >
                    {selectedTextModel
                      ? middleEllipsis(selectedTextModel.name, 40)
                      : pcModelId
                        ? middleEllipsis(pcModelId, 40)
                        : "Select a text model…"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ${isTextModelDropdownOpen ? "transform rotate-180" : ""}`}
                  />
                </button>
                {isTextModelDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-[#1A212A] border border-white/10 rounded-lg shadow-[0_24px_56px_rgba(0,0,0,0.55)] max-h-80 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-white/6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={textModelSearchInputRef}
                          type="text"
                          placeholder="Search text models..."
                          value={textModelSearch}
                          onChange={(e) => setTextModelSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border-none rounded-lg focus:ring-2 focus:ring-blue-500/50 bg-white/5 focus:bg-white/10 text-white placeholder:text-gray-500 text-sm transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="overflow-y-auto flex-1">
                      {(() => {
                        const pinnedSet = new Set(settings.pinnedModels || []);

                        const renderRow = (model: TextModel) => (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                              handleTextModelSelect(model.id);
                              setIsTextModelDropdownOpen(false);
                              setTextModelSearch("");
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-white/5 transition-colors ${
                              pcModelId === model.id
                                ? "bg-blue-900/30 text-blue-400"
                                : "text-white"
                            }`}
                            title={model.name}
                          >
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium">
                                  {middleEllipsis(model.name, 40)}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {formatPrice(
                                    model.pricing.prompt +
                                      model.pricing.completion,
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
                                className="ml-3 text-gray-400 hover:text-gray-300 flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  hookTogglePinnedModel(model.id);
                                  addToast(
                                    pinnedSet.has(model.id)
                                      ? "Model unpinned"
                                      : "Model pinned",
                                    "success",
                                  );
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
                            {pinnedTextModels.length > 0 && (
                              <>
                                <div className="px-4 py-1 text-xs uppercase tracking-wide text-gray-400">
                                  Pinned
                                </div>
                                {pinnedTextModels.map((m) => renderRow(m))}
                                <div className="my-1 border-t border-white/6" />
                              </>
                            )}
                            {unpinnedTextModels.map((m) => renderRow(m))}
                            {filteredTextModels.length === 0 && (
                              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                                No text models found
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {textModelError && (
              <p className="text-xs text-red-400">{textModelError}</p>
            )}
            {pcModelId && !selectedTextModel && (
              <p className="text-xs text-gray-400">
                Using stored model ID: {pcModelId}
              </p>
            )}
            {selectedTextModel && (
              <p className="text-xs text-gray-400">
                {selectedTextModel.description
                  ? `${selectedTextModel.description} · `
                  : ""}
                Prompt {formatPrice(selectedTextModel.pricing.prompt)} ·
                Completion {formatPrice(selectedTextModel.pricing.completion)}
                {selectedTextModel.context_length
                  ? ` · Context ${selectedTextModel.context_length.toLocaleString()} tokens`
                  : ""}
              </p>
            )}
          </div>
          {validationState.isValid && (
            <div className="flex items-center text-green-400">
              <CheckCircle className="mr-1 h-4 w-4" />
              <span className="text-sm">
                Connection verified
                {settings.lastApiKeyValidation && (
                  <span className="text-gray-400 ml-1">
                    (verified {formatTimestamp(settings.lastApiKeyValidation)})
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        {/* Field Creation Form - Centered and Compact */}
        <div className="mx-auto max-w-xl rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border-2 border-blue-500/30">
          <header className="mb-4 text-center">
            <h3 className="text-base font-semibold text-white mb-1">
              Create New Field
            </h3>
            <p className="text-xs text-gray-300">
              Quickly define custom fields for your prompt creator
            </p>
            {editingFieldId && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => resetFieldForm()}
                  className="rounded-md border border-white/20 px-2 py-1 text-xs text-gray-200 hover:border-blue-400"
                >
                  Cancel edit
                </button>
              </div>
            )}
          </header>

          <form onSubmit={handleFieldSubmit} className="space-y-3">
            {/* Field Label */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white block">
                Field label
              </label>
              <input
                value={fieldForm.label}
                onChange={(event) =>
                  handleFieldFormChange("label", event.target.value)
                }
                placeholder="e.g., Time of day, Art style"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Control Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white block">
                Control type
              </label>
              <select
                value={fieldForm.type}
                onChange={(event) => {
                  const nextType = event.target
                    .value as PromptCreatorField["type"];
                  if (editingFieldId) {
                    const original = orderedPromptCreatorFields.find(
                      (field) => field.id === editingFieldId,
                    );
                    if (original && original.type !== nextType) {
                      const confirmed = window.confirm(
                        "Changing control type may remove existing options. Continue?",
                      );
                      if (!confirmed) {
                        return;
                      }
                    }
                  }
                  handleFieldFormChange("type", nextType);
                }}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="dropdown" className="bg-[#1A212A] text-white">
                  Dropdown - Single choice from list
                </option>
                <option value="multiselect" className="bg-[#1A212A] text-white">
                  Multiselect - Multiple choices from list
                </option>
                <option value="slider" className="bg-[#1A212A] text-white">
                  Slider - Numeric range selector
                </option>
                <option value="number" className="bg-[#1A212A] text-white">
                  Number - Direct numeric input
                </option>
                <option value="text" className="bg-[#1A212A] text-white">
                  Text - Free-form text input
                </option>
              </select>
            </div>

            {/* Tier */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white block">
                Tier
              </label>
              <select
                value={fieldForm.tier}
                onChange={(event) =>
                  handleFieldFormChange(
                    "tier",
                    event.target.value as PromptCreatorField["tier"],
                  )
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="mandatory" className="bg-[#1A212A] text-white">
                  Mandatory - Must be filled
                </option>
                <option value="optional" className="bg-[#1A212A] text-white">
                  Optional - Can be skipped
                </option>
                <option value="free" className="bg-[#1A212A] text-white">
                  Free - No restrictions
                </option>
              </select>
            </div>

            {/* Order and Helper Text - Side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white block">
                  Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={fieldForm.order}
                  onChange={(event) =>
                    handleFieldFormChange("order", Number(event.target.value))
                  }
                  placeholder="1"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white block">
                  Default value
                </label>
                <input
                  value={fieldForm.defaultValue}
                  onChange={(event) =>
                    handleFieldFormChange("defaultValue", event.target.value)
                  }
                  placeholder="Optional"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Helper Text */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white block">
                Helper text (optional)
              </label>
              <input
                value={fieldForm.helperText}
                onChange={(event) =>
                  handleFieldFormChange("helperText", event.target.value)
                }
                placeholder="Tooltip guidance"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Type-specific fields */}
            {(fieldForm.type === "dropdown" ||
              fieldForm.type === "multiselect") && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white block">
                  Options (one per line)
                </label>
                <textarea
                  value={fieldForm.optionsText}
                  onChange={(event) =>
                    handleFieldFormChange("optionsText", event.target.value)
                  }
                  rows={3}
                  placeholder="Morning&#10;Afternoon&#10;Evening"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none font-mono"
                />
                {fieldForm.type === "multiselect" && (
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <span>Max selections</span>
                    <input
                      type="number"
                      min={1}
                      value={fieldForm.maxSelections}
                      onChange={(event) =>
                        handleFieldFormChange(
                          "maxSelections",
                          Number(event.target.value),
                        )
                      }
                      placeholder="3"
                      className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}
            {(fieldForm.type === "slider" || fieldForm.type === "number") && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white block">
                  Numeric range
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300">Min</label>
                    <input
                      type="number"
                      value={fieldForm.min}
                      onChange={(event) =>
                        handleFieldFormChange("min", Number(event.target.value))
                      }
                      placeholder="0"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300">Max</label>
                    <input
                      type="number"
                      value={fieldForm.max}
                      onChange={(event) =>
                        handleFieldFormChange("max", Number(event.target.value))
                      }
                      placeholder="100"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300">Step</label>
                    <input
                      type="number"
                      value={fieldForm.step}
                      onChange={(event) =>
                        handleFieldFormChange(
                          "step",
                          Number(event.target.value),
                        )
                      }
                      placeholder="1"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
            {fieldForm.type === "text" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white block">
                  Max characters
                </label>
                <input
                  type="number"
                  value={fieldForm.maxLength}
                  onChange={(event) =>
                    handleFieldFormChange(
                      "maxLength",
                      Number(event.target.value),
                    )
                  }
                  placeholder="60"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 flex justify-center">
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-sm font-semibold text-white hover:from-blue-500 hover:to-purple-500 shadow-lg transition-all"
              >
                {editingFieldId ? "Update Field" : "Create Field"}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Fields Section - Visually Distinct */}
        <div className="rounded-xl bg-[#151A21] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
          <header className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Existing Fields
            </h3>
            <p className="text-sm text-gray-400">
              Manage and organize the fields you&apos;ve created
            </p>
          </header>

          <div className="space-y-3">
            {orderedPromptCreatorFields.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No fields yet. Create your first field above to get started.
              </p>
            ) : (
              orderedPromptCreatorFields.map((field) => (
                <div
                  key={field.id}
                  className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <h4 className="text-base font-semibold text-white">
                        {field.label}
                        {field.hidden && (
                          <span className="ml-2 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-300">
                            Hidden
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-400">
                        Tier: {field.tier} • Type: {field.type} • Order:{" "}
                        {field.order}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditField(field)}
                        className="rounded-md border border-white/20 px-3 py-1 text-xs text-gray-200 hover:border-blue-400"
                      >
                        Edit
                      </button>
                      {field.hidden ? (
                        <button
                          type="button"
                          onClick={() => handleRestoreField(field)}
                          className="rounded-md border border-white/20 px-3 py-1 text-xs text-gray-200 hover:border-green-400"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDeleteField(field, false)}
                          className="rounded-md border border-white/20 px-3 py-1 text-xs text-gray-200 hover:border-yellow-400"
                        >
                          Hide
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteField(field, true)}
                        className="rounded-md border border-red-500/50 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                      >
                        Hard delete
                      </button>
                    </div>
                  </header>
                  {field.helperText && (
                    <p className="text-sm text-gray-300">
                      Helper: {field.helperText}
                    </p>
                  )}
                  {field.options && field.options.length > 0 && (
                    <div className="text-sm text-gray-300">
                      Options: {field.options.join(", ")}
                      {field.maxSelections && field.type === "multiselect" && (
                        <span className="ml-2 text-gray-400">
                          (max {field.maxSelections})
                        </span>
                      )}
                    </div>
                  )}
                  {(field.type === "slider" || field.type === "number") && (
                    <p className="text-sm text-gray-300">
                      Range: {field.min} – {field.max} (step {field.step})
                    </p>
                  )}
                  {field.type === "text" && field.maxLength && (
                    <p className="text-sm text-gray-300">
                      Max length: {field.maxLength}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );

  const renderCategoriesTab = useCallback(
    () => (
      <div className="bg-[#151A21] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)] space-y-4">
        <h3 className="text-lg font-semibold text-gray-400">Categories</h3>
        <p className="text-sm text-gray-500 italic">
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
          <h3 className="text-lg font-semibold text-white flex items-center">
            Vision Models (Select up to 5)
          </h3>
          <div className="flex items-center gap-3">
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
              Fetch
            </button>
            {settings.lastModelFetch && (
              <div className="flex items-center text-green-400">
                <CheckCircle className="mr-1 h-4 w-4" />
                <span className="text-sm">
                  Verified
                  <span className="text-gray-400 ml-1">
                    (verified {formatTimestamp(settings.lastModelFetch)})
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {modelState.error && (
          <div className="p-4 bg-red-900/20 border border-red-800/30 rounded-lg">
            <p className="text-sm text-red-400">{modelState.error}</p>
          </div>
        )}

        {modelState.models.length > 0 && (
          <>
            <div className="text-sm text-gray-400">
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
                    className="bg-[#151A21] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">
                          Vision Model {index + 1}
                        </h4>
                        {selectedModelData && (
                          <button
                            onClick={() => toggleModelExpansion(index)}
                            className="text-gray-400 hover:text-gray-300"
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
                        <select
                          value={selectedVisionModels[index] || ""}
                          onChange={(e) => {
                            const newModels = [...selectedVisionModels];
                            newModels[index] = e.target.value;
                            setSelectedVisionModels(newModels.filter(Boolean));
                          }}
                          className="w-full px-4 py-2 border-none rounded-lg focus:ring-2 focus:ring-blue-500/50 bg-white/5 focus:bg-white/10 text-white transition-colors [&>option]:bg-[#1A212A] [&>option]:text-white [&>option:disabled]:text-gray-500"
                        >
                          <option value="" className="bg-[#1A212A] text-white">
                            -- Select a model --
                          </option>
                          {modelState.models.map((model) => (
                            <option
                              key={model.id}
                              value={model.id}
                              disabled={
                                selectedVisionModels.includes(model.id) &&
                                selectedVisionModels[index] !== model.id
                              }
                              title={model.name}
                              className="bg-[#1A212A] text-white disabled:text-gray-500"
                            >
                              {middleEllipsis(model.name, 50)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Collapsible Model Info */}
                      {selectedModelData && isExpanded && (
                        <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-300">
                                Model:
                              </span>
                              <span className="text-white">
                                {selectedModelData.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-300">
                                Prompt Price:
                              </span>
                              <span className="text-white">
                                {formatPrice(selectedModelData.pricing.prompt)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-300">
                                Completion Price:
                              </span>
                              <span className="text-white">
                                {formatPrice(
                                  selectedModelData.pricing.completion,
                                )}
                              </span>
                            </div>
                            {selectedModelData.description && (
                              <div>
                                <span className="font-medium text-gray-300">
                                  Description:
                                </span>
                                <p className="text-gray-400 mt-1">
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      modelState,
      validationState.isValid,
      selectedVisionModels,
      expandedModels,
      settings.lastModelFetch,
      settings.pinnedModels,
      fetchModels,
      toggleModelExpansion,
      hookTogglePinnedModel,
    ],
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Sub-tabs Navigation */}
      <div className="border-b border-white/10">
        <nav className="flex space-x-4" aria-label="Settings sections">
          <button
            onClick={() => setActiveSubTab("api-keys")}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeSubTab === "api-keys"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveSubTab("model-selection")}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeSubTab === "model-selection"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            Model Selection
          </button>
          <button
            onClick={() => setActiveSubTab("custom-prompts")}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeSubTab === "custom-prompts"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            Custom Prompt Templates
          </button>
          <button
            onClick={() => setActiveSubTab("prompt-creator")}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeSubTab === "prompt-creator"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            Prompt Creator
          </button>
          <button
            onClick={() => setActiveSubTab("categories")}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeSubTab === "categories"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-500"
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
        {activeSubTab === "prompt-creator" && renderPromptCreatorTab()}
        {activeSubTab === "categories" && renderCategoriesTab()}
      </div>
    </div>
  );
};

export default SettingsTab;
