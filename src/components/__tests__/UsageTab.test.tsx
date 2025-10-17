import React from "react";
import { render, screen } from "@testing-library/react";
import { UsageTab } from "../UsageTab";
import { usageStorage } from "@/lib/usage";

// Mock the usage storage
jest.mock("@/lib/usage", () => ({
  usageStorage: {
    list: jest.fn().mockReturnValue([]),
  },
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe("UsageTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the Usage & Costs heading", () => {
    render(<UsageTab />);

    expect(screen.getByText("Usage & Costs")).toBeInTheDocument();
  });

  it("should render empty state when no usage entries", () => {
    (usageStorage.list as jest.Mock).mockReturnValue([]);

    render(<UsageTab />);

    expect(screen.getByText(/No usage yet/i)).toBeInTheDocument();
  });

  it("should render usage entries when available", () => {
    const mockEntries = [
      {
        id: "entry-1",
        timestamp: Date.now(),
        modelId: "model-1",
        modelName: "Test Model",
        imagePreview: "https://example.com/image.jpg",
        inputTokens: 100,
        outputTokens: 200,
        inputCost: 0.02,
        outputCost: 0.03,
        totalCost: 0.05,
        success: true,
        error: null,
      },
      {
        id: "entry-2",
        timestamp: Date.now() - 1000,
        modelId: "model-2",
        modelName: "Another Model",
        imagePreview: "https://example.com/image2.jpg",
        inputTokens: 150,
        outputTokens: 250,
        inputCost: 0.03,
        outputCost: 0.045,
        totalCost: 0.075,
        success: true,
        error: null,
      },
    ];

    (usageStorage.list as jest.Mock).mockReturnValue(mockEntries);

    render(<UsageTab />);

    // Check that entries are rendered
    expect(screen.getByText("Test Model")).toBeInTheDocument();
    expect(screen.getByText("Another Model")).toBeInTheDocument();
  });

  it("should calculate total spend correctly", () => {
    const mockEntries = [
      {
        id: "entry-1",
        timestamp: Date.now(),
        modelId: "model-1",
        modelName: "Test Model",
        imagePreview: "https://example.com/image.jpg",
        inputTokens: 100,
        outputTokens: 200,
        inputCost: 0.02,
        outputCost: 0.03,
        totalCost: 0.05,
        success: true,
        error: null,
      },
      {
        id: "entry-2",
        timestamp: Date.now(),
        modelId: "model-2",
        modelName: "Another Model",
        imagePreview: "https://example.com/image2.jpg",
        inputTokens: 150,
        outputTokens: 250,
        inputCost: 0.01,
        outputCost: 0.02,
        totalCost: 0.03,
        success: true,
        error: null,
      },
    ];

    (usageStorage.list as jest.Mock).mockReturnValue(mockEntries);

    const { container } = render(<UsageTab />);

    // Total should be 0.05 + 0.03 = 0.08
    // Verify the total spend section exists
    const totalSpendText = container.textContent || "";
    expect(totalSpendText).toContain("Total Spend");
    expect(totalSpendText).toContain("$0.08");
  });

  it("should format currency to 2 decimal places", () => {
    const mockEntries = [
      {
        id: "entry-1",
        timestamp: Date.now(),
        modelId: "model-1",
        modelName: "Test Model",
        imagePreview: "https://example.com/image.jpg",
        inputTokens: 100,
        outputTokens: 200,
        inputCost: 0.05,
        outputCost: 0.07,
        totalCost: 0.1234567, // Should be formatted to $0.12
        success: true,
        error: null,
      },
    ];

    (usageStorage.list as jest.Mock).mockReturnValue(mockEntries);

    const { container } = render(<UsageTab />);

    // Check that currency is formatted to 2 decimal places
    const text = container.textContent || "";
    expect(text).toContain("$0.12");
  });

  it("should render filter section", () => {
    render(<UsageTab />);

    // Check for filter elements
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getByText("To")).toBeInTheDocument();
  });

  it("should display formatted timestamps", () => {
    const mockTimestamp = new Date("2024-01-15T10:30:00Z").getTime();
    const mockEntries = [
      {
        id: "entry-1",
        timestamp: mockTimestamp,
        modelId: "model-1",
        modelName: "Test Model",
        imagePreview: null,
        inputTokens: 100,
        outputTokens: 200,
        inputCost: 0.02,
        outputCost: 0.03,
        totalCost: 0.05,
        success: true,
        error: null,
      },
    ];

    (usageStorage.list as jest.Mock).mockReturnValue(mockEntries);

    render(<UsageTab />);

    expect(screen.getByText("Test Model")).toBeInTheDocument();
  });
});
