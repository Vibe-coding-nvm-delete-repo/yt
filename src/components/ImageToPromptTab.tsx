"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import type { AppSettings } from "@/types";
import { createOpenRouterClient } from "@/lib/openrouter";
import { imageStateStorage } from "@/lib/storage";
import calculateGenerationCost from "@/lib/cost";
import { normalizeToApiError } from "@/lib/errorUtils";
import {
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  DollarSign,
  Copy,
  Check,
} from "lucide-react";
import Image from "next/image";

interface ImageToPromptTabProps {
  settings: AppSettings;
}

interface ModelResult {
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
  const [copiedModelId, setCopiedModelId] = useState<string | null>(null);
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

  // Load persisted image on mount
  useEffect(() => {
    const persisted = imageStateStorage.getImageState();
    if (persisted && persisted.preview) {
      setUploadedImage({
        file: null, // We don't have the file object from storage
        preview: persisted.preview,
      });
    }
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

    // Process each model sequentially with explicit index access
    for (let i = 0; i < modelResults.length; i++) {
      const result = modelResults[i];
      if (!result) {
        continue;
      }
      // Mark as processing
      setModelResults((prev) =>
        prev.map((r, idx) =>
          idx === i ? { ...r, isProcessing: true, error: null } : r,
        ),
      );

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
            const toNumber = (v: number | string | null | undefined): number =>
              typeof v === "number"
                ? v
                : Number.isFinite(parseFloat(v ?? "0"))
                  ? parseFloat(v ?? "0")
                  : 0;
            const inputPrice = toNumber(model.pricing.prompt);
            const outputPrice = toNumber(model.pricing.completion);
            inputCost = (inputTokens * inputPrice) / 1000000; // Convert from per-1M tokens
            outputCost = (outputTokens * outputPrice) / 1000000;
          }
        }

        // Update result
        setModelResults((prev) =>
          prev.map((r, idx) =>
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
          ),
        );
      } catch (error) {
        const apiErr = normalizeToApiError(error);
        setModelResults((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  isProcessing: false,
                  error: apiErr.message,
                }
              : r,
          ),
        );
      }
    }

    setIsGenerating(false);
  }, [
    settings,
    uploadedImage,
    modelResults,
    estimateImageTokens,
    estimateTextTokens,
  ]);

  const formatCost = useCallback((cost: number | null): string => {
    if (cost === null || cost === 0) return "$0.000000";
    return `$${cost.toFixed(6)}`;
  }, []);

  const copyToClipboard = useCallback(async (text: string, modelId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedModelId(modelId);
      setTimeout(() => setCopiedModelId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  const getCharCountColor = useCallback((charCount: number): string => {
    return charCount <= 1500
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  }, []);

  const getCharCountBgColor = useCallback((charCount: number): string => {
    return charCount <= 1500
      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
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

      {/* Overall Cost Summary - Minimalist */}
      {modelResults.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="text-gray-600 dark:text-gray-400">
                Models:{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {modelResults.length}
                </span>
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Completed:{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {modelResults.filter((r) => r.prompt).length}
                </span>
              </span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400 mr-1" />
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCost(totalCostAllModels)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Model Results - Vertical Minimalist Layout */}
      {modelResults.length > 0 && (
        <div className="space-y-2">
          {modelResults.map((result) => (
            <div
              key={result.modelId}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              style={{ minHeight: "20vh" }}
            >
              {/* Model Name */}
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                {result.modelName}
              </h3>

              {/* Cost Breakdown - Single Line */}
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Input: {formatCost(result.inputCost)} | Output:{" "}
                {formatCost(result.outputCost)}
              </div>

              {/* Total Cost */}
              <div className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3">
                Total: {formatCost(result.cost)}
              </div>

              {result.isProcessing && (
                <div className="flex items-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                  <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                    Processing...
                  </span>
                </div>
              )}

              {result.error && (
                <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {result.error}
                  </p>
                </div>
              )}

              {result.prompt && !result.isProcessing && (
                <div className="space-y-2">
                  {/* Character Count Indicator */}
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border ${getCharCountBgColor(result.prompt.length)}`}
                  >
                    <span className={getCharCountColor(result.prompt.length)}>
                      {result.prompt.length} / 1500 chars
                      {result.prompt.length <= 1500 ? " ✓" : " ⚠"}
                    </span>
                  </div>

                  {/* Generated Prompt - Small Scrollable Window */}
                  <div className="relative">
                    <div className="h-16 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-900 dark:text-white whitespace-pre-wrap">
                        {result.prompt}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(result.prompt || "", result.modelId)
                      }
                      className="absolute top-1 right-1 p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      aria-label="Copy prompt"
                      title="Copy prompt"
                    >
                      {copiedModelId === result.modelId ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {!result.isProcessing && !result.prompt && !result.error && (
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Waiting to generate...
                  </p>
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
