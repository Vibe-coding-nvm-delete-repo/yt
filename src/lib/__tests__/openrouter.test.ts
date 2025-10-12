import { OpenRouterClient } from '../openrouter';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('OpenRouterClient', () => {
  let client: OpenRouterClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new OpenRouterClient('test-api-key');
  });

  describe('getVisionModels', () => {
    it('filters models correctly based on image pricing', async () => {
      const mockResponse = {
        data: [
          {
            id: 'anthropic/claude-3.7-sonnet',
            name: 'Anthropic: Claude 3.7 Sonnet',
            description: 'Latest Claude model',
            pricing: {
              prompt: '0.000003',
              completion: '0.000015',
              image: '0.0048', // Has image pricing > 0
            },
          },
          {
            id: 'openai/gpt-4',
            name: 'OpenAI: GPT-4',
            pricing: {
              prompt: '0.00003',
              completion: '0.00006',
              // No image pricing - should be filtered out
            },
          },
          {
            id: 'gemini/gemini-pro-vision',
            name: 'Google: Gemini Pro Vision',
            pricing: {
              prompt: '0.00000025',
              completion: '0.0000005',
              image: '0.0025', // Has image pricing > 0
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as unknown as Response);

      const models = await client.getVisionModels();

      expect(models).toHaveLength(2);
      expect(models[0].id).toBe('anthropic/claude-3.7-sonnet');
      expect(models[1].id).toBe('gemini/gemini-pro-vision');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/models',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        })
      );
    });
  });

  describe('cost calculations', () => {
    const mockModel = {
      id: 'test-model',
      name: 'Test Model',
      description: 'Test model for cost calculations',
      pricing: {
        prompt: 0.00003,
        completion: 0.00006,
      },
      context_length: 4096,
      supports_image: true,
      supports_vision: true,
    };

    it('calculates generation cost correctly', () => {
      const result = client.calculateGenerationCost(mockModel, 12); // 12 character prompt
      expect(result.inputCost).toBe(0); // Image cost not implemented
      expect(result.outputCost).toBeGreaterThan(0); // Text cost should be calculated
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.totalCost).toBe(result.inputCost + result.outputCost);
    });
  });
});
