# ISSUE-007: Missing E2E Test Infrastructure

**Status:** 🟢 MEDIUM PRIORITY  
**Impact:** 7/10  
**Difficulty:** 6/10 ⭐⭐⭐⭐⭐⭐  
**Estimated Time:** 3-5 days  
**Assignee:** TBD  
**Created:** 2025-10-14

---

## 📋 Problem Statement

The project has **ZERO end-to-end (E2E) tests**, meaning critical user flows are completely untested. While unit tests verify individual functions work, they cannot catch integration bugs, API interaction issues, or real user workflow problems. This is a major gap in test coverage that risks production bugs slipping through.

### Current State

```
Unit Tests:           ✅ 185 passing (functions, components)
Integration Tests:    ❌ 0 tests
E2E Tests:            ❌ 0 tests
E2E Framework:        ❌ Not installed
E2E Infrastructure:   ❌ Not configured

Coverage:
- Function level:     ✅ Good
- Component level:    ⚠️  Partial
- User flow level:    ❌ None
```

---

## 🔍 Critical Untested Flows

### Flow 1: Complete Image-to-Prompt Generation

```
User Journey:
1. Open app
2. Upload image (drag & drop or click)
3. See image preview
4. Enter API key (if not set)
5. Validate API key
6. Fetch models
7. Select 5 vision models
8. Click "Generate"
9. See loading spinners for each model
10. See results appear one by one
11. Copy prompt to clipboard
12. Navigate to History tab
13. See history entry created

❌ UNTESTED END-TO-END
```

### Flow 2: Settings Persistence

```
User Journey:
1. Enter API key
2. Validate API key
3. Select models
4. Set custom prompt
5. Refresh page
6. ✅ API key still there
7. ✅ Models still selected
8. ✅ Custom prompt still there

❌ UNTESTED END-TO-END
```

### Flow 3: Error Handling

```
User Journey:
1. Enter invalid API key
2. See error message
3. Try to generate without image
4. See error message
5. Upload 11MB image
6. See file size error
7. Generate with network error
8. See API error per model

❌ UNTESTED END-TO-END
```

### Flow 4: Multi-Model Batch Generation

```
User Journey:
1. Select 5 different models
2. Upload image
3. Click generate
4. Verify ALL 5 models called in parallel
5. Verify costs calculated for each
6. Verify history saved for each
7. Verify can copy each result

❌ UNTESTED END-TO-END
```

---

## 📊 Gap Analysis

### What Unit Tests Cover

```
✅ Individual functions work
✅ Components render
✅ Props passed correctly
✅ State updates work
✅ Callbacks fire
```

### What Unit Tests CANNOT Cover

```
❌ Image upload actually works in browser
❌ API calls succeed with real network
❌ localStorage persists across reload
❌ Navigation preserves state
❌ Multiple components work together
❌ Async flows complete correctly
❌ Race conditions
❌ Browser compatibility
❌ Actual user experience
```

---

## ✅ The Solution: Add Playwright E2E Tests

### Why Playwright?

| Feature         | Playwright                 | Cypress            | Selenium   |
| --------------- | -------------------------- | ------------------ | ---------- |
| Speed           | ⚡ Fast                    | ⚡ Fast            | 🐌 Slow    |
| API             | 🎯 Modern                  | 🎯 Modern          | 😵 Legacy  |
| Multi-browser   | ✅ Chrome, Firefox, Safari | ⚠️ Chrome, Firefox | ✅ All     |
| TypeScript      | ✅ First-class             | ✅ Good            | ⚠️ Partial |
| Network mocking | ✅ Built-in                | ✅ Good            | ❌ Manual  |
| Debugging       | ✅ Excellent               | ✅ Excellent       | ⚠️ Poor    |
| CI/CD           | ✅ Easy                    | ✅ Easy            | ⚠️ Complex |
| Learning curve  | ✅ Low                     | ✅ Low             | ⚠️ High    |

