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
   - USD formatting uses 6 decimals

## Notes
- Token counts are estimates; API pricing is authoritative.
- See src/lib/cost.ts for calculation details.
