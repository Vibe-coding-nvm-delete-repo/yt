import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PromptCreatorOutput,
  type GenerationStep,
} from "../PromptCreatorOutput";

describe("PromptCreatorOutput", () => {
  const mockGenerationSteps: GenerationStep[] = [
    { label: "Step 1", status: "completed", detail: "Done" },
    { label: "Step 2", status: "active" },
    { label: "Step 3", status: "pending" },
  ];

  it("does not render when content is empty", () => {
    const mockOnCopy = jest.fn();
    const mockOnToggle = jest.fn();

    const { container } = render(
      <PromptCreatorOutput
        content=""
        copied={false}
        generationSteps={[]}
        showBackendProcess={false}
        isGenerating={false}
        onCopy={mockOnCopy}
        onToggleBackendProcess={mockOnToggle}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders output when content is present", () => {
    const mockOnCopy = jest.fn();
    const mockOnToggle = jest.fn();

    render(
      <PromptCreatorOutput
        content="Test generated prompt"
        copied={false}
        generationSteps={[]}
        showBackendProcess={false}
        isGenerating={false}
        onCopy={mockOnCopy}
        onToggleBackendProcess={mockOnToggle}
      />,
    );

    expect(screen.getByText("Generated Prompt")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Test generated prompt"),
    ).toBeInTheDocument();
  });

  it("displays copy button", () => {
    const mockOnCopy = jest.fn();
    const mockOnToggle = jest.fn();

    render(
      <PromptCreatorOutput
        content="Test"
        copied={false}
        generationSteps={[]}
        showBackendProcess={false}
        isGenerating={false}
        onCopy={mockOnCopy}
        onToggleBackendProcess={mockOnToggle}
      />,
    );

    expect(screen.getByText("📋 Copy")).toBeInTheDocument();
  });

  it("shows copied state after copy", () => {
    const mockOnCopy = jest.fn();
    const mockOnToggle = jest.fn();

    render(
      <PromptCreatorOutput
        content="Test"
        copied={true}
        generationSteps={[]}
        showBackendProcess={false}
        isGenerating={false}
        onCopy={mockOnCopy}
        onToggleBackendProcess={mockOnToggle}
      />,
    );

    expect(screen.getByText("✓ Copied!")).toBeInTheDocument();
  });

  it("calls onCopy when copy button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnCopy = jest.fn();
    const mockOnToggle = jest.fn();

    render(
      <PromptCreatorOutput
        content="Test"
        copied={false}
        generationSteps={[]}
        showBackendProcess={false}
        isGenerating={false}
        onCopy={mockOnCopy}
        onToggleBackendProcess={mockOnToggle}
      />,
    );

    await user.click(screen.getByText("📋 Copy"));
    expect(mockOnCopy).toHaveBeenCalledTimes(1);
  });

  it("displays character count", () => {
    const mockOnCopy = jest.fn();
    const mockOnToggle = jest.fn();

    render(
      <PromptCreatorOutput
        content="Test content"
        copied={false}
        generationSteps={[]}
        showBackendProcess={false}
        isGenerating={false}
        onCopy={mockOnCopy}
        onToggleBackendProcess={mockOnToggle}
      />,
    );

    expect(screen.getByText(/12 \/ 1500 characters/)).toBeInTheDocument();
  });

  it("shows warning when exceeding character limit", () => {
    const mockOnCopy = jest.fn();
    const mockOnToggle = jest.fn();
    const longContent = "a".repeat(1501);

    render(
      <PromptCreatorOutput
        content={longContent}
        copied={false}
        generationSteps={[]}
        showBackendProcess={false}
        isGenerating={false}
        onCopy={mockOnCopy}
        onToggleBackendProcess={mockOnToggle}
      />,
    );

    expect(screen.getByText("⚠ Exceeds limit")).toBeInTheDocument();
  });

  it("displays metadata when provided", () => {
    const mockOnCopy = jest.fn();
    const mockOnToggle = jest.fn();

    render(
      <PromptCreatorOutput
        content="Test"
        copied={false}
        metadata={{
          model: "gpt-4/turbo",
          inputTokens: 100,
          outputTokens: 50,
          totalCost: 0.01,
        }}
        generationSteps={[]}
        showBackendProcess={false}
        isGenerating={false}
        onCopy={mockOnCopy}
        onToggleBackendProcess={mockOnToggle}
      />,
    );

    expect(screen.getByText(/Model: turbo/)).toBeInTheDocument();
    expect(screen.getByText(/Tokens: 100 in \/ 50 out/)).toBeInTheDocument();
  });

  it("displays generation steps when present", () => {
    const mockOnCopy = jest.fn();
    const mockOnToggle = jest.fn();

    render(
      <PromptCreatorOutput
        content="Test"
        copied={false}
        generationSteps={mockGenerationSteps}
        showBackendProcess={true}
        isGenerating={false}
        onCopy={mockOnCopy}
        onToggleBackendProcess={mockOnToggle}
      />,
    );

    expect(screen.getByText("Backend Process Steps")).toBeInTheDocument();
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
  });
});
