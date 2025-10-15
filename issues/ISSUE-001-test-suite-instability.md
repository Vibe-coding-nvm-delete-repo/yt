# ISSUE-001: Test Suite Instability - 39 Failing Tests

**Status:** 🔴 CRITICAL  
**Impact:** 10/10  
**Difficulty:** 3/10 ⭐⭐⭐  
**Estimated Time:** 4-6 hours  
**Assignee:** TBD  
**Created:** 2025-10-14

---

## 📋 Problem Statement

The test suite has **39 failing tests out of 224 total** (17% failure rate), which completely undermines CI/CD confidence and makes it impossible to catch regressions. Broken tests are worse than no tests because they create a "cry wolf" situation where developers ignore test failures.

### Current Test Results

```
Test Suites: 18 failed, 17 passed, 35 total
Tests:       39 failed, 185 passed, 224 total
Snapshots:   0 total
Time:        9.664 s
```

---

## 🔍 Root Causes Identified

### Cause 1: Missing React Imports (7 test files)

### Cause 2: Empty Test Files (3 files)

### Cause 3: localStorage Mocking Issues (8 tests)

### Cause 4: Timeout Issues (3 tests)

---

## 📦 Sub-Issues Breakdown

### [ISSUE-001-A] Fix Missing React Imports

**Files Affected:** 7 test files  
**Time:** 30 minutes  
**Difficulty:** 1/10

**Problem:**

```typescript
// ❌ BROKEN: src/components/__tests__/ImageToPromptTab.vertical-layout.test.tsx
import { render, screen } from "@testing-library/react";
import ImageToPromptTab from "@/components/ImageToPromptTab";

// Missing: import React from "react";
```

**Error:**

```
ReferenceError: React is not defined
    at render(<ImageToPromptTab settings={mockSettings} />)
```

**Files to fix:**

1. `src/components/__tests__/ImageToPromptTab.vertical-layout.test.tsx`
2. `src/components/__tests__/ImageToPromptTab.error-handling.test.tsx`
3. `src/components/__tests__/ImageToPromptTabs.props.test.tsx`
4. `src/components/__tests__/App.test.tsx`
5. `src/utils/__tests__/retry.test.ts` (check if needed)
6. `src/__tests__/integration.test.ts` (check if needed)
7. `src/types/__tests__/errors.test.ts` (check if needed)

**Fix Steps:**

```bash
# 1. Add import to each file
echo 'import React from "react";' | cat - file.tsx > temp && mv temp file.tsx

# Or manually add at top of each file:
# import React from "react";

# 2. Verify fix
npm test -- --testPathPattern="ImageToPromptTab.vertical-layout"

# 3. Run all affected tests
npm test -- --testPathPattern="(ImageToPromptTab|App|ImageToPromptTabs)"
```

**Acceptance Criteria:**

- [ ] All 7 files have `import React from "react";` at the top
- [ ] Tests run without "React is not defined" errors
- [ ] All previously failing tests now pass or have different errors

---

### [ISSUE-001-B] Fix or Remove Empty Test Files

**Files Affected:** 3 files  
**Time:** 2 hours  
**Difficulty:** 3/10

**Problem:**
These files have test logic but NO Jest test cases:

1. **`src/lib/__tests__/characterCounter.test.ts`** (94 lines)
   - Has logic: `getCharacterCounterInfo()`, `runCharacterCounterTests()`
   - Missing: No `describe()` or `test()` blocks
   - Error: "Your test suite must contain at least one test"

2. **`src/lib/__tests__/tooltip.test.ts`**
   - Custom test runner, not using Jest
3. **`src/components/layout/__tests__/layoutWidth.test.ts`**
   - Custom test runner, not using Jest

**Options:**

**Option A: Convert to Jest Tests** (Recommended)

```typescript
// BEFORE: characterCounter.test.ts
export const runCharacterCounterTests = () => {
  testCases.forEach((testCase, index) => {
    const result = getCharacterCounterInfo(testCase.input);
    if (isMatch) {
      console.log(`✓ Test ${index + 1} passed`);
    }
  });
};

// AFTER: Convert to Jest
describe("Character Counter", () => {
  test.each([
    { input: "", expected: { count: 0, isOverLimit: false, color: "green" } },
    {
      input: "A".repeat(1500),
      expected: { count: 1500, isOverLimit: false, color: "green" },
    },
    {
      input: "A".repeat(1501),
      expected: { count: 1501, isOverLimit: true, color: "red" },
    },
  ])("should handle input: $input", ({ input, expected }) => {
    const result = getCharacterCounterInfo(input);
    expect(result).toEqual(expected);
  });
});
```

**Option B: Delete Files**

```bash
# If these utilities aren't actually used:
rm src/lib/__tests__/characterCounter.test.ts
rm src/lib/__tests__/tooltip.test.ts
rm src/components/layout/__tests__/layoutWidth.test.ts
```

**Fix Steps:**

