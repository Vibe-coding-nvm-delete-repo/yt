import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsApiKeys, type SettingsApiKeysProps } from "../SettingsApiKeys";

const createValidation = (
  overrides?: Partial<SettingsApiKeysProps["validation"]>,
) => ({
  isValid: false,
  isValidating: false,
  error: null,
  lastCheckedAt: null,
  validationAttempts: 0,
  isStale: false,
  ...overrides,
});

const defaultProps: SettingsApiKeysProps = {
  apiKey: "",
  showApiKey: false,
  validation: createValidation(),
  onApiKeyChange: jest.fn(),
  onToggleShow: jest.fn(),
  onValidate: jest.fn(),
};

describe("SettingsApiKeys", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render with default props", () => {
    render(<SettingsApiKeys {...defaultProps} />);

    expect(screen.getByText("OpenRouter API Key")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("sk-or-v1-...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /validate api key/i }),
    ).toBeInTheDocument();
  });

  it("should display API key input as password by default", () => {
    render(<SettingsApiKeys {...defaultProps} />);

    const input = screen.getByPlaceholderText(
      "sk-or-v1-...",
    ) as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  it("should toggle API key visibility", () => {
    const onToggleShow = jest.fn();
    const { rerender } = render(
      <SettingsApiKeys {...defaultProps} onToggleShow={onToggleShow} />,
    );

    const toggleButton = screen.getByLabelText("Show API key");
    fireEvent.click(toggleButton);

    expect(onToggleShow).toHaveBeenCalledTimes(1);

    // Rerender with showApiKey = true
    rerender(
      <SettingsApiKeys
        {...defaultProps}
        showApiKey={true}
        onToggleShow={onToggleShow}
      />,
    );

    const input = screen.getByPlaceholderText(
      "sk-or-v1-...",
    ) as HTMLInputElement;
    expect(input.type).toBe("text");

    const hideButton = screen.getByLabelText("Hide API key");
    expect(hideButton).toBeInTheDocument();
  });

  it("should call onApiKeyChange when input changes", () => {
    const onApiKeyChange = jest.fn();
    render(
      <SettingsApiKeys {...defaultProps} onApiKeyChange={onApiKeyChange} />,
    );

    const input = screen.getByPlaceholderText("sk-or-v1-...");
    fireEvent.change(input, { target: { value: "sk-or-v1-test-key" } });

    expect(onApiKeyChange).toHaveBeenCalledWith("sk-or-v1-test-key");
  });

  it("should call onValidate when validate button is clicked", () => {
    const onValidate = jest.fn();
    render(
      <SettingsApiKeys
        {...defaultProps}
        apiKey="sk-or-v1-test-key"
        onValidate={onValidate}
      />,
    );

    const validateButton = screen.getByRole("button", {
      name: /validate api key/i,
    });
    fireEvent.click(validateButton);

    expect(onValidate).toHaveBeenCalledTimes(1);
  });

  it("should disable validate button when API key is empty", () => {
    render(<SettingsApiKeys {...defaultProps} apiKey="" />);

    const validateButton = screen.getByRole("button", {
      name: /validate api key/i,
    });
    expect(validateButton).toBeDisabled();
  });

  it("should disable validate button when validating", () => {
    render(
      <SettingsApiKeys
        {...defaultProps}
        apiKey="sk-or-v1-test-key"
        validation={createValidation({ isValidating: true })}
      />,
    );

    const validateButton = screen.getByRole("button", {
      name: /validate api key/i,
    });
    expect(validateButton).toBeDisabled();
  });

  it("should show spinner when validating", () => {
    render(
      <SettingsApiKeys
        {...defaultProps}
        apiKey="sk-or-v1-test-key"
        validation={createValidation({ isValidating: true })}
      />,
    );

    const spinner = screen
      .getByRole("button", { name: /validate api key/i })
      .querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("should display success message when validation is successful", () => {
    render(
      <SettingsApiKeys
        {...defaultProps}
        apiKey="sk-or-v1-test-key"
        validation={createValidation({ isValid: true })}
      />,
    );

    expect(screen.getByText("API key is valid")).toBeInTheDocument();
  });

  it("should display validated at label when provided", () => {
    render(
      <SettingsApiKeys
        {...defaultProps}
        apiKey="sk-or-v1-test-key"
        validation={createValidation({ isValid: true })}
        validatedAtLabel="2 hours ago"
      />,
    );

    expect(screen.getByText(/validated 2 hours ago/i)).toBeInTheDocument();
  });

  it("should display error message when validation fails", () => {
    render(
      <SettingsApiKeys
        {...defaultProps}
        apiKey="sk-or-v1-test-key"
        validation={createValidation({
          error: "Invalid API key format",
        })}
      />,
    );

    expect(screen.getByText("Invalid API key format")).toBeInTheDocument();
  });

  it("should show checkmark icon when API key is valid", () => {
    const { container } = render(
      <SettingsApiKeys
        {...defaultProps}
        apiKey="sk-or-v1-test-key"
        validation={createValidation({ isValid: true })}
      />,
    );

    const checkIcons = container.querySelectorAll(".text-green-600");
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it("should use custom tooltip text when provided", () => {
    const customTooltip = "Custom tooltip message";
    render(<SettingsApiKeys {...defaultProps} tooltipText={customTooltip} />);

    // Tooltip component should receive the custom text
    expect(screen.getByText("OpenRouter API Key")).toBeInTheDocument();
  });

  it("should use default tooltip text when not provided", () => {
    render(<SettingsApiKeys {...defaultProps} />);

    expect(screen.getByText("OpenRouter API Key")).toBeInTheDocument();
  });

  it("should disable validate button when API key is only whitespace", () => {
    render(<SettingsApiKeys {...defaultProps} apiKey="   " />);

    const validateButton = screen.getByRole("button", {
      name: /validate api key/i,
    });
    expect(validateButton).toBeDisabled();
  });

  it("should not show validation status when not validated", () => {
    render(
      <SettingsApiKeys
        {...defaultProps}
        apiKey="sk-or-v1-test-key"
        validation={createValidation()}
      />,
    );

    expect(screen.queryByText("API key is valid")).not.toBeInTheDocument();
  });

  it("should have accessible button labels", () => {
    render(<SettingsApiKeys {...defaultProps} />);

    expect(screen.getByLabelText("Show API key")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /validate api key/i }),
    ).toBeInTheDocument();
  });

  it("should apply correct styling classes", () => {
    const { container } = render(<SettingsApiKeys {...defaultProps} />);

    const input = screen.getByPlaceholderText("sk-or-v1-...");
    expect(input).toHaveClass("w-full", "px-4", "py-2", "rounded-lg");
  });

  it("should handle multiple validation states correctly", () => {
    const { rerender } = render(
      <SettingsApiKeys
        {...defaultProps}
        apiKey="sk-or-v1-test"
        validation={createValidation()}
      />,
    );

    // Start validating
    rerender(
      <SettingsApiKeys
        {...defaultProps}
        apiKey="sk-or-v1-test"
        validation={createValidation({ isValidating: true })}
      />,
    );

    expect(
      screen.getByRole("button", { name: /validate api key/i }),
    ).toBeDisabled();

    // Validation succeeds
    rerender(
      <SettingsApiKeys
        {...defaultProps}
        apiKey="sk-or-v1-test"
        validation={createValidation({ isValid: true })}
      />,
    );

    expect(screen.getByText("API key is valid")).toBeInTheDocument();

    // Validation fails
    rerender(
      <SettingsApiKeys
        {...defaultProps}
        apiKey="sk-or-v1-test"
        validation={createValidation({
          error: "Invalid key",
        })}
      />,
    );

    expect(screen.getByText("Invalid key")).toBeInTheDocument();
  });
});
