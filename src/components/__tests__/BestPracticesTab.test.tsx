import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BestPracticesTab } from "../BestPracticesTab";
import { bestPracticesStorage } from "@/lib/bestPracticesStorage";

// Mock the storage
jest.mock("@/lib/bestPracticesStorage", () => ({
  bestPracticesStorage: {
    subscribe: jest.fn((callback) => {
      callback([]);
      return jest.fn(); // unsubscribe function
    }),
    createPractice: jest.fn(),
    updatePractice: jest.fn(),
    deletePractice: jest.fn(),
    getPractices: jest.fn(() => []),
  },
}));

describe("BestPracticesTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the component with title", () => {
    render(<BestPracticesTab />);
    expect(screen.getByText("Best Practices")).toBeInTheDocument();
  });

  it("should render all subtabs", () => {
    render(<BestPracticesTab />);
    expect(screen.getByText(/All \(\d+\)/)).toBeInTheDocument();
    expect(screen.getByText(/Words\/Phrases \(\d+\)/)).toBeInTheDocument();
    expect(screen.getByText(/Photography \(\d+\)/)).toBeInTheDocument();
    expect(screen.getByText(/Youtube Engagement \(\d+\)/)).toBeInTheDocument();
    expect(screen.getByText(/Youtube Thumbnail \(\d+\)/)).toBeInTheDocument();
    expect(screen.getByText(/Our Unique Channel \(\d+\)/)).toBeInTheDocument();
  });

  it("should show empty state when no practices exist", () => {
    render(<BestPracticesTab />);
    expect(screen.getByText(/No best practices yet/i)).toBeInTheDocument();
  });

  it("should open create dropdown when Create button is clicked", () => {
    render(<BestPracticesTab />);
    const createButton = screen.getByText("Create");
    fireEvent.click(createButton);

    // Check that dropdown options appear
    const wordsPhrasesOptions = screen.getAllByText(/Words\/Phrases/);
    expect(wordsPhrasesOptions.length).toBeGreaterThan(1);
  });

  it("should render subtabs", () => {
    render(<BestPracticesTab />);

    // All subtabs should be visible
    expect(screen.getByText(/All \(\d+\)/)).toBeInTheDocument();
    const photographyOptions = screen.getAllByText(/Photography/);
    expect(photographyOptions.length).toBeGreaterThan(0);
  });

  it("should display practices when they exist", () => {
    const mockPractices = [
      {
        id: "1",
        name: "Test Practice",
        description: "Test Description",
        leonardoAiLanguage: "Test Language",
        images: [],
        importance: 5,
        type: "mandatory" as const,
        typeExplanation: "Test Explanation",
        category: "words-phrases" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    (bestPracticesStorage.subscribe as jest.Mock).mockImplementation(
      (callback) => {
        callback(mockPractices);
        return jest.fn();
      },
    );

    render(<BestPracticesTab />);

    expect(screen.getByText("Test Practice")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("should filter practices by category when subtab is clicked", () => {
    const mockPractices = [
      {
        id: "1",
        name: "Words Practice",
        description: "Words Description",
        leonardoAiLanguage: "",
        images: [],
        importance: 5,
        type: "mandatory" as const,
        typeExplanation: "",
        category: "words-phrases" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "2",
        name: "Photography Practice",
        description: "Photography Description",
        leonardoAiLanguage: "",
        images: [],
        importance: 5,
        type: "optional" as const,
        typeExplanation: "",
        category: "photography" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    (bestPracticesStorage.subscribe as jest.Mock).mockImplementation(
      (callback) => {
        callback(mockPractices);
        return jest.fn();
      },
    );

    render(<BestPracticesTab />);

    // Initially both should be visible (All tab)
    expect(screen.getByText("Words Practice")).toBeInTheDocument();
    expect(screen.getByText("Photography Practice")).toBeInTheDocument();

    // Click on Words/Phrases subtab
    const subtab = screen.getByText(/Words\/Phrases \(1\)/);
    if (subtab) {
      fireEvent.click(subtab);
    }

    // Only Words Practice should be visible
    expect(screen.getByText("Words Practice")).toBeInTheDocument();
    expect(screen.queryByText("Photography Practice")).not.toBeInTheDocument();
  });

  it("should render modal components", () => {
    render(<BestPracticesTab />);

    // Component renders successfully
    expect(screen.getByText("Best Practices")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  it("should initialize with storage", () => {
    render(<BestPracticesTab />);

    // Storage subscribe should be called
    expect(bestPracticesStorage.subscribe).toHaveBeenCalled();
  });
});
