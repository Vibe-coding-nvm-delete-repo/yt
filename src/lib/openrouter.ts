import { VisionModel, ApiError } from '@/types';

interface OpenRouterModelResponse {
  id: string;
  name: string;
  description?: string;
  pricing?: {
    prompt: string | number;
    completion: string | number;
    image?: string | number;
  };
  context_length?: number;
  supports_image?: boolean;
  supports_vision?: boolean;
}

interface OpenRouterModelsResponse {
  data: OpenRouterModelResponse[];
}

interface OpenRouterChatChoice {
  message: {
    content: string;
  };
}

interface OpenRouterChatResponse {
  choices: OpenRouterChatChoice[];
}

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';

export class OpenRouterClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Safely convert a value to a number with proper validation
   * @param value The value to convert
   * @param defaultValue The default value if conversion fails
   * @returns A valid number or the default value
   */
  private safeNumber(value: unknown, defaultValue: number = 0): number {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    
    if (isNaN(num) || !isFinite(num)) {
      return defaultValue;
    }
    
    return num;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${OPENROUTER_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'Image to Prompt Generator',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
      
      const errorMessage = typeof errorData === 'object' && errorData && 'error' in errorData && 
        typeof errorData.error === 'object' && errorData.error && 'message' in errorData.error &&
        typeof errorData.error.message === 'string'
        ? errorData.error.message 
        : `HTTP ${response.status}: ${response.statusText}`;
        
      throw new ApiError(
        errorMessage,
        response.status.toString(),
        errorData
      );
    }

    return response.json();
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.makeRequest('/models', { method: 'GET' });
      return true;
    } catch (error) {
      if (error instanceof ApiError && (error.code === '401' || error.code === '403')) {
        return false;
      }
      console.error('validateApiKey error:', error);
      throw error;
    }
  }

  async getVisionModels(): Promise<VisionModel[]> {
    try {
      const response = await this.makeRequest<OpenRouterModelsResponse>('/models');
      
      if (!response?.data || !Array.isArray(response.data)) {
        console.error('Invalid response format:', response);
        throw new ApiError('Invalid response format from OpenRouter API');
      }

      const models: VisionModel[] = response.data
        .filter((model: OpenRouterModelResponse): model is OpenRouterModelResponse =>
          Boolean(model?.id) &&
          Boolean(model?.name)
        )
        .filter((model: OpenRouterModelResponse) => {
          // Vision models are identified by having a non-zero image pricing
          const hasImagePricing = model.pricing?.image && this.safeNumber(model.pricing.image, 0) > 0;
          return hasImagePricing;
        })
        .map((model: OpenRouterModelResponse): VisionModel => ({
          id: model.id,
          name: model.name,
          description: model.description || '',
          pricing: {
            prompt: this.safeNumber(model.pricing?.prompt, 0),
            completion: this.safeNumber(model.pricing?.completion, 0),
          },
          context_length: this.safeNumber(model.context_length) ? Number(model.context_length) : undefined,
          supports_image: Boolean(model.supports_image) || Boolean(model.supports_vision),
          supports_vision: Boolean(model.supports_vision) || Boolean(model.supports_image),
        }))
        .sort((a: VisionModel, b: VisionModel) => a.name.localeCompare(b.name));

      if (models.length === 0) {
        throw new ApiError('No vision models found. Please check your API key and try again.');
      }

      return models;
    } catch (error) {
      console.error('getVisionModels error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to fetch models from OpenRouter API');
    }
  }

  async generateImagePrompt(
    imageData: string,
    customPrompt: string,
    modelId: string
  ): Promise<string> {
    try {
      const messages = [
        {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: customPrompt || 'Describe this image in detail and suggest a good prompt for generating similar images.',
            },
            {
              type: 'image_url' as const,
              image_url: {
                url: imageData,
              },
            },
          ],
        },
      ];

      const response = await this.makeRequest<OpenRouterChatResponse>('/chat/completions', {
        method: 'POST',
        body: JSON.stringify({
          model: modelId,
          messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.choices || !response.choices[0]?.message?.content) {
        throw new ApiError('Invalid response format from OpenRouter API');
      }

      return response.choices[0].message.content.trim();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to generate prompt from image');
    }
  }
}

export const createOpenRouterClient = (apiKey: string): OpenRouterClient => {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new ApiError('API key is required');
  }
  return new OpenRouterClient(apiKey.trim());
};

export const isValidApiKeyFormat = (apiKey: string): boolean => {
  // OpenRouter API keys typically start with 'sk-or-v1-' and are at least 20 characters
  const trimmedKey = apiKey.trim();
  return trimmedKey.length >= 20 && trimmedKey.startsWith('sk-or-v1-');
};
