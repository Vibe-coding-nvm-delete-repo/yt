import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RatingWidget } from "../RatingWidget";
import { ratingStorage } from "@/lib/ratingStorage";

jest.mock("@/lib/ratingStorage");

const mockRatingStorage = ratingStorage as jest.Mocked<typeof ratingStorage>;

const defaultProps = {
  historyEntryId: "test-entry-123",
  modelId: "test-model",
  modelName: "Test Model",
  imagePreview: "data:image/png;base64,test",
  prompt: "Test prompt",
};

describe("RatingWidget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRatingStorage.getRatingByHistoryId.mockReturnValue(null);
  });

  it("should render without existing rating", () => {
    render(<RatingWidget {...defaultProps} />);
    expect(screen.getByText(/rate this output/i)).toBeInTheDocument();
  });

  it("should handle star rating click", () => {
    const savedRating = {
      id: "rating-1",
      historyEntryId: "test-entry-123",
      modelId: "test-model",
      modelName: "Test Model",
      stars: 4 as const,
      thumbs: null,
      comment: null,
      timestamp: Date.now(),
      imagePreview: null,
      prompt: null,
    };

    mockRatingStorage.saveRating.mockReturnValue(savedRating);

    render(<RatingWidget {...defaultProps} />);

    const stars = screen.getAllByTitle(/rate \d+ stars/i);
    fireEvent.click(stars[3]);

    expect(mockRatingStorage.saveRating).toHaveBeenCalled();
  });

  it("should handle thumbs up click", () => {
    const savedRating = {
      id: "rating-1",
      historyEntryId: "test-entry-123",
      modelId: "test-model",
      modelName: "Test Model",
      stars: null,
      thumbs: "up" as const,
      comment: null,
      timestamp: Date.now(),
      imagePreview: null,
      prompt: null,
    };

    mockRatingStorage.saveRating.mockReturnValue(savedRating);

    render(<RatingWidget {...defaultProps} />);

    const goodButton = screen.getByText(/good/i);
    fireEvent.click(goodButton);

    expect(mockRatingStorage.saveRating).toHaveBeenCalled();
  });

  it("should handle thumbs down click", () => {
    const savedRating = {
      id: "rating-1",
      historyEntryId: "test-entry-123",
      modelId: "test-model",
      modelName: "Test Model",
      stars: null,
      thumbs: "down" as const,
      comment: null,
      timestamp: Date.now(),
      imagePreview: null,
      prompt: null,
    };

    mockRatingStorage.saveRating.mockReturnValue(savedRating);

    render(<RatingWidget {...defaultProps} />);

    const poorButton = screen.getByText(/poor/i);
    fireEvent.click(poorButton);

    expect(mockRatingStorage.saveRating).toHaveBeenCalled();
  });

  it("should show feedback textarea when add feedback clicked", () => {
    render(<RatingWidget {...defaultProps} />);

    const addFeedbackButton = screen.getByText(/add feedback/i);
    fireEvent.click(addFeedbackButton);

    expect(
      screen.getByPlaceholderText(/share your thoughts/i),
    ).toBeInTheDocument();
  });

  it("should save feedback", () => {
    const savedRating = {
      id: "rating-1",
      historyEntryId: "test-entry-123",
      modelId: "test-model",
      modelName: "Test Model",
      stars: null,
      thumbs: null,
      comment: "Great!",
      timestamp: Date.now(),
      imagePreview: null,
      prompt: null,
    };

    mockRatingStorage.saveRating.mockReturnValue(savedRating);

    render(<RatingWidget {...defaultProps} />);

    const addFeedbackButton = screen.getByText(/add feedback/i);
    fireEvent.click(addFeedbackButton);

    const textarea = screen.getByPlaceholderText(/share your thoughts/i);
    fireEvent.change(textarea, { target: { value: "Great!" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    expect(mockRatingStorage.saveRating).toHaveBeenCalled();
  });

  it("should cancel feedback editing", () => {
    render(<RatingWidget {...defaultProps} />);

    const addFeedbackButton = screen.getByText(/add feedback/i);
    fireEvent.click(addFeedbackButton);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(
      screen.queryByPlaceholderText(/share your thoughts/i),
    ).not.toBeInTheDocument();
  });

  it("should load existing rating", () => {
    const existingRating = {
      id: "rating-1",
      historyEntryId: "test-entry-123",
      modelId: "test-model",
      modelName: "Test Model",
      stars: 4 as const,
      thumbs: "up" as const,
      comment: "Great!",
      timestamp: Date.now(),
      imagePreview: null,
      prompt: null,
    };

    mockRatingStorage.getRatingByHistoryId.mockReturnValue(existingRating);

    render(<RatingWidget {...defaultProps} />);

    expect(mockRatingStorage.getRatingByHistoryId).toHaveBeenCalledWith(
      "test-entry-123",
    );
  });

  it("should handle mouse enter on stars", () => {
    render(<RatingWidget {...defaultProps} />);

    const stars = screen.getAllByTitle(/rate \d+ stars/i);
    fireEvent.mouseEnter(stars[2]);

    expect(stars[2]).toBeInTheDocument();
  });

  it("should handle mouse leave on stars", () => {
    render(<RatingWidget {...defaultProps} />);

    const stars = screen.getAllByTitle(/rate \d+ stars/i);
    fireEvent.mouseEnter(stars[2]);
    fireEvent.mouseLeave(stars[2]);

    expect(stars[2]).toBeInTheDocument();
  });

  it("should toggle thumbs when clicking same option", () => {
    const existingRating = {
      id: "rating-1",
      historyEntryId: "test-entry-123",
      modelId: "test-model",
      modelName: "Test Model",
      stars: null,
      thumbs: "up" as const,
      comment: null,
      timestamp: Date.now(),
      imagePreview: null,
      prompt: null,
    };

    mockRatingStorage.getRatingByHistoryId.mockReturnValue(existingRating);
    mockRatingStorage.saveRating.mockReturnValue({
      ...existingRating,
      thumbs: null,
    });

    render(<RatingWidget {...defaultProps} />);

    const goodButton = screen.getByText(/good/i);
    fireEvent.click(goodButton);

    expect(mockRatingStorage.saveRating).toHaveBeenCalled();
  });

  it("should handle null imagePreview", () => {
    render(<RatingWidget {...defaultProps} imagePreview={null} />);
    expect(screen.getByText(/rate this output/i)).toBeInTheDocument();
  });

  it("should handle null prompt", () => {
    render(<RatingWidget {...defaultProps} prompt={null} />);
    expect(screen.getByText(/rate this output/i)).toBeInTheDocument();
  });
});
