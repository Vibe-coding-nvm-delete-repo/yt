# ISSUE-006: Hook Implementation Proliferation

**Status:** 🟢 MEDIUM PRIORITY  
**Impact:** 7/10  
**Difficulty:** 4/10 ⭐⭐⭐⭐  
**Estimated Time:** 1 day  
**Assignee:** TBD  
**Created:** 2025-10-14

---

## 📋 Problem Statement

There are **THREE hooks that do the exact same thing** with nearly-identical code, totaling **849 lines** when it should be **~300 lines**. The "optimized" versions claim better performance but have the same implementation. Worse: **only one is actually used in production**, making the other two dead code.

### The Three Hooks

```
src/hooks/useSettings.ts:           345 lines ← USED in production ✅
src/hooks/useOptimizedSettings.ts:  261 lines ← UNUSED dead code ❌
src/hooks/usePerformantSettings.ts: 243 lines ← UNUSED dead code ❌
────────────────────────────────────────────────────────────────
Total:                              849 lines
Expected (deduplicated):            ~300 lines
Waste:                              ~549 lines (65% duplication!)
```

---

## 🔍 Root Cause Analysis

### How This Happened

**Likely Timeline:**

1. Original `useSettings.ts` created
2. Performance concerns → Created "optimized" version
3. More perf tweaking → Created "performant" version
4. Original was fixed → Now we have 3 identical hooks!
5. Nobody deleted the old ones

**Why It's Problematic:**

```typescript
// Developer A (reads docs):
import { useSettings } from "@/hooks/useSettings";

// Developer B (sees "optimized" in name):
import { useOptimizedSettings } from "@/hooks/useOptimizedSettings";

// Developer C (wants performance):
import { usePerformantSettings } from "@/hooks/usePerformantSettings";

// ❌ ALL THREE DO THE SAME THING!
// ❌ Confusion about which to use
// ❌ 849 lines to maintain when should be 300
```

---

## 🔬 Evidence

### Proof 1: Identical Signatures

```bash
$ grep -A 5 "export const use" src/hooks/use*Settings.ts

# ALL THREE have IDENTICAL function signatures:

src/hooks/useSettings.ts:
export const useSettings = (subscribeToKeys?: (keyof AppSettings)[]) => {

src/hooks/useOptimizedSettings.ts:
export const useOptimizedSettings = (subscribeToKeys?: (keyof AppSettings)[]) => {

src/hooks/usePerformantSettings.ts:
export const usePerformantSettings = (subscribeToKeys?: (keyof AppSettings)[]) => {
```

### Proof 2: Identical Implementation

```typescript
// ALL THREE have the same logic:

1. useState with default settings
2. useEffect to load from storage
3. useEffect to subscribe
4. useMemo to memoize settings
5. useCallback for each method
6. useMemo to return object

// Only difference: which storage singleton they import!
```

### Proof 3: Only One Used in Production

```bash
$ grep -r "useSettings\|useOptimizedSettings\|usePerformantSettings" src \
  --include="*.tsx" --include="*.ts" --exclude-dir=__tests__ \
  | grep -v "export const use"

# Results:
src/components/App.tsx:import { useSettings } from "@/hooks/useSettings";
src/components/ImageToPromptTabs.tsx:import { useSettings } from "@/hooks/useSettings";
src/components/SettingsTab.tsx:import { useSettings as useSettingsHook } from "@/hooks/useSettings";

# useOptimizedSettings: 0 usages ❌
# usePerformantSettings: 0 usages ❌
```

**VERDICT:** The "optimized" hooks are **100% dead code**!

---

## 📊 Detailed Comparison

### Feature Matrix

| Feature                 | useSettings | useOptimizedSettings | usePerformantSettings |
| ----------------------- | ----------- | -------------------- | --------------------- |
| Selective subscriptions | ✅          | ✅                   | ✅                    |
| Memoized settings       | ✅          | ✅                   | ✅                    |
| Memoized callbacks      | ✅          | ✅                   | ✅                    |
| SSR-safe initialization | ✅          | ✅                   | ✅                    |
| Debounced updates       | ✅          | ✅                   | ✅                    |
| Deep equality checking  | ✅          | ✅                   | ✅                    |
| **Used in production**  | ✅          | ❌                   | ❌                    |
| **Has tests**           | ✅          | ✅                   | ❌                    |
| **Lines of code**       | 345         | 261                  | 243                   |

**Winner:** `useSettings.ts` is the clear choice! ✅

### Code Comparison

