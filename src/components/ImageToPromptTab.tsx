"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import type { AppSettings, ModelResult } from "@/types";
import { createOpenRouterClient } from "@/lib/openrouter";
import { imageStateStorage } from "@/lib/storage";
import { calculateDetailedCost } from "@/lib/cost";
import { normalizeToApiError } from "@/lib/errorUtils";
import {
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  Check,
  Copy,
} from "lucide-react";
import Image from "next/image";

interface ImageToPromptTabProps {
  settings: AppSettings;
}

// Helper function to format token counts
const formatTokens = (tokens: number | null): string => {
  if (tokens === null) return "—";
  return tokens.toLocaleString();
};

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
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  // Initialize model results when settings change
  useEffect(() => {
    if (
      settings.selectedVisionModels &&
      settings.selectedVisionModels.length > 0
    ) {
      const results: ModelResult[] = settings.selectedVisionModels.map(
        (modelId) => {
          const model = settings.availableModels.find((m) => m.id === modelId);
          return {
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
        },
      );
      setModelResults(results);
    }
  }, [settings.selectedVisionModels, settings.availableModels]);

  // Load persisted image and model results on mount
  useEffect(() => {
    const persisted = imageStateStorage.getImageState();
    if (persisted && persisted.preview) {
      setUploadedImage({
        file: null, // We don't have the file object from storage
        preview: persisted.preview,
      });
    }
    // Restore model results if they exist, but clear any stale processing flags
    if (
      persisted &&
      Array.isArray(persisted.modelResults) &&
      persisted.modelResults.length > 0
    ) {
      // Clear isProcessing flags to prevent stuck spinners after navigation/refresh
      const cleanedResults = persisted.modelResults.map((result) => ({
        ...result,
        isProcessing: false,
      }));
      setModelResults(cleanedResults);
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
        setModelResults((prev) => {
          const resetResults = prev.map((r) => ({
            ...r,
            prompt: null,
            cost: null,
            inputTokens: null,
            outputTokens: null,
            inputCost: null,
            outputCost: null,
            error: null,
          }));
          // Persist reset results
          imageStateStorage.saveModelResults(resetResults);
          return resetResults;
        });
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
        setModelResults((prev) => {
          const resetResults = prev.map((r) => ({
            ...r,
            prompt: null,
            cost: null,
            inputTokens: null,
            outputTokens: null,
            inputCost: null,
            outputCost: null,
            error: null,
          }));
          // Persist reset results
          imageStateStorage.saveModelResults(resetResults);
          return resetResults;
        });
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

    // Process each model sequentially with explicit index access
    for (let i = 0; i < modelResults.length; i++) {
      const result = modelResults[i];
      if (!result) {
        continue;
      }
      // Mark as processing
      setModelResults((prev) => {
        const updated = prev.map((r, idx) =>
          idx === i ? { ...r, isProcessing: true, error: null } : r,
        );
        // Persist to storage immediately
        imageStateStorage.saveModelResults(updated);
        return updated;
      });

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

        // Calculate detailed costs using proper function
        let inputTokens = 0;
        let outputTokens = 0;
        let inputCost = 0;
        let outputCost = 0;
        let totalCost = 0;

        if (model) {
          const costDetails = calculateDetailedCost(
            model,
            uploadedImage.preview,
            prompt,
          );
          inputTokens = costDetails.inputTokens;
          outputTokens = costDetails.outputTokens;
          inputCost = costDetails.inputCost;
          outputCost = costDetails.outputCost;
          totalCost = costDetails.totalCost;
        }

        // Update result
        setModelResults((prev) => {
          const updated = prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  prompt,
                  cost: totalCost,
                  inputTokens,
                  outputTokens,
                  inputCost,
                  outputCost,
                  isProcessing: false,
                  error: null,
                }
              : r,
          );
          // Persist to storage immediately
          imageStateStorage.saveModelResults(updated);
          return updated;
        });
      } catch (error) {
        const apiErr = normalizeToApiError(error);
        setModelResults((prev) => {
          const updated = prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  isProcessing: false,
                  error: apiErr.message,
                }
              : r,
          );
          // Persist to storage immediately
          imageStateStorage.saveModelResults(updated);
          return updated;
        });
      }
    }

    setIsGenerating(false);
    // Persist generation completion status
    imageStateStorage.saveGenerationStatus(false);
  }, [settings, uploadedImage, modelResults]);

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

  const copyToClipboard = useCallback(async (text: string, modelId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPromptId(modelId);
      setTimeout(() => setCopiedPromptId(null), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
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

      {/* Overall Cost Summary - Ultra Minimalist */}
      {modelResults.length > 0 && (
        <div className="flex items-center justify-center gap-8 py-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Models:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {modelResults.filter((r) => r.prompt).length}/
              {modelResults.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">
              Total Cost:
            </span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatCost(totalCostAllModels)}
            </span>
          </div>
        </div>
      )}

      {/* Model Results - Horizontal Layout (Columns) */}
      {modelResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {modelResults.map((result) => (
            <div
              key={result.modelId}
              className="flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden h-[600px]"
            >
              {/* Model Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 truncate">
                  {result.modelName}
                </h3>
                <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {result.modelId}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="p-4 space-y-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Input Tokens
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatTokens(result.inputTokens)}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Output Tokens
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatTokens(result.outputTokens)}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Input Cost
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {formatCost(result.inputCost)}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Output Cost
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {formatCost(result.outputCost)}
                  </span>
                </div>

                <div className="flex justify-between text-xs pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Total Cost
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatCost(result.cost)}
                  </span>
                </div>
              </div>

              {/* Output Section */}
              <div className="flex-1 flex flex-col min-h-0">
                {result.isProcessing && (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                  </div>
                )}

                {result.error && (
                  <div className="flex-1 p-4">
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {result.error}
                    </p>
                  </div>
                )}

                {result.prompt && !result.isProcessing && (
                  <div className="flex-1 flex flex-col min-h-0 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Output
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(result.prompt!, result.modelId)
                        }
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Copy to clipboard"
                        aria-label="Copy prompt to clipboard"
                      >
                        {copiedPromptId === result.modelId ? (
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        )}
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-gray-900 dark:text-white leading-relaxed break-words">
                        {result.prompt}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageToPromptTab;
