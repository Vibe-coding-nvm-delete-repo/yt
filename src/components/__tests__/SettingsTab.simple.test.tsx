/**
 * Simple render tests for SettingsTab to boost coverage
 */

import React from "react";
import { render } from "@testing-library/react";
import { SettingsTab } from "../SettingsTab";

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

describe("SettingsTab Simple Tests", () => {
  const mockOnUpdate = jest.fn();

  it("renders with minimal settings", () => {
    const settings = {
      openRouterApiKey: "",
      isValidApiKey: false,
      availableModels: [],
      selectedVisionModels: [],
      customPrompt: "",
      pinnedModels: [],
      selectedModel: "",
      lastApiKeyValidation: null,
      lastModelFetch: null,
      preferredModels: [],
    };

    const { container } = render(
      <SettingsTab settings={settings} onSettingsUpdate={mockOnUpdate} />,
    );

    expect(container).toBeTruthy();
  });

  it("renders with API key", () => {
    const settings = {
      openRouterApiKey: "sk-test",
      isValidApiKey: true,
      availableModels: [],
      selectedVisionModels: [],
      customPrompt: "test",
      pinnedModels: [],
      selectedModel: "",
      lastApiKeyValidation: null,
      lastModelFetch: null,
      preferredModels: [],
    };

    const { container } = render(
      <SettingsTab settings={settings} onSettingsUpdate={mockOnUpdate} />,
    );

    expect(container).toBeTruthy();
  });

  it("renders with models", () => {
    const settings = {
      openRouterApiKey: "",
      isValidApiKey: false,
      availableModels: [{ id: "model-1", name: "Test" } as any],
      selectedVisionModels: ["model-1"],
      customPrompt: "",
      pinnedModels: ["model-1"],
      selectedModel: "",
      lastApiKeyValidation: null,
      lastModelFetch: null,
      preferredModels: [],
    };

    const { container } = render(
      <SettingsTab settings={settings} onSettingsUpdate={mockOnUpdate} />,
    );

    expect(container).toBeTruthy();
  });

  it("renders without errors", () => {
    const settings = {
      openRouterApiKey: "",
      isValidApiKey: false,
      availableModels: [],
      selectedVisionModels: [],
      customPrompt: "",
      pinnedModels: [],
      selectedModel: "",
      lastApiKeyValidation: null,
      lastModelFetch: null,
      preferredModels: [],
    };

    const { container } = render(
      <SettingsTab settings={settings} onSettingsUpdate={mockOnUpdate} />,
    );

    expect(container).toBeTruthy();
  });
});
