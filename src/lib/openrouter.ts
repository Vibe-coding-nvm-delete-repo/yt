import { OpenAI } from 'openai';
import type { VisionModel } from '@/types';

/**
 * Client for OpenRouter API.
 *
 * All methods accept `settings.openRouterApiKey` from AppSettings.
 * Methods:
 * - validateApiKey(): Promise<boolean>
 * - generateImagePrompt(imageBase64: string, customPrompt: string, modelId: string): Promise<string>
 * - getVisionModels(): Promise<VisionModel[]>
 *
 * All API calls use OpenAI's SDK but with baseURL='https://openrouter.ai/api/v1'.
 * Models fetched from /api/v1/models?format=v1 (OpenAI format) with vision capability filter.
 */
export const createOpenRouterClient = (apiKey: string) => ({
  // Validate API key by calling /key/info
  validateApiKey: async (): Promise<boolean> => {
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });
    try {
      const response = await client?.chat?.completions?.create({
        model: 'openai/gpt-4o-mini', // any model works for validation
        messages: [{ role: 'user', content: '' }],
        max_tokens: 1,
        temperature: 0,
        stream: false,
      });
      return response !== null; // if no error, valid
    } catch {
      return false;
    }
  },

  // Generate prompt from image using vision model
  generateImagePrompt: async (imageBase64: string, customPrompt: string, modelId: string): Promise<string> => {
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });

    const messages = [
      {
        role: 'system',
        content: customPrompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Describe this image in detail, suggesting a good prompt for generating similar images using tools like DALL·E or Midjourney.',
          },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64,
            },
          },
        ],
      },
    ];

    const result = await client.chat.completions.create({
      model: modelId,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    return result.choices[0].message.content;
  },

  // Fetch vision models from OpenRouter
  getVisionModels: async (): Promise<VisionModel[]> => {
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });

    const response = await fetch(`${new OpenAI({ baseURL: 'https://openrouter.ai/api/v1' }).baseURL}/models?format=v1`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    const data: { data: any[] } = await response.json();

    return data.data.filter(
      (model: any) => model.id !== 'openai/gpt-4o-mini' && model.requires === 'vision' || model.supports === 'vision',
    ).map((model: any) => ({
      id: model.id,
      name: model.name,
      description: model.description || '',
      pricing: {
        prompt: model.context2in1 || 1, // fallback
        completion: model.completionTokenPrice || 2,
      },
    })) as VisionModel[];
  },
});

/**
 * Utility to check if api key format is valid for OpenRouter.
 * OpenRouter keys start with sk-or-v1-
 */
export const isValidApiKeyFormat = (apiKey: string) => apiKey.startsWith('sk-or-v1-');
