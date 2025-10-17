/* eslint-disable custom/max-file-size */
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  promptCreatorConfigStorage,
  promptCreatorDraftStorage,
  promptCreatorResultsStorage,
} from "@/lib/promptCreatorStorage";
import type {
  PromptCreatorDraft,
  PromptCreatorField,
  PromptCreatorResult,
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

const createId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const tierOrder: Record<PromptCreatorField["tier"], number> = {
  mandatory: 0,
  optional: 1,
  free: 2,
};

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

const parseRating = (raw: string) => {
  try {
    const parsed = JSON.parse(raw);
    return {
      score: Number(parsed.score) || 0,
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : [],
      edits: Array.isArray(parsed.edits) ? parsed.edits.map(String) : [],
    };
  } catch (error) {
    return {
      score: 0,
      reasons: [
        `RATING_ERROR:${error instanceof Error ? error.message : String(error)}`,
      ],
      risks: [],
      edits: [],
    };
  }
};

const ratingPromptTemplate =
  'Return JSON: {"score": number, "reasons": string[], "risks": string[], "edits": string[]}';

export const PromptCreatorTab: React.FC<PromptCreatorTabProps> = ({
  apiKey,
}) => {
  const [config, setConfig] = useState(() => promptCreatorConfigStorage.load());
  const [draft, setDraft] = useState<PromptCreatorDraft>(() =>
    promptCreatorDraftStorage.load(),
  );
  const [results, setResults] = useState(
    () => promptCreatorResultsStorage.load().results,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(0);
  const [sortOrder, setSortOrder] = useState<"date" | "score">("date");
  const [showFree, setShowFree] = useState(false);

  const refreshConfig = useCallback(() => {
    setConfig(promptCreatorConfigStorage.load());
  }, []);

  const refreshResults = useCallback(() => {
    setResults(promptCreatorResultsStorage.load().results);
  }, []);

  useEffect(() => {
    refreshConfig();
    refreshResults();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key) return;
      if (event.key === "prompt-creator-config") {
        refreshConfig();
      }
      if (event.key === "prompt-creator-results") {
        refreshResults();
      }
      if (event.key === "prompt-creator-draft") {
        setDraft(promptCreatorDraftStorage.load());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refreshConfig, refreshResults]);

  const visibleFields = useMemo(
    () =>
      [...config.fields]
        .filter((field) => !field.hidden)
        .sort((a, b) => {
          const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
          if (tierDiff !== 0) return tierDiff;
          return a.order - b.order;
        }),
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

  const groupedFields = useMemo(
    () => ({
      mandatory: visibleFields.filter((field) => field.tier === "mandatory"),
      optional: visibleFields.filter((field) => field.tier === "optional"),
      free: visibleFields.filter((field) => field.tier === "free"),
    }),
    [visibleFields],
  );

  const allMandatoryFilled = useMemo(
    () =>
      groupedFields.mandatory.every((field) =>
        isValueProvided(draft.selections[field.id]),
      ),
    [groupedFields.mandatory, draft.selections],
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
                      setError(
                        `Max selections for ${field.label} is ${field.maxSelections}.`,
                      );
                      next = selected;
                    } else {
                      setError(null);
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
              model: config.openRouterModelId,
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
    [apiKey, config.openRouterModelId],
  );

  const generatePrompts = async (count: number) => {
    if (!config.openRouterModelId) {
      setError(
        "Set a model ID in Settings → Prompt Creator before generating.",
      );
      return;
    }
    if (!apiKey) {
      setError(
        "Add an OpenRouter API key in Settings before generating prompts.",
      );
      return;
    }

    const variablesText = buildVariablesText(visibleFields, draft.selections);
    const lockedInPrompt = config.lockedInPrompt || "";
    const fullPromptInput = lockedInPrompt
      ? `${lockedInPrompt}\n\n${variablesText}`
      : variablesText;
    const ratingSystemPrompt = `You are a prompt quality rater. Follow these instructions:\n${config.ratingRubric}\n${ratingPromptTemplate}`;

    setIsGenerating(true);
    setError(null);

    try {
      for (let index = 0; index < count; index += 1) {
        const generation = await callChatCompletion(
          config.promptGenInstructions,
          fullPromptInput,
        );

        let ratingRaw: string;
        let ratingUsage: ChatUsage = {};
        try {
          const rating = await callChatCompletion(
            ratingSystemPrompt,
            generation.content,
          );
          ratingRaw = rating.content;
          ratingUsage = rating.usage;
        } catch (ratingError) {
          ratingRaw = JSON.stringify({
            score: 0,
            reasons: [],
            risks: [],
            edits: [],
          });
          setError(
            ratingError instanceof Error
              ? ratingError.message
              : "Failed to score prompt.",
          );
        }

        const parsedRating = parseRating(ratingRaw);
        const result: PromptCreatorResult = {
          id: createId(),
          timestamp: Date.now(),
          selections: { ...draft.selections },
          generatedPrompt: generation.content,
          rating: parsedRating,
          cost: {
            generationInputTokens: generation.usage.prompt_tokens ?? 0,
            generationOutputTokens: generation.usage.completion_tokens ?? 0,
            generationCost: 0,
            ratingInputTokens: ratingUsage.prompt_tokens ?? 0,
            ratingOutputTokens: ratingUsage.completion_tokens ?? 0,
            ratingCost: 0,
            totalCost: 0,
          },
          isSaved: false,
        };

        promptCreatorResultsStorage.add(result);
        refreshResults();
      }
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Prompt generation failed.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredResults = useMemo(() => {
    let data = [...results];
    if (minScore > 0) {
      data = data.filter((item) => item.rating.score >= minScore);
    }
    if (sortOrder === "score") {
      return data.sort((a, b) => b.rating.score - a.rating.score);
    }
    return data.sort((a, b) => b.timestamp - a.timestamp);
  }, [results, minScore, sortOrder]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setError(null);
    } catch (copyError) {
      setError(
        copyError instanceof Error
          ? copyError.message
          : "Unable to copy prompt to clipboard.",
      );
    }
  };

  const toggleSaved = (id: string) => {
    promptCreatorResultsStorage.toggleSaved(id);
    refreshResults();
  };

  const renderSection = (
    title: string,
    fields: PromptCreatorField[],
    collapsed?: boolean,
  ) => {
    if (fields.length === 0) {
      return (
        <section className="rounded-lg border border-white/5 bg-gray-900/30 p-4">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
          </header>
          <p className="mt-2 text-sm text-gray-400">No fields configured.</p>
        </section>
      );
    }

    if (collapsed) {
      return (
        <section className="rounded-lg border border-white/5 bg-gray-900/30">
          <button
            type="button"
            onClick={() => setShowFree((prev) => !prev)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-gray-100"
          >
            <span>{title}</span>
            <span className="text-sm text-blue-300">
              {showFree ? "Hide" : "Show"}
            </span>
          </button>
          {showFree && (
            <div className="space-y-4 px-4 pb-4">
              {fields.map(renderFieldControl)}
            </div>
          )}
        </section>
      );
    }

    return (
      <section className="space-y-4 rounded-lg border border-white/5 bg-gray-900/30 p-4">
        <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
        {fields.map(renderFieldControl)}
      </section>
    );
  };

  const hasConfig = visibleFields.length > 0;
  const isGenerationDisabled =
    !allMandatoryFilled || isGenerating || !hasConfig;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Prompt Creator</h1>
          <button
            type="button"
            onClick={() => generatePrompts(3)}
            disabled={isGenerationDisabled}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              isGenerationDisabled
                ? "border-transparent bg-gray-700 text-gray-400 cursor-not-allowed"
                : "border-transparent bg-blue-600 text-white hover:bg-blue-500 shadow-sm"
            }`}
            title="Generate 3 prompts with the selected text model"
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
        <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
          <h2 className="mb-2 font-semibold text-blue-50">
            How the Prompt Creator works:
          </h2>
          <ol className="ml-4 list-decimal space-y-1 text-blue-100">
            <li>
              <strong>Configure fields:</strong> Set up your prompt fields in
              Settings → Prompt Creator (mandatory, optional, and free-form).
            </li>
            <li>
              <strong>Locked-in prompt:</strong> A base prompt (configured in
              Settings) is always prepended to your selections. This ensures
              consistency across all generated prompts.
            </li>
            <li>
              <strong>Select values:</strong> Fill in the mandatory fields and
              optionally add guided or free-form selections below.
            </li>
            <li>
              <strong>Generate:</strong> Click &quot;Generate&quot; to create 3
              prompts using your selected AI model. Each prompt is automatically
              scored and rated.
            </li>
            <li>
              <strong>Review results:</strong> View generated prompts with their
              quality scores, reasons, risks, and suggested edits in the Results
              section.
            </li>
          </ol>
        </div>
        {!hasConfig && (
          <p className="rounded-md border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200">
            Configure Prompt Creator fields in Settings → Prompt Creator.
          </p>
        )}
        {!allMandatoryFilled && hasConfig && (
          <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            Select all mandatory fields before generating prompts.
          </p>
        )}
        {error && (
          <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {renderSection("Mandatory", groupedFields.mandatory)}
        {renderSection("Optional / Guided", groupedFields.optional)}
        {renderSection("Free / Emergent", groupedFields.free, true)}
      </div>

      <section className="space-y-4 rounded-lg border border-white/5 bg-gray-900/30 p-4">
        <header className="flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-100">Results</h2>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            Min score
            <input
              type="number"
              min={0}
              max={10}
              value={minScore}
              onChange={(event) => setMinScore(Number(event.target.value) || 0)}
              className="w-16 rounded-md border border-white/10 bg-gray-900/60 px-2 py-1 text-sm text-white"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            Sort by
            <select
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value as "date" | "score")
              }
              className="rounded-md border border-white/10 bg-gray-900/60 px-2 py-1 text-sm text-white [&>option]:bg-[#1A212A] [&>option]:text-white"
            >
              <option value="date" className="bg-[#1A212A] text-white">
                Newest
              </option>
              <option value="score" className="bg-[#1A212A] text-white">
                Score
              </option>
            </select>
          </label>
        </header>

        {filteredResults.length === 0 ? (
          <p className="text-sm text-gray-400">
            Generate prompts to see results.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredResults.map((result) => {
              const ratingErrorMessage = result.rating.reasons.find((reason) =>
                reason.startsWith("RATING_ERROR:"),
              );
              const isRatingError = Boolean(ratingErrorMessage);
              const scoreLabel = isRatingError
                ? "Not scored"
                : `${result.rating.score}/10`;
              return (
                <article
                  key={result.id}
                  className="space-y-3 rounded-lg border border-white/5 bg-gray-900/40 p-4"
                >
                  <header className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-200">
                      <span className="font-semibold">{scoreLabel}</span>
                      <span className="text-gray-500">
                        {new Date(result.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(result.generatedPrompt)}
                        className="rounded-md border border-white/10 px-2 py-1 text-xs text-gray-200 hover:border-blue-400"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSaved(result.id)}
                        className={`rounded-md border px-2 py-1 text-xs ${
                          result.isSaved
                            ? "border-yellow-400 text-yellow-300"
                            : "border-white/10 text-gray-200 hover:border-yellow-400"
                        }`}
                      >
                        {result.isSaved ? "Saved" : "Save"}
                      </button>
                    </div>
                  </header>
                  <p className="whitespace-pre-wrap text-sm text-gray-100">
                    {result.generatedPrompt}
                  </p>
                  <details className="rounded-md border border-white/5 bg-gray-900/30 p-3 text-sm text-gray-200">
                    <summary className="cursor-pointer text-gray-100">
                      Details
                    </summary>
                    <div className="mt-2 space-y-2">
                      {isRatingError ? (
                        <p className="text-red-300">
                          {ratingErrorMessage?.replace(
                            "RATING_ERROR:",
                            "Rating failed: ",
                          )}
                        </p>
                      ) : (
                        <>
                          <div>
                            <h3 className="font-semibold text-gray-100">
                              Reasons
                            </h3>
                            <ul className="ml-4 list-disc text-gray-200">
                              {result.rating.reasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-100">
                              Risks
                            </h3>
                            <ul className="ml-4 list-disc text-gray-200">
                              {result.rating.risks.map((risk) => (
                                <li key={risk}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-100">
                              Suggested edits
                            </h3>
                            <ul className="ml-4 list-disc text-gray-200">
                              {result.rating.edits.map((edit) => (
                                <li key={edit}>{edit}</li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-100">
                          Selections
                        </h3>
                        <ul className="ml-4 list-disc text-gray-200">
                          {visibleFields.map((field) => (
                            <li key={field.id}>
                              <span className="font-medium">
                                {field.label}:
                              </span>{" "}
                              {formatFieldValue(
                                field,
                                result.selections[field.id],
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default PromptCreatorTab;
