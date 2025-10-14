import { createOpenRouterClient } from '../openrouter';
import type { VisionModel } from '@/types';

// Mock fetch to prevent actual API calls
global.fetch = jest.fn();

const mockModel: VisionModel = {
  id: 'test-model',
  name: 'Test Vision Model',
  pricing: {
    prompt: 0.03, // $0.03 per 1k tokens
    completion: 0.06, // $0.06 per 1k tokens
  },
  supports_vision: true,
};

const mockModelZeroCost: VisionModel = {
  id: 'free-model',
  name: 'Free Model',
  pricing: {
    prompt: 0,
    completion: 0,
  },
  supports_vision: true,
};

describe('OpenRouterClient Cost Calculations', () => {
  let client: ReturnType<typeof createOpenRouterClient>;

  beforeEach(() => {
    client = createOpenRouterClient('sk-or-v1-test-api-key');
    jest.clearAllMocks();
  });

  describe('calculateImageCost', () => {
    it('calculates image cost based on prompt pricing', () => {
      const cost = client.calculateImageCost(mockModel);
      
      // Should be prompt price * 0.001
      const expected = 0.03 * 0.001;
      expect(cost).toBe(parseFloat(expected.toFixed(6)));
    });

    it('handles zero pricing', () => {
      const cost = client.calculateImageCost(mockModelZeroCost);
      expect(cost).toBe(0);
    });

    it('returns result with 6 decimal precision', () => {
      const cost = client.calculateImageCost(mockModel);
      const decimal = cost.toString().split('.')[1];
      expect(decimal?.length).toBeLessThanOrEqual(6);
    });
  });

  describe('calculateTextCost', () => {
    it('calculates text cost based on character length and completion pricing', () => {
      const textLength = 1000; // characters
      const cost = client.calculateTextCost(textLength, mockModel);
      
      // Token estimation: Math.ceil(1000 / 3.75) = 267 tokens
      // Cost: (0.06 * 267) / 1000 = 0.016020
      const estimatedTokens = Math.ceil(textLength / 3.75);
      const expected = (0.06 * estimatedTokens) / 1000;
      
      expect(cost).toBe(parseFloat(expected.toFixed(6)));
    });

    it('handles zero completion pricing', () => {
      const cost = client.calculateTextCost(100, mockModelZeroCost);
      expect(cost).toBe(0);
    });

    it('handles small text lengths', () => {
      const cost = client.calculateTextCost(1, mockModel);
      
      // 1 character = 1 token (Math.ceil(1 / 3.75) = 1)
      const expected = (0.06 * 1) / 1000;
      expect(cost).toBe(parseFloat(expected.toFixed(6)));
    });

    it('handles large text lengths', () => {
      const cost = client.calculateTextCost(10000, mockModel);
      
      const estimatedTokens = Math.ceil(10000 / 3.75);
      const expected = (0.06 * estimatedTokens) / 1000;
      expect(cost).toBe(parseFloat(expected.toFixed(6)));
    });

    it('returns result with 6 decimal precision', () => {
      const cost = client.calculateTextCost(500, mockModel);
      const decimal = cost.toString().split('.')[1];
      expect(decimal?.length).toBeLessThanOrEqual(6);
    });
  });

  describe('calculateGenerationCost', () => {
    it('returns detailed cost breakdown', () => {
      const textLength = 500;
      const result = client.calculateGenerationCost(mockModel, textLength);
      
      expect(result).toHaveProperty('inputCost');
      expect(result).toHaveProperty('outputCost');
      expect(result).toHaveProperty('totalCost');
      expect(typeof result.inputCost).toBe('number');
      expect(typeof result.outputCost).toBe('number');
      expect(typeof result.totalCost).toBe('number');
    });

    it('calculates total cost as sum of input and output', () => {
      const textLength = 500;
      const result = client.calculateGenerationCost(mockModel, textLength);
      
      const expectedTotal = result.inputCost + result.outputCost;
      expect(result.totalCost).toBe(parseFloat(expectedTotal.toFixed(6)));
    });

    it('handles zero costs correctly', () => {
      const result = client.calculateGenerationCost(mockModelZeroCost, 100);
      
      expect(result.inputCost).toBe(0);
      expect(result.outputCost).toBe(0);
      expect(result.totalCost).toBe(0);
    });

    it('returns consistent results for same inputs', () => {
      const textLength = 750;
      const result1 = client.calculateGenerationCost(mockModel, textLength);
      const result2 = client.calculateGenerationCost(mockModel, textLength);
      
      expect(result1.inputCost).toBe(result2.inputCost);
      expect(result1.outputCost).toBe(result2.outputCost);
      expect(result1.totalCost).toBe(result2.totalCost);
    });

    it('formats all costs with proper precision', () => {
      const result = client.calculateGenerationCost(mockModel, 1000);
      
      // Check that all values are properly formatted numbers
      expect(Number.isFinite(result.inputCost)).toBe(true);
      expect(Number.isFinite(result.outputCost)).toBe(true);
      expect(Number.isFinite(result.totalCost)).toBe(true);
      
      // Check decimal precision
      [result.inputCost, result.outputCost, result.totalCost].forEach(cost => {
        const decimal = cost.toString().split('.')[1];
        if (decimal) {
          expect(decimal.length).toBeLessThanOrEqual(6);
        }
      });
    });
  });

  describe('Token Estimation Accuracy', () => {
    it('uses correct token-to-character ratio', () => {
      const textLength = 375; // Should be exactly 100 tokens
      const cost = client.calculateTextCost(textLength, mockModel);
      
      const expectedTokens = Math.ceil(375 / 3.75); // = 100 tokens
      const expectedCost = (0.06 * expectedTokens) / 1000;
      
      expect(cost).toBe(parseFloat(expectedCost.toFixed(6)));
    });

    it('rounds up fractional tokens correctly', () => {
      const textLength = 4; // Should be 2 tokens: Math.ceil(4 / 3.75)
      const cost = client.calculateTextCost(textLength, mockModel);
      
      const expectedTokens = 2; // Math.ceil(4 / 3.75) = 2
      const expectedCost = (0.06 * expectedTokens) / 1000;
      
      expect(cost).toBe(parseFloat(expectedCost.toFixed(6)));
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined pricing gracefully', () => {
      const modelWithUndefinedPricing: VisionModel = {
        id: 'undefined-model',
        name: 'Undefined Pricing Model',
        pricing: {
          prompt: undefined as any,
          completion: undefined as any,
        },
        supports_vision: true,
      };

      const result = client.calculateGenerationCost(modelWithUndefinedPricing, 100);
      
      expect(result.inputCost).toBe(0);
      expect(result.outputCost).toBe(0);
      expect(result.totalCost).toBe(0);
    });

    it('handles null pricing gracefully', () => {
      const modelWithNullPricing: VisionModel = {
        id: 'null-model',
        name: 'Null Pricing Model',
        pricing: {
          prompt: null as any,
          completion: null as any,
        },
        supports_vision: true,
      };

      const result = client.calculateGenerationCost(modelWithNullPricing, 100);
      
      expect(result.inputCost).toBe(0);
      expect(result.outputCost).toBe(0);
      expect(result.totalCost).toBe(0);
    });

    it('handles zero text length', () => {
      const result = client.calculateGenerationCost(mockModel, 0);
      
      // Should still have input cost, but zero output cost
      expect(result.inputCost).toBeGreaterThan(0);
      expect(result.outputCost).toBe(0);
      expect(result.totalCost).toBe(result.inputCost);
    });
  });
});
