import { render, screen } from "@testing-library/react";
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
  preferredModels: [],
  pinnedModels: [],
  ...overrides,
});

describe("ImageToPromptTab integration", () => {
  it("renders upload area and generate button disabled by default", () => {
    const settings = createSettings();
    render(<ImageToPromptTab settings={settings} />);

    expect(
      screen.getByRole("button", { name: /Generate Batch/i }),
    ).toBeDisabled();
    expect(screen.getByText(/Drop images here/i)).toBeInTheDocument();
  });

  it("shows API key warning when key is not validated", () => {
    const settings = createSettings({ isValidApiKey: false });
    render(<ImageToPromptTab settings={settings} />);

    expect(screen.getByText(/API Key Required/i)).toBeInTheDocument();
  });
});
