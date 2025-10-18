/* eslint-disable custom/max-file-size */
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  promptCreatorConfigStorage,
  promptCreatorDraftStorage,
} from "@/lib/promptCreatorStorage";
import type {
  PromptCreatorConfig,
  PromptCreatorDraft,
  PromptCreatorField,
  PromptCreatorValue,
} from "@/types/promptCreator";

export interface PromptCreatorTabProps {
  apiKey: string;
}

interface ChatUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
}

interface ChatResponseChoice {
  message?: { content?: string };
}

interface ChatResponse {
  choices?: ChatResponseChoice[];
  usage?: ChatUsage;
}

const isValueProvided = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const formatFieldValue = (
  field: PromptCreatorField,
  value: unknown,
): string => {
  if (!isValueProvided(value)) {
    return "[not selected]";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value);
};

const parseDefaultValue = (
  field: PromptCreatorField,
): PromptCreatorValue | undefined => {
  const raw = field.defaultValue;
  if (raw === undefined || raw === null) {
    return undefined;
  }
  if (typeof raw === "string" && raw.trim().length === 0) {
    return undefined;
  }

  if (field.type === "multiselect") {
    if (Array.isArray(raw)) {
      return raw.length > 0 ? [...raw] : undefined;
    }
    const parsed = String(raw)
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return parsed.length > 0 ? parsed : undefined;
  }

  if (field.type === "number" || field.type === "slider") {
    const numeric =
      typeof raw === "number"
        ? raw
        : Number.parseFloat(typeof raw === "string" ? raw : String(raw));
    if (Number.isFinite(numeric)) {
      return numeric;
    }
    return undefined;
  }

  return raw;
};

const getInitialValue = (
  field: PromptCreatorField,
): PromptCreatorValue | undefined => {
  const fromDefault = parseDefaultValue(field);
  if (isValueProvided(fromDefault)) {
    return fromDefault as PromptCreatorValue;
  }

  if (field.type === "number" || field.type === "slider") {
    return field.min ?? 0;
  }

  return undefined;
};

const buildVariablesText = (
  fields: PromptCreatorField[],
  selections: Record<string, unknown>,
): string =>
  fields
    .map(
      (field) =>
        `${field.label}: ${formatFieldValue(field, selections[field.id])}`,
    )
    .join("\n");

