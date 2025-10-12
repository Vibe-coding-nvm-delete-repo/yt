## What changed
- Implement complete multi-image batch processing with per-image model assignment
- Add concurrency queue with retry/cancellation and cost tracking
- Update UI to multi-image grid with copy/cancel controls

## Why
- Addresses Issue #45 requirements for multi-image workflows

## How to verify
1. Configure a valid OpenRouter API key
2. Upload 2-3 images via drag-and-drop or file picker
3. Assign different models per image and click **Generate Batch**
4. Observe sequential processing, cost metrics, per-image results
5. Test **Cancel Batch**, per-image **Retry**, **Copy** and **Copy All** buttons

## Risks / Limitations
- Higher memory usage when many large images are uploaded (concurrency capped at 2)
- Legacy single-image-only flow replaced by the multi-image grid

## DoD
- [x] Persistence across reloads
- [x] Validation of type/size/count (5 images max, 10MB each)
- [x] A11y labels and `aria-live` progress updates
- [x] Cancel/Retry support with AbortController
- [x] Cost calculations per image and total
- [x] Tests pass (unit + integration)
- [x] Lint & type checks clean

**Size:** +1116 / -734 lines
