import { render, screen } from '@testing-library/react';
import ImageToPromptTab from '@/components/ImageToPromptTab';

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

describe('ImageToPromptTab integration (smoke)', () => {
  it('renders header and model option from settings', () => {
    render(<ImageToPromptTab settings={mockSettings as any} />);
    expect(screen.getByText(/Image to Prompt/i)).toBeInTheDocument();
    // There should be an option rendered for the provided model
    expect(screen.getByRole('option', { name: /Test Model/i })).toBeInTheDocument();
  });
});