export const PromptCreatorTab: React.FC<PromptCreatorTabProps> = ({
  apiKey,
}) => {
  const [config, setConfig] = useState(() => promptCreatorConfigStorage.load());
  const [draft, setDraft] = useState<PromptCreatorDraft>(() =>
    promptCreatorDraftStorage.load(),
  );
  const [uiState, setUiState] = useState({
    isGenerating: false,
    error: null as string | null,
    isLockedPromptLocked: true,
    showBackendProcess: false,
    draggedFieldId: null as string | null,
    generationSteps: [] as Array<{
      label: string;
      status: "pending" | "active" | "completed" | "error";
      detail?: string;
    }>,
  });
  const [currentOutput, setCurrentOutput] = useState<{
    content: string;
    copied: boolean;
    metadata?: {
      model: string;
      inputTokens: number;
      outputTokens: number;
      totalCost: number;
    };
  }>({ content: "", copied: false });

  const refreshConfig = useCallback(() => {
    setConfig(promptCreatorConfigStorage.load());
  }, []);

  // Refresh config on component mount, focus, and storage changes
  useEffect(() => {
    // Initial load
    refreshConfig();

    const handleFocus = () => {
      // Refresh config when window regains focus to pick up any changes from Settings
      refreshConfig();
    };

    const handleStorage = (event: StorageEvent) => {
      if (!event.key) return;
      if (event.key === "prompt-creator-config") {
        refreshConfig();
      }
      if (event.key === "prompt-creator-draft") {
        setDraft(promptCreatorDraftStorage.load());
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshConfig]);

  const visibleFields = useMemo(
    () =>
      [...config.fields]
        .filter((field) => !field.hidden)
        .sort((a, b) => a.order - b.order),
    [config.fields],
  );

  useEffect(() => {
    setDraft((previousDraft) => {
      const nextSelections = { ...previousDraft.selections };
      let changed = false;

      visibleFields.forEach((field) => {
        if (!isValueProvided(nextSelections[field.id])) {
          const initialValue = getInitialValue(field);
          if (isValueProvided(initialValue)) {
            nextSelections[field.id] = initialValue as PromptCreatorValue;
            changed = true;
          }
        }
      });

      if (!changed) {
        return previousDraft;
      }

      const nextDraft: PromptCreatorDraft = {
        selections: nextSelections,
        lastModified: Date.now(),
        schemaVersion: 1 as const,
      };
      promptCreatorDraftStorage.save(nextDraft);
      return nextDraft;
    });
  }, [visibleFields]);

  const allMandatoryFilled = useMemo(
    () =>
      visibleFields
        .filter((field) => field.tier === "mandatory")
        .every((field) => isValueProvided(draft.selections[field.id])),
    [visibleFields, draft.selections],
  );

  const handleSelectionChange = (
    field: PromptCreatorField,
    value: PromptCreatorValue,
  ) => {
    const nextDraft: PromptCreatorDraft = {
      selections: {
        ...draft.selections,
        [field.id]: value,
      },
      lastModified: Date.now(),
      schemaVersion: 1 as const,
    };
    setDraft(nextDraft);
    promptCreatorDraftStorage.save(nextDraft);
  };

  const handleLockedPromptChange = (value: string) => {
    const updatedConfig: PromptCreatorConfig = {
      ...config,
      lockedInPrompt: value,
    };
    setConfig(updatedConfig);
    promptCreatorConfigStorage.save(updatedConfig);
  };

  const handleFieldDelete = (fieldId: string) => {
    const updatedConfig: PromptCreatorConfig = {
      ...config,
      fields: config.fields.map((f) =>
        f.id === fieldId ? { ...f, hidden: true } : f,
      ),
    };
    setConfig(updatedConfig);
    promptCreatorConfigStorage.save(updatedConfig);
  };

  const handleFieldDragStart = (fieldId: string) => {
    setUiState((prev) => ({ ...prev, draggedFieldId: fieldId }));
  };

  const handleFieldDrop = (targetFieldId: string) => {
    if (!uiState.draggedFieldId || uiState.draggedFieldId === targetFieldId) {
      setUiState((prev) => ({ ...prev, draggedFieldId: null }));
      return;
    }

    const draggedField = visibleFields.find(
      (f) => f.id === uiState.draggedFieldId,
    );
    const targetField = visibleFields.find((f) => f.id === targetFieldId);

    if (!draggedField || !targetField) {
      setUiState((prev) => ({ ...prev, draggedFieldId: null }));
      return;
    }

    const draggedOrder = draggedField.order;
    const targetOrder = targetField.order;

    const updatedFields = config.fields.map((field) => {
      if (field.id === uiState.draggedFieldId) {
        return { ...field, order: targetOrder };
      }
      if (field.id === targetFieldId) {
        return { ...field, order: draggedOrder };
      }
      return field;
    });

    const updatedConfig: PromptCreatorConfig = {
      ...config,
      fields: updatedFields,
    };
    setConfig(updatedConfig);
    promptCreatorConfigStorage.save(updatedConfig);
    setUiState((prev) => ({ ...prev, draggedFieldId: null }));
  };

  const renderFieldControl = (field: PromptCreatorField) => {
    const value = draft.selections[field.id];
    const controlId = `prompt-creator-${field.id}`;
    const helperTextId = field.helperText ? `${controlId}-helper` : undefined;
    const helperContent = field.helperText ? (
      <p id={helperTextId} className="text-xs text-gray-400">
        {field.helperText}
      </p>
    ) : null;

    const labelProps: React.LabelHTMLAttributes<HTMLLabelElement> =
      field.type === "multiselect" ? {} : { htmlFor: controlId };

    const commonLabel = (
      <label
        {...labelProps}
        className="flex items-center gap-2 text-sm font-medium text-gray-100"
      >
        {field.tier === "mandatory" && (
          <span
            className={`h-2 w-2 rounded-full ${isValueProvided(value) ? "bg-green-500" : "bg-red-500"}`}
          >
            <span className="sr-only">Mandatory field status</span>
          </span>
        )}
        {field.label}
      </label>
    );

    if (field.type === "dropdown" && field.options) {
      return (
        <div key={field.id} className="space-y-2">
          {commonLabel}
          {helperContent}
          <select
            id={controlId}
            value={typeof value === "string" ? value : ""}
            onChange={(event) =>
              handleSelectionChange(field, event.target.value || null)
            }
            className="w-full rounded-md border border-white/10 bg-gray-900/60 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none [&>option]:bg-[#1A212A] [&>option]:text-white"
            aria-describedby={helperTextId}
          >
            <option value="" className="bg-[#1A212A] text-white">
              Select…
            </option>
            {field.options.map((option) => (
              <option
                key={option}
                value={option}
                className="bg-[#1A212A] text-white"
              >
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === "multiselect" && field.options) {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div key={field.id} className="space-y-2">
          {commonLabel}
          {helperContent}
          <div className="flex flex-wrap gap-2">
            {field.options.map((option) => {
              const isSelected = selected.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    let next = isSelected
                      ? selected.filter((item) => item !== option)
                      : [...selected, option];
                    if (
                      field.maxSelections &&
                      next.length > field.maxSelections
                    ) {
                      setUiState((prev) => ({
                        ...prev,
                        error: `Max selections for ${field.label} is ${field.maxSelections}.`,
                      }));
                      next = selected;
                    } else {
                      setUiState((prev) => ({ ...prev, error: null }));
                    }
                    handleSelectionChange(field, next);
                  }}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/20 text-blue-200"
                      : "border-white/10 bg-gray-900/40 text-gray-200 hover:border-blue-400"
                  }`}
                  aria-pressed={isSelected}
                  aria-describedby={helperTextId}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {field.maxSelections && (
            <p className="text-xs text-gray-400">
              Select up to {field.maxSelections} options.
            </p>
          )}
        </div>
      );
    }

    if (field.type === "slider") {
      const min = field.min ?? 0;
      const max = field.max ?? 100;
      const step = field.step ?? 1;
      const defaultNumeric =
        typeof field.defaultValue === "number"
          ? field.defaultValue
          : typeof field.defaultValue === "string"
            ? Number(field.defaultValue) || min
            : min;
      const numericValue = typeof value === "number" ? value : defaultNumeric;
      return (
        <div key={field.id} className="space-y-2">
          {commonLabel}
          {helperContent}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={numericValue}
            onChange={(event) =>
              handleSelectionChange(field, Number(event.target.value))
            }
            className="w-full"
            id={controlId}
            aria-describedby={helperTextId}
          />
          <span className="text-xs text-gray-300">{numericValue}</span>
        </div>
      );
    }

    if (field.type === "number") {
      const min = field.min ?? 0;
      const max = field.max ?? 100;
      const step = field.step ?? 1;
      return (
        <div key={field.id} className="space-y-2">
          {commonLabel}
          {helperContent}
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={typeof value === "number" ? value : ""}
            onChange={(event) =>
              handleSelectionChange(
                field,
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
            className="w-full rounded-md border border-white/10 bg-gray-900/60 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            id={controlId}
            aria-describedby={helperTextId}
          />
        </div>
      );
    }

    const maxLength = field.maxLength ?? 60;
    return (
      <div key={field.id} className="space-y-2">
        {commonLabel}
        {helperContent}
        <input
          type="text"
          value={typeof value === "string" ? value : ""}
          maxLength={maxLength}
          onChange={(event) => handleSelectionChange(field, event.target.value)}
          placeholder="Enter text"
          className="w-full rounded-md border border-white/10 bg-gray-900/60 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          id={controlId}
          aria-describedby={helperTextId}
        />
        <p className="text-xs text-gray-400">Max {maxLength} characters.</p>
      </div>
    );
  };

  const callChatCompletion = useCallback(
    async (
      systemPrompt: string,
      userContent: string,
      modelId: string,
    ): Promise<{
      content: string;
      usage: ChatUsage;
    }> => {
      try {
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer":
                typeof window !== "undefined" ? window.location.origin : "",
              "X-Title": "Prompt Creator",
            },
            body: JSON.stringify({
              model: modelId,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent },
              ],
            }),
          },
        );

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`OpenRouter error ${response.status}: ${body}`);
        }

        const data = (await response.json()) as ChatResponse;
        const content = data.choices?.[0]?.message?.content?.trim();
        if (!content) {
          throw new Error("OpenRouter returned an empty response");
        }

        return {
          content,
          usage: data.usage ?? {},
        };
      } catch (fetchError) {
        throw new Error(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to call OpenRouter",
        );
      }
    },
    [apiKey],
  );

  const generatePrompts = async () => {
    // Initialize generation steps
    const steps = [
      {
        label: "Loading configuration",
        status: "pending" as const,
        detail: "",
      },
      {
        label: "Building prompt from selections",
        status: "pending" as const,
        detail: "",
      },
      {
        label: "Preparing API request",
        status: "pending" as const,
        detail: "",
      },
      {
        label: "Sending request to OpenRouter",
        status: "pending" as const,
        detail: "",
      },
      { label: "Processing response", status: "pending" as const, detail: "" },
    ];

    setUiState((prev) => ({
      ...prev,
      isGenerating: true,
      error: null,
      showBackendProcess: true,
      generationSteps: steps,
    }));
    setCurrentOutput({ content: "", copied: false }); // Clear previous output

    const updateStep = (
      index: number,
      status: "active" | "completed" | "error",
      detail?: string,
    ) => {
      setUiState((prev) => ({
        ...prev,
        generationSteps: prev.generationSteps.map((step, i) =>
          i === index
            ? { ...step, status, ...(detail !== undefined ? { detail } : {}) }
            : step,
        ),
      }));
    };

    try {
      // Step 1: Load configuration
      updateStep(0, "active");
      const latestConfig = promptCreatorConfigStorage.load();
      setConfig(latestConfig);

      if (!latestConfig.openRouterModelId) {
        updateStep(0, "error", "No model selected");
        setUiState((prev) => ({
          ...prev,
          error:
            "Set a model ID in Settings → Prompt Creator before generating.",
          isGenerating: false,
        }));
        return;
      }
      if (!apiKey) {
        updateStep(0, "error", "No API key found");
        setUiState((prev) => ({
          ...prev,
          error:
            "Add an OpenRouter API key in Settings before generating prompts.",
          isGenerating: false,
        }));
        return;
      }
      updateStep(
        0,
        "completed",
        `Model: ${latestConfig.openRouterModelId.split("/").pop()}`,
      );

      // Step 2: Build prompt from selections
      updateStep(1, "active");
      const variablesText = buildVariablesText(visibleFields, draft.selections);
      const lockedInPrompt = latestConfig.lockedInPrompt || "";
      const fullPromptInput = lockedInPrompt
        ? `${lockedInPrompt}\n\n${variablesText}`
        : variablesText;
      updateStep(1, "completed", `${visibleFields.length} fields combined`);

      // Step 3: Prepare API request
      updateStep(2, "active");
      updateStep(
        2,
        "completed",
        `Request prepared for ${latestConfig.openRouterModelId.split("/").pop()}`,
      );

      // Step 4: Send request to OpenRouter
      updateStep(3, "active");
      const generation = await callChatCompletion(
        latestConfig.promptGenInstructions,
        fullPromptInput,
        latestConfig.openRouterModelId,
      );
      updateStep(
        3,
        "completed",
        `Received ${generation.usage.completion_tokens ?? 0} tokens`,
      );

      // Step 5: Process response
      updateStep(4, "active");
      setCurrentOutput({
        content: generation.content,
        copied: false,
        metadata: {
          model: latestConfig.openRouterModelId,
          inputTokens: generation.usage.prompt_tokens ?? 0,
          outputTokens: generation.usage.completion_tokens ?? 0,
          totalCost: 0, // Calculate if pricing is available
        },
      });
      updateStep(
        4,
        "completed",
        `Generated ${generation.content.length} characters`,
      );
    } catch (generationError) {
      // Find the first non-completed step and mark it as error
      setUiState((prev) => {
        const errorStepIndex = prev.generationSteps.findIndex(
          (s) => s.status !== "completed",
        );
        const updatedSteps =
          errorStepIndex >= 0
            ? prev.generationSteps.map((step, i) =>
                i === errorStepIndex
                  ? {
                      ...step,
                      status: "error" as const,
                      detail:
                        generationError instanceof Error
                          ? generationError.message
                          : "Failed",
                    }
                  : step,
              )
            : prev.generationSteps;

        return {
          ...prev,
          error:
            generationError instanceof Error
              ? generationError.message
              : "Prompt generation failed.",
          generationSteps: updatedSteps,
        };
      });
    } finally {
      setUiState((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCurrentOutput((prev) => ({ ...prev, copied: true }));
      setUiState((prev) => ({ ...prev, error: null }));
      setTimeout(() => {
        setCurrentOutput((prev) => ({ ...prev, copied: false }));
      }, 2000);
    } catch (copyError) {
      setUiState((prev) => ({
        ...prev,
        error:
          copyError instanceof Error
            ? copyError.message
            : "Unable to copy prompt to clipboard.",
      }));
    }
  };

  const hasConfig = visibleFields.length > 0;
  const isGenerationDisabled =
    !allMandatoryFilled || uiState.isGenerating || !hasConfig;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Prompt Creator</h1>

      {/* 1. Locked Prompt Field */}
      <section className="space-y-2 rounded-lg border border-white/5 bg-gray-900/30 p-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-100">
            Locked Prompt (combined with field selections)
          </label>
          <button
            type="button"
            onClick={() =>
              setUiState((prev) => ({
                ...prev,
                isLockedPromptLocked: !prev.isLockedPromptLocked,
              }))
            }
            className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-1 text-xs text-gray-200 hover:border-blue-400 transition-colors"
          >
            {uiState.isLockedPromptLocked ? (
              <>
                <span>🔒</span>
                <span>Unlock to Edit</span>
              </>
            ) : (
              <>
                <span>🔓</span>
                <span>Lock</span>
              </>
            )}
          </button>
        </div>
        <textarea
          value={config.lockedInPrompt}
          onChange={(e) => handleLockedPromptChange(e.target.value)}
          disabled={uiState.isLockedPromptLocked}
          rows={6}
          className={`w-full rounded-md border border-white/10 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none font-mono ${
            uiState.isLockedPromptLocked
              ? "bg-gray-900/80 cursor-not-allowed opacity-70"
              : "bg-gray-900/60"
          }`}
          placeholder="Enter base prompt that will be combined with field selections..."
        />
      </section>

      {/* 2. Generate Button */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => generatePrompts()}
          disabled={isGenerationDisabled}
          className={`rounded-md border px-6 py-3 text-sm font-medium transition-colors ${
            isGenerationDisabled
              ? "border-transparent bg-gray-700 text-gray-400 cursor-not-allowed"
              : "border-transparent bg-blue-600 text-white hover:bg-blue-500 shadow-sm"
          }`}
          title="Generate a single prompt with the selected text model"
        >
          {uiState.isGenerating ? "Generating..." : "Generate"}
        </button>
        {!hasConfig && (
          <p className="text-sm text-yellow-200">
            Add fields below to start generating prompts
          </p>
        )}
        {!allMandatoryFilled && hasConfig && (
          <p className="text-sm text-red-200">
            Fill all mandatory fields before generating
          </p>
        )}
      </div>

      {uiState.error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {uiState.error}
        </p>
      )}

      {/* 3. Generated Prompt Output */}
      {currentOutput.content && (
        <section className="space-y-3 rounded-lg border border-green-500/40 bg-green-500/10 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-green-50">
              Generated Prompt
            </h2>
            <button
              type="button"
              onClick={() => handleCopy(currentOutput.content)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
              aria-label="Copy generated prompt"
            >
              {currentOutput.copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          </div>
          <textarea
            readOnly
            value={currentOutput.content}
            className="w-full h-48 p-3 rounded-md border border-green-500/30 bg-gray-900/60 text-white text-sm font-mono resize-y focus:outline-none"
          />
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-green-200">
              <span
                className={
                  currentOutput.content.length > 1500
                    ? "text-red-300 font-semibold"
                    : ""
                }
              >
                {currentOutput.content.length} / 1500 characters
              </span>
              {currentOutput.content.length > 1500 && (
                <span className="text-red-300">⚠ Exceeds limit</span>
              )}
            </div>
            {currentOutput.metadata && (
              <div className="flex items-center gap-4 text-green-200">
                <span>
                  Model: {currentOutput.metadata.model.split("/").pop()}
                </span>
                <span>
                  Tokens: {currentOutput.metadata.inputTokens} in /{" "}
                  {currentOutput.metadata.outputTokens} out
                </span>
              </div>
            )}
          </div>

          {/* Backend Process Section (Collapsed) */}
          {uiState.generationSteps.length > 0 && (
            <details
              open={uiState.showBackendProcess}
              onToggle={(e) => {
                const target = e.currentTarget;
                if (target) {
                  setUiState((prev) => ({
                    ...prev,
                    showBackendProcess: target.open,
                  }));
                }
              }}
              className="rounded-md border border-green-500/20 bg-gray-900/40 p-3 text-sm"
            >
              <summary className="cursor-pointer text-green-100 font-medium">
                Backend Process Steps{" "}
                {uiState.isGenerating && (
                  <span className="ml-2 text-xs text-blue-300">
                    (In Progress...)
                  </span>
                )}
              </summary>
              <div className="mt-3 space-y-2 text-green-200">
                {uiState.generationSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span
                      className={`flex-shrink-0 ${
                        step.status === "completed"
                          ? "text-green-400"
                          : step.status === "active"
                            ? "text-blue-400"
                            : step.status === "error"
                              ? "text-red-400"
                              : "text-gray-500"
                      }`}
                    >
                      {step.status === "completed" && "✓"}
                      {step.status === "active" && "⋯"}
                      {step.status === "error" && "✗"}
                      {step.status === "pending" && "○"}
                    </span>
                    <div className="flex-1">
                      <span
                        className={
                          step.status === "active"
                            ? "text-blue-300 font-medium"
                            : step.status === "error"
                              ? "text-red-300"
                              : step.status === "completed"
                                ? "text-green-200"
                                : "text-gray-400"
                        }
                      >
                        {step.label}
                      </span>
                      {step.detail && (
                        <span className="ml-2 text-xs text-gray-400">
                          — {step.detail}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </section>
      )}

      {/* 5. All Fields Section */}
      <section className="space-y-4 rounded-lg border border-white/5 bg-gray-900/30 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-100">
            All Fields
            {visibleFields.length > 0 && (
              <span className="ml-2 text-sm text-gray-400">
                ({visibleFields.length} fields)
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-400">
            Drag to reorder • Edit fields inline or in Settings
          </p>
        </div>

        {visibleFields.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 mb-4">
              No fields configured yet. Add fields in Settings → Prompt Creator.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleFields.map((field) => (
              <div
                key={field.id}
                draggable
                onDragStart={() => handleFieldDragStart(field.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleFieldDrop(field.id)}
                className={`space-y-2 rounded-lg border border-white/10 bg-gray-900/40 p-4 cursor-move transition-colors hover:border-blue-400/50 ${
                  uiState.draggedFieldId === field.id ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">⋮⋮</span>
                    {renderFieldControl(field)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFieldDelete(field.id)}
                    className="rounded-md border border-white/10 px-2 py-1 text-xs text-gray-400 hover:border-red-400 hover:text-red-300"
                    title="Hide field"
                  >
                    Hide
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PromptCreatorTab;
