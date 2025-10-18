import {
  buildModelDrivenInstructions,
  buildModelDrivenRubric,
} from "../promptCreatorHelpers";
import type { TextModel } from "@/lib/openrouter";

describe("buildModelDrivenInstructions", () => {
  it("should build instructions with model name", () => {
    const model: TextModel = {
      id: "test-model",
      name: "Test Model",
      description: "A test model",
      pricing: { prompt: 0, completion: 0 },
      context_length: 1000,
    };

    const instructions = buildModelDrivenInstructions(model);
    expect(instructions).toContain("Test Model");
    expect(instructions).toContain(
      "advanced text generation model that specializes in high quality prompt construction",
    );
  });

  it("should include model description when available", () => {
    const model: TextModel = {
      id: "test-model",
      name: "Test Model",
      description: "A specialized test model",
      pricing: { prompt: 0, completion: 0 },
      context_length: 1000,
    };

    const instructions = buildModelDrivenInstructions(model);
    expect(instructions).toContain("Model context: A specialized test model");
  });

  it("should work without model description", () => {
    const model: TextModel = {
      id: "test-model",
      name: "Test Model",
      description: "",
      pricing: { prompt: 0, completion: 0 },
      context_length: 1000,
    };

    const instructions = buildModelDrivenInstructions(model);
    expect(instructions).toContain("Test Model");
    expect(instructions).not.toContain("Model context:");
  });

  it("should include standard prompting guidelines", () => {
    const model: TextModel = {
      id: "test-model",
      name: "Test Model",
      description: "",
      pricing: { prompt: 0, completion: 0 },
      context_length: 1000,
    };

    const instructions = buildModelDrivenInstructions(model);
    expect(instructions).toContain("production ready");
    expect(instructions).toContain("richly descriptive");
    expect(instructions).toContain("stay faithful to every variable");
  });
});

describe("buildModelDrivenRubric", () => {
  it("should build rubric with model name", () => {
    const model: TextModel = {
      id: "test-model",
      name: "Test Model",
      description: "",
      pricing: { prompt: 0, completion: 0 },
      context_length: 1000,
    };

    const rubric = buildModelDrivenRubric(model);
    expect(rubric).toContain("Test Model");
    expect(rubric).toContain(
      "Evaluate how well the generated prompt would perform",
    );
  });

  it("should include scoring criteria", () => {
    const model: TextModel = {
      id: "test-model",
      name: "Test Model",
      description: "",
      pricing: { prompt: 0, completion: 0 },
      context_length: 1000,
    };

    const rubric = buildModelDrivenRubric(model);
    expect(rubric).toContain("Score from 1-10");
    expect(rubric).toContain("clarity");
    expect(rubric).toContain("alignment");
    expect(rubric).toContain("actionable detail");
  });

  it("should include improvement guidance criteria", () => {
    const model: TextModel = {
      id: "test-model",
      name: "Test Model",
      description: "",
      pricing: { prompt: 0, completion: 0 },
      context_length: 1000,
    };

    const rubric = buildModelDrivenRubric(model);
    expect(rubric).toContain("missing variables");
    expect(rubric).toContain("vague language");
    expect(rubric).toContain("score is below 8");
  });
});
