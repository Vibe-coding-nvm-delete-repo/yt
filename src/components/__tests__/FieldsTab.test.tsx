import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FieldsTab } from "../FieldsTab";
import { promptCreatorConfigStorage } from "@/lib/promptCreatorStorage";
import type { PromptCreatorConfig } from "@/types/promptCreator";

// Mock the storage
jest.mock("@/lib/promptCreatorStorage", () => ({
  promptCreatorConfigStorage: {
    load: jest.fn(),
  },
}));

const mockLoad = promptCreatorConfigStorage.load as jest.MockedFunction<
  typeof promptCreatorConfigStorage.load
>;

describe("FieldsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no fields are configured", () => {
    const emptyConfig: PromptCreatorConfig = {
      fields: [],
      promptGenInstructions: "",
      ratingRubric: "",
      openRouterModelId: "",
      defaultPromptCount: 3,
      lockedInPrompt: "",
      schemaVersion: 1,
    };

    mockLoad.mockReturnValue(emptyConfig);

    render(<FieldsTab />);

    expect(screen.getByText("No Fields Created Yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Get started by creating your first prompt creator field/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders fields grouped by tier", () => {
    const config: PromptCreatorConfig = {
      fields: [
        {
          id: "1",
          label: "Style",
          type: "dropdown",
          tier: "mandatory",
          order: 1,
          options: ["Photorealistic", "Cartoon", "Abstract"],
        },
        {
          id: "2",
          label: "Mood",
          type: "text",
          tier: "optional",
          order: 2,
          maxLength: 100,
        },
        {
          id: "3",
          label: "Custom Note",
          type: "text",
          tier: "free",
          order: 3,
        },
      ],
      promptGenInstructions: "",
      ratingRubric: "",
      openRouterModelId: "",
      defaultPromptCount: 3,
      lockedInPrompt: "",
      schemaVersion: 1,
    };

    mockLoad.mockReturnValue(config);

    render(<FieldsTab />);

    // Check that all three sections are rendered
    expect(screen.getByText("Mandatory Fields")).toBeInTheDocument();
    expect(screen.getByText("Optional Fields")).toBeInTheDocument();
    expect(screen.getByText("Free Fields")).toBeInTheDocument();

    // Check that field labels are present
    expect(screen.getByText("Style")).toBeInTheDocument();
    expect(screen.getByText("Mood")).toBeInTheDocument();
    expect(screen.getByText("Custom Note")).toBeInTheDocument();
  });

  it("displays field details correctly for dropdown type", () => {
    const config: PromptCreatorConfig = {
      fields: [
        {
          id: "1",
          label: "Art Style",
          type: "dropdown",
          tier: "mandatory",
          order: 1,
          options: ["Realistic", "Anime", "Oil Painting"],
          helperText: "Choose the primary art style",
        },
      ],
      promptGenInstructions: "",
      ratingRubric: "",
      openRouterModelId: "",
      defaultPromptCount: 3,
      lockedInPrompt: "",
      schemaVersion: 1,
    };

    mockLoad.mockReturnValue(config);

    render(<FieldsTab />);

    expect(screen.getByText("Art Style")).toBeInTheDocument();
    expect(
      screen.getByText("Choose the primary art style"),
    ).toBeInTheDocument();
    expect(screen.getByText("Realistic")).toBeInTheDocument();
    expect(screen.getByText("Anime")).toBeInTheDocument();
    expect(screen.getByText("Oil Painting")).toBeInTheDocument();
  });

  it("displays field details correctly for slider type", () => {
    const config: PromptCreatorConfig = {
      fields: [
        {
          id: "1",
          label: "Intensity",
          type: "slider",
          tier: "optional",
          order: 1,
          min: 0,
          max: 100,
          step: 5,
        },
      ],
      promptGenInstructions: "",
      ratingRubric: "",
      openRouterModelId: "",
      defaultPromptCount: 3,
      lockedInPrompt: "",
      schemaVersion: 1,
    };

    mockLoad.mockReturnValue(config);

    render(<FieldsTab />);

    expect(screen.getByText("Intensity")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText(/step: 5/i)).toBeInTheDocument();
  });

  it("displays field details correctly for multiselect type", () => {
    const config: PromptCreatorConfig = {
      fields: [
        {
          id: "1",
          label: "Colors",
          type: "multiselect",
          tier: "optional",
          order: 1,
          options: ["Red", "Blue", "Green", "Yellow"],
          maxSelections: 2,
        },
      ],
      promptGenInstructions: "",
      ratingRubric: "",
      openRouterModelId: "",
      defaultPromptCount: 3,
      lockedInPrompt: "",
      schemaVersion: 1,
    };

    mockLoad.mockReturnValue(config);

    render(<FieldsTab />);

    expect(screen.getByText("Colors")).toBeInTheDocument();
    expect(screen.getByText(/max 2/i)).toBeInTheDocument();
    expect(screen.getByText("Red")).toBeInTheDocument();
    expect(screen.getByText("Blue")).toBeInTheDocument();
    expect(screen.getByText("Green")).toBeInTheDocument();
    expect(screen.getByText("Yellow")).toBeInTheDocument();
  });

  it("displays field details correctly for text type", () => {
    const config: PromptCreatorConfig = {
      fields: [
        {
          id: "1",
          label: "Description",
          type: "text",
          tier: "free",
          order: 1,
          maxLength: 200,
        },
      ],
      promptGenInstructions: "",
      ratingRubric: "",
      openRouterModelId: "",
      defaultPromptCount: 3,
      lockedInPrompt: "",
      schemaVersion: 1,
    };

    mockLoad.mockReturnValue(config);

    render(<FieldsTab />);

    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText(/characters/i)).toBeInTheDocument();
  });

  it("displays field details correctly for number type", () => {
    const config: PromptCreatorConfig = {
      fields: [
        {
          id: "1",
          label: "Count",
          type: "number",
          tier: "optional",
          order: 1,
          min: 1,
          max: 10,
          step: 1,
        },
      ],
      promptGenInstructions: "",
      ratingRubric: "",
      openRouterModelId: "",
      defaultPromptCount: 3,
      lockedInPrompt: "",
      schemaVersion: 1,
    };

    mockLoad.mockReturnValue(config);

    render(<FieldsTab />);

    expect(screen.getByText("Count")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("hides hidden fields", () => {
    const config: PromptCreatorConfig = {
      fields: [
        {
          id: "1",
          label: "Visible Field",
          type: "text",
          tier: "mandatory",
          order: 1,
        },
        {
          id: "2",
          label: "Hidden Field",
          type: "text",
          tier: "mandatory",
          order: 2,
          hidden: true,
        },
      ],
      promptGenInstructions: "",
      ratingRubric: "",
      openRouterModelId: "",
      defaultPromptCount: 3,
      lockedInPrompt: "",
      schemaVersion: 1,
    };

    mockLoad.mockReturnValue(config);

    render(<FieldsTab />);

    expect(screen.getByText("Visible Field")).toBeInTheDocument();
    expect(screen.queryByText("Hidden Field")).not.toBeInTheDocument();
  });

  it("sorts fields by tier and order", () => {
    const config: PromptCreatorConfig = {
      fields: [
        {
          id: "1",
          label: "Free Field",
          type: "text",
          tier: "free",
          order: 1,
        },
        {
          id: "2",
          label: "Mandatory Field",
          type: "text",
          tier: "mandatory",
          order: 1,
        },
        {
          id: "3",
          label: "Optional Field",
          type: "text",
          tier: "optional",
          order: 1,
        },
      ],
      promptGenInstructions: "",
      ratingRubric: "",
      openRouterModelId: "",
      defaultPromptCount: 3,
      lockedInPrompt: "",
      schemaVersion: 1,
    };

    mockLoad.mockReturnValue(config);

    render(<FieldsTab />);

    const sections = screen.getAllByRole("heading", { level: 2 });
    const sectionTitles = sections.map((s) => s.textContent);

    // Mandatory should come before Optional, which should come before Free
    const mandatoryIndex = sectionTitles.findIndex((t) =>
      t?.includes("Mandatory"),
    );
    const optionalIndex = sectionTitles.findIndex((t) =>
      t?.includes("Optional"),
    );
    const freeIndex = sectionTitles.findIndex((t) => t?.includes("Free"));

    expect(mandatoryIndex).toBeLessThan(optionalIndex);
    expect(optionalIndex).toBeLessThan(freeIndex);
  });

  it("displays tier badges with correct styling", () => {
    const config: PromptCreatorConfig = {
      fields: [
        {
          id: "1",
          label: "Test Field",
          type: "text",
          tier: "mandatory",
          order: 1,
        },
      ],
      promptGenInstructions: "",
      ratingRubric: "",
      openRouterModelId: "",
      defaultPromptCount: 3,
      lockedInPrompt: "",
      schemaVersion: 1,
    };

    mockLoad.mockReturnValue(config);

    render(<FieldsTab />);

    const badge = screen.getByText("mandatory");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("text-red-300");
  });

  it("displays field count in header", () => {
    const config: PromptCreatorConfig = {
      fields: [
        {
          id: "1",
          label: "Field 1",
          type: "text",
          tier: "mandatory",
          order: 1,
        },
        {
          id: "2",
          label: "Field 2",
          type: "text",
          tier: "optional",
          order: 2,
        },
        {
          id: "3",
          label: "Field 3",
          type: "text",
          tier: "free",
          order: 3,
        },
      ],
      promptGenInstructions: "",
      ratingRubric: "",
      openRouterModelId: "",
      defaultPromptCount: 3,
      lockedInPrompt: "",
      schemaVersion: 1,
    };

    mockLoad.mockReturnValue(config);

    render(<FieldsTab />);

    expect(screen.getByText("3 fields configured")).toBeInTheDocument();
  });

  it("displays default value when present", () => {
    const config: PromptCreatorConfig = {
      fields: [
        {
          id: "1",
          label: "Test Field",
          type: "text",
          tier: "optional",
          order: 1,
          defaultValue: "Default text",
        },
      ],
      promptGenInstructions: "",
      ratingRubric: "",
      openRouterModelId: "",
      defaultPromptCount: 3,
      lockedInPrompt: "",
      schemaVersion: 1,
    };

    mockLoad.mockReturnValue(config);

    render(<FieldsTab />);

    expect(screen.getByText(/Default:/i)).toBeInTheDocument();
    expect(screen.getByText(/Default text/i)).toBeInTheDocument();
  });
});
