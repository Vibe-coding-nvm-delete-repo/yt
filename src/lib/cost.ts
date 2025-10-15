import type { VisionModel } from "@/types";

/**
 * Calculate prompt/text cost given token count and price per token (OpenRouter format).
 * OpenRouter API returns pricing as $/token (e.g., 0.00003 = $0.00003/token = $30/1M tokens).
 * This is a pure helper used by UI and tests.
 */
export function calcTextCost(tokens: number, pricePerToken: number): number {
  return +(tokens * pricePerToken).toFixed(6);
}

/**
 * Estimate tokens for image input (vision models)
 * Most vision models use ~85-200 tokens per image depending on resolution
 */
export function estimateImageTokens(imageDataUrl: string): number {
  // Base64 image analysis for rough token estimation
  const base64Data = imageDataUrl.split(",")[1] || "";
  const sizeInBytes = base64Data.length * 0.75; // Base64 to bytes conversion

  // Vision model token estimation based on image complexity
  if (sizeInBytes < 100000) return 85; // Small images
  if (sizeInBytes < 500000) return 120; // Medium images
  if (sizeInBytes < 1000000) return 170; // Large images
  return 200; // Very large images
}

/**
 * Estimate tokens for text output
 * Rule of thumb: 1 token ≈ 4 characters for English text
 */
export function estimateTextTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Calculate detailed generation cost with input/output breakdown
 * For vision models: input = image tokens, output = generated text tokens
 */
export function calculateDetailedCost(
  model: VisionModel,
  imageDataUrl: string,
  outputText: string,
): {
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
} {
  const inputTokens = estimateImageTokens(imageDataUrl);
  const outputTokens = estimateTextTokens(outputText);

  const toNumber = (v: number | string | null | undefined): number =>
    typeof v === "number"
      ? v
      : Number.isFinite(parseFloat(v ?? "0"))
        ? parseFloat(v ?? "0")
        : 0;
  const inputPrice = toNumber(model.pricing?.prompt);
  const outputPrice = toNumber(model.pricing?.completion);

  const inputCost = calcTextCost(inputTokens, inputPrice);
  const outputCost = calcTextCost(outputTokens, outputPrice);
  const totalCost = inputCost + outputCost;

  return {
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost,
  };
}

/**
 * calculateGenerationCost (legacy function for backward compatibility)
 * Given a model and an estimated output length (characters or tokens),
 * returns input/output/total cost in USD as numbers.
 */
export function calculateGenerationCost(
  model: VisionModel,
  estimatedOutputLength: number,
) {
  // approximate tokens from characters (4 chars/token)
  const tokens = Math.max(1, Math.round(estimatedOutputLength / 4));
  const inputCost = calcTextCost(tokens, model.pricing.prompt || 0);
  const outputCost = calcTextCost(tokens, model.pricing.completion || 0);
  const totalCost = inputCost + outputCost;
  return {
    inputCost,
    outputCost,
    totalCost,
  };
}

export default calculateGenerationCost;
