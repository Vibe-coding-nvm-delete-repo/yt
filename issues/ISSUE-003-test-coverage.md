# ISSUE-003: Test Coverage Below 60% Target

**Status:** 🟡 HIGH PRIORITY  
**Impact:** 8/10  
**Difficulty:** 7/10 ⭐⭐⭐⭐⭐⭐⭐  
**Estimated Time:** 6-9 days  
**Assignee:** TBD  
**Created:** 2025-10-14

---

## 📋 Problem Statement

Current test coverage is **46.74%**, falling short of the **60% target** by **-13.26%**. This gap represents **~1,682 lines of untested code** concentrated in 3 large legacy files. Without adequate coverage, bugs can slip through, refactoring becomes risky, and developer confidence decreases.

### Coverage Report

```
Current:  46.74%
Target:   60.00%
Gap:      -13.26%

Critical Coverage Gaps:
├─ SettingsTab.tsx:        20.4%  (696 lines untested)
├─ ImageToPromptTab.tsx:   23.72% (544 lines untested)
└─ storage.ts:             38.62% (442 lines untested)
                           ───────────────────────────
Total Untested:            1,682 lines
```

---

## 🔍 Root Causes

### 1. Legacy Monolithic Components

- SettingsTab: 874 lines with 10+ responsibilities
- Hard to test in isolation
- Complex async flows

### 2. Missing Test Infrastructure

- No test factories/builders
- No API mocking utilities
- No shared test helpers

### 3. Integration Code Not Unit-Tested

- API calls not mocked
- localStorage integration
- React hooks interdependencies

---

## 📦 Sub-Issues Breakdown

### [ISSUE-003-A] Improve SettingsTab Coverage (20.4% → 60%)

**Current:** 20.4% (176/874 lines)  
**Target:** 60% (524 lines)  
**Gap:** 348 lines to cover  
**Time:** 3-4 days  
**Difficulty:** 8/10

#### Current Coverage Details

```
File: src/components/SettingsTab.tsx
Statements: 31.6%
Branches:   31.06%
Functions:  20.89%
Lines:      32.18%

Uncovered Lines:
53-57, 110-120, 132-133, 143-148, 158-163, 178-182,
193-230, 240-268, 278-285, 291-292, 298-300, 327-333,
396-402, 418, 481, 497, 519-726, 822, 842-852
```

#### Critical Untested Flows

**1. API Key Validation Flow (Lines 192-230)**

```typescript
// UNTESTED:
const validateApiKey = async () => {
  if (!apiKey.trim()) {
    // Error: API key required
  }

  if (!isValidApiKeyFormat(apiKey)) {
    // Error: Invalid format
  }

  const client = createOpenRouterClient(apiKey);
  const isValid = await client.validateApiKey();
  // Update state based on response
};

// NEEDS: 5 test cases
// 1. Empty API key
// 2. Invalid format
// 3. Valid format, API rejects
// 4. Valid format, API accepts
// 5. Network error during validation
```

**2. Model Fetching Flow (Lines 239-276)**

```typescript
// UNTESTED:
const fetchModels = async () => {
  const client = createOpenRouterClient(apiKey);
  const models = await client.getVisionModels();
  // Update state with models
  // Handle errors
};

// NEEDS: 4 test cases
// 1. Successful fetch
// 2. Empty models list
// 3. Network error
// 4. API returns invalid data
```

**3. Model Selection Logic (Lines 430-726)** ⭐ Largest gap

```typescript
// UNTESTED: 297 lines of model selection UI
// - Dropdowns with search
// - Pin/unpin functionality
// - Model categorization
// - Cost calculations
// - Selection limits (max 5)

// NEEDS: 15+ test cases
```

#### Testing Strategy

**Phase 1: Test Utilities (Day 1, 4 hours)**