**Winner:** Playwright ✅

---

## 📦 Implementation Plan

### Phase 1: Infrastructure Setup (Day 1, 4 hours)

**Step 1: Install Playwright**

```bash
# Install Playwright and browsers
npm install -D @playwright/test
npx playwright install

# This installs:
# - @playwright/test (test runner)
# - Chromium browser
# - Firefox browser
# - WebKit browser (Safari)
```

**Step 2: Create Playwright Config**

```typescript
// playwright.config.ts

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",

  // Run tests in parallel
  fullyParallel: true,

  // Fail build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [["html"], ["json", { outputFile: "test-results/results.json" }]],

  use: {
    // Base URL for navigation
    baseURL: "http://localhost:3000",

    // Collect trace on failure
    trace: "retain-on-failure",

    // Screenshot on failure
    screenshot: "only-on-failure",

    // Video on failure
    video: "retain-on-failure",
  },

  // Configure projects for major browsers
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  // Run local dev server before tests
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

**Step 3: Create E2E Directory Structure**

```bash
mkdir -p e2e/{fixtures,helpers,tests}

# Structure:
e2e/
├── fixtures/
│   ├── testImage.png          # Sample test image
│   └── mockApiResponses.ts    # Mock API data
├── helpers/
│   ├── imageUpload.ts         # Helper functions
│   ├── apiMocks.ts            # API mocking utilities
│   └── assertions.ts          # Custom assertions
└── tests/
    ├── image-upload.spec.ts
    ├── generation.spec.ts
    ├── settings.spec.ts
    └── history.spec.ts
```

**Step 4: Update package.json**

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

**Acceptance Criteria:**

- [ ] Playwright installed
- [ ] playwright.config.ts created
- [ ] E2E directory structure created
- [ ] npm scripts added
- [ ] Can run `npx playwright test` (even with 0 tests)

---

### Phase 2: Test Fixtures & Helpers (Day 1-2, 4 hours)

**Create Test Image:**

```bash
# Download a test image (or create one)
curl -o e2e/fixtures/testImage.png \
  https://via.placeholder.com/800x600.png?text=Test+Image

# Or use a real test image from your project
```

**Create API Mock Helpers:**

```typescript
// e2e/helpers/apiMocks.ts

import { Page } from "@playwright/test";

export const mockOpenRouterAPI = async (page: Page) => {
  // Mock models API
  await page.route("https://openrouter.ai/api/v1/models", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          {
            id: "anthropic/claude-3-opus",
            name: "Claude 3 Opus",
            pricing: { prompt: "0.000015", completion: "0.000075" },
            architecture: { input_modalities: ["image", "text"] },
          },
          {
            id: "openai/gpt-4-vision-preview",
            name: "GPT-4 Vision",
            pricing: { prompt: "0.00001", completion: "0.00003" },
            architecture: { input_modalities: ["image", "text"] },
          },
          // Add 3 more models for testing
        ],
      }),
    });
  });

  // Mock chat completions API
  await page.route(
    "https://openrouter.ai/api/v1/chat/completions",
    async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      const modelId = postData.model;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          choices: [
            {
              message: {
                content: `Test prompt generated by ${modelId}. This is a detailed description of the test image.`,
              },
            },
          ],
        }),
      });
    },
  );
};

export const mockAPIError = async (page: Page, status: number = 500) => {
  await page.route("https://openrouter.ai/api/v1/**", async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({
        error: { message: "API Error for testing" },
      }),
    });
  });
};
```

**Create Image Upload Helper:**

```typescript
// e2e/helpers/imageUpload.ts

import { Page } from "@playwright/test";
import path from "path";

export const uploadTestImage = async (page: Page) => {
  const filePath = path.join(__dirname, "../fixtures/testImage.png");

  // Option 1: File input
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);

  // Wait for preview to appear
  await page.waitForSelector('img[alt="Uploaded preview"]');
};

