import type { VisionModel } from "@/types";
import { ApiError } from "@/types";

interface OpenRouterModelResponse {
  id: string;
  name: string;
  description?: string;
  pricing?: {
    prompt?: string | number;
    completion?: string | number;
    image?: string | number;
  };
  context_length?: string | number;
  architecture?: {
    modality?: string;
    input_modalities?: string[];
    output_modalities?: string[];
  };
}

interface OpenRouterModelsResponse {
  data: OpenRouterModelResponse[];
}

interface OpenRouterChatChoice {
  message?: {
    content?: string;
  };
}

interface OpenRouterChatResponse {
  choices: OpenRouterChatChoice[];
}

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

export class OpenRouterClient {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private safeNumber(value: unknown, defaultValue = 0): number {
    if (value === null || value === undefined || value === "") {
      return defaultValue;
    }

    const asNumber =
      typeof value === "string" ? parseFloat(value) : Number(value);

    if (Number.isNaN(asNumber) || !Number.isFinite(asNumber)) {
      return defaultValue;
    }

    return asNumber;
  }

  private normaliseHeaders(headers?: HeadersInit): Record<string, string> {
    if (!headers) {
      return {};
    }

    if (headers instanceof Headers) {
      return Object.fromEntries(headers.entries());
    }

    if (Array.isArray(headers)) {
      return Object.fromEntries(headers);
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${OPENROUTER_API_BASE}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "HTTP-Referer":
        typeof window !== "undefined" ? window.location.origin : "",
      "X-Title": "Image to Prompt Generator",
    };

    const requestInit: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...this.normaliseHeaders(options.headers),
      },
    };

    const response = await fetch(url, requestInit);
    const responseClone = response.clone();

    if (!response.ok) {
      let errorData: unknown;

      try {
        errorData = await responseClone.json();
      } catch {
        try {
          errorData = await responseClone.text();
        } catch {
          errorData = {};
        }
      }

      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      if (
        typeof errorData === "object" &&
        errorData !== null &&
        "error" in errorData &&
        typeof (errorData as Record<string, unknown>).error === "object" &&
        (errorData as Record<string, unknown>).error !== null
      ) {
        const nested = (errorData as Record<string, unknown>).error as Record<
          string,
          unknown
        >;
        if (typeof nested.message === "string") {
          errorMessage = nested.message;
        }
      }

      throw new ApiError(errorMessage, response.status.toString(), errorData);
    }

    try {
      const parsed = await response.json();
      return parsed as T;
    } catch (parseErr) {
      let raw: string | null = null;

      try {
        raw = await responseClone.text();
      } catch {
        raw = null;
      }

      throw new ApiError(
        "Failed to parse response JSON from OpenRouter API",
        response.status.toString(),
        {
          parseError: String(parseErr),
          raw,
        },
      );
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.makeRequest<OpenRouterModelsResponse>("/models", {
        method: "GET",
      });
      return true;
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.code === "401" || error.code === "403")
      ) {
        return false;
      }
      console.error("validateApiKey error:", error);
      throw error;
    }
  }

  async getVisionModels(): Promise<VisionModel[]> {
    try {
      const response = await this.makeRequest<OpenRouterModelsResponse>(
        "/models",
        { method: "GET" },
      );

      if (!response?.data || !Array.isArray(response.data)) {
        console.error("Invalid response format:", response);
        throw new ApiError(
          "Invalid response format from OpenRouter API",
          undefined,
          response,
        );
      }

      const models = response.data
        .filter(
          (model): model is OpenRouterModelResponse =>
            Boolean(model?.id) && Boolean(model?.name),
        )
        .filter((model) => {
          // Check if model supports vision/image input via input_modalities
          const hasImageModality =
            model.architecture?.input_modalities?.includes("image") ?? false;
          return hasImageModality;
        })
        .map((model) => {
          const contextLength = this.safeNumber(model.context_length, 0);

          const hasImageModality =
            model.architecture?.input_modalities?.includes("image") ?? false;

          return {
            id: model.id,
            name: model.name,
            description: model.description ?? "",
            pricing: {
              prompt: this.safeNumber(model.pricing?.prompt, 0),
              completion: this.safeNumber(model.pricing?.completion, 0),
            },
            ...(contextLength > 0 && { context_length: contextLength }),
            supports_image: hasImageModality,
            supports_vision: hasImageModality,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      if (models.length === 0) {
        throw new ApiError(
          "No vision models found. Please check your API key and try again.",
        );
      }

      return models;
    } catch (error) {
      console.error("getVisionModels error:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "Failed to fetch models from OpenRouter API",
        undefined,
        error instanceof Error ? error.toString() : String(error),
      );
    }
  }

  calculateImageCost(_model: VisionModel): number {
    return 0;
  }

  calculateTextCost(textLength: number, model: VisionModel): number {
    const pricePerMillionTokens = this.safeNumber(
      model.pricing?.completion,
      0,
    );
    const estimatedTokens = Math.ceil(textLength / 4);
    // OpenRouter pricing is in $/1M tokens
    return (pricePerMillionTokens * estimatedTokens) / 1000000;
  }

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
    modelId: string,
  ): Promise<string> {
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              customPrompt ||
              "Describe this image in detail and suggest a good prompt for generating similar images.",
          },
          {
            type: "image_url",
            image_url: {
              url: imageData,
            },
          },
        ],
      },
    ];

    try {
      const response = await this.makeRequest<OpenRouterChatResponse>(
        "/chat/completions",
        {
          method: "POST",
          body: JSON.stringify({
            model: modelId,
            messages,
            max_tokens: 1000,
            temperature: 0.7,
          }),
        },
      );

      if (
        !response ||
        !Array.isArray(response.choices) ||
        response.choices.length === 0 ||
        !response.choices[0]?.message?.content
      ) {
        throw new ApiError(
          "Invalid response format from OpenRouter API",
          undefined,
          response,
        );
      }

      return response.choices[0].message.content.trim();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        "Failed to generate prompt from image",
        undefined,
        error instanceof Error ? error.toString() : String(error),
      );
    }
  }
}

export const createOpenRouterClient = (apiKey: string): OpenRouterClient => {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new ApiError("API key is required");
  }

  return new OpenRouterClient(apiKey.trim());
};

export const isValidApiKeyFormat = (apiKey: string): boolean => {
  const trimmedKey = apiKey.trim();
  return trimmedKey.length >= 20 && trimmedKey.startsWith("sk-or-v1-");
};
