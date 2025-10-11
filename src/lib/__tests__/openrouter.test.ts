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
});
