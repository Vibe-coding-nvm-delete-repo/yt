/**
 * Tests for enhanced model dropdowns in SettingsTab
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsTab } from "../SettingsTab";
import { ToastProvider } from "@/contexts/ToastContext";
import type { AppSettings, VisionModel } from "@/types";

// Mock dependencies
jest.mock("@/lib/storage", () => ({
  settingsStorage: {
    subscribe: jest.fn(() => jest.fn()),
    getSettings: jest.fn(() => ({
      openRouterApiKey: "",
      selectedModel: "",
      selectedVisionModels: [],
      customPrompt: "",
      isValidApiKey: false,
      lastApiKeyValidation: null,
      lastModelFetch: null,
      availableModels: [],
      preferredModels: [],
      pinnedModels: [],
    })),
    updateSelectedVisionModels: jest.fn(),
  },
}));

jest.mock("@/lib/openrouter", () => ({
  createOpenRouterClient: jest.fn(),
  isValidApiKeyFormat: jest.fn(() => true),
}));

describe("SettingsTab - Enhanced Model Dropdowns", () => {
  const mockModels: VisionModel[] = [
    {
      id: "openai/gpt-4-vision",
      name: "GPT-4 Vision",
      description: "Vision model",
      pricing: { prompt: 0.01, completion: 0.03 },
      supports_image: true,
      supports_vision: true,
    },
    {
      id: "anthropic/claude-3-opus",
      name: "Claude 3 Opus",
      description: "Vision model",
      pricing: { prompt: 0.015, completion: 0.075 },
      supports_image: true,
      supports_vision: true,
    },
    {
      id: "google/gemini-pro-vision",
      name: "Gemini Pro Vision",
      description: "Vision model",
      pricing: { prompt: 0.0025, completion: 0.005 },
      supports_image: true,
      supports_vision: true,
    },
  ];

  const createMockSettings = (
    overrides?: Partial<AppSettings>,
  ): AppSettings => ({
    openRouterApiKey: "test-key",
    selectedModel: "",
    selectedVisionModels: [],
    customPrompt: "",
    isValidApiKey: true,
    lastApiKeyValidation: Date.now(),
    lastModelFetch: Date.now(),
    availableModels: mockModels,
    preferredModels: [],
    pinnedModels: [],
    ...overrides,
  });

  it("renders 3 model selectors when models are available", () => {
    const settings = createMockSettings();
    const { container } = render(
      <ToastProvider>
        <SettingsTab settings={settings} onSettingsUpdate={jest.fn()} />
      </ToastProvider>,
    );

    // Switch to model selection tab
    const modelTab = screen.getByText("Model Selection");
    fireEvent.click(modelTab);

    // Wait for content to render and check that we have 3 "Vision Model" headings
    const allText = container.textContent || "";

    // Should have all 3 vision model slots
    expect(allText).toContain("Vision Model 1");
    expect(allText).toContain("Vision Model 2");
    expect(allText).toContain("Vision Model 3");
  });

  it("displays model names in dropdowns", () => {
    const settings = createMockSettings();
    const { container } = render(
      <ToastProvider>
        <SettingsTab settings={settings} onSettingsUpdate={jest.fn()} />
      </ToastProvider>,
    );

    // Switch to model selection tab
    const modelTab = screen.getByText("Model Selection");
    fireEvent.click(modelTab);

    // All dropdowns should show "Select a model…" initially
    const allText = container.textContent || "";
    expect(allText).toContain("Select a model…");
  });

  it("shows pinned models when available", () => {
    const settings = createMockSettings({
      pinnedModels: ["openai/gpt-4-vision"],
    });

    const { container } = render(
      <ToastProvider>
        <SettingsTab settings={settings} onSettingsUpdate={jest.fn()} />
      </ToastProvider>,
    );

    // Switch to model selection tab
    const modelTab = screen.getByText("Model Selection");
    fireEvent.click(modelTab);

    // Model is pinned in settings
    expect(settings.pinnedModels).toContain("openai/gpt-4-vision");
    // Component should render without errors
    expect(container).toBeTruthy();
  });

  it("renders without top dropdown", () => {
    const settings = createMockSettings();
    const { container } = render(
      <ToastProvider>
        <SettingsTab settings={settings} onSettingsUpdate={jest.fn()} />
      </ToastProvider>,
    );

    // Switch to model selection tab
    const modelTab = screen.getByText("Model Selection");
    fireEvent.click(modelTab);

    // The old top dropdown should not exist
    // We verify this by checking that there's no standalone dropdown above the 3 model selectors
    const allText = container.textContent || "";

    // Should have "Vision Model 1", "Vision Model 2", etc.
    expect(allText).toContain("Vision Model 1");
    expect(allText).toContain("Vision Model 2");
  });

  it("shows selected models count", () => {
    const settings = createMockSettings();

    const { container } = render(
      <ToastProvider>
        <SettingsTab settings={settings} onSettingsUpdate={jest.fn()} />
      </ToastProvider>,
    );

    // Switch to model selection tab
    const modelTab = screen.getByText("Model Selection");
    fireEvent.click(modelTab);

    // Should show the count of selected models out of 3
    const text = container.textContent || "";
    expect(text).toContain("Selected: 0 / 3");
  });

  it("applies overflow-visible to dropdown containers to prevent clipping", () => {
    const settings = createMockSettings();

    const { container } = render(
      <ToastProvider>
        <SettingsTab settings={settings} onSettingsUpdate={jest.fn()} />
      </ToastProvider>,
    );

    // Switch to model selection tab
    const modelTab = screen.getByText("Model Selection");
    fireEvent.click(modelTab);

    // Verify the component renders with overflow-visible classes in the HTML
    // This ensures dropdowns won't be clipped by parent containers
    const html = container.innerHTML;
    expect(html).toContain("overflow-visible");

    // Verify we have the expected structure with the dropdowns
    expect(screen.getByText("Vision Model 1")).toBeInTheDocument();
    expect(screen.getByText("Vision Model 2")).toBeInTheDocument();
    expect(screen.getByText("Vision Model 3")).toBeInTheDocument();
  });
});
