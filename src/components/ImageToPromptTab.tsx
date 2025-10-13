"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import type { AppSettings, VisionModel } from "@/types";
import { createOpenRouterClient } from "@/lib/openrouter";
import { imageStateStorage } from "@/lib/storage";
import calculateGenerationCost from "@/lib/cost";
import { normalizeToApiError } from "@/lib/errorUtils";
import { AlertCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageToPromptTabProps {
  settings: AppSettings;
}

interface ModelResult {
  modelId: string;
  modelName: string;
  prompt: string | null;
  cost: number | null;
  isProcessing: boolean;
  error: string | null;
}

export const ImageToPromptTab: React.FC<ImageToPromptTabProps> = ({
  settings,
}) => {
  const [uploadedImage, setUploadedImage] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const [modelResults, setModelResults] = useState<ModelResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
        file: null as any, // We don't have the file object from storage
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
          prev.map((r) => ({ ...r, prompt: null, cost: null, error: null })),
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
          prev.map((r) => ({ ...r, prompt: null, cost: null, error: null })),
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

    // Process each model sequentially
    for (let i = 0; i < modelResults.length; i++) {
      const result = modelResults[i];

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
        const costObj = model
          ? calculateGenerationCost(model, prompt.length)
          : null;
        const totalCost = costObj ? costObj.totalCost : null;

        // Update result
        setModelResults((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  prompt,
                  cost: totalCost,
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
        const modelInfo = settings.availableModels.find(m => m.id === img.assignedModelId);
        const costObj = modelInfo ? calculateGenerationCost(modelInfo, prompt.length) : null;
        const cost = costObj ? costObj.totalCost : null;

        setImages(prev => prev.map(it => it.id === img.id ? {
          ...it,
          processingStatus: 'done',
          generatedPrompt: prompt,
          cost,
        } : it));

        return { prompt, cost };
      } catch (err) {
        const apiErr = normalizeToApiError(err);
        setErrorMessage(apiErr.message);
        return { prompt: null, cost: null };
      }
    });

    try {
      const onProgress = (completed: number) => {
        setProcessedCount(completed);
      };
      await runWithConcurrency(tasks, { concurrency: 2, onProgress, signal: batchAbortRef.current!.signal });
      // persist results if needed
    } catch (err) {
      const e = err as { name?: string } | null;
      if (e && e.name === 'AbortError') {
        setErrorMessage('Batch cancelled.');
      } else {
        setErrorMessage('Generation failed.');
      }
    }

    setIsGenerating(false);
  }, [settings, uploadedImage, modelResults]);

  const formatCost = useCallback((cost: number | null): string => {
    if (cost === null) return "$0.000000";
    return `$${cost.toFixed(6)}`;
  }, []);

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

      {/* Model Results */}
      {modelResults.length > 0 && (
        <div className="space-y-4">
          {modelResults.map((result, index) => (
            <div
              key={result.modelId}
              className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {result.modelName}
                </h3>
                {result.cost !== null && (
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Cost: {formatCost(result.cost)}
                  </span>
                )}
              </div>

              {result.isProcessing && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Processing...
                  </span>
                </div>
                <div className="mt-3">
                  <label className="block text-xs">Model</label>
                  <select value={img.assignedModelId} onChange={(e) => handleSelectModelForImage(img.id, e.target.value)} className="w-full p-2 border rounded">
                    {(() => {
                      const list = settings.availableModels || [];
                      const pinnedSet = new Set(settings.pinnedModels || []);
                      const pinned = list.filter(m => pinnedSet.has(m.id));
                      const other = list.filter(m => !pinnedSet.has(m.id));
                      return [...pinned, ...other].map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ));
                    })()}
                  </select>
              )}

              {result.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {result.error}
                  </p>
                </div>
              )}

              {result.prompt && !result.isProcessing && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {result.prompt}
                  </p>
                </div>
              )}

              {!result.isProcessing && !result.prompt && !result.error && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
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
