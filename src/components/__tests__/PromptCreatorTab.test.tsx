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
      await screen.findByText(
        /Select all mandatory fields before generating prompts/i,
      ),
    ).toBeInTheDocument();

    const generateButton = screen.getByRole("button", {
      name: /^Generate$/i,
    });
    expect(generateButton).toBeDisabled();

    const dropdown = await screen.findByLabelText(/Time of Day$/);
    fireEvent.change(dropdown, { target: { value: "Dusk" } });

    await waitFor(() => {
      expect(
        screen.queryByText(
          /Select all mandatory fields before generating prompts/i,
        ),
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

  it("displays explanatory text about how the Prompt Creator works", async () => {
    render(<PromptCreatorTab apiKey="sk-test" />);

    await screen.findByLabelText(/Time of Day$/);

    expect(
      screen.getByText("How the Prompt Creator works:"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Set up your prompt fields in Settings/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/A base prompt.*is always prepended/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Fill in the mandatory fields/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Click.*Generate.*to create a single prompt/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The generated prompt appears in a scrollable field/i),
    ).toBeInTheDocument();
  });
});