```typescript
// useSettings.ts (line 11-28)
export const useSettings = (subscribeToKeys?: (keyof AppSettings)[]) => {
  const [settings, setSettings] = useState<AppSettings>(() => ({
    openRouterApiKey: "",
    selectedModel: "",
    selectedVisionModels: [],
    customPrompt: "Describe this image...",
    isValidApiKey: false,
    lastApiKeyValidation: null,
    lastModelFetch: null,
    availableModels: [],
    preferredModels: [],
    pinnedModels: [],
  }));
  // ... rest
};

// useOptimizedSettings.ts (line 11-28)
export const useOptimizedSettings = (
  subscribeToKeys?: (keyof AppSettings)[],
) => {
  const [settings, setSettings] = useState<AppSettings>(() => ({
    openRouterApiKey: "",
    selectedModel: "",
    selectedVisionModels: [],
    customPrompt: "Describe this image...",
    isValidApiKey: false,
    lastApiKeyValidation: null,
    lastModelFetch: null,
    availableModels: [],
    preferredModels: [],
    pinnedModels: [],
  }));
  // ... rest - IDENTICAL!
};

// Only difference: function name and import statement!
```

---

## ✅ The Solution: Delete the Unused Hooks

### Why Keep useSettings.ts?

1. ✅ **Most complete** (345 lines, has all helper hooks)
2. ✅ **Used in production** (3 components)
3. ✅ **Has tests** (comprehensive test suite)
4. ✅ **Documented** (JSDoc comments)
5. ✅ **Proven** (working in production)

### Why Delete the Others?

1. ❌ **Zero production usage**
2. ❌ **Pure duplication**
3. ❌ **Maintenance burden**
4. ❌ **Developer confusion**

---

## 📝 Implementation Plan

### Step 1: Final Verification (30 minutes)

**Confirm Zero Usage:**

```bash
# Search for ANY usage of "optimized" or "performant" hooks
rg "useOptimizedSettings|usePerformantSettings" src \
  --type ts \
  --type tsx \
  --glob '!**/*.test.*' \
  --glob '!**/useOptimizedSettings.ts' \
  --glob '!**/usePerformantSettings.ts'

# Expected: No results (except in their own files)
```

**Check Git History:**

```bash
# See if anyone recently added code to these files
git log --oneline -10 -- src/hooks/useOptimizedSettings.ts
git log --oneline -10 -- src/hooks/usePerformantSettings.ts

# If recent commits exist, review them first!
```

**Create Audit Log:**

```bash
cat > /tmp/hook-audit.txt <<EOF
Hook Duplication Audit
Date: $(date)

Files to DELETE:
- src/hooks/useOptimizedSettings.ts (261 lines) - Not used
- src/hooks/usePerformantSettings.ts (243 lines) - Not used
- src/hooks/__tests__/useOptimizedSettings.test.ts (if exists)

File to KEEP:
- src/hooks/useSettings.ts (345 lines) - Used by:
  * src/components/App.tsx
  * src/components/ImageToPromptTabs.tsx
  * src/components/SettingsTab.tsx

TOTAL LINES REMOVED: ~504 lines
DUPLICATION ELIMINATED: 100%
EOF

cat /tmp/hook-audit.txt
```

**Acceptance Criteria:**

- [ ] Confirmed useOptimizedSettings has zero production usage
- [ ] Confirmed usePerformantSettings has zero production usage
- [ ] Git history reviewed
- [ ] Audit log created

---

### Step 2: Delete Unused Hooks (15 minutes)

```bash
# Backup first (paranoia is good)
mkdir -p /tmp/hooks-backup
cp src/hooks/useOptimizedSettings.ts /tmp/hooks-backup/ 2>/dev/null || true
cp src/hooks/usePerformantSettings.ts /tmp/hooks-backup/ 2>/dev/null || true

# Delete the duplicate hooks
rm -f src/hooks/useOptimizedSettings.ts
rm -f src/hooks/usePerformantSettings.ts

# Delete associated tests (if any)
rm -f src/hooks/__tests__/useOptimizedSettings.test.ts
rm -f src/hooks/__tests__/usePerformantSettings.test.ts

echo "✅ Deleted 504+ lines of duplicate hook code"
```

**Verification:**

```bash
# TypeScript should compile cleanly
npm run typecheck
# ✅ Should pass (no broken imports)

# Build should succeed
npm run build
# ✅ Should succeed

# Tests should pass
npm test
# ✅ Should pass (same as before)
```

**Acceptance Criteria:**

- [ ] useOptimizedSettings.ts deleted
- [ ] usePerformantSettings.ts deleted
- [ ] Associated tests deleted
- [ ] TypeScript compiles
- [ ] Build succeeds
- [ ] All tests pass

