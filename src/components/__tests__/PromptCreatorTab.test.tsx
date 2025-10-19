import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PromptCreatorTab } from "@/components/PromptCreatorTab";

describe("PromptCreatorTab", () => {
  const CONFIG_KEY = "prompt-creator-config";
  const DRAFT_KEY = "prompt-creator-draft";
  const RESULTS_KEY = "prompt-creator-results";

  const baseConfig = {
    fields: [
      {
        id: "time",
        label: "Time of Day",
        type: "dropdown",
        tier: "mandatory" as const,
        order: 1,
        helperText: "Pick the lighting",
        options: ["Dawn", "Dusk"],
      },
      {
        id: "mood",
        label: "Mood",
        type: "text" as const,
        tier: "optional" as const,
        order: 2,
      },
    ],
    promptGenInstructions: "Create a prompt",
    ratingRubric: "Rate it",
    openRouterModelId: "test/model",
    defaultPromptCount: 3 as const,
    schemaVersion: 1 as const,
  };

  const baseDraft = {
    selections: {},
    lastModified: 0,
    schemaVersion: 1 as const,
  };

  const baseResults = {
    results: [],
    schemaVersion: 1 as const,
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(CONFIG_KEY, JSON.stringify(baseConfig));
    localStorage.setItem(DRAFT_KEY, JSON.stringify(baseDraft));
    localStorage.setItem(RESULTS_KEY, JSON.stringify(baseResults));
  });

  it("disables generation until mandatory fields are selected", async () => {
    render(<PromptCreatorTab apiKey="sk-test" />);

    await screen.findByLabelText(/Time of Day$/);

    expect(
      await screen.findByText(/Fill all mandatory fields before generating/i),
    ).toBeInTheDocument();

    const generateButton = screen.getByRole("button", {
      name: /^Generate$/i,
    });
    expect(generateButton).toBeDisabled();

    const dropdown = await screen.findByLabelText(/Time of Day$/);
    fireEvent.change(dropdown, { target: { value: "Dusk" } });

    await waitFor(() => {
      expect(
        screen.queryByText(/Fill all mandatory fields before generating/i),
      ).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(generateButton).not.toBeDisabled();
    });

    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
    expect(draft.selections.time).toBe("Dusk");
    expect(screen.getByText("Pick the lighting")).toBeInTheDocument();
  });

  it("applies default values defined in configuration", async () => {
    const configWithDefault = {
      ...baseConfig,
      fields: [
        baseConfig.fields[0],
        {
          id: "style",
          label: "Style",
          type: "text" as const,
          tier: "optional" as const,
          order: 3,
          defaultValue: "Warm",
        },
      ],
    };

    localStorage.setItem(CONFIG_KEY, JSON.stringify(configWithDefault));

    render(<PromptCreatorTab apiKey="sk-test" />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Warm")).toBeInTheDocument();
    });

    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
    expect(draft.selections.style).toBe("Warm");
  });

  it("displays new UI with locked prompt field", async () => {
    render(<PromptCreatorTab apiKey="sk-test" />);

    await screen.findByLabelText(/Time of Day$/);

    expect(
      screen.getByText(/Locked Prompt \(combined with field selections\)/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Unlock to Edit/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Generate/i }),
    ).toBeInTheDocument();
  });

  it("handles details toggle without crashing when currentTarget is null", async () => {
    // Mock fetch for successful generation
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Generated prompt" } }],
        usage: { prompt_tokens: 10, completion_tokens: 20 },
      }),
    });

    render(<PromptCreatorTab apiKey="sk-test" />);

    await screen.findByLabelText(/Time of Day$/);

    // Fill mandatory field to enable generation
    const dropdown = await screen.findByLabelText(/Time of Day$/);
    fireEvent.change(dropdown, { target: { value: "Dusk" } });

    // Wait for button to be enabled
    await waitFor(() => {
      const generateButton = screen.getByRole("button", {
        name: /^Generate$/i,
      });
      expect(generateButton).not.toBeDisabled();
    });

    // Click generate button
    const generateButton = screen.getByRole("button", {
      name: /^Generate$/i,
    });
    fireEvent.click(generateButton);

    // Wait for generation to complete by finding the heading
    await waitFor(
      () => {
        expect(
          screen.getByRole("heading", { name: /Generated Prompt/i }),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Find the details element and simulate toggle with null currentTarget
    const detailsElement = screen
      .getByText(/Backend Process Steps/i)
      .closest("details");

    if (detailsElement) {
      // Create a toggle event with null currentTarget (edge case)
      const toggleEvent = new Event("toggle", { bubbles: true });
      Object.defineProperty(toggleEvent, "currentTarget", {
        value: null,
        writable: false,
      });

      // This should not crash the application
      expect(() => {
        detailsElement.dispatchEvent(toggleEvent);
      }).not.toThrow();
    }
  });
});
