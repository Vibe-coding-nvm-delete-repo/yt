import { 
  AppError, 
  ErrorType, 
  NetworkError, 
  APIError, 
  AuthenticationError, 
  RateLimitError,
  TimeoutError,
  createErrorFromResponse,
  createErrorFromException 
} from '../types/errors';
import { retryAsync, RetryStrategies, RetryOptions } from '../utils/retry';

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens?: number;
  };
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
  object: string;
}

export interface VisionModel {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  pricing: {
    prompt: number;
    completion: number;
  };
  supportsVision: boolean;
}

export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterClientConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
  retryOptions?: RetryOptions;
  enableDebugLogging?: boolean;
  rateLimitConfig?: {
    requestsPerSecond: number;
    burstLimit: number;
  };
}

export class OpenRouterClient {
  private readonly apiKey: string;
  private readonly baseURL: string;
  private readonly timeout: number;
  private readonly defaultHeaders: Record<string, string>;
  private readonly retryOptions: RetryOptions;
  private readonly enableDebugLogging: boolean;
  private readonly abortControllers: Set<AbortController>;
  
  // Rate limiting
  private requestQueue: Array<{ resolve: Function; reject: Function; request: () => Promise<any> }> = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  private readonly requestsPerSecond: number;
  
  constructor(config: OpenRouterClientConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://openrouter.ai/api/v1';
    this.timeout = config.timeout || 30000;
    this.enableDebugLogging = config.enableDebugLogging || false;
    this.abortControllers = new Set();
    this.requestsPerSecond = config.rateLimitConfig?.requestsPerSecond || 2;
    
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': process.env.NEXT_PUBLIC_APP_NAME || 'OpenRouter Client',
      ...config.defaultHeaders
    };

    this.retryOptions = {
      ...RetryStrategies.api,
      ...config.retryOptions
    };

    if (!this.apiKey) {
      throw new AuthenticationError(
        'OpenRouter API key is required',
        { component: 'OpenRouterClient', operation: 'constructor' }
      );
    }

