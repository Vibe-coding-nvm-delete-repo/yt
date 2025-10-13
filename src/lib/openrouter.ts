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

  /**
   * Make a fetch request and parse JSON safely.
   * On non-2xx responses, attempt to parse error JSON and throw ApiError.
   * On successful responses, attempt to parse JSON and return it; if JSON parsing fails,
   * throw an ApiError that includes the raw response text for debugging.
   */
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
        // Try to parse structured error response
        errorData = await response.json();
      } catch {
        // Fallback to raw text if JSON can't be parsed
        try {
          const txt = await response.text();
          errorData = { raw: txt };
        } catch {
          errorData = {};
        }
      }
      
      // Derive a helpful error message from structured error payloads when possible
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      if (typeof errorData === 'object' && errorData !== null) {
        const ed = errorData as Record<string, unknown>;
        if ('error' in ed && typeof ed.error === 'object' && ed.error !== null) {
          const nested = ed.error as Record<string, unknown>;
          if ('message' in nested && typeof nested.message === 'string') {
            errorMessage = nested.message;
          }
        }
      }

      throw new ApiError(
        errorMessage,
        response.status.toString(),
        errorData
      );
    }

    // Attempt to parse JSON for successful responses, but surface a helpful ApiError if parsing fails.
    try {
      const parsed = await response.json();
      return parsed as T;
    } catch (parseErr) {
      // Try to capture raw text for debugging
      let raw: string | null = null;
      try {
        raw = await response.text();
      } catch {
        raw = null;
      }
      throw new ApiError(
        'Failed to parse response JSON from OpenRouter API',
        response.status.toString(),
        { parseError: String(parseErr), raw }
      );
    }
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
        throw new ApiError('Invalid response format from OpenRouter API', undefined, response);
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
      throw new ApiError('Failed to fetch models from OpenRouter API', undefined, error instanceof Error ? error.toString() : String(error));
    }
  }

  /**
   * Calculate the cost for image processing
   * Note: Image pricing not currently tracked in VisionModel interface
   * @param _model The vision model used (unused for now)
   * @returns Cost estimate in USD (currently 0, can be enhanced later)
   */
  calculateImageCost(model: VisionModel): number {
    // TODO: Add image pricing to VisionModel interface when needed
    // For now, image processing costs are not tracked
    return 0;
  }

  /**
   * Estimate the cost for processing text
   * @param textLength Character count of text
   * @param model The model used for completion
   * @returns Cost estimate in USD
   */
  calculateTextCost(textLength: number, model: VisionModel): number {
    const pricePerThousand = this.safeNumber(model.pricing?.completion, 0);
    // Rough estimate: ~4 characters per token
    const estimatedTokens = Math.ceil(textLength / 4);
    // pricePerThousand is USD per 1000 tokens; return proportional cost
    return (pricePerThousand * estimatedTokens) / 1000;
  }

  /**
   * Get combined total cost for a generation
   * @param model The model used
   * @param textLength Character count of generated text
   * @returns Object with individual and total costs
   */
  calculateGenerationCost(model: VisionModel, textLength: number) {
    const inputCost = this.calculateImageCost(model);
    const outputCost = this.calculateTextCost(textLength, model);
    const totalCost = inputCost + outputCost;

    return {
      inputCost,
      outputCost,
      totalCost,
    };
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

      // Validate the response shape explicitly and include the raw payload in the ApiError for telemetry.
      if (!response || !response.choices || !Array.isArray(response.choices) || response.choices.length === 0 ||
          !response.choices[0] || !response.choices[0].message || typeof response.choices[0].message.content !== 'string') {
        throw new ApiError('Invalid response format from OpenRouter API', undefined, response);
      }

      return response.choices[0].message.content.trim();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;  // Preserve specific ApiError with correct message and details
      }
      throw new ApiError('Failed to generate prompt from image', undefined, error instanceof Error ? error.toString() : String(error));
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
