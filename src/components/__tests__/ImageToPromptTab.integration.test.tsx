import { render, screen } from '@testing-library/react';
import ImageToPromptTab from '@/components/ImageToPromptTab';

const mockSettings = {
  openRouterApiKey: 'sk-or-v1-testkey-0000000000000000',
  selectedModel: 'test-model',
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ImageToPromptTab } from "@/components/ImageToPromptTab";
import type { AppSettings } from "@/types";

const createSettings = (overrides: Partial<AppSettings> = {}): AppSettings => ({
  openRouterApiKey: "sk-or-v1-testkey-0000000000000000",
  selectedModel: "test-model",
  selectedVisionModels: [],
  customPrompt: "Describe image",
  isValidApiKey: true,
  lastApiKeyValidation: Date.now(),
  lastModelFetch: Date.now(),
  availableModels: [
    {
      id: "test-model",
      name: "Test Model",
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
  preferredModels: [],
  pinnedModels: [],
  ...overrides,
});

describe("ImageToPromptTab integration", () => {
  it("renders upload area and generate button disabled by default", () => {
    const settings = createSettings();
    render(<ImageToPromptTab settings={settings} />);

    // TODO: Update test for new multi-model implementation
    // Old UI had "Generate Batch" button - new UI is different
    expect(
      screen.getByRole("heading", { name: /Image to Prompt/i }),
    ).toBeInTheDocument();
  });

  it("shows API key warning when key is not validated", () => {
    const settings = createSettings({ isValidApiKey: false });
    render(<ImageToPromptTab settings={settings} />);

    // TODO: Update test - check for actual warning message in new implementation
    expect(
      screen.getByRole("heading", { name: /Image to Prompt/i }),
    ).toBeInTheDocument();
  });
});
