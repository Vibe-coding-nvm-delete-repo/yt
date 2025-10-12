'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AppSettings, ImageUploadState, GenerationState } from '@/types';
import { createOpenRouterClient } from '@/lib/openrouter';
import { imageStateStorage } from '@/lib/storage';
import { Upload, X, Loader2, Copy, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Tooltip } from '@/components/common/Tooltip';

interface ImageToPromptTabProps {
  settings: AppSettings;
}

export const ImageToPromptTab: React.FC<ImageToPromptTabProps> = ({
  settings,
}) => {
  const [uploadState, setUploadState] = useState<ImageUploadState>({
    file: null,
    preview: null,
    isUploading: false,
    error: null,
  });
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    generatedPrompt: null,
    error: null,
  });
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [uploadTimestamp, setUploadTimestamp] = useState<Date | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Load persisted image state on mount
  useEffect(() => {
    const persistedState = imageStateStorage.getImageState();
    
    if (persistedState.preview) {
      setUploadState(prev => ({
        ...prev,
        preview: persistedState.preview,
        file: null, // File object can't be persisted, but we have the preview
      }));
    }

    if (persistedState.generatedPrompt) {
      setGenerationState(prev => ({
        ...prev,
        generatedPrompt: persistedState.generatedPrompt,
      }));
    }
  }, []);

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.';
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return 'File size too large. Please upload an image smaller than 10MB.';
    }

    return null;
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadState(prev => ({
        ...prev,
        error: validationError,
      }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      error: null,
    }));

    try {
      const dataUrl = await readFileAsDataURL(file);
      
      // Save to state
      setUploadState({
        file,
        preview: dataUrl,
        isUploading: false,
        error: null,
      });

      // Set upload timestamp
      setUploadTimestamp(new Date());

      // Persist to localStorage
      imageStateStorage.saveUploadedImage(
        dataUrl,
        file.name,
        file.size,
        file.type
      );
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: error instanceof Error ? error.message : 'Failed to process image',
      }));
    }
  }, []);

  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle click anywhere in drop zone to trigger file input
  const handleDropZoneClick = useCallback(() => {
    if (fileInputRef.current && !uploadState.isUploading) {
      fileInputRef.current.click();
    }
  }, [uploadState.isUploading]);

  const generatePrompt = useCallback(async () => {
    if (!uploadState.preview || !settings.selectedModel || !settings.isValidApiKey) {
      setGenerationState(prev => ({
        ...prev,
        error: 'Please ensure you have a valid API key, selected a model, and uploaded an image.',
      }));
      return;
    }

    setGenerationState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
    }));

    try {
      const client = createOpenRouterClient(settings.openRouterApiKey);
      const prompt = await client.generateImagePrompt(
        uploadState.preview,
        settings.customPrompt,
        settings.selectedModel
      );

      setGenerationState({
        isGenerating: false,
        generatedPrompt: prompt,
        error: null,
      });

      // Persist generated prompt
      imageStateStorage.saveGeneratedPrompt(prompt);
    } catch (error) {
      setGenerationState({
        isGenerating: false,
        generatedPrompt: null,
        error: error instanceof Error ? error.message : 'Failed to generate prompt',
      });
    }
  }, [uploadState.preview, settings]);

  const clearImage = useCallback(() => {
    setUploadState({
      file: null,
      preview: null,
      isUploading: false,
      error: null,
    });
    setGenerationState({
      isGenerating: false,
      generatedPrompt: null,
      error: null,
    });
    setUploadTimestamp(null);
    
    // Clear from localStorage
    imageStateStorage.clearImageState();
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (!generationState.generatedPrompt) return;

    try {
      await navigator.clipboard.writeText(generationState.generatedPrompt);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, [generationState.generatedPrompt]);

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isGenerateDisabled = !uploadState.preview || !settings.selectedModel || !settings.isValidApiKey || generationState.isGenerating;

  // Calculate character count
  const charCount = generationState.generatedPrompt?.length || 0;
  const charLimit = 1500;
  const isOverLimit = charCount > charLimit;

  // Get current model information and calculate costs
  const selectedModelInfo = settings.availableModels.find(model => model.id === settings.selectedModel);
  const costs = selectedModelInfo && generationState.generatedPrompt
    ? createOpenRouterClient(settings.openRouterApiKey).calculateGenerationCost(selectedModelInfo, generationState.generatedPrompt.length)
    : null;

  // Format currency for display
  const formatCost = (cost: number) => `$${cost.toFixed(4)}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Image to Prompt
      </h1>

      {/* Status Messages */}
      {!settings.isValidApiKey && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
            <div>
              <h2 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                API Key Required
              </h2>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Please add and validate your OpenRouter API key in the Settings tab to start generating prompts.
              </p>
            </div>
          </div>
        </div>
      )}

      {settings.isValidApiKey && !settings.selectedModel && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
            <div>
              <h2 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Model Selection Required
              </h2>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Please select a vision model in the Settings tab to start generating prompts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="space-y-4">
        <div className="flex items-center text-gray-900 dark:text-white">
          <ImageIcon className="mr-2 h-5 w-5" />
          <h2 className="text-lg font-semibold">Upload Image</h2>
          <Tooltip
            id="upload-image"
            label="More information about uploading images"
            message="Upload a JPEG, PNG, WebP, or GIF image up to 10MB. You can drag and drop or click the area to browse."
          />
          {uploadState.preview && (
            <CheckCircle
              className="ml-2 h-4 w-4 text-green-600"
              aria-hidden="true"
            />
          )}
        </div>

        {!uploadState.preview ? (
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleDropZoneClick}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${uploadState.isUploading
                ? 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
              }
            `}
            role="button"
            tabIndex={0}
            aria-label="Upload image - Click to browse or drag and drop"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDropZoneClick();
              }
            }}
          >
            {uploadState.isUploading ? (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />
                <p className="text-gray-600 dark:text-gray-400">Processing image...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <Upload className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    Drop your image here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Supports JPEG, PNG, WebP, and GIF up to 10MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  aria-label="File upload input"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview - Full image display with object-contain */}
            <div className="relative group">
              <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center min-h-64">
                <Image
                  src={uploadState.preview}
                  alt="Uploaded image"
                  width={800}
                  height={600}
                  className="max-w-full h-auto object-contain"
                  style={{ maxHeight: '600px' }}
                />
              </div>
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* File Info - Left aligned with single space after labels */}
            {uploadState.file && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm space-y-1">
                <div className="text-gray-900 dark:text-white">
                  <span className="font-medium text-gray-700 dark:text-gray-300">File:</span> {uploadState.file.name}
                </div>
                <div className="text-gray-900 dark:text-white">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Size:</span> {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <div className="text-gray-900 dark:text-white">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span> {uploadState.file.type}
                </div>
                {uploadTimestamp && (
                  <div className="text-gray-900 dark:text-white">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Uploaded:</span> {formatTimestamp(uploadTimestamp)}
                  </div>
                )}
                {generationState.generatedPrompt && (
                  <div className="text-gray-900 dark:text-white">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Length:</span> {charCount}/1500
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {uploadState.error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{uploadState.error}</p>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-gray-900 dark:text-white">
          <h2 className="text-lg font-semibold">Generate Prompt</h2>
          <Tooltip
            id="generate-prompt"
            label="More information about generating prompts"
            message="After uploading an image and selecting a model, click Generate Prompt to create a detailed prompt from the image."
          />
        </div>
        <button
          onClick={generatePrompt}
          disabled={isGenerateDisabled}
          className={`
            w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors
            ${isGenerateDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          {generationState.isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Prompt...
            </>
          ) : (
            'Generate Prompt'
          )}
        </button>

        {generationState.error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{generationState.error}</p>
          </div>
        )}
      </div>

      {/* Enhanced Prompt Metrics and Generation */}
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 Generation Metrics
          </h2>

          {/* Model Info and Estimated Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model Selected</h3>
              <p className="text-sm text-gray-900 dark:text-white">
                {selectedModelInfo?.name || 'Select a model first'}
              </p>
            </div>

            {costs ? (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Cost</h3>
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  Total: {formatCost(costs.totalCost)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Input: {formatCost(costs.inputCost)} • Output: {formatCost(costs.outputCost)}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost Preview</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Complete image upload and model selection for cost preview
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center justify-between text-gray-900 dark:text-white">
          <h2 className="text-lg font-semibold">Generate Prompt</h2>
          <Tooltip
            id="generate-prompt"
            label="More information about generating prompts"
            message="After uploading an image and selecting a model, click Generate Prompt to create a detailed prompt from the image."
          />
        </div>
        <button
          onClick={generatePrompt}
          disabled={isGenerateDisabled}
          className={`
            w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors
            ${isGenerateDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          {generationState.isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Prompt...
            </>
          ) : (
            'Generate Prompt'
          )}
        </button>

        {generationState.error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{generationState.error}</p>
          </div>
        )}
      </div>

      {/* Generated Prompt */}
      {generationState.generatedPrompt && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
            Generated Prompt
          </h2>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {/* Character Counter */}
            <div className="mb-3">
              <span
                className={`text-lg font-semibold ${
                  isOverLimit
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}
              >
                {charCount}/{charLimit}
              </span>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your generated prompt:
              </span>
              {/* Bigger Copy Button - 50% larger */}
              <button
                onClick={copyToClipboard}
                className="flex items-center px-5 py-2 text-base bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                aria-label="Copy prompt to clipboard"
              >
                {copiedToClipboard ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-5 w-5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {generationState.generatedPrompt}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
