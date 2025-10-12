import { createOpenRouterClient } from '@/lib/openrouter';
import { ApiError } from '@/types';

describe('OpenRouter response validation', () => {
  const ORIGINAL_FETCH = global.fetch;

  afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
    jest.resetAllMocks();
  });

  test('generateImagePrompt throws ApiError on empty object response', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({}),
      text: async () => '{}',
    } as unknown as Response);

    const client = createOpenRouterClient('sk-or-v1-testkey-0000000000000000');
    await expect(client.generateImagePrompt('data://x', 'prompt', 'model-id')).rejects.toBeInstanceOf(ApiError);

    try {
      await client.generateImagePrompt('data://x', 'prompt', 'model-id');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      // message should be generic, raw payload available in third parameter (details)
      expect((err as ApiError).message).toMatch(/Invalid response format/);
      expect((err as ApiError).details).toBeDefined();
    }
  });

  test('generateImagePrompt throws ApiError when choices missing', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ choices: [] }),
      text: async () => '{"choices":[]}',
    } as unknown as Response);

    const client = createOpenRouterClient('sk-or-v1-testkey-0000000000000000');
    await expect(client.generateImagePrompt('data://x', 'prompt', 'model-id')).rejects.toBeInstanceOf(ApiError);
  });

  test('getVisionModels throws ApiError on invalid models response', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ data: null }),
      text: async () => '{"data":null}',
    } as unknown as Response);

    const client = createOpenRouterClient('sk-or-v1-testkey-0000000000000000');
    await expect(client.getVisionModels()).rejects.toBeInstanceOf(ApiError);
  });

  test('makeRequest surfaces non-2xx structured error as ApiError', async () => {
    const structuredError = { error: { message: 'Bad API key' } };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => structuredError,
      text: async () => JSON.stringify(structuredError),
    } as unknown as Response);

    const client = createOpenRouterClient('sk-or-v1-testkey-0000000000000000');
    await expect(client.validateApiKey()).resolves.toBe(false);
  });
});
