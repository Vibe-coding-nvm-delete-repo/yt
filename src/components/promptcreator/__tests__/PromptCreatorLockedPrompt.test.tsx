import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PromptCreatorLockedPrompt } from "../PromptCreatorLockedPrompt";

describe("PromptCreatorLockedPrompt", () => {
  it("renders locked prompt section", () => {
    const mockOnChange = jest.fn();
    const mockOnToggle = jest.fn();

    render(
      <PromptCreatorLockedPrompt
        lockedInPrompt="Test prompt"
        isLocked={true}
        onLockedPromptChange={mockOnChange}
        onToggleLock={mockOnToggle}
      />,
    );

    expect(screen.getByText(/Locked Prompt/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test prompt")).toBeInTheDocument();
  });

  it("displays lock button when locked", () => {
    const mockOnChange = jest.fn();
    const mockOnToggle = jest.fn();

    render(
      <PromptCreatorLockedPrompt
        lockedInPrompt=""
        isLocked={true}
        onLockedPromptChange={mockOnChange}
        onToggleLock={mockOnToggle}
      />,
    );

    expect(screen.getByText("Unlock to Edit")).toBeInTheDocument();
  });

  it("displays unlock button when unlocked", () => {
    const mockOnChange = jest.fn();
    const mockOnToggle = jest.fn();

    render(
      <PromptCreatorLockedPrompt
        lockedInPrompt=""
        isLocked={false}
        onLockedPromptChange={mockOnChange}
        onToggleLock={mockOnToggle}
      />,
    );

    expect(screen.getByText("Lock")).toBeInTheDocument();
  });

  it("calls onToggleLock when button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const mockOnToggle = jest.fn();

    render(
      <PromptCreatorLockedPrompt
        lockedInPrompt=""
        isLocked={true}
        onLockedPromptChange={mockOnChange}
        onToggleLock={mockOnToggle}
      />,
    );

    await user.click(screen.getByText("Unlock to Edit"));
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it("disables textarea when locked", () => {
    const mockOnChange = jest.fn();
    const mockOnToggle = jest.fn();

    render(
      <PromptCreatorLockedPrompt
        lockedInPrompt="Test"
        isLocked={true}
        onLockedPromptChange={mockOnChange}
        onToggleLock={mockOnToggle}
      />,
    );

    const textarea = screen.getByDisplayValue("Test");
    expect(textarea).toBeDisabled();
  });

  it("enables textarea when unlocked", () => {
    const mockOnChange = jest.fn();
    const mockOnToggle = jest.fn();

    render(
      <PromptCreatorLockedPrompt
        lockedInPrompt="Test"
        isLocked={false}
        onLockedPromptChange={mockOnChange}
        onToggleLock={mockOnToggle}
      />,
    );

    const textarea = screen.getByDisplayValue("Test");
    expect(textarea).not.toBeDisabled();
  });
});
