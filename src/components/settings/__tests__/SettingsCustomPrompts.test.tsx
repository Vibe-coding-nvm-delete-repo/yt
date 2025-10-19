import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsCustomPrompts } from "../SettingsCustomPrompts";

describe("SettingsCustomPrompts", () => {
  it("renders custom prompts section", () => {
    const mockOnChange = jest.fn();
    render(
      <SettingsCustomPrompts
        customPrompt="Test prompt"
        onCustomPromptChange={mockOnChange}
      />,
    );

    expect(screen.getByText("Custom Prompt Templates")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Enter your custom prompt/i),
    ).toHaveValue("Test prompt");
  });

  it("calls onChange when text is entered", async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    render(
      <SettingsCustomPrompts
        customPrompt=""
        onCustomPromptChange={mockOnChange}
      />,
    );

    const textarea = screen.getByPlaceholderText(/Enter your custom prompt/i);
    await user.type(textarea, "New prompt");

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("displays helper text", () => {
    const mockOnChange = jest.fn();
    render(
      <SettingsCustomPrompts
        customPrompt=""
        onCustomPromptChange={mockOnChange}
      />,
    );

    expect(
      screen.getByText(
        /This prompt will be used when generating prompts from images/i,
      ),
    ).toBeInTheDocument();
  });
});