```bash
# 1. Check if logic is used anywhere
grep -r "characterCounter\|tooltipIdTests\|layoutWidthTests" src --exclude-dir=__tests__

# 2. If used: Convert to Jest (see template above)
# 3. If not used: Delete files
# 4. Verify
npm test -- --listTests | grep -E "characterCounter|tooltip|layoutWidth"
```

**Acceptance Criteria:**

- [ ] Decision made: Convert or Delete
- [ ] If converted: All tests use Jest `describe()`/`test()` blocks
- [ ] If deleted: Confirm logic isn't needed elsewhere
- [ ] `npm test` doesn't show "must contain at least one test" errors

---

### [ISSUE-001-C] Fix localStorage Mocking Issues

**Tests Affected:** 8 failing tests in `storage.coverage.test.ts`  
**Time:** 1 hour  
**Difficulty:** 3/10

**Problem:**

```typescript
// src/lib/__tests__/storage.coverage.test.ts:39
const stored = localStorage.getItem("yt-settings");
expect(stored).toBeTruthy();

// ❌ FAIL: Received: undefined
```

**Root Cause:** localStorage isn't properly reset between tests, causing state pollution.

**Failing Tests:**

1. `updatePinnedModels › should persist pinned models to localStorage`
2. `updateModels › should persist models to localStorage`
3. `Error handling › should handle null localStorage data`
4. `Error handling › should handle partial settings`
5. `Subscription › should notify subscribers on settings update`
6. `Subscription › should handle multiple subscribers`
7. `Complex state › should maintain consistency`
8. `Data persistence › should persist all settings fields`

**Fix Steps:**

```typescript
// Add to storage.coverage.test.ts

// BEFORE: Missing setup/teardown
describe("Storage Coverage Tests", () => {
  it("should persist pinned models", () => {
    // Test code...
  });
});

// AFTER: Proper setup/teardown
describe("Storage Coverage Tests", () => {
  let storage: SettingsStorage;

  beforeEach(() => {
    // Clear everything before each test
    localStorage.clear();
    jest.clearAllMocks();

    // Reset singleton instance (if needed)
    // @ts-ignore - accessing private for testing
    SettingsStorage.instance = undefined;

    // Get fresh instance
    storage = SettingsStorage.getInstance();
  });

  afterEach(() => {
    // Clean up
    localStorage.clear();
  });

  it("should persist pinned models", () => {
    const pinnedModels = ["model-1", "model-2"];
    storage.updatePinnedModels(pinnedModels);

    // Force sync (if async)
    jest.runAllTimers();

    const stored = localStorage.getItem("image-to-prompt-settings");
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.pinnedModels).toEqual(pinnedModels);
  });
});
```

**Additional Fixes Needed:**

1. **Mock timers for debounced operations:**

```typescript
beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

// In tests:
storage.updatePinnedModels(["model-1"]);
jest.runAllTimers(); // Flush debounced saves
```

2. **Wait for async subscriptions:**

```typescript
it("should notify subscribers", async () => {
  const callback = jest.fn();
  storage.subscribe(callback);

  storage.updatePinnedModels(["model-1"]);

  // Wait for debounced notification
  await jest.runAllTimersAsync();

  expect(callback).toHaveBeenCalled();
});
```

**Acceptance Criteria:**

- [ ] All 8 storage tests pass
- [ ] `beforeEach` properly clears localStorage
- [ ] Debounced operations are flushed with timers
- [ ] No test pollution between runs
- [ ] Can run tests in isolation: `npm test -- storage.coverage.test.ts`

---

### [ISSUE-001-D] Fix Timeout Issues in Retry Tests

**Tests Affected:** 3 tests in `retry.test.ts` and `integration.test.ts`  
**Time:** 1 hour  
**Difficulty:** 4/10

**Problem:**

```typescript
// src/utils/__tests__/retry.test.ts:72
it("should handle abort signal", async () => {
  // ❌ FAIL: Exceeded timeout of 5000 ms
```

**Failing Tests:**

1. `retry.test.ts › should retry on failure and succeed` (AppError issues)
2. `retry.test.ts › should handle abort signal` (timeout)
3. `integration.test.ts › should work with circuit breaker` (timeout)

**Root Cause Analysis:**

**Issue 1: AppError.withRetryCount() breaking tests**

```typescript
// src/utils/retry.ts:86
throw error.withRetryCount(attempt);

// This creates a NEW error, losing the original mock
// Tests expect the same error object
```

**Issue 2: Abort signal never resolves**

```typescript
it("should handle abort signal", async () => {
  const controller = new AbortController();
  const operation = jest.fn().mockRejectedValue(new Error("Test"));

  const promise = retryAsync(operation, {
    signal: controller.signal,
  });

  controller.abort(); // This never stops the retry loop!
  await expect(promise).rejects.toThrow();
});
```

**Fix Steps:**

**Fix 1: Mock withRetryCount properly**

