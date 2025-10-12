import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageToPromptTab } from '@/components/ImageToPromptTab';

// Increase timeout for this test file since it invokes async batch operations
jest.setTimeout(20000);

import * as openrouter from '@/lib/openrouter';
import * as storage from '@/lib/storage';
import * as cost from '@/lib/cost';

jest.mock('@/lib/openrouter');
jest.mock('@/lib/storage');
jest.mock('@/lib/cost');

describe('ImageToPromptTab - multi-image batch', () => {
  const mockCreateClient = openrouter.createOpenRouterClient as jest.Mock;
  const mockStorage = storage.imageStateStorage || {};

  let genMock: jest.Mock;
  let calcMock: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();

    // Mock image state to include a preview so the component thinks an image is uploaded
    mockStorage.getImageState = jest.fn(() => ({
      preview: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
      fileName: 'test.png',
      fileSize: 1234,
      fileType: 'image/png',
      generatedPrompt: null,
      batchHistory: [],
      schemaVersion: 1,
    }));

    // Provide mocked storage methods used by the component
    mockStorage.saveGeneratedPrompt = jest.fn();
    mockStorage.saveImageBatchEntry = jest.fn();

    // Prepare mocks for the client methods so we can assert they were called
    genMock = jest.fn((imageData: string, customPrompt: string, modelId: string) =>
      Promise.resolve(`Generated for ${modelId}`)
    );
    calcMock = jest.fn((model: import('@/types').VisionModel, length: number) => ({
      inputCost: 0.0001,
      outputCost: 0.0002,
      totalCost: 0.0003,
    }));
    // Mock calculateGenerationCost by using the mocked module function
    (cost.calculateGenerationCost as jest.Mock).mockImplementation(calcMock);

    // Mock OpenRouter client factory to return a client with our mocks
    mockCreateClient.mockImplementation(() => {
      return {
        generateImagePrompt: genMock,
        calculateGenerationCost: calcMock,
      };
    });
  });

  it('runs batch generation for uploaded images and persists results', async () => {
    const settings = {
      openRouterApiKey: 'sk-or-v1-testkey',
      selectedModel: 'model-1',
      customPrompt: 'Describe this image in detail.',
      isValidApiKey: true,
      lastApiKeyValidation: null,
      lastModelFetch: null,
      availableModels: [
        { id: 'model-1', name: 'Model One', description: '', pricing: { prompt: 0.0001, completion: 0.0002 } },
        { id: 'model-2', name: 'Model Two', description: '', pricing: { prompt: 0.0001, completion: 0.0002 } },
      ],
      preferredModels: [],
    };

    render(<ImageToPromptTab settings={settings} />);

    // Wait for persisted preview to be applied (image element appears with random ID)
    // The component now uses the image's ID/filename in the alt text instead of 'Uploaded image'
    // We check for the dynamic alt text generated from mock data.
    // Note: The timestamp changes on every test run, so we just check for 'Preview persisted-'
    await waitFor(() => expect(screen.getByAltText(/Preview persisted-/)).toBeInTheDocument(), { timeout: 2000 });

    // Verify the added image appears in the grid
    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('Status: idle')).toBeInTheDocument();

    // Click the Generate Batch button
    const generateButton = screen.getByRole('button', { name: /generate batch/i });
    expect(generateButton).toBeEnabled();
    fireEvent.click(generateButton);

    // Wait for the mocked client generateImagePrompt to be invoked
    await waitFor(() => expect(genMock).toHaveBeenCalled(), { timeout: 5000 });

    // Ensure individual prompts persistence was attempted
    expect(mockStorage.saveGeneratedPrompt).toHaveBeenCalled();

    // Ensure batch persistence was attempted
    expect(mockStorage.saveImageBatchEntry).toHaveBeenCalled();

    // Check that cost calculation was called
    expect(calcMock).toHaveBeenCalled();
  });
});
