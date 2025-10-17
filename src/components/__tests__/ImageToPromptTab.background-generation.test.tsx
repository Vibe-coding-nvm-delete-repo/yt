import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ImageToPromptTab } from "../ImageToPromptTab";
import { imageStateStorage } from "@/lib/storage";
import { createOpenRouterClient } from "@/lib/openrouter";
import type { AppSettings, ModelResult } from "@/types";

// Mock dependencies
jest.mock("@/lib/openrouter");
jest.mock("@/lib/storage");

const mockSettings: AppSettings = {
  openRouterApiKey: "test-api-key",
  selectedModel: "test-model",
  selectedVisionModels: ["model-1", "model-2"],
  activeModels: ["model-1", "model-2"],
  customPrompt: "Test prompt",
  isValidApiKey: true,
  lastApiKeyValidation: Date.now(),
  lastModelFetch: Date.now(),
  availableModels: [
    {
      id: "model-1",
      name: "Model 1",
      pricing: { prompt: 0.001, completion: 0.002 },
    },
    {
      id: "model-2",
      name: "Model 2",
      pricing: { prompt: 0.0015, completion: 0.0025 },
    },
  ],
  preferredModels: [],
  pinnedModels: [],
};

describe("ImageToPromptTab - Background Generation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // Mock imageStateStorage methods
    (imageStateStorage.getImageState as jest.Mock).mockReturnValue({
      preview: null,
      fileName: null,
      fileSize: null,
      fileType: null,
      generatedPrompt: null,
      modelResults: [],
      isGenerating: false,
      schemaVersion: 1,
    });
    (imageStateStorage.saveModelResults as jest.Mock).mockImplementation(
      () => {},
    );
    (imageStateStorage.saveGenerationStatus as jest.Mock).mockImplementation(
      () => {},
    );
    (imageStateStorage.saveUploadedImage as jest.Mock).mockImplementation(
      () => {},
    );
    (imageStateStorage.clearImageState as jest.Mock).mockImplementation(
      () => {},
    );
  });

  it("should persist model results during generation", async () => {
    const mockGenerateImagePrompt = jest
      .fn()
      .mockResolvedValueOnce("Generated prompt 1")
      .mockResolvedValueOnce("Generated prompt 2");

    (createOpenRouterClient as jest.Mock).mockReturnValue({
      generateImagePrompt: mockGenerateImagePrompt,
    });

    // Mock initial state with uploaded image
    (imageStateStorage.getImageState as jest.Mock).mockReturnValue({
      preview: "data:image/png;base64,test",
      fileName: "test.png",
      fileSize: 1024,
      fileType: "image/png",
      generatedPrompt: null,
      modelResults: [],
      isGenerating: false,
      schemaVersion: 1,
    });

    render(<ImageToPromptTab settings={mockSettings} />);

    // Find and click the Generate button
    const generateButton = screen.getByRole("button", { name: /generate/i });
    fireEvent.click(generateButton);

    // Wait for generation to start
    await waitFor(() => {
      expect(imageStateStorage.saveGenerationStatus).toHaveBeenCalledWith(true);
    });

    // Verify that model results are persisted during generation
    await waitFor(
      () => {
        expect(imageStateStorage.saveModelResults).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    // Verify generation completion status is persisted
    await waitFor(
      () => {
        expect(imageStateStorage.saveGenerationStatus).toHaveBeenCalledWith(
          false,
        );
      },
      { timeout: 5000 },
    );
  });

  it("should restore model results from storage on mount", () => {
    const persistedResults: ModelResult[] = [
      {
        modelId: "model-1",
        modelName: "Model 1",
        prompt: "Persisted prompt 1",
        cost: 0.001,
        inputTokens: 100,
        outputTokens: 50,
        inputCost: 0.0001,
        outputCost: 0.0001,
        isProcessing: false,
        error: null,
      },
      {
        modelId: "model-2",
        modelName: "Model 2",
        prompt: "Persisted prompt 2",
        cost: 0.0015,
        inputTokens: 100,
        outputTokens: 50,
        inputCost: 0.00015,
        outputCost: 0.000125,
        isProcessing: false,
        error: null,
      },
    ];

    (imageStateStorage.getImageState as jest.Mock).mockReturnValue({
      preview: "data:image/png;base64,test",
      fileName: "test.png",
      fileSize: 1024,
      fileType: "image/png",
      generatedPrompt: null,
      modelResults: persistedResults,
      isGenerating: false,
      schemaVersion: 1,
    });

    render(<ImageToPromptTab settings={mockSettings} />);

    // Verify that persisted prompts are displayed
    expect(screen.getByText("Persisted prompt 1")).toBeInTheDocument();
    expect(screen.getByText("Persisted prompt 2")).toBeInTheDocument();
  });

  it("should clear stale generation status and isProcessing flags on mount", () => {
    (imageStateStorage.getImageState as jest.Mock).mockReturnValue({
      preview: "data:image/png;base64,test",
      fileName: "test.png",
      fileSize: 1024,
      fileType: "image/png",
      generatedPrompt: null,
      modelResults: [
        {
          modelId: "model-1",
          modelName: "Model 1",
          prompt: null,
          cost: null,
          inputTokens: null,
          outputTokens: null,
          inputCost: null,
          outputCost: null,
          isProcessing: true, // This should be cleared
          error: null,
        },
        {
          modelId: "model-2",
          modelName: "Model 2",
          prompt: "Generated prompt",
          cost: 0.001,
          inputTokens: 100,
          outputTokens: 50,
          inputCost: 0.0001,
          outputCost: 0.0001,
          isProcessing: true, // This should also be cleared
          error: null,
        },
      ],
      isGenerating: true,
      schemaVersion: 1,
    });

    render(<ImageToPromptTab settings={mockSettings} />);

    // Verify that stale generation status is cleared on mount
    expect(imageStateStorage.saveGenerationStatus).toHaveBeenCalledWith(false);

    // Verify that all isProcessing flags are cleared from model results
    expect(imageStateStorage.saveModelResults).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          modelId: "model-1",
          isProcessing: false,
        }),
        expect.objectContaining({
          modelId: "model-2",
          isProcessing: false,
        }),
      ]),
    );
  });

  it("should clear generation status and isProcessing flags when component unmounts", () => {
    const mockModelResults = [
      {
        modelId: "model-1",
        modelName: "Model 1",
        prompt: null,
        cost: null,
        inputTokens: null,
        outputTokens: null,
        inputCost: null,
        outputCost: null,
        isProcessing: true, // Simulating active generation
        error: null,
      },
    ];

    (imageStateStorage.getImageState as jest.Mock).mockReturnValue({
      preview: "data:image/png;base64,test",
      fileName: "test.png",
      fileSize: 1024,
      fileType: "image/png",
      generatedPrompt: null,
      modelResults: mockModelResults,
      isGenerating: false,
      schemaVersion: 1,
    });

    const { unmount } = render(<ImageToPromptTab settings={mockSettings} />);

    // Clear previous calls from mount
    jest.clearAllMocks();

    // Ensure getImageState returns the model results for the cleanup
    (imageStateStorage.getImageState as jest.Mock).mockReturnValue({
      preview: "data:image/png;base64,test",
      fileName: "test.png",
      fileSize: 1024,
      fileType: "image/png",
      generatedPrompt: null,
      modelResults: mockModelResults,
      isGenerating: false,
      schemaVersion: 1,
    });

    // Unmount the component
    unmount();

    // Verify generation status is cleared on unmount
    expect(imageStateStorage.saveGenerationStatus).toHaveBeenCalledWith(false);

    // Verify all isProcessing flags are cleared on unmount
    expect(imageStateStorage.saveModelResults).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          modelId: "model-1",
          isProcessing: false,
        }),
      ]),
    );
  });

  // Note: File upload persistence is tested via integration tests
  // This unit test focuses on the core persistence logic

  it("should persist error states during generation", async () => {
    const mockGenerateImagePrompt = jest
      .fn()
      .mockRejectedValueOnce(new Error("API Error"));

    (createOpenRouterClient as jest.Mock).mockReturnValue({
      generateImagePrompt: mockGenerateImagePrompt,
    });

    (imageStateStorage.getImageState as jest.Mock).mockReturnValue({
      preview: "data:image/png;base64,test",
      fileName: "test.png",
      fileSize: 1024,
      fileType: "image/png",
      generatedPrompt: null,
      modelResults: [],
      isGenerating: false,
      schemaVersion: 1,
    });

    render(<ImageToPromptTab settings={mockSettings} />);

    const generateButton = screen.getByRole("button", { name: /generate/i });
    fireEvent.click(generateButton);

    // Verify that error is persisted
    await waitFor(
      () => {
        const calls = (imageStateStorage.saveModelResults as jest.Mock).mock
          .calls;
        const hasErrorState = calls.some((call) =>
          call[0].some((result: ModelResult) => result.error !== null),
        );
        expect(hasErrorState).toBe(true);
      },
      { timeout: 3000 },
    );
  });
});