```typescript
// Create: src/components/__tests__/utils/settingsTestUtils.tsx

import { render } from '@testing-library/react';
import type { AppSettings, VisionModel } from '@/types';

export const mockApiKey = 'sk-or-v1-test-key-1234567890';

export const mockVisionModel = (overrides?: Partial<VisionModel>): VisionModel => ({
  id: 'model-1',
  name: 'Test Model',
  description: 'A test vision model',
  pricing: {
    prompt: 0.000001,
    completion: 0.000002,
  },
  context_length: 4096,
  supports_image: true,
  supports_vision: true,
  ...overrides,
});

export const mockSettings = (overrides?: Partial<AppSettings>): AppSettings => ({
  openRouterApiKey: '',
  selectedModel: '',
  selectedVisionModels: [],
  customPrompt: 'Test prompt',
  isValidApiKey: false,
  lastApiKeyValidation: null,
  lastModelFetch: null,
  availableModels: [],
  preferredModels: [],
  pinnedModels: [],
  ...overrides,
});

export const mockOpenRouterClient = {
  validateApiKey: jest.fn().mockResolvedValue(true),
  getVisionModels: jest.fn().mockResolvedValue([
    mockVisionModel({ id: 'model-1' }),
    mockVisionModel({ id: 'model-2' }),
  ]),
};

export const renderSettingsTab = (props?: Partial<SettingsTabProps>) => {
  const defaultProps = {
    settings: mockSettings(),
    onSettingsUpdate: jest.fn(),
  };

  return render(<SettingsTab {...defaultProps} {...props} />);
};
```

**Phase 2: API Validation Tests (Day 1-2, 8 hours)**

```typescript
// Create: src/components/__tests__/SettingsTab.apiValidation.test.tsx

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  renderSettingsTab,
  mockOpenRouterClient,
} from "./utils/settingsTestUtils";
import * as openrouterModule from "@/lib/openrouter";

jest.mock("@/lib/openrouter");

describe("SettingsTab - API Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (openrouterModule.createOpenRouterClient as jest.Mock).mockReturnValue(
      mockOpenRouterClient,
    );
  });

  test("should show error for empty API key", async () => {
    renderSettingsTab();
    const validateButton = screen.getByText("Validate");

    await userEvent.click(validateButton);

    expect(screen.getByText(/API key is required/i)).toBeInTheDocument();
    expect(mockOpenRouterClient.validateApiKey).not.toHaveBeenCalled();
  });

  test("should show error for invalid format", async () => {
    renderSettingsTab();
    const input = screen.getByLabelText(/API Key/i);

    await userEvent.type(input, "invalid-key");
    await userEvent.click(screen.getByText("Validate"));

    expect(screen.getByText(/Invalid API key format/i)).toBeInTheDocument();
  });

  test("should validate correct API key successfully", async () => {
    mockOpenRouterClient.validateApiKey.mockResolvedValueOnce(true);
    renderSettingsTab();

    const input = screen.getByLabelText(/API Key/i);
    await userEvent.type(input, "sk-or-v1-valid-key");
    await userEvent.click(screen.getByText("Validate"));

    await waitFor(() => {
      expect(screen.getByText(/API key validated/i)).toBeInTheDocument();
    });

    expect(mockOpenRouterClient.validateApiKey).toHaveBeenCalledTimes(1);
  });

  test("should handle validation rejection", async () => {
    mockOpenRouterClient.validateApiKey.mockResolvedValueOnce(false);
    renderSettingsTab();

    const input = screen.getByLabelText(/API Key/i);
    await userEvent.type(input, "sk-or-v1-invalid-key");
    await userEvent.click(screen.getByText("Validate"));

    await waitFor(() => {
      expect(screen.getByText(/Invalid API key/i)).toBeInTheDocument();
    });
  });

  test("should handle network error during validation", async () => {
    mockOpenRouterClient.validateApiKey.mockRejectedValueOnce(
      new Error("Network error"),
    );
    renderSettingsTab();

    const input = screen.getByLabelText(/API Key/i);
    await userEvent.type(input, "sk-or-v1-test-key");
    await userEvent.click(screen.getByText("Validate"));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});

// 5 tests = ~40 lines of uncovered code
```

**Phase 3: Model Fetching Tests (Day 2, 4 hours)**

```typescript
// Add to: src/components/__tests__/SettingsTab.modelFetching.test.tsx

describe("SettingsTab - Model Fetching", () => {
  test("should fetch models successfully", async () => {
    // Test implementation
  });

  test("should handle empty model list", async () => {
    // Test implementation
  });

  test("should handle fetch error", async () => {
    // Test implementation
  });

  test("should disable fetch when API key invalid", () => {
    // Test implementation
  });
});

// 4 tests = ~35 lines covered
```

**Phase 4: Model Selection Tests (Day 3-4, 12 hours)**

