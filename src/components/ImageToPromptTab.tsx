'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AppSettings, MultiImageUploadState, ImageBatchEntry, ImageBatchItem, VisionModel } from '@/types';
import { createOpenRouterClient } from '@/lib/openrouter';
import { imageStateStorage } from '@/lib/storage';
import runWithConcurrency from '@/lib/batchQueue';
import calculateGenerationCost from '@/lib/cost';
import { normalizeToApiError } from '@/lib/errorUtils';
import { X, Loader2, Copy, AlertCircle, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Tooltip } from '@/components/common/Tooltip';

interface ImageToPromptTabProps {
  settings: AppSettings;
}

/**
 * Multi-image batch processing UI + logic.
 * - Upload up to 5 images
 * - Assign a model per image
 * - Process with concurrency=2 using runWithConcurrency helper
 * - Persist batch entries to storage
 *
 * This component augments existing single-image flows and provides the full
 * multi-image experience required by Issue #45.
 */
export const ImageToPromptTab: React.FC<ImageToPromptTabProps> = ({
  settings,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  const [images, setImages] = useState<MultiImageUploadState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Abort controller for the current batch run (allows cancel all)
  const batchAbortRef = useRef<AbortController | null>(null);

  // Load persisted image batch history preview if any (keep UX simple)
  useEffect(() => {
    const persisted = imageStateStorage.getImageState();
    if (persisted && persisted.preview && images.length === 0) {
      // If there is a last uploaded preview, populate a single image preview
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
      } as MultiImageUploadState;
      setImages([fallback]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helpers
  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.';
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size too large. Please upload an image smaller than 10MB.';
    }
    return null;
  };

  const readFileAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) resolve(e.target.result as string);
        else reject(new Error('Failed to read file'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const addFiles = useCallback(async (files: FileList | File[]) => {
    setErrorMessage(null);
    const arr = Array.from(files);
    if (arr.length === 0) return;

    // enforce max 5 images total
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
      setImages(prev => {
        const combined = [...prev, ...newItems];
        // persist a simple preview to storage for quick reload UX
        imageStateStorage.saveUploadedImage(combined[0].preview, combined[0].file?.name || 'image', combined[0].file?.size || 0, combined[0].file?.type || 'image/png');
        return combined;
      });
    }
  }, [images.length, settings.selectedModel, settings.availableModels]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files;
    if (file && file.length > 0) {
      addFiles(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
  }, [addFiles]);

  const handleSelectModelForImage = (imageId: string, modelId: string) => {
    setImages(prev => prev.map(img => img.id === imageId ? { ...img, assignedModelId: modelId } : img));
  };

  const removeImage = (imageId: string) => {
    setImages(prev => {
      const remaining = prev.filter(i => i.id !== imageId);
      if (remaining.length > 0) {
        imageStateStorage.saveUploadedImage(remaining[0].preview, remaining[0].file?.name || 'image', remaining[0].file?.size || 0, remaining[0].file?.type || 'image/png');
      } else {
        imageStateStorage.clearImageState();
      }
      return remaining;
    });
  };

  const clearAll = () => {
    setImages([]);
    imageStateStorage.clearImageState();
  };

  const generateBatch = useCallback(async () => {
    if (!settings.isValidApiKey) {
      setErrorMessage('Please set a valid API key in Settings.');
      return;
    }
    if (images.length === 0) {
      setErrorMessage('Please upload at least one image.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setProcessedCount(0);

    // create abort controller for this batch run
    batchAbortRef.current = new AbortController();

    // Build tasks per image that are not already done
    const tasks: Array<() => Promise<ImageBatchItem>> = images.map((img) => {
      return async () => {
        // mark queued -> processing
        setImages(prev => prev.map(it => it.id === img.id ? { ...it, processingStatus: 'processing' } : it));
        const client = createOpenRouterClient(settings.openRouterApiKey);
        try {
          const prompt = await client.generateImagePrompt(
            img.preview,
            settings.customPrompt,
            img.assignedModelId
          );

          const modelInfo: VisionModel | undefined = settings.availableModels.find(m => m.id === img.assignedModelId);
          const cost = modelInfo ? calculateGenerationCost(modelInfo, prompt.length) : null;

          // update state per image
          setImages(prev => prev.map(it => it.id === img.id ? {
            ...it,
            processingStatus: 'done',
            generatedPrompt: prompt,
            cost: cost ? { inputCost: cost.inputCost, outputCost: cost.outputCost, totalCost: cost.totalCost } : null,
            processingError: null,
          } : it));

          // persist individual prompt
          imageStateStorage.saveGeneratedPrompt(prompt);

          return {
            imageId: img.id,
            fileName: img.file?.name || 'image',
            modelId: img.assignedModelId,
            modelName: modelInfo?.name,
            prompt,
            error: null,
            cost: cost ? { inputCost: cost.inputCost, outputCost: cost.outputCost, totalCost: cost.totalCost } : null,
            status: 'done' as const,
            processingStartTime: Date.now(),
            processingEndTime: Date.now(),
          };
        } catch (err) {
          const apiErr = normalizeToApiError(err);
          setImages(prev => prev.map(it => it.id === img.id ? {
            ...it,
            processingStatus: 'error',
            processingError: apiErr.message,
          } : it));
          return {
            imageId: img.id,
            fileName: img.file?.name || 'image',
            modelId: img.assignedModelId,
            modelName: undefined,
            prompt: null,
            error: apiErr.message,
            cost: null,
            status: 'error' as const,
            processingStartTime: Date.now(),
            processingEndTime: Date.now(),
          };
        }
      };
    });

    // run tasks with concurrency control
    try {
      const onProgress = (completed: number) => {
        setProcessedCount(completed);
      };
      const result = await runWithConcurrency(tasks, { concurrency: 2, onProgress, retryAttempts: 1, retryDelay: 400, signal: batchAbortRef.current?.signal });
      // assemble batch entry from results
      const items = (result.results || []).map((r) => {
        if (r instanceof Error) {
          return {
            imageId: 'unknown',
            fileName: 'unknown',
            modelId: '',
            modelName: undefined,
            prompt: null,
            error: r.message,
            cost: null,
            status: 'error' as const,
          } as ImageBatchItem;
        }
        return r as ImageBatchItem;
      });

      const totalCost = items.reduce((acc, it) => acc + (it.cost?.totalCost || 0), 0);
      const batch: ImageBatchEntry = {
        id: `batch-${Date.now()}`,
        createdAt: Date.now(),
        imagePreview: images[0]?.preview || null,
        items,
        totalCost,
        schemaVersion: 1,
        processingMode: 'multi',
      };

      // Persist batch entry: use legacy saveBatchEntry (it accepts generic objects) for now
      // cast to any to satisfy TS
      try {
        // imageStateStorage.saveBatchEntry exists for legacy entries; use it to record the batch
        imageStateStorage.saveImageBatchEntry(batch);
      } catch (e) {
        console.warn('Failed to persist batch:', e);
      }

    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setErrorMessage('Batch cancelled.');
      } else {
        setErrorMessage(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setIsProcessing(false);
      batchAbortRef.current = null;
    }
  }, [images, settings]);

  // Retry a single image processing (runs the same logic as the batch but only for one image)
  const retryImage = async (imageId: string) => {
    const img = images.find(i => i.id === imageId);
    if (!img) return;
    setErrorMessage(null);
    setImages(prev => prev.map(it => it.id === imageId ? { ...it, processingStatus: 'processing', processingError: null } : it));
    try {
      const client = createOpenRouterClient(settings.openRouterApiKey);
      const prompt = await client.generateImagePrompt(img.preview, settings.customPrompt, img.assignedModelId);
      const modelInfo: VisionModel | undefined = settings.availableModels.find(m => m.id === img.assignedModelId);
      const cost = modelInfo ? calculateGenerationCost(modelInfo, prompt.length) : null;
      setImages(prev => prev.map(it => it.id === imageId ? {
        ...it,
        processingStatus: 'done',
        generatedPrompt: prompt,
        cost: cost ? { inputCost: cost.inputCost, outputCost: cost.outputCost, totalCost: cost.totalCost } : null,
        processingError: null,
      } : it));
      imageStateStorage.saveGeneratedPrompt(prompt);
      setProcessedCount(p => p + 1);
    } catch (err) {
      const apiErr = normalizeToApiError(err);
      setImages(prev => prev.map(it => it.id === imageId ? { ...it, processingStatus: 'error', processingError: apiErr.message } : it));
    }
  };

  // Cancel batch run
  const cancelBatch = () => {
    if (batchAbortRef.current) {
      batchAbortRef.current.abort();
      batchAbortRef.current = null;
      setIsProcessing(false);
      setErrorMessage('Batch cancelled by user.');
      // reset any 'processing' images back to 'idle' so they can be retried
      setImages(prev => prev.map(it => it.processingStatus === 'processing' ? { ...it, processingStatus: 'idle' } : it));
    }
  };

  const copyPrompt = async (text: string | null) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('copy failed', e);
    }
  };

  const copyAll = async () => {
    const all = images.map(i => i.generatedPrompt).filter(Boolean).join('\n\n');
    await copyPrompt(all || '');
  };

  // UI helpers
  const formatBytes = (bytes: number | null) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Image to Prompt</h1>

      {!settings.isValidApiKey && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h2 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">API Key Required</h2>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">Please add and validate your OpenRouter API key in the Settings tab to start generating prompts.</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div>
        <div className="flex items-center mb-2">
          <ImageIcon className="mr-2 h-5 w-5" />
          <h2 className="text-lg font-semibold">Upload Images (up to 5)</h2>
          <Tooltip id="upload-multi" label="Upload multiple images" message="Drag & drop or click to browse. Max 5 images, 10MB each." />
        </div>

        <div
          ref={dropZoneRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
          aria-label="Upload images - Click or drag and drop"
          onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click(); }}
        >
          <p className="text-gray-700 dark:text-gray-300">Drop images here or click to browse</p>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
        </div>

        {errorMessage && (
          <div className="mt-3 text-sm text-red-600">{errorMessage}</div>
        )}

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {images.map(img => {
              const modelOptions = settings.availableModels;
              return (
                <div key={img.id} className="p-3 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                        <Image src={img.preview} alt={`Preview ${img.file?.name || img.id}`} width={96} height={96} className="object-contain" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{img.file?.name || 'Image'}</div>
                        <div className="text-xs text-gray-500">{formatBytes(img.file?.size || null)}</div>
                        <div className="text-xs text-gray-500">Status: {img.processingStatus}</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <button onClick={() => removeImage(img.id)} aria-label="Remove image" className="p-2 rounded hover:bg-gray-100">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs text-gray-600 mb-1">Assigned model</label>
                    <select value={img.assignedModelId} onChange={(e) => handleSelectModelForImage(img.id, e.target.value)} className="w-full p-2 border rounded bg-white dark:bg-gray-700">
                      {(modelOptions || []).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm">Prompt:</div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{img.generatedPrompt || (img.processingStatus === 'processing' ? 'Generating...' : '—')}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-right">
                        <div>Total: ${img.cost?.totalCost?.toFixed(4) ?? '0.0000'}</div>
                        <div className="text-xs text-gray-500">Input: ${img.cost?.inputCost?.toFixed(4) ?? '0.0000'}</div>
                      </div>
                      <div>
                        <div className="flex space-x-2">
                          <button onClick={() => copyPrompt(img.generatedPrompt)} disabled={!img.generatedPrompt} className="px-3 py-1 bg-gray-600 text-white rounded">
                            <Copy className="inline-block mr-2 h-4 w-4" />Copy
                          </button>

                          {img.processingStatus === 'processing' && (
                            <button onClick={() => {
                              // cancelling individual image: mark idle (the batch controller can't cancel a single item easily)
                              setImages(prev => prev.map(it => it.id === img.id ? { ...it, processingStatus: 'idle', processingError: 'Cancelled' } : it));
                            }} className="px-3 py-1 bg-yellow-500 text-white rounded">
                              Cancel
                            </button>
                          )}

                          {img.processingStatus === 'error' && (
                            <button onClick={() => retryImage(img.id)} className="px-3 py-1 bg-green-600 text-white rounded">
                              Retry
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {img.processingError && <div className="mt-2 text-sm text-red-600">Error: {img.processingError}</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center space-x-3 mt-4">
          <button onClick={generateBatch} disabled={isProcessing || images.length === 0} className={`px-4 py-2 rounded ${isProcessing ? 'bg-gray-300' : 'bg-blue-600 text-white'}`}>
            {isProcessing ? (<><Loader2 className="inline-block mr-2 animate-spin" />Processing...</>) : 'Generate Batch'}
          </button>

          {isProcessing ? (
            <button onClick={cancelBatch} className="px-4 py-2 rounded bg-red-500 text-white">
              Cancel Batch
            </button>
          ) : null}

          <button onClick={copyAll} disabled={images.every(i => !i.generatedPrompt)} className="px-4 py-2 rounded bg-gray-600 text-white">
            Copy All
          </button>

          <button onClick={clearAll} className="px-4 py-2 rounded border">Clear All</button>

          <div className="ml-auto text-sm text-gray-600" role="status" aria-live="polite">
            {processedCount}/{images.length} processed
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageToPromptTab;
