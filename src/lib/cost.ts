import { VisionModel } from '@/types';

/**
 * Calculate prompt/text cost given token count and pricing per 1k tokens.
 * This is a pure helper used by UI and tests.
 */
export function calcTextCost(tokens: number, pricePerK: number): number {
  return +((tokens / 1000) * pricePerK).toFixed(6);
}

/**
 * calculateGenerationCost
 * Given a model and an estimated output length (characters or tokens),
 * returns input/output/total cost in USD as numbers.
 *
 * Note: This function is intentionally simple — it uses model.pricing.prompt
 * and model.pricing.completion as per-1k-token pricing. Caller should
 * convert characters to tokens if needed (approx: 4 chars per token).
 */
export function calculateGenerationCost(model: VisionModel, estimatedOutputLength: number) {
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
