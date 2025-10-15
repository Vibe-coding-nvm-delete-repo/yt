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
      historyModelOptions: [],
    });

    render(<HistoryTab />);

    expect(screen.getByText("History")).toBeInTheDocument();
    expect(
      screen.getByText("No history yet. Generate prompts to see entries here."),
    ).toBeInTheDocument();
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
      historyModelOptions: [{ id: "model-1", name: "Test Model" }],
    });

    render(<HistoryTab />);

    // Check that history entries are displayed
    expect(screen.getByText("A test prompt")).toBeInTheDocument();
    expect(screen.getAllByText(/Test Model/i).length).toBeGreaterThan(0);
  });

  it("displays filter controls", () => {
    mockUseHistory.mockReturnValue({
      entries: [],
      filterModelIds: [],
      addEntry: jest.fn(),
      setFilterModelIds: jest.fn(),
      historyModelOptions: [],
    });

    render(<HistoryTab />);

    // Check that filter section exists
    expect(screen.getByText("Filter")).toBeInTheDocument();
  });
});