---

### Step 3: Verify useSettings.ts is Complete (1 hour)

Make sure we're not losing any functionality:

**Feature Checklist:**

```typescript
// src/hooks/useSettings.ts

✅ Main hook: useSettings(subscribeToKeys?)
✅ Helper hooks:
  - useSettingsKey<K>(key)
  - useApiKey()
  - useApiKeyValidation()
  - useModelSelection()
  - usePinnedModels()
  - useCustomPrompt()
  - useModelManagement()

✅ Memoization:
  - Settings object memoized
  - Callbacks memoized
  - Return object memoized

✅ Selective subscriptions:
  - Can subscribe to specific keys
  - Prevents unnecessary re-renders

✅ SSR-safe:
  - Default values during SSR
  - Hydration-safe

✅ Performance:
  - Debounced updates
  - Deep equality checking
  - Ref-based optimization
```

**Performance Validation:**

```typescript
// Add temporary performance measurement

// In useSettings.ts (temporarily):
console.time("useSettings render");
const result = useMemo(
  () => ({
    settings: memoizedSettings,
    // ... rest
  }),
  [
    /* deps */
  ],
);
console.timeEnd("useSettings render");

// Test in browser:
// Before: N/A (using dead code)
// After: Should be <1ms per render
```

**Acceptance Criteria:**

- [ ] All features present in useSettings.ts
- [ ] All helper hooks exported
- [ ] Performance is acceptable
- [ ] No regressions

---

### Step 4: Update Documentation (30 minutes)

**Update Hook Documentation:**

```typescript
// src/hooks/useSettings.ts

/**
 * Centralized settings hook with performance optimizations.
 *
 * Features:
 * - Selective subscriptions (subscribe to specific keys only)
 * - Memoized settings and callbacks
 * - SSR-safe initialization
 * - Debounced updates for performance
 * - Deep equality checking
 *
 * @param subscribeToKeys - Optional array of keys to subscribe to
 * @returns Settings object and update methods
 *
 * @example
 * // Subscribe to all settings changes
 * const { settings, updateApiKey } = useSettings();
 *
 * @example
 * // Subscribe only to API key changes (optimized)
 * const { settings } = useSettings(['openRouterApiKey', 'isValidApiKey']);
 *
 * @example
 * // Use helper hooks for single values
 * const [apiKey, setApiKey] = useApiKey();
 * const { pinnedModels, pinModel } = usePinnedModels();
 */
export const useSettings = (subscribeToKeys?: (keyof AppSettings)[]) => {
  // implementation
};
```

**Update README:**

````markdown
<!-- README.md or docs/HOOKS.md -->

## Settings Hook

Use `useSettings()` for all settings management:

```typescript
import { useSettings } from "@/hooks/useSettings";

function MyComponent() {
  const { settings, updateApiKey } = useSettings();
  // ...
}
```
````

### Performance Optimization

Subscribe to specific keys only:

```typescript
// Only re-renders when API key changes
const { settings } = useSettings(["openRouterApiKey"]);
```

### Helper Hooks

For single values, use helper hooks:

```typescript
const [apiKey, setApiKey] = useApiKey();
const { pinnedModels, pinModel } = usePinnedModels();
```

### ~~Deprecated~~

- ❌ `useOptimizedSettings` - Removed (duplicate)
- ❌ `usePerformantSettings` - Removed (duplicate)

Use `useSettings` instead. It has all optimizations built-in.

````

**Acceptance Criteria:**
- [ ] JSDoc comments added/updated
- [ ] README updated
- [ ] Examples provided
- [ ] Deprecated hooks documented

---

### Step 5: Git Commit (5 minutes)

```bash
# Stage deletions
git add -A

# Commit with clear message
git commit -m "refactor: remove duplicate settings hooks

- Delete useOptimizedSettings.ts (261 lines, unused)
- Delete usePerformantSettings.ts (243 lines, unused)
- Keep useSettings.ts as single source of truth
- Total: 504 lines of duplication removed

Rationale:
- Only useSettings is used in production (3 components)
- All three had identical implementations
- Reduces maintenance burden
- Eliminates developer confusion

ISSUE-006"

echo "✅ Changes committed"
````

---

## 🎯 Acceptance Criteria

**Overall Success:**

- [ ] Only ONE settings hook exists: `useSettings`
- [ ] useOptimizedSettings.ts deleted (261 lines)
- [ ] usePerformantSettings.ts deleted (243 lines)
- [ ] Associated tests deleted
- [ ] TypeScript compiles without errors
- [ ] Build succeeds
- [ ] All tests pass (no regressions)
- [ ] Documentation updated
- [ ] 504+ lines of code removed
- [ ] Developer confusion eliminated

---

## 🧪 Testing Strategy

### Automated Tests

```bash
# Run all tests
npm test

