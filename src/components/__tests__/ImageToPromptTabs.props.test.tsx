import React from "react";
import { render, screen } from "@testing-library/react";
import ImageToPromptTabs from "@/components/ImageToPromptTabs";
import * as useSettingsModule from "@/hooks/useSettings";
import type { AppSettings } from "@/types";

describe("ImageToPromptTabs", () => {
  test("passes settings into ImageToPromptTab when generate is active", () => {
    const mockSettings: AppSettings = {
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

    jest.spyOn(useSettingsModule, "useSettings").mockReturnValue({
      settings: mockSettings,
      isInitialized: true,
      updateSettings: jest.fn(),
      updateApiKey: jest.fn(),
      validateApiKey: jest.fn(),
      updateSelectedModel: jest.fn(),
      updateCustomPrompt: jest.fn(),
      updateModels: jest.fn(),
      updatePinnedModels: jest.fn(),
      pinModel: jest.fn(),
      unpinModel: jest.fn(),
      togglePinnedModel: jest.fn(),
      clearSettings: jest.fn(),
      shouldRefreshModels: jest.fn(),
      getModelById: jest.fn(),
      getSelectedModel: jest.fn(),
      getPinnedModels: jest.fn(),
      subscribe: jest.fn(),
    } as unknown as ReturnType<typeof useSettingsModule.useSettings>);

    render(<ImageToPromptTabs />);

    // The h1 in ImageToPromptTab should render, meaning component mounted with settings
    expect(
      screen.getByRole("heading", { name: /Image to Prompt/i }),
    ).toBeInTheDocument();
  });
});
