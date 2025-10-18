# Prompt Metrics — Follow-up Notes

This follow-up documents and validates the comprehensive prompt cost metrics introduced in PR #115.

## What

- Documents always-visible metrics panel behavior
- Clarifies input (image) vs output (text) token/cost breakdown
- Adds verification checklist for QA / reviewers

## Why

- Provide clarity and ensure future contributors understand metrics expectations
- Facilitate quick regression checks

## How to Verify

1. Upload an image in Image → Prompt
2. Select multiple vision models
3. Click Generate
4. Confirm:
   - Metrics panel is visible before and after generation
   - Per-model breakdown shows input/output tokens and costs
   - Total cost aggregates correctly across models
   - USD formatting uses 6 decimals for small amounts (< $0.01), 2 decimals for larger amounts
   - Cost data persists to Usage and History tabs

## Pricing Format (CRITICAL)

**OpenRouter uses per-token pricing, NOT per-1k or per-1M tokens.**

- API returns prices like `0.00003` which means `$0.00003 per token` (equivalent to `$30 per 1M tokens`)
- Our calculation: `cost = tokens × pricePerToken`
- **DO NOT divide by 1000 or multiply by 1000** - the API price is already per-token

### Example:

```typescript
// Model pricing from OpenRouter API:
model.pricing.prompt = 0.000001      // $0.000001 per token = $1 per 1M tokens
model.pricing.completion = 0.000002  // $0.000002 per token = $2 per 1M tokens

// Calculation for 100 tokens:
inputCost = 100 * 0.000001 = $0.0001
outputCost = 100 * 0.000002 = $0.0002
totalCost = $0.0003
```

## Token Estimation

- **Image tokens**: 85-200 tokens depending on image size (estimated from base64 data)
  - Small images (<100KB): 85 tokens
  - Medium images (100-500KB): 120 tokens
  - Large images (500KB-1MB): 170 tokens
  - Very large images (>1MB): 200 tokens
- **Text tokens**: ~1 token per 4 characters (rough estimate)

## Cost Calculation Functions

- **Use `calculateDetailedCost(model, imageDataUrl, outputText)`** for all production code
- **Legacy `calculateGenerationCost()`** is deprecated - only for backward compatibility
- See `src/lib/cost.ts` and `docs/COST_CALCULATION_SPEC.md` for detailed documentation

## Notes

- Token counts are estimates; API pricing is authoritative.
- All successful generations are automatically saved to both `usageStorage` and `historyStorage`
- Total cost in header updates automatically via storage subscription