export const uploadImageViaDragDrop = async (page: Page) => {
  const filePath = path.join(__dirname, "../fixtures/testImage.png");

  // Create a DataTransfer object
  const buffer = await page
    .context()
    .browser()!
    .newContext()
    .then((ctx) =>
      ctx
        .newPage()
        .then((p) =>
          p
            .goto(`file://${filePath}`)
            .then(() => p.screenshot({ type: "png" })),
        ),
    );

  // Trigger drop event
  await page.dispatchEvent('[role="button"]', "drop", {
    dataTransfer: {
      files: [
        {
          name: "testImage.png",
          type: "image/png",
          buffer,
        },
      ],
    },
  });
};
```

**Acceptance Criteria:**

- [ ] Test image fixture created
- [ ] API mocking helpers created
- [ ] Image upload helpers created
- [ ] Can import and use helpers in tests

---

### Phase 3: Core E2E Tests (Day 2-3, 12 hours)

**Test 1: Image Upload Flow**

```typescript
// e2e/tests/image-upload.spec.ts

import { test, expect } from "@playwright/test";
import { uploadTestImage } from "../helpers/imageUpload";

test.describe("Image Upload", () => {
  test("should upload image via file input", async ({ page }) => {
    await page.goto("/");

    // Upload image
    await uploadTestImage(page);

    // Verify preview appears
    const preview = page.locator('img[alt="Uploaded preview"]');
    await expect(preview).toBeVisible();

    // Verify remove button appears
    const removeButton = page.locator('button[aria-label="Remove image"]');
    await expect(removeButton).toBeVisible();
  });

  test("should reject invalid file type", async ({ page }) => {
    await page.goto("/");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("test"),
    });

    // Verify error message
    await expect(page.locator("text=/Invalid file type/i")).toBeVisible();
  });

  test("should reject oversized file", async ({ page }) => {
    await page.goto("/");

    // Create 11MB buffer
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "large.png",
      mimeType: "image/png",
      buffer: largeBuffer,
    });

    // Verify error message
    await expect(page.locator("text=/File size too large/i")).toBeVisible();
  });

  test("should clear uploaded image", async ({ page }) => {
    await page.goto("/");
    await uploadTestImage(page);

    // Click remove button
    await page.click('button[aria-label="Remove image"]');

    // Verify preview is gone
    await expect(page.locator('img[alt="Uploaded preview"]')).not.toBeVisible();

    // Verify upload zone is back
    await expect(page.locator("text=/Drop your image here/i")).toBeVisible();
  });
});
```

**Test 2: Settings & API Key Flow**

```typescript
// e2e/tests/settings.spec.ts

import { test, expect } from "@playwright/test";
import { mockOpenRouterAPI } from "../helpers/apiMocks";

test.describe("Settings", () => {
  test("should validate API key", async ({ page }) => {
    await mockOpenRouterAPI(page);
    await page.goto("/");

    // Navigate to Settings
    await page.click('button:has-text("Settings")');

    // Enter API key
    await page.fill('input[placeholder*="API Key"]', "sk-or-v1-test-key");

    // Click validate
    await page.click('button:has-text("Validate")');

    // Wait for validation
    await expect(page.locator("text=/API key validated/i")).toBeVisible();
  });

  test("should fetch and display models", async ({ page }) => {
    await mockOpenRouterAPI(page);
    await page.goto("/");

    // Go to Settings
    await page.click('button:has-text("Settings")');

    // Enter and validate API key
    await page.fill('input[placeholder*="API Key"]', "sk-or-v1-test-key");
    await page.click('button:has-text("Validate")');
    await page.waitForSelector("text=/API key validated/i");

    // Go to Model Selection tab
    await page.click('button:has-text("Model Selection")');

    // Click Fetch Models
    await page.click('button:has-text("Fetch Models")');

    // Verify models loaded
    await expect(
      page.locator("text=/Successfully fetched.*models/i"),
    ).toBeVisible();

    // Verify model dropdowns appear
    const dropdown = page.locator('button:has-text("Select Model 1")');
    await expect(dropdown).toBeVisible();
  });

  test("should persist settings across reload", async ({ page, context }) => {
    await mockOpenRouterAPI(page);
    await page.goto("/");

    // Set up settings
    await page.click('button:has-text("Settings")');
    await page.fill('input[placeholder*="API Key"]', "sk-or-v1-persist-test");
    await page.click('button:has-text("Validate")');
    await page.waitForSelector("text=/API key validated/i");

    // Reload page
    await page.reload();

    // Verify API key persisted
    await page.click('button:has-text("Settings")');
    const apiKeyInput = page.locator('input[placeholder*="API Key"]');
    await expect(apiKeyInput).toHaveValue("sk-or-v1-persist-test");
  });
});
```

**Test 3: End-to-End Generation Flow**

```typescript
// e2e/tests/generation.spec.ts