    this.log('OpenRouter client initialized', { baseURL: this.baseURL });
  }

  private log(message: string, data?: any) {
    if (this.enableDebugLogging) {
      console.log(`[OpenRouterClient] ${message}`, data);
    }
  }

  private createAbortController(timeoutMs?: number): AbortController {
    const controller = new AbortController();
    this.abortControllers.add(controller);

    const timeout = timeoutMs || this.timeout;
    const timeoutId = setTimeout(() => {
      controller.abort();
      this.abortControllers.delete(controller);
    }, timeout);

    controller.signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      this.abortControllers.delete(controller);
    });

    return controller;
  }

  private async rateLimitRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ resolve, reject, request });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      const minimumInterval = 1000 / this.requestsPerSecond;

      if (timeSinceLastRequest < minimumInterval) {
        await new Promise(resolve => 
          setTimeout(resolve, minimumInterval - timeSinceLastRequest)
        );
      }

      const { resolve, reject, request } = this.requestQueue.shift()!;
      this.lastRequestTime = Date.now();

      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.isProcessingQueue = false;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs?: number
  ): Promise<T> {
    const controller = this.createAbortController(timeoutMs);
    const url = `${this.baseURL}${endpoint}`;

    this.log('Making request', { url, method: options.method || 'GET' });

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      },
      signal: controller.signal
    };

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw createErrorFromResponse(response, `Request failed: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        this.log('Request successful', { url, status: response.status });
        return data;
      } else {
        const text = await response.text();
        this.log('Request successful (text)', { url, status: response.status });
        return text as any;
      }
    } catch (error) {
      if (controller.signal.aborted) {
        throw new TimeoutError(
          `Request to ${endpoint} timed out after ${timeoutMs || this.timeout}ms`,
          timeoutMs || this.timeout,
          { component: 'OpenRouterClient', operation: 'makeRequest', url }
        );
      }

      throw createErrorFromException(error, {
        component: 'OpenRouterClient',
        operation: 'makeRequest',
        url
      });
    }
  }

  private async makeRequestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOptions?: RetryOptions
  ): Promise<T> {
    const mergedRetryOptions = { ...this.retryOptions, ...retryOptions };

    this.log('Making request with retry', { endpoint, retryOptions: mergedRetryOptions });

    const result = await retryAsync(
      () => this.rateLimitRequest(() => this.makeRequest<T>(endpoint, options)),
      {
        ...mergedRetryOptions,
        onRetry: (error, attempt) => {
          this.log(`Retry attempt ${attempt} for ${endpoint}`, { error: error.message });
          if (mergedRetryOptions.onRetry) {
            mergedRetryOptions.onRetry(error, attempt);
          }
        }
      }
    );

    return result.result;
  }

  public async validateApiKey(): Promise<boolean> {
    try {
      this.log('Validating API key');
      
      await this.makeRequestWithRetry<OpenRouterModelsResponse>('/models', { 
        method: 'GET' 
      }, {
        maxRetries: 1,
        retryCondition: () => false
      });

      this.log('API key validation successful');
      return true;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        this.log('API key validation failed - authentication error');
        return false;
      }
      this.log('API key validation failed - other error', { error });
      throw error;
    }
  }

  public async getModels(): Promise<OpenRouterModel[]> {
    try {
      this.log('Fetching models');
      
      const response = await this.makeRequestWithRetry<OpenRouterModelsResponse>('/models');

      if (!response?.data || !Array.isArray(response.data)) {
        throw new APIError(
          'Invalid response format from OpenRouter API',
          undefined,
          'Unable to load models. Please try again.',
          { component: 'OpenRouterClient', operation: 'getModels' }
        );
      }

      this.log('Models fetched successfully', { count: response.data.length });
      return response.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new APIError(
        'Failed to fetch models',
        undefined,
        'Unable to load available models. Please try again.',
        { component: 'OpenRouterClient', operation: 'getModels' }
      );
    }
  }

  public async getVisionModels(): Promise<VisionModel[]> {
    try {
      this.log('Fetching vision models');
      
      const models = await this.getModels();
      const visionModels = this.processModelData(models);

      if (visionModels.length === 0) {
        throw new APIError(
          'No vision models found',
          undefined,
          'No compatible vision models available. Please check your API key.',
          { component: 'OpenRouterClient', operation: 'getVisionModels' }
        );
      }

      this.log('Vision models processed', { count: visionModels.length });
      return visionModels;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new APIError(
        'Failed to fetch vision models',
        undefined,
        'Unable to load vision models. Please try again.',
        { component: 'OpenRouterClient', operation: 'getVisionModels' }
      );
    }
  }

  private processModelData(models: OpenRouterModel[]): VisionModel[] {
    return models
      .filter(model => 
        model.architecture?.modality === 'text+image' ||
        model.name.toLowerCase().includes('vision') ||
        model.description?.toLowerCase().includes('vision')
      )
      .map(model => ({
        id: model.id,
        name: model.name,
        description: model.description || '',
        contextLength: model.context_length,
        pricing: {
          prompt: parseFloat(model.pricing.prompt) || 0,
          completion: parseFloat(model.pricing.completion) || 0
        },
        supportsVision: true
      }));
  }

  public async createChatCompletion(
    request: ChatCompletionRequest,
    retryOptions?: RetryOptions
  ): Promise<ChatCompletionResponse> {
    try {
      this.log('Creating chat completion', { model: request.model });

      const response = await this.makeRequestWithRetry<ChatCompletionResponse>(
        '/chat/completions',
        {
          method: 'POST',
          body: JSON.stringify(request)
        },
        retryOptions
      );

      this.log('Chat completion successful', { 
        model: response.model,
        tokens: response.usage?.total_tokens 
      });

      return response;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new APIError(
        'Failed to create chat completion',
        undefined,
        'Unable to process your request. Please try again.',
        { 
          component: 'OpenRouterClient', 
          operation: 'createChatCompletion',
          metadata: { model: request.model }
        }
      );
    }
  }

  public abortAllRequests(): void {
    this.log('Aborting all requests', { count: this.abortControllers.size });
    
    this.abortControllers.forEach(controller => {
      controller.abort();
    });
    this.abortControllers.clear();
    
    // Clear request queue
    this.requestQueue.forEach(({ reject }) => {
      reject(new AppError(
        ErrorType.UNKNOWN,
        'Request aborted',
        'The request was cancelled',
        { component: 'OpenRouterClient', operation: 'abortAllRequests' }
      ));
    });
    this.requestQueue = [];
  }

  public cleanup(): void {
    this.log('Cleaning up OpenRouter client');
    this.abortAllRequests();
  }
}

export const createOpenRouterClient = (config: Partial<OpenRouterClientConfig> = {}) => {
  const apiKey = config.apiKey || process.env.OPENROUTER_API_KEY || '';
  
  return new OpenRouterClient({
    apiKey,
    baseURL: config.baseURL,
    timeout: config.timeout,
    defaultHeaders: config.defaultHeaders,
    retryOptions: config.retryOptions,
    enableDebugLogging: process.env.NODE_ENV === 'development',
    rateLimitConfig: config.rateLimitConfig,
    ...config
  });
};

export default OpenRouterClient;