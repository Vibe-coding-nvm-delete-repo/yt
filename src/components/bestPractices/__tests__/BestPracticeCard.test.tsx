import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BestPracticeCard } from "../BestPracticeCard";
import type { BestPractice } from "@/types";

const mockPractice: BestPractice = {
  id: "test-1",
  name: "Test Practice",
  description: "Test description",
  leonardoAiLanguage: "Test Leonardo language",
  images: [],
  importance: 7,
  type: "mandatory",
  typeExplanation: "Must follow this",
  category: "words-phrases",
  timestamp: Date.now(),
};

const defaultProps = {
  practice: mockPractice,
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe("BestPracticeCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render practice name", () => {
    render(<BestPracticeCard {...defaultProps} />);
    expect(screen.getByText("Test Practice")).toBeInTheDocument();
  });

  it("should render practice type", () => {
    render(<BestPracticeCard {...defaultProps} />);
    expect(screen.getByText("mandatory")).toBeInTheDocument();
  });

  it("should render importance level", () => {
    render(<BestPracticeCard {...defaultProps} />);
    expect(screen.getByText(/importance: 7\/10/i)).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<BestPracticeCard {...defaultProps} />);
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("should call onEdit when edit button clicked", () => {
    render(<BestPracticeCard {...defaultProps} />);

    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);

    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockPractice);
  });

  it("should call onDelete when delete button clicked", () => {
    render(<BestPracticeCard {...defaultProps} />);

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(defaultProps.onDelete).toHaveBeenCalledWith("test-1");
  });

  it("should render optional type with correct styling", () => {
    const optionalPractice = { ...mockPractice, type: "optional" as const };
    render(<BestPracticeCard {...defaultProps} practice={optionalPractice} />);

    expect(screen.getByText("optional")).toBeInTheDocument();
  });

  it("should render conditional type with correct styling", () => {
    const conditionalPractice = {
      ...mockPractice,
      type: "conditional" as const,
    };
    render(
      <BestPracticeCard {...defaultProps} practice={conditionalPractice} />,
    );

    expect(screen.getByText("conditional")).toBeInTheDocument();
  });

  it("should render Leonardo AI language", () => {
    render(<BestPracticeCard {...defaultProps} />);
    expect(screen.getByText("Test Leonardo language")).toBeInTheDocument();
  });

  it("should render type explanation", () => {
    render(<BestPracticeCard {...defaultProps} />);
    expect(screen.getByText("Must follow this")).toBeInTheDocument();
  });

  it("should handle practice with high importance", () => {
    const highImportance = { ...mockPractice, importance: 10 };
    render(<BestPracticeCard {...defaultProps} practice={highImportance} />);

    expect(screen.getByText(/importance: 10\/10/i)).toBeInTheDocument();
  });

  it("should handle practice with low importance", () => {
    const lowImportance = { ...mockPractice, importance: 1 };
    render(<BestPracticeCard {...defaultProps} practice={lowImportance} />);

    expect(screen.getByText(/importance: 1\/10/i)).toBeInTheDocument();
  });
});