import { test, expect } from "@playwright/test";
import { mockOpenRouterAPI } from "../helpers/apiMocks";
import { uploadTestImage } from "../helpers/imageUpload";

test.describe("Prompt Generation", () => {
  test("should generate prompts for all selected models", async ({ page }) => {
    await mockOpenRouterAPI(page);
    await page.goto("/");

    // Setup: API key and models
    await page.click('button:has-text("Settings")');
    await page.fill('input[placeholder*="API Key"]', "sk-or-v1-test");
    await page.click('button:has-text("Validate")');
    await page.waitForSelector("text=/API key validated/i");

    await page.click('button:has-text("Model Selection")');
    await page.click('button:has-text("Fetch Models")');
    await page.waitForSelector("text=/Successfully fetched/i");

    // Select 3 models
    for (let i = 0; i < 3; i++) {
      await page.click(`button:has-text("Select Model ${i + 1}")`);
      await page.click(`text=Claude 3 Opus`); // Select first model
    }

    // Go back to main tab
    await page.click('button:has-text("Image to Prompt")');

    // Upload image
    await uploadTestImage(page);

    // Click Generate
    await page.click('button:has-text("Generate")');

    // Verify loading states
    await expect(page.locator(".animate-spin")).toBeVisible();

    // Wait for results (one for each model)
    await expect(
      page.locator("text=/Test prompt generated/i").first(),
    ).toBeVisible({ timeout: 10000 });

    // Verify all 3 results appear
    const results = page.locator("text=/Test prompt generated/i");
    await expect(results).toHaveCount(3);

    // Verify costs displayed
    await expect(page.locator("text=/Total Cost/i")).toBeVisible();
  });

  test("should handle API errors gracefully", async ({ page }) => {
    await page.route("https://openrouter.ai/api/v1/**", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: { message: "Server error" } }),
      });
    });

    await page.goto("/");

    // ... setup API key and models ...
    // ... upload image ...
    // ... click generate ...

    // Verify error message appears
    await expect(page.locator("text=/Server error/i")).toBeVisible();
  });
});
```

**Test 4: History Tracking**

```typescript
// e2e/tests/history.spec.ts

import { test, expect } from "@playwright/test";
import { mockOpenRouterAPI } from "../helpers/apiMocks";
import { uploadTestImage } from "../helpers/imageUpload";

test.describe("History", () => {
  test("should save generation to history", async ({ page }) => {
    await mockOpenRouterAPI(page);
    await page.goto("/");

    // ... complete a generation ...

    // Navigate to History tab
    await page.click('button:has-text("History")');

    // Verify history entry exists
    await expect(page.locator("table tbody tr").first()).toBeVisible();

    // Verify entry contains image thumbnail
    await expect(page.locator("table tbody tr img").first()).toBeVisible();

    // Verify entry contains cost
    await expect(
      page.locator("table tbody tr text=/\\$/i").first(),
    ).toBeVisible();
  });

  test("should filter history by search", async ({ page }) => {
    await page.goto("/");
    await page.click('button:has-text("History")');

    // Type in search
    await page.fill('input[placeholder*="Search"]', "Claude");

    // Verify filtered results
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toContainText("Claude");
  });
});
```

**Acceptance Criteria:**

- [ ] 15+ E2E tests written
- [ ] All critical user flows covered
- [ ] Tests pass locally
- [ ] Tests are reliable (no flakiness)

---

### Phase 4: CI Integration (Day 4, 4 hours)

**Update GitHub Actions Workflow:**

```yaml
# .github/workflows/e2e-tests.yml

