import type { TextModel } from "@/lib/openrouter";

/**
 * Build model-driven instructions for prompt generation
 * @param model - The text model to generate instructions for
 * @returns Instruction string for the model
 */
export const buildModelDrivenInstructions = (model: TextModel): string =>
  [
    `You are ${model.name}, an advanced text generation model that specializes in high quality prompt construction.`,
    model.description ? `Model context: ${model.description.trim()}` : null,
    "Use the provided variables to synthesize a complete creative brief. The prompt must be production ready, richly descriptive, and stay faithful to every variable.",
    "Respond with a single prompt that can be executed directly without further editing.",
  ]
    .filter(Boolean)
    .join("\n");

/**
 * Build model-driven rubric for prompt rating
 * @param model - The text model to generate rubric for
 * @returns Rubric string for rating prompts
 */
export const buildModelDrivenRubric = (model: TextModel): string =>
  [
    `Evaluate how well the generated prompt would perform when executed by ${model.name}.`,
    "Score from 1-10 based on clarity, alignment with the supplied variables, actionable detail, and readiness for immediate use.",
    "Call out missing variables, vague language, or risky phrasing. Provide specific improvement guidance when the score is below 8.",
  ].join("\n");