```typescript
// Add to: src/components/__tests__/SettingsTab.modelSelection.test.tsx

describe("SettingsTab - Model Selection", () => {
  test("should select model from dropdown", async () => {
    // Test dropdown interaction
  });

  test("should limit selection to 5 models", async () => {
    // Test selection limit
  });

  test("should pin/unpin models", async () => {
    // Test pin functionality
  });

  test("should search models", async () => {
    // Test search filter
  });

  test("should show model costs", () => {
    // Test cost display
  });

  test("should categorize models", () => {
    // Test model grouping
  });

  // 10-15 more tests...
});

// 15 tests = ~200 lines covered
```

#### Acceptance Criteria

- [ ] SettingsTab coverage ≥60%
- [ ] All async flows tested (validation, fetching)
- [ ] Model selection tested (dropdown, pin, search)
- [ ] Error states tested
- [ ] Test utilities created and reusable
- [ ] Tests run in <10 seconds
- [ ] No flaky tests

---

### [ISSUE-003-B] Improve ImageToPromptTab Coverage (23.72% → 60%)

**Current:** 23.72% (169/713 lines)  
**Target:** 60% (428 lines)  
**Gap:** 259 lines to cover  
**Time:** 2-3 days  
**Difficulty:** 7/10

#### Critical Untested Flows

**1. Image Upload Flow**

```typescript
// Lines 151-197 - File input handling
- File validation (type, size)
- FileReader integration
- Preview generation
- State updates

// NEEDS: 6 test cases
```

**2. Image Generation Flow**

```typescript
// Lines 250-407 - Generate prompts
- Validation checks
- Parallel API calls
- Progress tracking
- Cost calculation
- History saving

// NEEDS: 8 test cases
```

**3. Copy to Clipboard**

```typescript
// Lines 424-432
- Copy functionality
- Success feedback
- Error handling

// NEEDS: 3 test cases
```

#### Testing Strategy

**Phase 1: Image Upload Tests (Day 1, 6 hours)**

```typescript
// src/components/__tests__/ImageToPromptTab.imageUpload.test.tsx

describe('ImageToPromptTab - Image Upload', () => {
  test('should upload valid image', async () => {
    const { getByLabelText } = render(<ImageToPromptTab />);
    const file = new File(['image'], 'test.png', { type: 'image/png' });
    const input = getByLabelText(/upload/i);

    await userEvent.upload(input, file);

    expect(screen.getByAltText('Uploaded preview')).toBeInTheDocument();
  });

  test('should reject invalid file type', async () => {
    // Test .txt file rejection
  });

  test('should reject oversized file', async () => {
    // Test 11MB file rejection
  });

  test('should handle drag and drop', async () => {
    // Test D&D functionality
  });

  test('should clear uploaded image', async () => {
    // Test remove button
  });
});

// 6 tests = ~80 lines covered
```

**Phase 2: Generation Tests (Day 2, 8 hours)**

```typescript
// src/components/__tests__/ImageToPromptTab.generation.test.tsx

describe("ImageToPromptTab - Prompt Generation", () => {
  test("should generate prompts for all models", async () => {
    // Mock API calls
    // Test parallel generation
    // Verify results displayed
  });

  test("should show loading state during generation", () => {
    // Test loading spinners
  });

  test("should calculate costs correctly", () => {
    // Test cost display
  });

  test("should handle API errors gracefully", async () => {
    // Test error handling per model
  });

  test("should save to history after generation", async () => {
    // Verify history storage
  });
});

// 8 tests = ~150 lines covered
```

#### Acceptance Criteria

- [ ] ImageToPromptTab coverage ≥60%
- [ ] Image upload fully tested
- [ ] Generation flow tested end-to-end
- [ ] Error handling tested
- [ ] File validation tested
- [ ] Cost calculation tested

---

### [ISSUE-003-C] Improve storage.ts Coverage (38.62% → 60%)

**Current:** 38.62% (278/720 lines)  
**Target:** 60% (432 lines)  
**Gap:** 154 lines to cover  
**Time:** 1-2 days  
**Difficulty:** 5/10

#### Uncovered Areas

**1. Subscription System**

```typescript
// Lines 144-180 - Debounced notifications
// Lines 185-217 - Subscribe/unsubscribe
// Lines 222-237 - subscribeToKey

// NEEDS: 8 test cases
```

**2. Batch Operations**

```typescript
// Lines 242-259 - batchUpdate
// Complex state diffing
// Change detection

// NEEDS: 5 test cases
```

**3. Edge Cases**

```typescript
// Lines 283-319 - handleStorageEvent
// Cross-tab synchronization
// Malformed data handling

// NEEDS: 4 test cases
```

