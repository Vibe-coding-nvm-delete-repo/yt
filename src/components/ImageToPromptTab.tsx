"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { AppSettings } from '@/types';
import { createOpenRouterClient } from '@/lib/openrouter';
import { imageStateStorage } from '@/lib/storage';
import runWithConcurrency from '@/lib/batchQueue';
import calculateGenerationCost from '@/lib/cost';
import { normalizeToApiError } from '@/lib/errorUtils';
import { X, Copy, AlertCircle, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageToPromptTabProps {
  settings: AppSettings;
}


  type MultiImageUploadState = {
  id: string;
  file: File | null;
  preview: string | null;
  isUploading: boolean;
  error: string | null;
  assignedModelId: string;
  processingStatus: 'idle' | 'uploading' | 'processing' | 'done' | 'error';
  generatedPrompt: string | null;
  cost: number | null;
  processingError: string | null;
  uploadTimestamp: Date;
};


export const ImageToPromptTab: React.FC<ImageToPromptTabProps> = ({
  settings,
}) => {
  const [images, setImages] = useState<MultiImageUploadState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const batchAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const persisted = imageStateStorage.getImageState();
    if (persisted && persisted.preview && images.length === 0) {
      const fallback: MultiImageUploadState = {
        id: `persisted-${Date.now()}`,
        file: null,
        preview: persisted.preview as string,
        isUploading: false,
        error: null,
        assignedModelId: settings.selectedModel || settings.availableModels?.[0]?.id || '',
        processingStatus: 'idle',
        generatedPrompt: persisted.generatedPrompt || null,
        cost: null,
        processingError: null,
        uploadTimestamp: new Date(),
      };
      setImages([fallback]);
    }
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.';
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size too large. Please upload an image smaller than 10MB.';
    }
    return null;
  }, []);

  const readFileAsDataURL = useCallback((file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) resolve(e.target.result as string);
        else reject(new Error('Failed to read file'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    }), []);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    setErrorMessage(null);
    const arr = Array.from(files);
    if (arr.length === 0) return;

    if (images.length + arr.length > 5) {
      setErrorMessage('You can upload up to 5 images total.');
      return;
    }

    const newItems: MultiImageUploadState[] = [];
    for (const f of arr) {
      const validationError = validateFile(f);
      if (validationError) {
        setErrorMessage(validationError);
        continue;
      }
      try {
        const preview = await readFileAsDataURL(f);
        const id = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const assignedModelId = settings.selectedModel || settings.availableModels?.[0]?.id || '';
        newItems.push({
          id,
          file: f,
          preview,
          isUploading: false,
          error: null,
          assignedModelId,
          processingStatus: 'idle',
          generatedPrompt: null,
          cost: null,
          processingError: null,
          uploadTimestamp: new Date(),
        });
      } catch (e) {
        console.error('readFile error', e);
      }
    }

    if (newItems.length > 0) {
      setImages(prev => [...prev, ...newItems]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files;
    if (file && file.length > 0) {
      void addFiles(file);
      e.target.value = '';
    }
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      void addFiles(files);
    }
  }, [addFiles]);

  const handleSelectModelForImage = useCallback((imageId: string, modelId: string) => {
    setImages(prev => prev.map(img => img.id === imageId ? { ...img, assignedModelId: modelId } : img));
  }, []);

  const removeImage = useCallback((imageId: string) => {
    setImages(prev => prev.filter(i => i.id !== imageId));
  }, []);

  const clearAll = useCallback(() => {
    setImages([]);
  }, []);

  const generateBatch = useCallback(async () => {
    if (!settings.isValidApiKey) {
      setErrorMessage('Please set a valid API key in Settings.');
      return;
    }
    if (images.length === 0) {
      setErrorMessage('Please upload at least one image.');
      return;
    }

    setIsProcessing(true);
    setProcessedCount(0);

    batchAbortRef.current = new AbortController();

    const tasks: Array<() => Promise<{ prompt: string | null; cost: number | null; }>> = images.map((img) => async () => {
      const client = createOpenRouterClient(settings.openRouterApiKey);
      try {
        const prompt = await client.generateImagePrompt(
          img.preview ?? '',
          settings.customPrompt,
          img.assignedModelId
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
      if ((err as any)?.name === 'AbortError') {
        setErrorMessage('Batch cancelled.');
      } else {
        setErrorMessage('Generation failed.');
      }
    } finally {
      setIsProcessing(false);
      batchAbortRef.current = null;
    }
  }, [images, settings]);

  const copyPrompt = useCallback(async (text: string | null) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setErrorMessage('Failed to copy to clipboard.');
    }
  }, []);

  // formatBytes removed (unused)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Image to Prompt</h1>

      {!settings.isValidApiKey && (
        <div className="p-4 bg-yellow-50 border rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h2 className="text-sm font-medium text-yellow-800">API Key Required</h2>
              <p className="text-sm text-yellow-700 mt-1">Please add and validate your OpenRouter API key in the Settings tab.</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center mb-2">
          <ImageIcon className="mr-2 h-5 w-5" />
          <h2 className="text-lg font-semibold">Upload Images (up to 5)</h2>
        </div>

        <div
          ref={dropZoneRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
          role="button"
          tabIndex={0}
        >
          <p className="text-gray-700">Drop images here or click to browse</p>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
        </div>

        {errorMessage && (
          <div className="mt-3 text-sm text-red-600">{errorMessage}</div>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {images.map(img => (
              <div key={img.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between">
                    <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden">
                      <Image src={img.preview ?? ''} alt="Preview" width={96} height={96} className="object-contain" />
                    </div>
                  <div className="flex space-x-2">
                    <button onClick={() => removeImage(img.id)}><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs">Model</label>
                  <select value={img.assignedModelId} onChange={(e) => handleSelectModelForImage(img.id, e.target.value)} className="w-full p-2 border rounded">
                    {settings.availableModels?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="mt-3">
                  <p>{img.processingStatus}</p>
                  {img.generatedPrompt && <p>{img.generatedPrompt}</p>}
                  {img.processingStatus === 'done' && (
                    <button onClick={() => copyPrompt(img.generatedPrompt)}><Copy className="h-4 w-4" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-3 mt-4">
          <button onClick={generateBatch} disabled={isProcessing || images.length === 0} className="px-4 py-2 rounded bg-blue-600 text-white">
            {isProcessing ? 'Processing...' : 'Generate Batch'}
          </button>
          <button onClick={clearAll} className="px-4 py-2 rounded border">Clear All</button>
          <div className="ml-auto text-sm">{processedCount}/{images.length} processed</div>
        </div>
      </div>
    </div>
  );
};

export default ImageToPromptTab;
