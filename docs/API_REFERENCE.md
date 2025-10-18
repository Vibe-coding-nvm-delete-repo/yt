# API Reference

Technical documentation for core modules and utilities.

## Table of Contents

- [OpenRouter Client](#openrouter-client)
- [Cost Calculation](#cost-calculation)
- [Storage Utilities](#storage-utilities)
- [React Hooks](#react-hooks)
- [Type Definitions](#type-definitions)
- [Utilities](#utilities)

---

## OpenRouter Client

**Module**: `src/lib/openrouter.ts`

### `OpenRouterClient`

Client for interacting with the OpenRouter API.

#### Constructor

```typescript
constructor(apiKey: string)
```

#### Methods

##### `analyzeImage(modelId: string, imageDataUrl: string, customPrompt?: string): Promise<string>`

Analyze an image using a vision model.

**Example:**

```typescript
const client = createOpenRouterClient("sk-...");
const prompt = await client.analyzeImage(
  "anthropic/claude-3-opus",
  "data:image/jpeg;base64,...",
  "Describe this image for a YouTube thumbnail",
);
```

##### `fetchModels(filterVisionOnly?: boolean): Promise<VisionModel[]>`

Fetch available models from OpenRouter.

**Example:**

```typescript
const visionModels = await client.fetchModels(true);
```

##### `chat(modelId: string, messages: Array<{role: string, content: string}>): Promise<ChatResponse>`

Send a chat completion request.

**Example:**

```typescript
const response = await client.chat("openai/gpt-4", [
  { role: "system", content: "You are helpful" },
  { role: "user", content: "Generate a prompt" },
]);
```

---

## Cost Calculation

**Module**: `src/lib/cost.ts`

### Functions

#### `calcTextCost(tokens: number, pricePerToken: number): number`

Calculate text generation cost.

```typescript
const cost = calcTextCost(1000, 0.00003); // $0.03
```

#### `estimateImageTokens(imageDataUrl: string): number`

Estimate tokens for image processing (85-200 tokens).

```typescript
const tokens = estimateImageTokens("data:image/jpeg;base64,...");
```

#### `estimateTextTokens(text: string): number`

Estimate tokens for text (~1 token per 4 characters).

```typescript
const tokens = estimateTextTokens("Sample text");
```

#### `calculateDetailedCost(model, imageDataUrl, outputText)`

Calculate detailed cost breakdown with input/output separation.

```typescript
const cost = calculateDetailedCost(model, imageUrl, generatedText);
// Returns: { inputTokens, outputTokens, inputCost, outputCost, totalCost }
```

---

## Storage Utilities

**Module**: `src/lib/storage.ts`

### `StorageAdapter<T>`

Generic localStorage wrapper with type safety.

#### Methods

```typescript
get(): T                              // Get current value
set(value: T): void                   // Set value
update(updater: (T) => T): void       // Update using function
clear(): void                         // Reset to default
subscribe(listener: (T) => void): () => void  // Subscribe to changes
```

**Example:**

```typescript
const storage = new StorageAdapter<AppSettings>("settings", DEFAULT_SETTINGS);

storage.update((current) => ({
  ...current,
  selectedModel: "claude-3-opus",
}));

const unsubscribe = storage.subscribe((newSettings) => {
  console.log("Settings changed:", newSettings);
});
```

### Pre-configured Storage

- `imageStateStorage` - Image upload state
- `usageStorage` - API usage tracking
- `historyStorage` - Prompt generation history

---

## React Hooks

### `useSettings()`

**Module**: `src/hooks/useSettings.ts`

Access and update application settings.

```typescript
const { settings, updateApiKey, updateSelectedModel } = useSettings();

// Update API key
updateApiKey("sk-...");

// Select model
updateSelectedModel("anthropic/claude-3-opus");
```

### `useHistory()`

**Module**: `src/hooks/useHistory.ts`

Manage prompt generation history.

```typescript
const { history, addToHistory, clearHistory } = useHistory();

addToHistory({
  prompt: "Generated prompt text",
  modelId: "claude-3-opus",
  cost: 0.05,
});
```

### `useErrorHandler()`

**Module**: `src/hooks/useErrorHandler.ts`

Centralized error handling with retry logic.

```typescript
const { handleError, clearError } = useErrorHandler();

try {
  await api.fetchModels();
} catch (error) {
  handleError(error, "Failed to fetch models");
}
```

### `useResponsive()`

**Module**: `src/hooks/useResponsive.ts`

Responsive design utilities.

```typescript
const { isMobile, isTablet, isDesktop } = useResponsive();

return isMobile ? <MobileView /> : <DesktopView />;
```

---

## Type Definitions

**Module**: `src/types/index.ts`

### `VisionModel`

```typescript
interface VisionModel {
  id: string; // Model ID
  name: string; // Display name
  description?: string; // Description
  pricing: {
    prompt: number; // Input price per token
    completion: number; // Output price per token
  };
  context_length?: number; // Max context length
  supports_vision?: boolean; // Vision support
}
```

### `AppSettings`

```typescript
interface AppSettings {
  openRouterApiKey: string;
  selectedVisionModels: string[]; // Up to 3 models
  customPrompt: string;
  isValidApiKey: boolean;
  lastApiKeyValidation: number | null;
  availableModels: VisionModel[];
  preferredModels: string[];
  pinnedModels: string[];
}
```

### `UsageEntry`

```typescript
interface UsageEntry {
  id: string;
  modelId: string;
  timestamp: number;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  imageDataUrl?: string;
  generatedPrompt?: string;
}
```

### `HistoryEntry`

```typescript
interface HistoryEntry {
  id: string;
  timestamp: number;
  modelId: string;
  prompt: string;
  imageDataUrl?: string;
  cost: number;
  isFavorite?: boolean;
  rating?: number; // 1-5 stars
}
```

---

## Utilities

### Truncation

**Module**: `src/utils/truncation.ts`

#### `middleEllipsis(str: string, maxLen: number): string`

Truncate string with middle ellipsis.

```typescript
const truncated = middleEllipsis("anthropic/claude-3-opus-20240229", 25);
// Result: "anthropic/cl...40229"
```

#### `getResponsiveMaxLength(screenWidth: number): number`

Get appropriate truncation length for screen size.

```typescript
const maxLen = getResponsiveMaxLength(window.innerWidth);
// Returns: 20 (mobile), 30 (tablet), 40 (desktop), 50 (large)
```

### Retry Logic

**Module**: `src/utils/retry.ts`

#### `retryAsync<T>(operation, options?): Promise<RetryResult<T>>`

Retry async operations with exponential backoff.

```typescript
const result = await retryAsync(() => api.fetchModels(), {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
});
```

#### `CircuitBreaker`

Prevent cascading failures.

```typescript
const breaker = new CircuitBreaker(5, 60000);
const data = await breaker.execute(() => api.call());
```

---

## Error Handling

**Module**: `src/lib/errorUtils.ts`

### `ApiError`

```typescript
class ApiError extends Error {
  constructor(message: string, statusCode?: number, originalError?: unknown);
}
```

### `normalizeToApiError(error: unknown): ApiError`

Convert any error to ApiError.

```typescript
try {
  await api.call();
} catch (error) {
  const apiError = normalizeToApiError(error);
  console.error(apiError.message, apiError.statusCode);
}
```

---

## Best Practices

### API Key Management

```typescript
// ✅ Store securely in localStorage
const { updateApiKey } = useSettings();
updateApiKey("sk-...");

// ❌ Never hardcode
const apiKey = "sk-actual-key"; // NEVER!
```

### Error Handling

```typescript
// ✅ Use error handler
const { handleError } = useErrorHandler();
try {
  await operation();
} catch (error) {
  handleError(error, "Operation failed");
}
```

### Cost Tracking

```typescript
// ✅ Always track costs
const cost = calculateDetailedCost(model, image, output);
usageStorage.add({
  modelId: model.id,
  totalCost: cost.totalCost,
  timestamp: Date.now(),
});
```

### Type Safety

```typescript
// ✅ Use proper types
interface Props {
  onComplete: (result: string) => void;
}

// ❌ Avoid 'any'
const Component = (props: any) => {};
```

---

## Related Documentation

- [Quick Start Guide](./QUICK_START.md)
- [Features Guide](./FEATURES_GUIDE.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Engineering Standards](./ENGINEERING_STANDARDS.md)
