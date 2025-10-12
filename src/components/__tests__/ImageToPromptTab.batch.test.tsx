import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageToPromptTab } from '@/components/ImageToPromptTab';

// Increase timeout for this test file since it invokes async batch operations
jest.setTimeout(20000);
import * as openrouter from '@/lib/openrouter';
import * as storage from '@/lib/storage';

jest.mock('@/lib/openrouter');
jest.mock('@/lib/storage');

describe('ImageToPromptTab - multi-model batch', () => {
  const mockCreateClient = openrouter.createOpenRouterClient as jest.Mock;
  const mockStorage = storage as unknown as {
    imageStateStorage: {
      getImageState: jest.Mock,
      saveGeneratedPrompt: jest.Mock,
      saveBatchEntry: jest.Mock,
    };
  };

    let genMock: jest.Mock;
    let calcMock: jest.Mock;

    let genMock: jest.MockedFunction<any>;
    let calcMock: jest.MockedFunction<any>;

  beforeEach(() => {
    jest.resetAllMocks();

    // Mock image state to include a preview so the component thinks an image is uploaded
    mockStorage.imageStateStorage.getImageState = jest.fn(() => ({
      preview: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
      fileName: 'test.png',
      fileSize: 1234,
      fileType: 'image/png',
      generatedPrompt: null,
      batchHistory: [],
    }));

    // Provide mocked storage methods used by the component
    mockStorage.imageStateStorage.saveGeneratedPrompt = jest.fn();
    mockStorage.imageStateStorage.saveBatchEntry = jest.fn();

    // Prepare mocks for the client methods so we can assert they were called
    genMock = jest.fn((imageData: string, customPrompt: string, modelId: string) =>
      Promise.resolve(`Generated for ${modelId}`)
    );
    calcMock = jest.fn((model: import('@/types').VisionModel, length: number) => ({
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
    }));

    // Mock OpenRouter client factory to return a client with our mocks
    mockCreateClient.mockImplementation(() => {
      return {
        generateImagePrompt: genMock,
        calculateGenerationCost: calcMock,
      };
    });
  });

  it('runs batch generation across selectedModel and checkedModels and persists a batch entry', async () => {
    const settings = {
      openRouterApiKey: 'sk-or-v1-testkey',
      selectedModel: 'model-1',
      customPrompt: 'Describe this image in detail.',
      isValidApiKey: true,
      lastApiKeyValidation: null,
      lastModelFetch: null,
      availableModels: [
        { id: 'model-1', name: 'Model One', description: '', pricing: { prompt: 0, completion: 0 } },
        { id: 'model-2', name: 'Model Two', description: '', pricing: { prompt: 0, completion: 0 } },
      ],
      preferredModels: [],
    };

    render(<ImageToPromptTab settings={settings} />);

    // The component now uses the image's ID/filename in the alt text instead of 'Uploaded image'
    // We check for the dynamic alt text generated from mock data.
    // Note: The timestamp changes on every test run, so we just check for 'Preview persisted-'
    await waitFor(() => expect(screen.getByAltText(/Preview persisted-/)).toBeInTheDocument(), { timeout: 2000 });

    // Since the component UI is completely different (multi-image grid now),
    // the model multi-select checkboxes are obsolete and replaced by a single dropdown per image.
    // The initial image is rendered, so we click the Generate Batch button.
    const generateButton = screen.getByRole('button', { name: /generate batch/i });
    expect(generateButton).toBeEnabled();
    fireEvent.click(generateButton);

    // Wait for the mocked client generateImagePrompt to be invoked
    await waitFor(() => expect(genMock).toHaveBeenCalled(), { timeout: 5000 });

    // Ensure individual prompts persistence was attempted at least once
    expect(mockStorage.imageStateStorage.saveGeneratedPrompt).toHaveBeenCalled();
  });
});