#### Testing Strategy

**Phase 1: Subscription Tests (Day 1, 4 hours)**

```typescript
// Fix existing: src/lib/__tests__/storage.test.ts

describe("SettingsStorage - Subscriptions", () => {
  test("should notify subscribers on change", async () => {
    const callback = jest.fn();
    storage.subscribe(callback);

    storage.updateApiKey("new-key");
    await jest.runAllTimersAsync();

    expect(callback).toHaveBeenCalled();
  });

  test("should only notify for subscribed keys", async () => {
    const callback = jest.fn();
    storage.subscribe(callback, { keys: ["openRouterApiKey"] });

    storage.updateCustomPrompt("new prompt");
    await jest.runAllTimersAsync();

    expect(callback).not.toHaveBeenCalled();
  });

  // 6 more tests...
});

// 8 tests = ~70 lines covered
```

**Phase 2: Batch & Edge Cases (Day 1-2, 4 hours)**

```typescript
describe("SettingsStorage - Batch Operations", () => {
  test("should batch multiple updates atomically", () => {
    // Test batchUpdate
  });

  test("should detect actual changes only", () => {
    // Test change detection
  });
});

describe("SettingsStorage - Edge Cases", () => {
  test("should handle corrupted localStorage", () => {
    // Test JSON parse errors
  });

  test("should sync across tabs", () => {
    // Test storage events
  });
});

// 9 tests = ~84 lines covered
```

#### Acceptance Criteria

- [ ] storage.ts coverage ≥60%
- [ ] Subscription system fully tested
- [ ] Batch operations tested
- [ ] Edge cases handled
- [ ] Cross-tab sync tested

---

## 🎯 Overall Implementation Plan

### Week 1: SettingsTab Coverage

**Monday-Tuesday:**

- Create test utilities
- Write API validation tests
- Write model fetching tests

**Wednesday-Thursday:**

- Write model selection tests
- Write UI interaction tests
- Achieve 60% coverage

**Friday:**

- Buffer day for fixes
- Run full test suite

### Week 2: ImageToPromptTab & Storage

**Monday-Tuesday:**

- Write image upload tests
- Write generation tests

**Wednesday:**

- Write storage subscription tests
- Write edge case tests

**Thursday:**

- Integration across all files
- Final coverage check

**Friday:**

- Buffer day
- Documentation

---

## 📊 Success Metrics

**Before:**

```
Overall:  46.74%
Target:   60.00%
Status:   ❌ Below target
```

**After:**

```
Overall:  62.00%+
Target:   60.00%
Status:   ✅ Exceeds target

SettingsTab:      60%+ (was 20.4%)
ImageToPromptTab: 60%+ (was 23.72%)
storage.ts:       60%+ (was 38.62%)
```

---

## 🧪 Testing the Coverage

```bash
# Check current coverage
npm test -- --coverage --collectCoverageFrom="src/components/SettingsTab.tsx"

# Run specific test file
npm test -- SettingsTab.apiValidation.test.tsx --coverage

# Watch mode while developing tests
npm test -- --watch SettingsTab

# Final check
npm test -- --coverage --coverageThreshold='{"global":{"lines":60}}'
```

---

## 🚨 Common Pitfalls to Avoid

1. **Testing Implementation Details**
   - ❌ Don't test internal state directly
   - ✅ Test user-visible behavior

2. **Flaky Async Tests**
   - ❌ Don't use `setTimeout` for waiting
   - ✅ Use `waitFor` from Testing Library

3. **Over-Mocking**
   - ❌ Don't mock everything
   - ✅ Mock external dependencies only

4. **Incomplete Error Testing**
   - ❌ Don't just test happy paths
   - ✅ Test error scenarios thoroughly

---

## 🔗 Related Issues

- Requires: ISSUE-001 (must fix failing tests first)
- Blocks: Refactoring work (need tests before refactoring)
- Complements: ISSUE-007 (E2E testing)

---

## 📚 References

- [Testing Library Best Practices](https://testing-library.com/docs/queries/about/#priority)
- [Jest Coverage](https://jestjs.io/docs/configuration#coveragethreshold-object)
- [React Testing Tutorial](https://testing-library.com/docs/react-testing-library/example-intro)

---

**Last Updated:** 2025-10-14  
**Priority:** High (after critical issues resolved)  
**Estimated Effort:** 6-9 days