name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npm run test:e2e

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

**Acceptance Criteria:**

- [ ] E2E tests run in CI
- [ ] Test reports uploaded as artifacts
- [ ] CI fails if E2E tests fail

---

### Phase 5: Documentation & Maintenance (Day 4-5, 4 hours)

**Create E2E Testing Guide:**

````markdown
<!-- docs/E2E_TESTING.md -->

# E2E Testing Guide

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in UI mode (interactive)
npm run test:e2e:ui

# Run specific test
npx playwright test e2e/tests/generation.spec.ts

# Debug mode
npm run test:e2e:debug
```
````

## Writing Tests

See examples in `e2e/tests/`.

### Best Practices

1. Use Page Object Model for complex pages
2. Mock external APIs
3. Use test fixtures for data
4. Keep tests independent
5. Use meaningful assertions

## Troubleshooting

### Tests are flaky

- Add explicit waits: `await page.waitForSelector()`
- Increase timeouts: `{ timeout: 10000 }`
- Check for animations: `await page.waitForLoadState('networkidle')`

### Can't find element

- Use Playwright Inspector: `npx playwright test --debug`
- Check selectors: `npx playwright codegen http://localhost:3000`

```

**Acceptance Criteria:**
- [ ] E2E testing docs written
- [ ] Examples provided
- [ ] Troubleshooting guide included

---

## 🎯 Final Acceptance Criteria

**Infrastructure:**
- [ ] Playwright installed and configured
- [ ] E2E directory structure created
- [ ] Test helpers and fixtures created
- [ ] CI/CD integration complete

**Tests:**
- [ ] 15+ E2E tests written
- [ ] Image upload flow tested
- [ ] Settings flow tested
- [ ] Generation flow tested end-to-end
- [ ] History flow tested
- [ ] Error handling tested
- [ ] All tests pass locally
- [ ] All tests pass in CI

**Documentation:**
- [ ] E2E testing guide written
- [ ] Examples provided
- [ ] README updated

**Quality:**
- [ ] Tests are reliable (< 5% flaky)
- [ ] Tests run in < 5 minutes
- [ ] Clear error messages
- [ ] Screenshots/videos on failure

---

## 📊 Success Metrics

**Before:**
```

E2E Coverage: 0%
User flows tested: 0
Integration bugs: Unknown (not caught)
Confidence in releases: Low

```

**After:**
```

E2E Coverage: 80%+ ✅
User flows tested: 4 critical flows ✅
Integration bugs: Caught before production ✅
Confidence in releases: High ✅

```

---

## 🚨 Common Pitfalls

1. **Flaky Tests**
   - Use proper waits
   - Avoid hardcoded delays
   - Mock time-dependent operations

2. **Slow Tests**
   - Mock external APIs
   - Run in parallel
   - Optimize selectors

3. **Brittle Selectors**
   - Use test IDs (`data-testid`)
   - Avoid CSS class names
   - Use semantic selectors

---

## 🔗 Related Issues

- Complements: ISSUE-003 (Test coverage)
- Enables: Confidence in refactoring
- Blocks: None

---

## 📚 References

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [CI/CD Integration](https://playwright.dev/docs/ci)

---

**Last Updated:** 2025-10-14
**Status:** Ready for implementation (after critical issues)
**Estimated Effort:** 3-5 days
```
