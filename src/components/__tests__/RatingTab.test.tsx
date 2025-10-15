import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RatingTab } from "../RatingTab";
import { ratingStorage } from "@/lib/ratingStorage";
import type { Rating } from "@/types";

// Mock the rating storage
jest.mock("@/lib/ratingStorage", () => ({
  ratingStorage: {
    getAllRatings: jest.fn(),
    getFilteredRatings: jest.fn(),
    getStats: jest.fn(),
    deleteRating: jest.fn(),
    clearAllRatings: jest.fn(),
  },
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
  },
}));

describe("RatingTab", () => {
  const mockRatings: Rating[] = [
    {
      id: "rating-1",
      historyEntryId: "history-1",
      modelId: "model-1",
      modelName: "Test Model 1",
      stars: 5,
      thumbs: "up",
      comment: "Great output!",
      imagePreview: "data:image/png;base64,test",
      prompt: "Test prompt 1",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "rating-2",
      historyEntryId: "history-2",
      modelId: "model-2",
      modelName: "Test Model 2",
      stars: 3,
      thumbs: "down",
      comment: null,
      imagePreview: null,
      prompt: "Test prompt 2",
      createdAt: Date.now() - 1000,
      updatedAt: Date.now() - 1000,
    },
  ];

  const mockStats = {
    totalRatings: 2,
    averageStars: 4.0,
    thumbsUp: 1,
    thumbsDown: 1,
    byModel: {
      "model-1": {
        modelName: "Test Model 1",
        count: 1,
        averageStars: 5.0,
        thumbsUp: 1,
        thumbsDown: 0,
      },
      "model-2": {
        modelName: "Test Model 2",
        count: 1,
        averageStars: 3.0,
        thumbsUp: 0,
        thumbsDown: 1,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ratingStorage.getFilteredRatings as jest.Mock).mockReturnValue(
      mockRatings,
    );
    (ratingStorage.getStats as jest.Mock).mockReturnValue(mockStats);
    (ratingStorage.getAllRatings as jest.Mock).mockReturnValue(mockRatings);
  });

  it("renders rating statistics correctly", () => {
    render(<RatingTab />);

    expect(screen.getByText("Total Ratings")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // Total ratings
    expect(screen.getByText("4.0")).toBeInTheDocument(); // Average stars
    // Check for thumbs counts within their specific contexts
    expect(screen.getByText("Thumbs Up")).toBeInTheDocument();
    expect(screen.getByText("Thumbs Down")).toBeInTheDocument();
  });

  it("displays ratings list", () => {
    render(<RatingTab />);

    // Model names appear multiple times in the UI
    expect(screen.getAllByText(/Test Model 1/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Test Model 2/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Great output!")).toBeInTheDocument();
  });

  it("shows empty state when no ratings exist", () => {
    (ratingStorage.getFilteredRatings as jest.Mock).mockReturnValue([]);
    (ratingStorage.getStats as jest.Mock).mockReturnValue({
      totalRatings: 0,
      averageStars: 0,
      thumbsUp: 0,
      thumbsDown: 0,
      byModel: {},
    });

    render(<RatingTab />);

    expect(screen.getByText(/No ratings yet/i)).toBeInTheDocument();
  });

  it("toggles filter panel", () => {
    render(<RatingTab />);

    const filterButton = screen.getByText(/Show Filters/i);
    fireEvent.click(filterButton);

    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("Model")).toBeInTheDocument();

    fireEvent.click(filterButton);
    expect(screen.queryByText("Filters")).not.toBeInTheDocument();
  });

  it("deletes a rating when confirmed", async () => {
    global.confirm = jest.fn(() => true);
    (ratingStorage.deleteRating as jest.Mock).mockReturnValue(true);

    render(<RatingTab />);

    const deleteButtons = screen.getAllByTitle("Delete rating");
    const firstButton = deleteButtons[0];
    if (firstButton) {
      fireEvent.click(firstButton);
    }

    expect(global.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this rating?",
    );
    expect(ratingStorage.deleteRating).toHaveBeenCalledWith("rating-1");
  });

  it("does not delete rating when cancelled", () => {
    global.confirm = jest.fn(() => false);

    render(<RatingTab />);

    const deleteButtons = screen.getAllByTitle("Delete rating");
    const firstButton = deleteButtons[0];
    if (firstButton) {
      fireEvent.click(firstButton);
    }

    expect(ratingStorage.deleteRating).not.toHaveBeenCalled();
  });

  it("clears all ratings when confirmed", () => {
    global.confirm = jest.fn(() => true);

    render(<RatingTab />);

    const clearButton = screen.getByText("Clear All Ratings");
    fireEvent.click(clearButton);

    expect(ratingStorage.clearAllRatings).toHaveBeenCalled();
  });

  it("displays model statistics correctly", () => {
    render(<RatingTab />);

    // Model names appear multiple times (in list and in stats)
    expect(screen.getAllByText(/Test Model 1/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Test Model 2/i).length).toBeGreaterThan(0);
    expect(screen.getByText("5.0")).toBeInTheDocument();
    expect(screen.getByText("3.0")).toBeInTheDocument();
  });
});
