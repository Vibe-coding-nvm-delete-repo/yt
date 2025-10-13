import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageToPromptTab } from '@/components/ImageToPromptTab';
import { renderHook } from '@testing-library/react';
import { useSettings } from '@/hooks/useSettings';

const mockSettings = {
  openRouterApiKey: 'sk-or-v1-testkey-0000000000000000',
  selectedModel: 'test-model',
  availableModels: [
    {
      id: 'test-model',
      name: 'Test Model',
      pricing: { prompt: 0.001, completion: 0.002 },
      supports_image: true,
      supports_vision: true,
    },
  ],
  customPrompt: 'Describe image',
  isValidApiKey: true,
};

jest.mock('@/hooks/useSettings', () => ({
  useSettings: jest.fn(() => ({
    settings: mockSettings,
    updateSettings: mockSettings.updateSettings ?? jest.fn(),
  })),
});

describe('ImageToPromptTab integration', () => {
  test('full image upload and batch generation flow', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = document.createElement('input');
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });

    render(<ImageToPromptTab />);

    // Test file upload
    const fileInputElement = screen.getByLabelText(/Upload images/i);
    fireEvent.change(fileInputElement, {
      target: { files: [mockFile] },
    });

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    // Test batch generation button
    const generateButton = screen.getByRole('button', { name: /Generate Batch/i });
    fireEvent.click(generateButton);

    // Test processing state
    expect(generateButton).toBeDisabled();
    expect(screen.getByText(/Processing\.\.\./i)).toBeInTheDocument();

    // Skip time to allow processing to complete
    await waitFor(() => {
      expect(screen.getByText('done')).toBeInTheDocument();
    });
  });

  test('handles generation error gracefully', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

    render(<ImageToPromptTab />);

    const fileInputElement = screen.getByLabelText(/Upload images/i);
    fireEvent.change(fileInputElement, {
      target: { files: [mockFile] },
    });

    const generateButton = screen.getByRole('button', { name: /Generate Batch/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });
  });

  test('handles no API key state', async () => {
    const mockSettingsNoKey = { ...mockSettings, isValidApiKey: false };
    jest.mock('@/hooks/useSettings', () => ({
      useSettings: jest.fn(() => ({
        settings: mockSettingsNoKey,
        updateSettings: mockSettings.updateSettings ?? jest.fn(),
      })),
    });

    render(<ImageToPromptTab />);

    const generateButton = screen.getByRole('button', { name: /Generate Batch/i });
    expect(generateButton).toBeDisabled();
    expect(screen.getByText(/API Key Required/i)).toBeInTheDocument();
  });

  test('model selection updates correctly', async () => {
    render(<ImageToPromptTab />);

    const modelSelect = screen.getByRole('combobox');
    const option = screen.getByRole('option', { name: /Test Model/i });
    fireEvent.click(modelSelect);
    fireEvent.click(option);

    expect(screen.getByText(/Test Model/)).toBeInTheDocument();
  });
});
