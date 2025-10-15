# Cost Calculation Specification

**Version:** 1.0  
**Last Updated:** 2025-10-14  
**Status:** Active

This document defines the authoritative standard for cost calculation across the Image-to-Prompt application.

---

## Table of Contents

1. [OpenRouter Pricing Format](#openrouter-pricing-format)
2. [Cost Calculation Formula](#cost-calculation-formula)
3. [Token Estimation](#token-estimation)
4. [Functions & Usage](#functions--usage)
5. [Display Formatting](#display-formatting)
6. [Storage & Persistence](#storage--persistence)
7. [Common Pitfalls](#common-pitfalls)
8. [Testing Standards](#testing-standards)

---

## OpenRouter Pricing Format

### **CRITICAL: Per-Token Pricing**

OpenRouter API returns pricing in **dollars per token**, NOT per-1k or per-1M tokens.

```typescript
// Example from OpenRouter API response:
{
  "pricing": {
    "prompt": "0.00003",      // $0.00003 per token
    "completion": "0.00006"   // $0.00006 per token
  }
}
```

**Conversion Reference:**

- `0.00003` per token = `$30` per 1M tokens
- `0.000001` per token = `$1` per 1M tokens
- `0.000002` per token = `$2` per 1M tokens

### **DO NOT:**

- ❌ Divide by 1000 (pricing is NOT per-1k tokens)
- ❌ Multiply by 1000 (pricing is NOT in fractional units)
- ❌ Use any conversion factor (pricing is already per-token)

### **DO:**

- ✅ Use the API price value directly as dollars per token
- ✅ Multiply tokens by price to get cost: `cost = tokens × pricePerToken`
- ✅ Store prices as numbers, not strings

---

## Cost Calculation Formula

### Vision Model Cost Structure

For vision models, costs have two components:

1. **Input Cost**: Cost of processing the image (image tokens × prompt price)
2. **Output Cost**: Cost of generating text (text tokens × completion price)

### Formula

```typescript
inputCost = inputTokens × model.pricing.prompt
outputCost = outputTokens × model.pricing.completion
totalCost = inputCost + outputCost
```

### Example Calculation

```typescript
// Given:
model.pricing.prompt = 0.000001      // $0.000001 per token
model.pricing.completion = 0.000002  // $0.000002 per token
inputTokens = 120                     // (image tokens)
outputTokens = 100                    // (generated text tokens)

// Calculate:
inputCost = 120 × 0.000001 = 0.000120    // $0.000120
outputCost = 100 × 0.000002 = 0.000200   // $0.000200
totalCost = 0.000120 + 0.000200 = 0.000320  // $0.000320
```

---

## Token Estimation

### Image Tokens (Input)

Images are estimated based on base64 data size:

```typescript
function estimateImageTokens(imageDataUrl: string): number {
  const base64Data = imageDataUrl.split(",")[1] || "";
  const sizeInBytes = base64Data.length * 0.75;

  if (sizeInBytes < 100000) return 85; // Small: < 100KB
  if (sizeInBytes < 500000) return 120; // Medium: 100-500KB
  if (sizeInBytes < 1000000) return 170; // Large: 500KB-1MB
  return 200; // Very Large: > 1MB
}
```

**Token Ranges:**

- Small images: **85 tokens**
- Medium images: **120 tokens**
- Large images: **170 tokens**
- Very large images: **200 tokens**

### Text Tokens (Output)

Text tokens are estimated using the standard 4-characters-per-token rule:

```typescript
function estimateTextTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
```

**Examples:**

- "Hello" (5 chars) = **2 tokens**
- "This is a test" (14 chars) = **4 tokens**
- 400 character text = **100 tokens**

---

## Functions & Usage

### ✅ Production Function: `calculateDetailedCost`

**Location:** `src/lib/cost.ts`

**Signature:**

```typescript
function calculateDetailedCost(
  model: VisionModel,
  imageDataUrl: string,
  outputText: string,
): {
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
};
```

**Usage:**

```typescript
import { calculateDetailedCost } from "@/lib/cost";

const costs = calculateDetailedCost(
  model,
  uploadedImage.preview,
  generatedPrompt,
);

console.log(costs.totalCost); // e.g., 0.000320
```

**When to Use:**

- ✅ All production code
- ✅ When you have both image and generated text
- ✅ For accurate per-request cost tracking
- ✅ In ImageToPromptTab after generation

### ⚠️ Legacy Function: `calculateGenerationCost`

**Status:** DEPRECATED

**Signature:**

```typescript
function calculateGenerationCost(
  model: VisionModel,
  estimatedOutputLength: number,
): {
  inputCost: number;
  outputCost: number;
  totalCost: number;
};
```

**Issues:**

- Does not account for image tokens
- Only estimates based on output length
- Deprecated in favor of `calculateDetailedCost`

**When to Use:**

- ⚠️ Only for backward compatibility
- ⚠️ Tests for legacy code
- ❌ DO NOT use in new code

### ⚠️ OpenRouterClient Methods

**Status:** DEPRECATED

The following methods on `OpenRouterClient` are deprecated:

- `calculateImageCost()` - Returns 0, doesn't account for image tokens
- `calculateTextCost()` - Only uses completion price, ignores input
- `calculateGenerationCost()` - Uses the above broken methods

**Replacement:** Use `calculateDetailedCost` from `@/lib/cost` instead.

---

## Display Formatting

### Format Rules

```typescript
function formatCost(cost: number | null): string {
  if (cost === null || cost === 0) return "$0.00";

  // 2 decimals for amounts >= $0.01
  if (cost >= 0.01) {
    return `$${cost.toFixed(2)}`;
  }

  // 6 decimals for very small amounts
  return `$${cost.toFixed(6)}`;
}
```

### Examples

| Cost Value | Displayed As | Reasoning                |
| ---------- | ------------ | ------------------------ |
| `0`        | `$0.00`      | Zero cost                |
| `0.000150` | `$0.000150`  | < $0.01, show 6 decimals |
| `0.001500` | `$0.001500`  | < $0.01, show 6 decimals |
| `0.015000` | `$0.02`      | ≥ $0.01, show 2 decimals |
| `1.500000` | `$1.50`      | ≥ $0.01, show 2 decimals |

### Token Display

```typescript
function formatTokens(tokens: number | null): string {
  if (tokens === null) return "0";
  return tokens.toLocaleString(); // e.g., "1,234"
}
```

---

## Storage & Persistence

### Saving Costs

After successful generation, costs MUST be saved to both storages:

```typescript
// 1. Save to usageStorage (for cost tracking & Total Cost header)
const usageEntry: UsageEntry = {
  id: `usage-${modelId}-${timestamp}`,
  timestamp: Date.now(),
  modelId,
  modelName,
  inputTokens,
  outputTokens,
  inputCost,
  outputCost,
  totalCost,
  success: true,
  error: null,
  imagePreview: imageDataUrl,
};
usageStorage.add(usageEntry);

// 2. Save to historyStorage (for History tab)
const historyEntry: HistoryEntry = {
  id: `history-${modelId}-${timestamp}`,
  imageUrl: imageDataUrl,
  prompt: generatedPrompt,
  charCount: generatedPrompt.length,
  totalCost,
  inputTokens,
  outputTokens,
  inputCost,
  outputCost,
  modelId,
  modelName,
  createdAt: Date.now(),
};
historyStorage.addEntry(historyEntry);
```

### Storage Locations

| Storage             | Purpose                 | Displayed In                 |
| ------------------- | ----------------------- | ---------------------------- |
| `usageStorage`      | Cost tracking & metrics | Usage Tab, Total Cost Header |
| `historyStorage`    | Generation history      | History Tab                  |
| `imageStateStorage` | Current session state   | ImageToPromptTab (temp)      |

### Total Cost Calculation

The header's "Total Cost" is calculated from `usageStorage`:

```typescript
const totalCost = useMemo(() => {
  const allEntries = usageStorage.list();
  return allEntries.reduce((sum, entry) => sum + entry.totalCost, 0);
}, [updateTrigger]);
```

---

## Common Pitfalls

### ❌ WRONG: Dividing by 1000

```typescript
// WRONG - Do NOT do this!
const cost = (tokens / 1000) * pricePerToken;
```

**Why it's wrong:** OpenRouter pricing is already per-token, not per-1k tokens.

### ✅ CORRECT: Direct multiplication

```typescript
// CORRECT
const cost = tokens * pricePerToken;
```

### ❌ WRONG: Adding prompt + completion prices

```typescript
// WRONG - This number is meaningless!
const totalPrice = model.pricing.prompt + model.pricing.completion;
// e.g., 0.000001 + 0.000002 = 0.000003 (what does this represent?)
```

### ✅ CORRECT: Use prices separately or show average

```typescript
// CORRECT - Show average for comparison
const averagePrice = (model.pricing.prompt + model.pricing.completion) / 2;

// CORRECT - Show both separately
console.log(`Prompt: ${model.pricing.prompt}/token`);
console.log(`Completion: ${model.pricing.completion}/token`);
```

### ❌ WRONG: Not saving to storage

```typescript
// WRONG - Costs are calculated but not persisted!
const costs = calculateDetailedCost(model, image, text);
// Missing: usageStorage.add() and historyStorage.addEntry()
```

### ✅ CORRECT: Save to both storages

```typescript
// CORRECT
const costs = calculateDetailedCost(model, image, text);
usageStorage.add({
  /* ...entry */
});
historyStorage.addEntry({
  /* ...entry */
});
```

---

## Testing Standards

### Test Structure

```typescript
describe("cost calculation", () => {
  const mockModel: VisionModel = {
    pricing: {
      prompt: 0.000001, // $1 per 1M tokens
      completion: 0.000002, // $2 per 1M tokens
    },
  };

  test("calculates costs correctly", () => {
    const cost = calculateDetailedCost(
      mockModel,
      mockImageDataUrl,
      mockOutputText,
    );

    expect(cost.inputCost).toBe(expectedInputCost);
    expect(cost.outputCost).toBe(expectedOutputCost);
    expect(cost.totalCost).toBe(expectedTotal);
  });
});
```

### Required Tests

Every cost calculation function MUST have tests for:

- ✅ Small amounts (< $0.01)
- ✅ Large amounts (≥ $0.01)
- ✅ Zero pricing (free models)
- ✅ Input + output breakdown
- ✅ Token estimation accuracy

---

## Version History

| Version | Date       | Changes                                                                                                            |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| 1.0     | 2025-10-14 | Initial specification. Fixed per-token pricing confusion, added storage requirements, deprecated legacy functions. |

---

## References

- **Code Implementation:** `src/lib/cost.ts`
- **Tests:** `src/lib/__tests__/cost.test.ts`
- **Usage Example:** `src/components/ImageToPromptTab.tsx` (lines 363-428)
- **Storage Updates:** `src/components/ImageToPromptTab.tsx` (lines 398-428)
- **Header Display:** `src/components/layout/MainLayout.tsx` (lines 32-64)
- **OpenRouter API Docs:** [openrouter.ai/docs](https://openrouter.ai/docs)
