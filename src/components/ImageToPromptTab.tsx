"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import type { AppSettings } from "@/types";
import { createOpenRouterClient } from "@/lib/openrouter";
import { imageStateStorage } from "@/lib/storage";
import { calculateGenerationCost } from "@/lib/cost";
import { normalizeToApiError } from "@/lib/errorUtils";
import { usageStorage } from "@/lib/usage";
import { historyStorage } from "@/lib/historyStorage";
import type { UsageEntry } from "@/types/usage";
import type { HistoryEntry } from "@/types/history";
import {
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  DollarSign,
  Copy as CopyIcon,
  Check as CheckIcon,
} from "lucide-react";
import Image from "next/image";
import { RatingWidget } from "@/components/RatingWidget";
import { middleEllipsis } from "@/utils/truncation";
import { UI_CONSTRAINTS } from "@/lib/constants";

interface ImageToPromptTabProps {
  settings: AppSettings;
}

interface ModelResult {
  id: string; // Stable ID for this result (used for ratings)
  modelId: string;
  modelName: string;
  prompt: string | null;
  cost: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  inputCost: number | null;
  outputCost: number | null;
  isProcessing: boolean;
  error: string | null;
}

export const ImageToPromptTab: React.FC<ImageToPromptTabProps> = ({
  settings,
}) => {
  const [uploadedImage, setUploadedImage] = useState<{
    file: File | null;
    preview: string;
  } | null>(null);
  const [modelResults, setModelResults] = useState<ModelResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionId] = useState<string>(() => `session-${Date.now()}`); // Stable session ID for ratings
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  // Initialize model results when selected models change
  // CRITICAL: Only reset when the actual selected models change, not when availableModels updates
  // This prevents wiping out cost data when models list refreshes
  // Justification for setState in effect: We're synchronizing React state with external settings changes.
  // This effect needs to observe selectedVisionModels and availableModels to properly maintain model results.
  // Alternative patterns like useMemo would not allow us to preserve existing results correctly.
  useEffect(() => {
    if (
      !settings.selectedVisionModels ||
      settings.selectedVisionModels.length === 0
    ) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModelResults((prevResults) => {
      // Get the set of current model IDs
      const prevModelIds = new Set(prevResults.map((r) => r.modelId));
      const newModelIds = new Set(settings.selectedVisionModels);

      // If the selected models haven't changed, preserve existing results
      if (
        prevModelIds.size === newModelIds.size &&
        [...prevModelIds].every((id) => newModelIds.has(id))
      ) {
        // Just update model names in case availableModels was updated
        return prevResults.map((result) => {
          const model = settings.availableModels.find(
            (m) => m.id === result.modelId,
          );
          return {
            ...result,
            modelName: model?.name || result.modelName,
          };
        });
      }

      // Models changed, create new results but try to preserve data for unchanged models
      const existingResultsMap = new Map(
        prevResults.map((r) => [r.modelId, r]),
      );

      return settings.selectedVisionModels.map((modelId) => {
        const model = settings.availableModels.find((m) => m.id === modelId);
        const existing = existingResultsMap.get(modelId);

        // If we have existing data for this model, preserve it
        if (existing) {
          return {
            ...existing,
            modelName: model?.name || existing.modelName,
          };
        }

        // New model, create fresh result
        return {
          id: `${sessionId}-${modelId}`, // Stable ID for this session + model
          modelId,
          modelName: model?.name || modelId,
          prompt: null,
          cost: null,
          inputTokens: null,
          outputTokens: null,
          inputCost: null,
          outputCost: null,
          isProcessing: false,
          error: null,
        };
      });
    });
  }, [settings.selectedVisionModels, settings.availableModels, sessionId]);

  // Load persisted image and model results on mount
  // CRITICAL: This must run AFTER the model initialization effect to prevent race conditions
  // Justification for setState in effect: This effect synchronizes React state with external storage (localStorage).
  // This is a valid use case per React docs - effects can sync state with external systems.
  useEffect(() => {
    const persisted = imageStateStorage.getImageState();

    if (!persisted) return;

    if (persisted.preview) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUploadedImage({
        file: null, // We don't have the file object from storage
        preview: persisted.preview,
      });
    }

    // Restore model results if they exist, but clear any stale processing flags
    // IMPORTANT: Only restore if we have valid persisted results with cost data
    if (
      Array.isArray(persisted.modelResults) &&
      persisted.modelResults.length > 0
    ) {
      // Clear isProcessing flags to prevent stuck spinners after navigation/refresh
      const cleanedResults = persisted.modelResults.map((result) => ({
        ...result,
        id: `${sessionId}-${result.modelId}`, // Ensure id is present
        isProcessing: false,
      }));

      // Set results directly, overriding any initialization from settings
      setModelResults((prevResults) => {
        // If prevResults is empty or doesn't have any prompts/costs, use persisted data
        const hasExistingData = prevResults.some(
          (r) => r.prompt || r.cost !== null,
        );
        if (!hasExistingData) {
          return cleanedResults;
        }
        // Otherwise keep the existing data (edge case: manual refresh during generation)
        return prevResults;
      });

      // Persist the cleaned results back to storage
      imageStateStorage.saveModelResults(cleanedResults);
    }

    // DO NOT restore generation status - if user navigated away or refreshed
    // during generation, the generation is effectively cancelled
    // Clear any stale generation status from storage
    if (persisted.isGenerating) {
      imageStateStorage.saveGenerationStatus(false);
    }
  }, [sessionId]);

  // Cleanup: Reset generation state when component unmounts
  useEffect(() => {
    return () => {
      // Clear generation status on unmount to prevent stuck state
      imageStateStorage.saveGenerationStatus(false);
      // Also clear all isProcessing flags from model results directly in storage
      const currentState = imageStateStorage.getImageState();
      if (
        currentState.modelResults &&
        Array.isArray(currentState.modelResults)
      ) {
        const cleaned = currentState.modelResults.map((result) => ({
          ...result,
          isProcessing: false,
        }));
        imageStateStorage.saveModelResults(cleaned);
      }
    };
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (
      !(UI_CONSTRAINTS.SUPPORTED_IMAGE_TYPES as readonly string[]).includes(
        file.type,
      )
    ) {
      return "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.";
    }
    if (file.size > UI_CONSTRAINTS.MAX_FILE_SIZE_BYTES) {
      return `File size too large. Please upload an image smaller than ${UI_CONSTRAINTS.MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  }, []);

  const readFileAsDataURL = useCallback(
    (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) resolve(e.target.result as string);
          else reject(new Error("Failed to read file"));
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      }),
    [],
  );

  const estimateImageTokens = useCallback((imageDataUrl: string): number => {
    // Rough estimation: base64 image size / 4 * 0.75 (typical compression)
    // This is an approximation - actual token count varies by model
    const base64Data = imageDataUrl.split(",")[1] || "";
    const sizeInBytes = base64Data.length * 0.75;
    // Vision models typically use ~85 tokens per image on average
    return Math.max(85, Math.floor(sizeInBytes / 1000));
  }, []);

  const estimateTextTokens = useCallback((text: string): number => {
    // Rough estimation: 1 token ≈ 0.75 words ≈ 4 characters
    return Math.ceil(text.length / 4);
  }, []);

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setErrorMessage(null);
      const validationError = validateFile(file);
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }

      try {
        const preview = await readFileAsDataURL(file);
        setUploadedImage({ file, preview });
        // Save to storage
        imageStateStorage.saveUploadedImage(
          preview,
          file.name,
          file.size,
          file.type,
        );
        // Reset results when new image is uploaded
        setModelResults((prev) =>
          prev.map((r) => ({
            ...r,
            prompt: null,
            cost: null,
            inputTokens: null,
            outputTokens: null,
            inputCost: null,
            outputCost: null,
            error: null,
          })),
        );
      } catch (error) {
        console.error("Failed to read file:", error);
        setErrorMessage("Failed to read file. Please try again.");
      }

      e.target.value = "";
    },
    [validateFile, readFileAsDataURL],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      setErrorMessage(null);
      const validationError = validateFile(file);
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }

      try {
        const preview = await readFileAsDataURL(file);
        setUploadedImage({ file, preview });
        // Save to storage
        imageStateStorage.saveUploadedImage(
          preview,
          file.name,
          file.size,
          file.type,
        );
        // Reset results when new image is uploaded
        setModelResults((prev) =>
          prev.map((r) => ({
            ...r,
            prompt: null,
            cost: null,
            inputTokens: null,
            outputTokens: null,
            inputCost: null,
            outputCost: null,
            error: null,
          })),
        );
      } catch (error) {
        console.error("Failed to read file:", error);
        setErrorMessage("Failed to read file. Please try again.");
      }
    },
    [validateFile, readFileAsDataURL],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // eslint-disable-next-line custom/require-error-handling
  const generatePrompts = useCallback(async () => {
    if (!settings.isValidApiKey) {
      setErrorMessage("Please set a valid API key in Settings.");
      return;
    }

    if (!uploadedImage) {
      setErrorMessage("Please upload an image first.");
      return;
    }

    if (
      !settings.selectedVisionModels ||
      settings.selectedVisionModels.length === 0
    ) {
      setErrorMessage("Please select at least one vision model in Settings.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    // Persist generation status
    imageStateStorage.saveGenerationStatus(true);

    // Mark ALL models as processing at once (single state update)
    setModelResults((prev) => {
      const updated = prev.map((r) => ({
        ...r,
        isProcessing: true,
        error: null,
      }));
      // Persist to storage immediately
      imageStateStorage.saveModelResults(updated);
      return updated;
    });

    // Process all models in parallel using Promise.all
    const timestamp = Date.now();
    const promises = modelResults.map(async (result, i) => {
      try {
        const client = createOpenRouterClient(settings.openRouterApiKey);
        const prompt = await client.generateImagePrompt(
          uploadedImage.preview,
          settings.customPrompt,
          result.modelId,
        );

        const model = settings.availableModels.find(
          (m) => m.id === result.modelId,
        );

        // Calculate detailed costs
        const inputTokens = estimateImageTokens(uploadedImage.preview);
        const outputTokens = estimateTextTokens(prompt);

        let inputCost = 0;
        let outputCost = 0;
        let totalCost = 0;

        if (model) {
          const costObj = calculateGenerationCost(model, prompt.length);
          totalCost = costObj ? costObj.totalCost : 0;

          // Calculate input/output costs based on model pricing
          if (model.pricing) {
            const inputPrice = parseFloat(String(model.pricing.prompt || 0));
            const outputPrice = parseFloat(
              String(model.pricing.completion || 0),
            );
            inputCost = (inputTokens * inputPrice) / 1000000; // Convert from per-1M tokens
            outputCost = (outputTokens * outputPrice) / 1000000;
          }
        }

        // Update this specific result (thread-safe with functional update)
        setModelResults((prev) => {
          const updated = [...prev];
          if (updated[i]) {
            updated[i] = {
              ...updated[i]!,
              prompt,
              cost: totalCost,
              inputTokens,
              outputTokens,
              inputCost,
              outputCost,
              isProcessing: false,
              error: null,
            };
          }
          // Persist to storage immediately
          imageStateStorage.saveModelResults(updated);
          return updated;
        });

        // CRITICAL: Save to usageStorage and historyStorage immediately after success
        // This ensures the total cost header updates right away
        const usageEntry: UsageEntry = {
          id: `usage-${result.modelId}-${timestamp}`,
          timestamp,
          modelId: result.modelId,
          modelName: result.modelName,
          inputTokens,
          outputTokens,
          inputCost,
          outputCost,
          totalCost,
          success: true,
          error: null,
          imagePreview: uploadedImage?.preview,
        };
        usageStorage.add(usageEntry);

        const historyEntry: HistoryEntry = {
          id: `history-${result.modelId}-${timestamp}`,
          imageUrl: uploadedImage?.preview || "",
          prompt,
          charCount: prompt.length,
          totalCost,
          inputTokens,
          outputTokens,
          inputCost,
          outputCost,
          modelId: result.modelId,
          modelName: result.modelName,
          createdAt: timestamp,
        };
        historyStorage.addEntry(historyEntry);
      } catch (error) {
        const apiErr = normalizeToApiError(error);
        setModelResults((prev) => {
          const updated = [...prev];
          if (updated[i]) {
            updated[i] = {
              ...updated[i]!,
              isProcessing: false,
              error: apiErr.message,
            };
          }
          // Persist to storage immediately
          imageStateStorage.saveModelResults(updated);
          return updated;
        });
      }
    });

    // Wait for all models to complete in parallel
    await Promise.all(promises);

    setIsGenerating(false);
    // Persist generation status
    imageStateStorage.saveGenerationStatus(false);
  }, [
    settings,
    uploadedImage,
    modelResults,
    estimateImageTokens,
    estimateTextTokens,
  ]);

  const formatCost = useCallback((cost: number | null): string => {
    if (cost === null || cost === 0) return "$0.00";
    // Always show exactly 2 decimal places for all amounts
    return `$${cost.toFixed(2)}`;
  }, []);

  const formatTokens = useCallback((tokens: number | null): string => {
    if (tokens === null) return "0";
    return tokens.toLocaleString();
  }, []);

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedMap((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedMap((prev) => ({ ...prev, [id]: false }));
      }, 1500);
    } catch {
      // silent failure to avoid noisy UI
    }
  }, []);

  // Calculate total cost across all models
  const totalCostAllModels = modelResults.reduce((sum, result) => {
    return sum + (result.cost || 0);
  }, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <ImageIcon className="h-6 w-6" /> Image to Prompt
      </h1>

      {!settings.isValidApiKey && (
        <div className="bg-[#151A21] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-yellow-600/30">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
            <div>
              <h2 className="text-sm font-medium text-yellow-300">
                API Key Required
              </h2>
              <p className="text-sm text-yellow-400 mt-1">
                Please add and validate your OpenRouter API key in the Settings
                tab.
              </p>
            </div>
          </div>
        </div>
      )}

      {(!settings.selectedVisionModels ||
        settings.selectedVisionModels.length === 0) && (
        <div className="bg-[#151A21] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-blue-600/30">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-blue-400 mr-3" />
            <div>
              <h2 className="text-sm font-medium text-blue-300">
                No Models Selected
              </h2>
              <p className="text-sm text-blue-400 mt-1">
                Please select up to 3 vision models in the Settings tab.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Drag and Drop Zone */}
      <div className="bg-[#151A21] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-3 mb-3 text-sm text-gray-300">
          <ImageIcon className="h-4 w-4" />
          Upload Image
        </div>

        {!uploadedImage ? (
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors bg-white/5"
            role="button"
            tabIndex={0}
          >
            <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg text-gray-300 mb-2">
              Drop your image here or click to browse
            </p>
            <p className="text-sm text-gray-400">
              Supports JPEG, PNG, WebP, and GIF (max 10MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden border border-white/10 bg-white/5">
            <div className="w-full max-h-[600px] flex items-center justify-center p-4">
              <Image
                src={uploadedImage.preview}
                alt="Uploaded preview"
                width={800}
                height={600}
                className="max-w-full h-auto object-contain rounded"
                unoptimized
              />
            </div>
            <button
              onClick={() => {
                setUploadedImage(null);
                imageStateStorage.clearImageState();
                // Reset model results in state (clearImageState already clears storage)
                setModelResults((prev) =>
                  prev.map((r) => ({
                    ...r,
                    prompt: null,
                    cost: null,
                    inputTokens: null,
                    outputTokens: null,
                    inputCost: null,
                    outputCost: null,
                    error: null,
                  })),
                );
              }}
              className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              aria-label="Remove image"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
            <p className="text-sm text-red-400">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Generate Button */}
      {uploadedImage && modelResults.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={generatePrompts}
            disabled={isGenerating || !settings.isValidApiKey}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
      )}

      {/* Overall Cost Summary */}
      {modelResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#151A21] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
            <div className="text-sm text-gray-400 mb-2">Models Selected</div>
            <div className="text-xl font-bold text-white">
              {modelResults.length}
            </div>
          </div>

          <div className="bg-[#151A21] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
            <div className="text-sm text-gray-400 mb-2">Completed</div>
            <div className="text-xl font-bold text-white">
              {modelResults.filter((r) => r.prompt).length}
            </div>
          </div>

          <div className="bg-[#151A21] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-sm">Total Cost</span>
            </div>
            <div className="text-xl font-bold text-green-400">
              {formatCost(totalCostAllModels)}
            </div>
          </div>
        </div>
      )}

      {/* Model Results - Horizontal Layout (Columns) */}
      {modelResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-16">
          {modelResults.map((result) => (
            <div
              key={result.modelId}
              className="flex flex-col rounded-xl bg-[#151A21] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-white/10"
            >
              {/* Model Header */}
              <div className="p-4 border-b border-white/10">
                <h3
                  className="font-semibold text-white text-sm mb-1 truncate"
                  title={result.modelName}
                >
                  {middleEllipsis(result.modelName, 30)}
                </h3>
                <div className="text-xs text-gray-400 truncate">
                  {result.modelId}
                </div>
              </div>

              {/* Scrollable Output Area with Fixed Height */}
              <div className="flex-1 flex flex-col min-h-0">
                {result.prompt && !result.isProcessing && (
                  <>
                    {/* Prompt Output - Truncated with Show More/Less */}
                    <div className="relative flex-1 p-4 bg-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-white text-xs">
                          Generated Prompt
                        </h5>
                        <button
                          type="button"
                          aria-label="Copy prompt"
                          title="Copy prompt"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 text-xs transition-colors"
                          onClick={() =>
                            copyToClipboard(result.prompt!, result.id)
                          }
                        >
                          {copiedMap[result.id] ? (
                            <>
                              <CheckIcon className="h-3 w-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <CopyIcon className="h-3 w-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                        {expandedMap[result.id] || result.prompt.length <= 300
                          ? result.prompt
                          : `${result.prompt.slice(0, 300)}...`}
                      </p>
                      {/* Character Count with Color Coding */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                        <span
                          className={`text-xs font-semibold ${
                            result.prompt.length > 1500
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          {result.prompt.length} chars
                        </span>
                        {result.prompt.length > 300 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedMap((prev) => ({
                                ...prev,
                                [result.id]: !prev[result.id],
                              }))
                            }
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                          >
                            {expandedMap[result.id] ? "Show Less" : "Show More"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Compact Cost Summary */}
                    <div className="p-3 bg-white/5 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-400">Tokens</div>
                          <div className="font-medium text-white">
                            {formatTokens(result.inputTokens)} /{" "}
                            {formatTokens(result.outputTokens)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-400">Total Cost</div>
                          <div className="font-semibold text-green-400">
                            {formatCost(result.cost)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {result.error && (
                  <div className="flex-1 p-4 flex items-center justify-center">
                    <p className="text-xs text-red-400 text-center">
                      {result.error}
                    </p>
                  </div>
                )}

                {result.isProcessing && (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                  </div>
                )}
              </div>

              {/* Rating Widget - Always at Bottom */}
              {result.prompt && !result.isProcessing && (
                <div className="p-3 bg-[#151A21] border-t border-white/10">
                  <RatingWidget
                    historyEntryId={result.id}
                    modelId={result.modelId}
                    modelName={result.modelName}
                    imagePreview={uploadedImage?.preview || null}
                    prompt={result.prompt}
                    compact={true}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageToPromptTab;
