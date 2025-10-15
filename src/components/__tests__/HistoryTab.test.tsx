import React from "react";
import { render, screen } from "@testing-library/react";
import { HistoryTab } from "../HistoryTab";
import { useHistory } from "@/hooks/useHistory";
import { useSettings } from "@/hooks/useSettings";

// Mock hooks
jest.mock("@/hooks/useHistory");
jest.mock("@/hooks/useSettings");

const mockUseHistory = useHistory as jest.MockedFunction<typeof useHistory>;
const mockUseSettings = useSettings as jest.MockedFunction<typeof useSettings>;

describe("HistoryTab", () => {
  beforeEach(() => {
    mockUseSettings.mockReturnValue({
      settings: {
        availableModels: [],
        openRouterApiKey: "",
        isValidApiKey: false,
        selectedVisionModels: [],
        customPrompt: "",
        categories: [],
        pinnedModels: [],
      },
      isInitialized: true,
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no entries exist", () => {
    mockUseHistory.mockReturnValue({
      entries: [],
      filterModelIds: [],
      addEntry: jest.fn(),
      setFilterModelIds: jest.fn(),
    });

    render(<HistoryTab />);

    expect(screen.getByText("Generation History")).toBeInTheDocument();
    expect(screen.getByText("No history entries found.")).toBeInTheDocument();
  });

  it("renders history entries in table format", () => {
    const mockEntries = [
      {
        id: "1",
        imageUrl: "data:image/png;base64,test",
        prompt: "A test prompt",
        charCount: 13,
        totalCost: 0.001234,
        inputTokens: 100,
        outputTokens: 50,
        inputCost: 0.0001,
        outputCost: 0.0002,
        modelId: "model-1",
        modelName: "Test Model",
        createdAt: Date.now(),
      },
    ];

    mockUseHistory.mockReturnValue({
      entries: mockEntries,
      filterModelIds: [],
      addEntry: jest.fn(),
      setFilterModelIds: jest.fn(),
    });

    render(<HistoryTab />);

    expect(screen.getByText("Test Model")).toBeInTheDocument();
    expect(screen.getByText("A test prompt")).toBeInTheDocument();
  });

  it("displays table headers correctly", () => {
    mockUseHistory.mockReturnValue({
      entries: [],
      filterModelIds: [],
      addEntry: jest.fn(),
      setFilterModelIds: jest.fn(),
    });

    render(<HistoryTab />);

    expect(screen.getByText("Date/Time")).toBeInTheDocument();
    expect(screen.getByText("Model")).toBeInTheDocument();
    expect(screen.getByText("Image")).toBeInTheDocument();
    expect(screen.getByText("Prompt")).toBeInTheDocument();
    expect(screen.getByText("Input Tokens")).toBeInTheDocument();
    expect(screen.getByText("Output Tokens")).toBeInTheDocument();
    expect(screen.getByText("Input Cost")).toBeInTheDocument();
    expect(screen.getByText("Output Cost")).toBeInTheDocument();
    expect(screen.getByText("Total Cost")).toBeInTheDocument();
  });
});