```typescript
// In retry.test.ts
it("should retry on failure and succeed", async () => {
  let attempts = 0;
  const operation = jest.fn(async () => {
    attempts++;
    if (attempts < 3) {
      const error = new AppError(
        ErrorType.NETWORK,
        `Fail ${attempts}`,
        undefined,
        {
          retryable: true,
        },
      );
      // Mock withRetryCount to return the same error
      error.withRetryCount = jest.fn().mockReturnValue(error);
      throw error;
    }
    return "success";
  });

  const result = await retryAsync(operation, {
    maxRetries: 3,
    initialDelay: 10,
    backoffMultiplier: 1,
  });

  expect(result).toBe("success");
  expect(operation).toHaveBeenCalledTimes(3);
});
```

**Fix 2: Proper abort signal handling**

```typescript
it("should handle abort signal", async () => {
  const controller = new AbortController();
  let callCount = 0;

  const operation = jest.fn(async () => {
    callCount++;
    if (callCount === 1) {
      // Abort after first attempt
      setTimeout(() => controller.abort(), 10);
    }
    throw new AppError(ErrorType.NETWORK, "Fail", undefined, {
      retryable: true,
    });
  });

  const promise = retryAsync(operation, {
    maxRetries: 10,
    initialDelay: 50,
    signal: controller.signal,
  });

  await expect(promise).rejects.toThrow();

  // Should not retry after abort
  expect(callCount).toBeLessThanOrEqual(2);
}, 10000); // Increase timeout to 10s
```

**Fix 3: Circuit breaker timeout**

```typescript
// In integration.test.ts
it("should work with circuit breaker pattern", async () => {
  const breaker = new CircuitBreaker(2, 1000);
  // ... test code ...
}, 10000); // Add explicit timeout
```

**Acceptance Criteria:**

- [ ] All retry tests pass within 5s timeout
- [ ] Abort signal properly stops retry loop
- [ ] Circuit breaker test completes in <10s
- [ ] Tests don't hang indefinitely
- [ ] Mock error handling works correctly

---

## 🎯 Overall Acceptance Criteria

- [ ] All 39 failing tests are fixed
- [ ] `npm test` shows 224/224 tests passing
- [ ] No "must contain at least one test" errors
- [ ] No timeout errors
- [ ] No React import errors
- [ ] CI pipeline passes
- [ ] Tests can run in parallel without conflicts
- [ ] Test output is clean (no console errors)

---

## 📝 Implementation Plan

### Step 1: Quick Wins (30 mins)

```bash
# Fix React imports
find src/components/__tests__ -name "*.tsx" | while read f; do
  if ! grep -q "import React" "$f"; then
    sed -i '1i import React from "react";' "$f"
  fi
done

# Verify
npm test -- --testPathPattern="(ImageToPromptTab|App)" --bail
```

### Step 2: Empty Test Files (1 hour)

```bash
# Option A: Convert to Jest
# Manually convert each file (see templates above)

# Option B: Delete if unused
rm src/lib/__tests__/characterCounter.test.ts
rm src/lib/__tests__/tooltip.test.ts
rm src/components/layout/__tests__/layoutWidth.test.ts

# Verify
npm test -- --listTests
```

### Step 3: Fix Storage Tests (1-2 hours)

```bash
# Edit src/lib/__tests__/storage.coverage.test.ts
# Add beforeEach/afterEach (see template above)

# Run to verify
npm test -- storage.coverage.test.ts --verbose
```

### Step 4: Fix Retry Tests (1-2 hours)

```bash
# Edit src/utils/__tests__/retry.test.ts
# Edit src/__tests__/integration.test.ts
# Add proper mocking and timeouts (see templates above)

# Run to verify
npm test -- retry.test.ts --verbose
npm test -- integration.test.ts --verbose
```

### Step 5: Full Test Run

```bash
# Run everything
npm test

# Verify coverage
npm test -- --coverage

# Check for any remaining failures
npm test 2>&1 | grep -E "(FAIL|●)"
```

---

## 🧪 Testing the Fix

```bash
# Before fix: Should show 39 failures
npm test 2>&1 | grep "Tests:"

# After each sub-issue:
npm test -- --testPathPattern="<affected-pattern>"

# Final verification
npm test && echo "✅ All tests passing!"
```

---

## 📊 Success Metrics

**Before:**

- ❌ 39 failed tests (17% failure rate)
- ❌ CI/CD unreliable
- ❌ Developer confidence low

**After:**

- ✅ 0 failed tests (0% failure rate)
- ✅ CI/CD reliable
- ✅ Developer confidence restored
- ✅ Can catch regressions

---

## 🔗 Related Issues

- Blocks: ISSUE-003 (Test Coverage) - can't improve coverage with broken tests
- Related to: ISSUE-002 (Lint Errors) - both block CI

---

## 📚 References

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Mock Timers](https://jestjs.io/docs/timer-mocks)
- [localStorage Testing](https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom)

---

**Last Updated:** 2025-10-14  
**Next Review:** After implementation
