# Critical Missing Features - Quick Reference

**🚨 These 5 features are ESSENTIAL for production use and must be implemented ASAP**

---

## 1. 💾 Data Export/Import System

**Why Critical:** Users can lose ALL their data (localStorage can be cleared)  
**Time Estimate:** 2-3 days  
**Files to Create:**

- `src/lib/dataExport.ts`
- `src/lib/dataImport.ts`
- `src/components/settings/DataManagement.tsx`

**Must Have:**

```typescript
// Export all data as JSON
function exportAllData(): Promise<Blob>;

// Import with validation
function importData(file: File, strategy: "replace" | "merge"): Promise<void>;

// Export individual sections
function exportSection(
  section: "usage" | "history" | "settings",
): Promise<Blob>;
```

**User Flow:**

1. Settings → Data Management
2. Click "Export All Data" → Downloads JSON
3. Click "Import Data" → Select file → Preview → Import
4. Data safely backed up ✅

---

## 2. 💰 API Quota & Budget Management

**Why Critical:** Users could accidentally spend hundreds on API calls  
**Time Estimate:** 2-3 days  
**Files to Create:**

- `src/lib/quotaManager.ts`
- `src/lib/rateLimiter.ts`
- `src/components/settings/BudgetSettings.tsx`

**Must Have:**

```typescript
// User sets budget limits
interface BudgetSettings {
  dailyLimit: number; // e.g., $5/day
  monthlyLimit: number; // e.g., $100/month
  warningThreshold: number; // e.g., warn at 80%
}

// Before any API call
function checkBudget(estimatedCost: number): {
  allowed: boolean;
  reason?: string;
};

// Show cost before batch operations
function estimateBatchCost(imageCount: number, models: string[]): number;
```

**User Flow:**

1. Settings → Budget
2. Set daily/monthly limits
3. Before batch: "This will cost ~$2.50. Continue?"
4. If over budget: "Daily limit reached ($5/$5). Try again tomorrow."

---

## 3. 📱 Offline Support (PWA)

**Why Critical:** Network errors cause complete app failure  
**Time Estimate:** 3-4 days  
**Files to Create:**

- `public/sw.js` (Service Worker)
- `src/lib/offlineQueue.ts`
- `src/hooks/useOfflineStatus.ts`
- `src/components/OfflineIndicator.tsx`

**Must Have:**

```typescript
// Service worker caches:
- Static assets (CSS, JS, images)
- API responses (prompts, usage data)
- Generated content for offline viewing

// When offline:
- View history (cached)
- Queue new requests
- Show "Offline" indicator
- Auto-sync when online
```

**User Flow:**

1. User loses connection
2. Orange "Offline" indicator appears
3. Can still view history/past prompts
4. New requests queued
5. Connection restored → Auto-sync queued requests

---

## 4. 🛡️ Error Recovery System

**Why Critical:** Errors crash entire app, no way to recover  
**Time Estimate:** 1-2 days  
**Files to Modify:**

- `src/components/ErrorBoundary.tsx` (add recovery)
- Create `src/lib/errorReporter.ts`
- Create `src/hooks/useErrorRecovery.ts`

**Must Have:**

```typescript
// Granular error boundaries
<ErrorBoundary level="tab" onRecover={retryAction}>
  <UsageTab />
</ErrorBoundary>

// Recovery actions
interface ErrorRecovery {
  retry: () => void;
  reset: () => void;
  goBack: () => void;
}

// User-friendly messages
"Something went wrong loading usage data. [Retry] [Go Back]"
```

**User Flow:**

1. Error occurs in one tab
2. Only that tab shows error (not whole app)
3. User sees: "Couldn't load history. [Retry] [Reset] [Contact Support]"
4. Click Retry → Tab reloads
5. If still fails → Option to reset that tab's data

---

## 5. 🔒 Input Validation & Sanitization

**Why Critical:** XSS vulnerabilities, data corruption, API errors  
**Time Estimate:** 1-2 days  
**Files to Create:**

- `src/lib/validation.ts`
- `src/lib/sanitization.ts`
- Install: `dompurify`, `zod`

**Must Have:**

```typescript
// Validate all inputs
function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
};

// Sanitize before rendering
function sanitizeHTML(userContent: string): string;

// Validate API responses
const UsageEntrySchema = z.object({
  id: z.string(),
  modelId: z.string(),
  totalCost: z.number().positive(),
  timestamp: z.number().positive(),
});

function validateApiResponse<T>(data: unknown, schema: ZodSchema<T>): T;
```

**Checks:**

- ✅ Image uploads: type, size (<10MB), valid format
- ✅ User text: sanitize HTML, max length
- ✅ API responses: schema validation
- ✅ File imports: JSON validation
- ✅ Settings: type and range validation

---

## Implementation Order

**Week 1 (Most Critical):**

1. ✅ Data Export/Import (2-3 days) - **START HERE**
2. ✅ Error Recovery (1-2 days)
3. ✅ Input Validation (1-2 days)

**Week 2 (Also Critical):** 4. ✅ API Quota Management (2-3 days) 5. ✅ Offline Support (3-4 days)

**Total Time:** 9-14 days for all 5 critical features

---

## Why These 5?

| Feature            | Prevents            | Impact if Missing                            |
| ------------------ | ------------------- | -------------------------------------------- |
| Data Export/Import | Data loss           | Users lose all work when localStorage clears |
| Quota Management   | Cost overruns       | Users accidentally spend $100+ on API        |
| Offline Support    | Network failures    | App unusable with bad connection             |
| Error Recovery     | App crashes         | One error breaks entire app                  |
| Input Validation   | Security/corruption | XSS attacks, corrupted data                  |

---

## Quick Start Checklist

**To implement Feature #1 (Data Export/Import) - START HERE:**

- [ ] Create `src/lib/dataExport.ts`

  ```typescript
  export async function exportAllData(): Promise<Blob>;
  export async function exportSection(section: DataSection): Promise<Blob>;
  ```

- [ ] Create `src/lib/dataImport.ts`

  ```typescript
  export async function importData(
    file: File,
    strategy: ImportStrategy,
  ): Promise<ImportResult>;
  export function validateImportData(data: unknown): ValidationResult;
  ```

- [ ] Create `src/components/settings/DataManagement.tsx`
  - Export All button
  - Export Sections dropdown (Usage, History, Settings, etc.)
  - Import button with file picker
  - Import preview modal
  - Merge strategy selection

- [ ] Add new settings tab section
  - Modify `src/components/SettingsTab.tsx`
  - Add "Data Management" section
  - Link to new DataManagement component

- [ ] Add tests
  - `src/lib/__tests__/dataExport.test.ts`
  - `src/lib/__tests__/dataImport.test.ts`
  - `src/components/__tests__/DataManagement.test.tsx`

- [ ] Update docs
  - Add to `docs/FEATURES_GUIDE.md`
  - Add to README.md

**Estimated Time:** 2-3 days  
**Priority:** P0 - CRITICAL  
**Blocks:** Production readiness

---

## Questions?

See full analysis in `MISSING_ESSENTIAL_FEATURES_ANALYSIS.md`
