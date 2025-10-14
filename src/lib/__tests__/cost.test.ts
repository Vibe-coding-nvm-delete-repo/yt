import calculateGenerationCost from "@/lib/cost";
import type { VisionModel } from "@/types";

describe("cost calculation", () => {
  const mockModel: VisionModel = {
    id: "test-model",
    name: "Test Model",
    description: "Test",
    pricing: {
      prompt: 0.000001, // $0.000001 per token = $1 per 1M tokens (OpenRouter format)
      completion: 0.000002, // $0.000002 per token = $2 per 1M tokens (OpenRouter format)
    },
    supports_image: true,
    supports_vision: true,
  };

  test("calculates correct input cost for short prompt", () => {
    const cost = calculateGenerationCost(mockModel, 100);
    expect(cost.inputCost).toBe(0.000025);
  });

  test("calculates correct input cost for long prompt", () => {
    const cost = calculateGenerationCost(mockModel, 1000);
    expect(cost.inputCost).toBe(0.00025);
  });

  test("calculates total cost correctly", () => {
    const cost = calculateGenerationCost(mockModel, 500);
    expect(cost.totalCost).toBe(0.000375);
  });

  test("handles zero pricing models", () => {
    const freeModel: VisionModel = {
      ...mockModel,
      pricing: { prompt: 0, completion: 0 },
    };
    const cost = calculateGenerationCost(freeModel, 500);
    expect(cost.totalCost).toBe(0);
  });

  test("handles zero pricing (missing or zero)", () => {
    const noPricing: VisionModel = {
      ...mockModel,
      pricing: { prompt: 0, completion: 0 },
    };
    const cost = calculateGenerationCost(noPricing, 500);
    expect(cost.inputCost).toBe(0);
    expect(cost.outputCost).toBe(0);
  });
});
