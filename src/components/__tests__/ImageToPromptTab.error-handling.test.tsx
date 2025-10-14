import { render, screen } from "@testing-library/react";
import ImageToPromptTab from "@/components/ImageToPromptTab";
import type { AppSettings } from "@/types";

/**
 * Minimal smoke test for ImageToPromptTab after main restoration.
 * Keeps assertions UI-stable and avoids coupling to error boundary internals.
 */

describe("ImageToPromptTab (restored)", () => {
  test("renders primary controls", () => {
    const settings: AppSettings = {
      openRouterApiKey: "",
      selectedModel: "",
      selectedVisionModels: [],
      customPrompt:
        "Describe this image in detail and suggest a good prompt for generating similar images.",
      isValidApiKey: false,
      lastApiKeyValidation: null,
      lastModelFetch: null,
      availableModels: [],
      preferredModels: [],
      pinnedModels: [],
    };

    render(<ImageToPromptTab settings={settings} />);

    // Expect the tab header or landmark text to be present
    const nodes = screen.getAllByText(/Image to Prompt/i);
    expect(nodes.length).toBeGreaterThan(0);
  });
});
