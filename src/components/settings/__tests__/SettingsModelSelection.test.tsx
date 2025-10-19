import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsModelSelection } from "../SettingsModelSelection";
import type { ModelState } from "@/types";

describe("SettingsModelSelection", () => {
  const mockModelState: ModelState = {
    isLoading: false,
    models: [
      {
        id: "model-1",
        name: "Test Model 1",
        pricing: { prompt: 0.001, completion: 0.002 },
      },
      {
        id: "model-2",
        name: "Test Model 2",
        pricing: { prompt: 0.002, completion: 0.003 },
      },
    ],
    error: null,
    searchTerm: "",
  };

  const mockProps = {
    modelState: mockModelState,
    selectedVisionModels: [],
    pinnedModels: [],
    isValidApiKey: true,
    onFetchModels: jest.fn(),
    onModelSelect: jest.fn(),
    onTogglePinned: jest.fn(),
    onPinToast: jest.fn(),
  };

  it("renders model selection section", () => {
    render(<SettingsModelSelection {...mockProps} />);

    expect(
      screen.getByText("Vision Models (Select up to 3)"),
    ).toBeInTheDocument();
  });

  it("displays fetch button", () => {
    render(<SettingsModelSelection {...mockProps} />);

    expect(screen.getByRole("button", { name: /fetch/i })).toBeInTheDocument();
  });

  it("disables fetch button when API key is invalid", () => {
    render(<SettingsModelSelection {...mockProps} isValidApiKey={false} />);

    expect(screen.getByRole("button", { name: /fetch/i })).toBeDisabled();
  });

  it("displays selected models count", () => {
    const props = {
      ...mockProps,
      selectedVisionModels: ["model-1", "model-2"],
    };
    render(<SettingsModelSelection {...props} />);

    expect(screen.getByText("Selected: 2 / 3")).toBeInTheDocument();
  });

  it("displays error message when present", () => {
    const props = {
      ...mockProps,
      modelState: { ...mockModelState, error: "Test error" },
    };
    render(<SettingsModelSelection {...props} />);

    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("displays verification timestamp when available", () => {
    const timestamp = Date.now();
    render(
      <SettingsModelSelection {...mockProps} lastModelFetch={timestamp} />,
    );

    expect(screen.getByText(/Verified/)).toBeInTheDocument();
  });

  it("calls onFetchModels when fetch button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnFetch = jest.fn();
    render(
      <SettingsModelSelection {...mockProps} onFetchModels={mockOnFetch} />,
    );

    await user.click(screen.getByRole("button", { name: /fetch/i }));

    expect(mockOnFetch).toHaveBeenCalled();
  });
});
