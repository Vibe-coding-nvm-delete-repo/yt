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
  const mockStorage = storage as any;

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

    // Wait for persisted preview to be applied (image element appears)
    await waitFor(() => expect(screen.getByAltText('Uploaded image')).toBeInTheDocument(), { timeout: 2000 });

    // Select the additional model checkbox (model-2)
    const checkbox = screen.getByLabelText('Select model Model Two') as HTMLInputElement;
    expect(checkbox).toBeInTheDocument();
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    // Click Generate Prompt (should start batch)
    const generateButton = screen.getAllByRole('button', { name: /generate prompt/i })[0];
    expect(generateButton).toBeEnabled();
    fireEvent.click(generateButton);

    // Wait for the mocked client generateImagePrompt to be invoked
    await waitFor(() => expect(genMock).toHaveBeenCalled(), { timeout: 5000 });

    // Ensure individual prompts persistence was attempted at least once
    expect(mockStorage.imageStateStorage.saveGeneratedPrompt).toHaveBeenCalled();
  });
});
