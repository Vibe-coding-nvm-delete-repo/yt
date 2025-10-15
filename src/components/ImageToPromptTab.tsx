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
  Calculator,
  DollarSign,
  Copy as CopyIcon,
  Check as CheckIcon,
} from "lucide-react";
import Image from "next/image";
import { RatingWidget } from "@/components/RatingWidget";

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

  // Initialize model results when selected models change
  // CRITICAL: Only reset when the actual selected models change, not when availableModels updates
  // This prevents wiping out cost data when models list refreshes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (
      settings.selectedVisionModels &&
      settings.selectedVisionModels.length > 0
    ) {
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
    }
  }, [settings.selectedVisionModels, settings.availableModels, sessionId]);

  // Load persisted image and model results on mount
  // CRITICAL: This must run AFTER the model initialization effect to prevent race conditions
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    const persisted = imageStateStorage.getImageState();
    if (persisted && persisted.preview) {
      setUploadedImage({
        file: null, // We don't have the file object from storage
        preview: persisted.preview,
      });
    }
    // Restore model results if they exist, but clear any stale processing flags
    // IMPORTANT: Only restore if we have valid persisted results with cost data
    if (
      persisted &&
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
    if (persisted && persisted.isGenerating) {
      imageStateStorage.saveGenerationStatus(false);
    }
  }, []);

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
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.";
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return "File size too large. Please upload an image smaller than 10MB.";
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
            const outputPrice = parseFloat(String(model.pricing.completion || 0));
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
  }, [
    settings,
    uploadedImage,
    modelResults,
    estimateImageTokens,
    estimateTextTokens,
  ]);

  const formatCost = useCallback((cost: number | null): string => {
    if (cost === null || cost === 0) return "$0.00";
    // Show user-friendly format: 2 decimal places for amounts >= $0.01
    // Otherwise show up to 6 decimals for very small amounts
    if (cost >= 0.01) {
      return `$${cost.toFixed(2)}`;
    }
    return `$${cost.toFixed(6)}`;
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Image to Prompt
      </h1>

      {!settings.isValidApiKey && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
            <div>
              <h2 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                API Key Required
              </h2>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                Please add and validate your OpenRouter API key in the Settings
                tab.
              </p>
            </div>
          </div>
        </div>
      )}

      {(!settings.selectedVisionModels ||
        settings.selectedVisionModels.length === 0) && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h2 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                No Models Selected
              </h2>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Please select up to 5 vision models in the Settings tab.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Drag and Drop Zone */}
      <div>
        <div className="flex items-center mb-3">
          <ImageIcon className="mr-2 h-5 w-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upload Image
          </h2>
        </div>

        {!uploadedImage ? (
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-800"
            role="button"
            tabIndex={0}
          >
            <ImageIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              Drop your image here or click to browse
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
          <div className="relative rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
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
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
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

      {/* Overall Cost Summary - Ultra Minimalist */
      }
      {modelResults.length > 0 && (
        <div className="flex items-center justify-center gap-8 py-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Models:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {modelResults.filter((r) => r.prompt).length}/
              {modelResults.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Models Selected
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {modelResults.length}
              </div>
            </div>

            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Completed
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {modelResults.filter((r) => r.prompt).length}
              </div>
            </div>

            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total Cost
                </div>
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCost(totalCostAllModels)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Results - Horizontal Layout (Columns) */}
      {modelResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {modelResults.map((result) => (
            <div
              key={result.modelId}
              className="flex flex-col rounded-xl bg-white dark:bg-gray-800 overflow-hidden h-[600px] shadow-sm"
            >
              {/* Model Header */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 truncate">
                  {result.modelName}
                </h3>
                <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {result.modelId}
                </div>
              </div>

              {/* Detailed Metrics - Always Visible */}
              <div className="mb-4 p-3 bg-gray-50/70 dark:bg-gray-700/70 rounded-lg">
                <div className="flex items-center mb-2">
                  <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Cost Breakdown
                  </h4>
                </div>

                {/* Compact summary line to satisfy tests and improve scannability */}
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                  Input: {formatCost(result.inputCost)} | Output: {formatCost(result.outputCost)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">
                      Input Tokens
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatTokens(result.inputTokens)}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500 dark:text-gray-400">
                      Output Tokens
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatTokens(result.outputTokens)}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500 dark:text-gray-400">
                      Input Cost
                    </div>
                    <div className="font-medium text-blue-600 dark:text-blue-400">
                      {formatCost(result.inputCost)}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500 dark:text-gray-400">
                      Output Cost
                    </div>
                    <div className="font-medium text-blue-600 dark:text-blue-400">
                      {formatCost(result.outputCost)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCost(result.cost)}
                    </span>
                  </div>
                </div>
              </div>

              {result.prompt && !result.isProcessing && (
                <>
                  <div className="relative p-3 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-2 pr-10">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        Generated Prompt
                      </h5>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {result.prompt.length} characters
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Copy prompt"
                      title="Copy prompt"
                      className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/90 dark:bg-gray-800/90 shadow hover:shadow-md text-gray-700 dark:text-gray-200 text-xs"
                      onClick={() => copyToClipboard(result.prompt!, result.id)}
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
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                      {result.prompt}
                    </p>
                  </div>
                  <div className="mt-3">
                    <RatingWidget
                      historyEntryId={result.id}
                      modelId={result.modelId}
                      modelName={result.modelName}
                      imagePreview={uploadedImage?.preview || null}
                      prompt={result.prompt}
                      compact={true}
                    />
                  </div>
                </>
              )}

              {result.error && (
                <div className="flex-1 p-4">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {result.error}
                  </p>
                </div>
              )}

              {result.isProcessing && (
                <div className="flex-1 flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
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
