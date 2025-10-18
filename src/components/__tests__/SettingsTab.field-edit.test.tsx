/**
 * Tests for field editing functionality in SettingsTab
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SettingsTab } from "../SettingsTab";
import { ToastProvider } from "@/contexts/ToastContext";
import { promptCreatorConfigStorage } from "@/lib/promptCreatorStorage";

// Mock dependencies
jest.mock("@/lib/storage", () => ({
  settingsStorage: {
    subscribe: jest.fn(() => jest.fn()),
    getSettings: jest.fn(() => ({
      openRouterApiKey: "",
      selectedModel: "",
      selectedVisionModels: [],
      customPrompt: "",
      isValidApiKey: false,
      lastApiKeyValidation: null,
      lastModelFetch: null,
      availableModels: [],
      preferredModels: [],
      pinnedModels: [],
    })),
    updateSelectedVisionModels: jest.fn(),
  },
}));

jest.mock("@/lib/openrouter", () => ({
  createOpenRouterClient: jest.fn(),
  isValidApiKeyFormat: jest.fn(() => true),
}));

jest.mock("@/lib/promptCreatorStorage", () => ({
  promptCreatorConfigStorage: {
    load: jest.fn(() => ({
      fields: [
        {
          id: "test-field-1",
          label: "Test Field",
          type: "dropdown",
          tier: "mandatory",
          order: 1,
          options: ["Option 1", "Option 2"],
        },
      ],
      lockedInPrompt: "",
      promptGenInstructions: "Test instructions",
      ratingRubric: "Test rubric",
      openRouterModelId: "",
    })),
    updateField: jest.fn(),
    addField: jest.fn(),
    deleteField: jest.fn(),
  },
  promptCreatorDraftStorage: {
    load: jest.fn(() => ({ selections: {} })),
    save: jest.fn(),
  },
}));

describe("SettingsTab Field Edit", () => {
  const mockOnUpdate = jest.fn();
  const mockScrollIntoView = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = mockScrollIntoView;
  });

  const renderComponent = () => {
    const settings = {
      openRouterApiKey: "",
      isValidApiKey: false,
      availableModels: [],
      selectedVisionModels: [],
      customPrompt: "",
      pinnedModels: [],
      selectedModel: "",
      lastApiKeyValidation: null,
      lastModelFetch: null,
      preferredModels: [],
    };

    return render(
      <ToastProvider>
        <SettingsTab settings={settings} onSettingsUpdate={mockOnUpdate} />
      </ToastProvider>,
    );
  };

  it("should populate form when Edit button is clicked", async () => {
    renderComponent();

    // Navigate to Prompt Creator tab
    const promptCreatorButton = screen.getByRole("button", {
      name: /prompt creator/i,
    });
    fireEvent.click(promptCreatorButton);

    // Wait for the field to appear
    await waitFor(() => {
      expect(screen.getByText("Test Field")).toBeInTheDocument();
    });

    // Click the Edit button
    const editButton = screen.getByRole("button", { name: /^edit$/i });
    fireEvent.click(editButton);

    // Verify the form is populated
    await waitFor(() => {
      expect(screen.getByText("Edit Field")).toBeInTheDocument();
    });

    const labelInput = screen.getByDisplayValue("Test Field");
    expect(labelInput).toBeInTheDocument();

    // Verify Update Field button appears
    expect(
      screen.getByRole("button", { name: /update field/i }),
    ).toBeInTheDocument();
  });

  it("should scroll form into view when Edit is clicked", async () => {
    renderComponent();

    // Navigate to Prompt Creator tab
    const promptCreatorButton = screen.getByRole("button", {
      name: /prompt creator/i,
    });
    fireEvent.click(promptCreatorButton);

    // Wait for the field to appear
    await waitFor(() => {
      expect(screen.getByText("Test Field")).toBeInTheDocument();
    });

    // Click the Edit button
    const editButton = screen.getByRole("button", { name: /^edit$/i });
    fireEvent.click(editButton);

    // Verify scrollIntoView was called with smooth scroll
    await waitFor(
      () => {
        expect(mockScrollIntoView).toHaveBeenCalledWith({
          behavior: "smooth",
          block: "nearest",
        });
      },
      { timeout: 200 },
    );
  });

  it("should show Cancel edit button in edit mode", async () => {
    renderComponent();

    // Navigate to Prompt Creator tab
    const promptCreatorButton = screen.getByRole("button", {
      name: /prompt creator/i,
    });
    fireEvent.click(promptCreatorButton);

    // Wait for the field to appear
    await waitFor(() => {
      expect(screen.getByText("Test Field")).toBeInTheDocument();
    });

    // Click the Edit button
    const editButton = screen.getByRole("button", { name: /^edit$/i });
    fireEvent.click(editButton);

    // Verify Cancel edit button appears
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /cancel edit/i }),
      ).toBeInTheDocument();
    });
  });

  it("should reset form when Cancel edit is clicked", async () => {
    renderComponent();

    // Navigate to Prompt Creator tab
    const promptCreatorButton = screen.getByRole("button", {
      name: /prompt creator/i,
    });
    fireEvent.click(promptCreatorButton);

    // Wait for the field to appear
    await waitFor(() => {
      expect(screen.getByText("Test Field")).toBeInTheDocument();
    });

    // Click the Edit button
    const editButton = screen.getByRole("button", { name: /^edit$/i });
    fireEvent.click(editButton);

    // Wait for edit mode
    await waitFor(() => {
      expect(screen.getByText("Edit Field")).toBeInTheDocument();
    });

    // Click Cancel edit
    const cancelButton = screen.getByRole("button", { name: /cancel edit/i });
    fireEvent.click(cancelButton);

    // Verify form is reset
    await waitFor(() => {
      expect(screen.getByText("Create New Field")).toBeInTheDocument();
    });
  });
});
