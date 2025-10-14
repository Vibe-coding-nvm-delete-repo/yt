import calculateGenerationCost, { calculateDetailedCost } from "@/lib/cost";
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

  describe("calculateDetailedCost (recommended for production)", () => {
    const mockImageSmall = "data:image/png;base64," + "A".repeat(50000); // Small image ~37.5KB
    const mockImageMedium = "data:image/png;base64," + "A".repeat(200000); // Medium image ~150KB
    const mockOutput = "This is a test output prompt"; // 28 chars = ~7 tokens

    test("calculates costs correctly for small image", () => {
      const cost = calculateDetailedCost(mockModel, mockImageSmall, mockOutput);
      
      expect(cost.inputTokens).toBe(85); // Small image = 85 tokens
      expect(cost.outputTokens).toBe(7); // 28 chars / 4 = 7 tokens
      expect(cost.inputCost).toBe(0.000085); // 85 * 0.000001
      expect(cost.outputCost).toBe(0.000014); // 7 * 0.000002
      expect(cost.totalCost).toBe(0.000099); // sum
    });

    test("calculates costs correctly for medium image", () => {
      const cost = calculateDetailedCost(mockModel, mockImageMedium, mockOutput);
      
      expect(cost.inputTokens).toBe(120); // Medium image = 120 tokens
      expect(cost.outputTokens).toBe(7);
      expect(cost.inputCost).toBe(0.000120); // 120 * 0.000001
      expect(cost.outputCost).toBe(0.000014); // 7 * 0.000002
      expect(cost.totalCost).toBe(0.000134);
    });

    test("calculates costs correctly with longer output", () => {
      const longOutput = "A".repeat(400); // 400 chars = 100 tokens
      const cost = calculateDetailedCost(mockModel, mockImageSmall, longOutput);
      
      expect(cost.inputTokens).toBe(85);
      expect(cost.outputTokens).toBe(100); // 400 / 4
      expect(cost.inputCost).toBe(0.000085);
      expect(cost.outputCost).toBe(0.000200); // 100 * 0.000002
      expect(cost.totalCost).toBe(0.000285);
    });

    test("handles free models correctly", () => {
      const freeModel: VisionModel = {
        ...mockModel,
        pricing: { prompt: 0, completion: 0 },
      };
      const cost = calculateDetailedCost(freeModel, mockImageSmall, mockOutput);
      
      expect(cost.inputCost).toBe(0);
      expect(cost.outputCost).toBe(0);
      expect(cost.totalCost).toBe(0);
    });
  });

  describe("calculateGenerationCost (legacy - deprecated)", () => {
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
});