# Run settings hook tests specifically
npm test -- --testPathPattern="useSettings"

# Verify coverage hasn't decreased
npm test -- --coverage --collectCoverageFrom="src/hooks/useSettings.ts"
```

### Manual Tests

```bash
# Start dev server
npm run dev

# Test these flows:
1. Settings tab → API key input → ✅ Updates work
2. Model selection → ✅ Updates work
3. Pin/unpin models → ✅ Works
4. Page refresh → ✅ State persists
5. Navigate between tabs → ✅ No errors

# Monitor console for:
- ❌ No import errors
- ❌ No runtime errors
- ❌ No performance issues
```

### Performance Comparison

```typescript
// Add React DevTools Profiler

import { Profiler } from 'react';

<Profiler id="SettingsTab" onRender={(id, phase, duration) => {
  console.log(`${id} (${phase}): ${duration}ms`);
}}>
  <SettingsTab />
</Profiler>

// Before: N/A (using dead code)
// After: Should be <20ms per render
// Result: ✅ No regression
```

---

## 📊 Impact Analysis

### Before

```
Hook files:               3 files (849 lines)
Production usage:         1 hook (useSettings)
Dead code:                2 hooks (504 lines)
Developer confusion:      High ("Which one should I use?")
Maintenance burden:       High (3 files to update)
Test files:              2 files
```

### After

```
Hook files:               1 file (345 lines) ✅
Production usage:         1 hook (useSettings) ✅
Dead code:                0 lines ✅
Developer confusion:      None (only one choice) ✅
Maintenance burden:       Low (1 file to update) ✅
Test files:              1 file ✅
Code reduction:           504 lines removed ✅
```

---

## 🚨 Risks & Mitigation

### Risk 1: Lost Optimization

**Likelihood:** Very Low  
**Impact:** Low  
**Mitigation:** useSettings.ts already has all optimizations

**Evidence:**

```typescript
// useSettings.ts already has:
✅ useMemo for settings (Line 36)
✅ useCallback for all methods (Lines 84-142)
✅ useMemo for return object (Line 152)
✅ Selective subscriptions (Line 61)
✅ Debounced updates (via storage layer)
```

### Risk 2: Someone Depending on Dead Code

**Likelihood:** Very Low  
**Impact:** Medium  
**Mitigation:** TypeScript will catch any broken imports immediately

```bash
# Verification:
npm run typecheck
# If this passes, no one was using the dead code
```

### Risk 3: Future Developer Confusion

**Likelihood:** Low  
**Impact:** Low  
**Mitigation:** Documentation clearly states to use useSettings

---

## 🔗 Related Issues

- **Depends on:** ISSUE-005 (Storage duplication must be fixed first)
- **Enables:** Cleaner codebase, easier onboarding
- **Blocks:** None

---

## 📚 References

- [React Hooks Best Practices](https://react.dev/reference/react)
- [useMemo Performance](https://react.dev/reference/react/useMemo)
- [Dead Code Elimination](https://en.wikipedia.org/wiki/Dead_code_elimination)

---

## 🎁 Prevention Strategy

**To prevent this from happening again:**

**1. Add ESLint Rule:**

```javascript
// eslint-rules/no-duplicate-hooks.js
module.exports = {
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value.match(/use(Optimized|Performant)Settings/)) {
          context.report({
            node,
            message:
              "Do not use duplicate hooks. Use @/hooks/useSettings instead.",
            fix(fixer) {
              return fixer.replaceText(node.source, '"@/hooks/useSettings"');
            },
          });
        }
      },
    };
  },
};
```

**2. Update PR Template:**

```markdown
## Checklist

- [ ] No duplicate implementations created
- [ ] If creating "optimized" version, deleted old one
- [ ] Only ONE version of each hook exists
```

**3. Document Convention:**

```markdown
<!-- docs/CONVENTIONS.md -->

## Hook Naming

- ❌ Don't: `useOptimizedX`, `usePerformantX`, `useImprovedX`
- ✅ Do: `useX` (improvements go IN the hook, not in a new hook)

If you need to optimize a hook:

1. Optimize the existing hook
2. Delete the old version (if you made a copy)
3. Never have 2 versions in production
```

---

**Last Updated:** 2025-10-14  
**Status:** Ready for immediate implementation (after ISSUE-005)  
**Estimated Effort:** 4-6 hours total
