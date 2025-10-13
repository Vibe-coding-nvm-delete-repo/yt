# feat: Model Pinning System (Fixes #43)

## What changed
- Added user-defined pinned model list with UI to pin/unpin.
- Introduced a “Pinned” section at the top of the model dropdown (sticky).
- Persisted pins across browser sessions and synced across tabs (localStorage + storage event).
- Keyboard shortcuts (1–9) to quickly select pinned models when dropdown is open.
- Reordered all model selectors to show pinned first (Settings + ImageToPromptTab).

## Why
Surface favorite models for instant access across a catalog of 133+; improves discovery and execution speed.

## How to verify
1. Settings → Validate API key (if needed) → Fetch Models.
2. Open model dropdown; click the pin icon to pin some models.
3. Confirm a “Pinned” section appears at the top; separator before the rest.
4. Reload the page (or open a new tab); pinned models remain.
5. With the dropdown open, press 1–9 to select the corresponding pinned model by order.
6. In ImageToPromptTab, verify the “Model” select lists pinned models first.

## Screens/UX
- Pin/Unpin with icon (Pin/PinOff) on each row.
- Sticky “Pinned” section at top with divider.

## Risks / limitations
- None functional; this is a UX/local persistence enhancement. No server/API changes.

## Notes
- New setting: `pinnedModels: string[]` in `AppSettings`.
- Tested storage behaviors in `src/lib/__tests__/storage.pinnedModels.test.ts`.

## Conformance
🧩 Conformance: Verified per [docs/ENGINEERING_STANDARDS.md](./docs/ENGINEERING_STANDARDS.md). Accessibility unchanged (single h1 per page).
