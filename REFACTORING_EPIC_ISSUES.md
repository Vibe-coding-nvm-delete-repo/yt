# Refactoring Epic - GitHub Issues Specification

**Repository**: `Vibe-coding-nvm-delete-repo/yt`  
**Generated**: 2025-10-18  
**Purpose**: Technical debt reduction and performance optimization

---

## 📊 Baseline Audit Results

### Current State (2025-10-18)

| Metric                         | Current              | Target  | Status             |
| ------------------------------ | -------------------- | ------- | ------------------ |
| **TypeScript Errors**          | 49 errors (4 files)  | 0       | ❌ Critical        |
| **Test Coverage - Statements** | 58.74%               | ≥60%    | ❌ Below threshold |
| **Test Coverage - Branches**   | 44.68%               | ≥60%    | ❌ Below threshold |
| **Test Coverage - Functions**  | 51.3%                | ≥60%    | ❌ Below threshold |
| **Test Coverage - Lines**      | 59.67%               | ≥60%    | ❌ Just below      |
| **Lint Warnings**              | 0                    | 0       | ✅ Clean           |
| **Security Vulnerabilities**   | 0                    | 0       | ✅ Clean           |
| **Total Source Files**         | 105 TS/TSX           | -       | -                  |
| **Total LOC**                  | ~20,565 lines        | -       | -                  |
| **Component LOC**              | ~9,007 lines         | -       | -                  |
| **Test Files**                 | 46 test files        | -       | -                  |
| **Test Cases**                 | 393 passing          | -       | ✅ Comprehensive   |
| **Build Status**               | ⚠️ Font fetch errors | Success | ⚠️ Non-blocking    |

### Largest Files (Complexity Risk)

| File                                  | Lines | Issue                               |
| ------------------------------------- | ----- | ----------------------------------- |
| `src/components/SettingsTab.tsx`      | 1,846 | 💥 Exceeds 400 line P0 limit (4.6x) |
| `src/components/PromptCreatorTab.tsx` | 974   | 💥 Exceeds 400 line limit (2.4x)    |
| `src/components/ImageToPromptTab.tsx` | 838   | 💥 Exceeds 400 line limit (2.1x)    |
| `src/lib/storage.ts`                  | 723   | 💥 Exceeds 400 line limit (1.8x)    |
| `src/lib/openrouter.ts`               | 451   | ⚠️ Near limit                       |

### Test Coverage Gaps

| Module              | Coverage        | Critical Gaps        |
| ------------------- | --------------- | -------------------- |
| `usePerformance.ts` | 0%              | 356 lines uncovered  |
| `useResponsive.ts`  | 0%              | 181 lines uncovered  |
| `imageStorage.ts`   | 35.29%          | 139 lines uncovered  |
| `useSettings.ts`    | 49.55%          | 83 lines uncovered   |
| `validation.ts`     | 60.86% branches | Error paths untested |

### CI/CD Status

- **CI Run Time**: ~20-40 seconds (tests only)
- **Build Time**: Network-dependent (font fetches)
- **Continue-on-error**: Overused (7 jobs allow failures)
- **Flaky Tests**: None reported
- **Coverage Enforcement**: Partially disabled

### Pain Points Identified

1. **TypeScript Contract Drift**: Test fixtures don't match updated types
2. **Monolithic Components**: 3 files exceed 800 lines
3. **Coverage Below Threshold**: 4/4 metrics under 60%
4. **Build Warnings**: Font fetch failures in production build
5. **CI Leniency**: Many jobs set to `continue-on-error: true`
6. **Untested Hooks**: Critical performance monitoring uncovered

---

## 🎯 DORA & Performance Targets

| Category            | Metric              | Current       | Target       | Priority |
| ------------------- | ------------------- | ------------- | ------------ | -------- |
| **DORA**            | Lead Time           | Unknown       | ≤2h          | P1       |
| **DORA**            | Deploy Frequency    | Manual        | ≥1/day       | P2       |
| **DORA**            | Change Failure Rate | ~0%           | ≤5%          | ✅ Good  |
| **DORA**            | MTTR                | Unknown       | ≤30m         | P2       |
| **Performance**     | P50 Response        | Not measured  | ≤200ms       | P1       |
| **Performance**     | P95 Response        | Not measured  | ≤500ms       | P1       |
| **CI**              | Wall Clock          | ~40s (tests)  | ≤120s (full) | P2       |
| **CI**              | Flaky Tests         | 0%            | ≤1%          | ✅ Good  |
| **Maintainability** | Function CC         | Unknown       | ≤10          | P1       |
| **Maintainability** | File Size           | Max 1,846 LOC | ≤500 LOC     | P0       |
| **Dependencies**    | CVEs                | 0 critical    | 0 critical   | ✅ Good  |

---

## 🏗️ Epic and Sub-Issues Structure

**Epic**: Refactor to Cut Tech Debt + Boost Velocity/Performance  
**Sub-Issues (12 consolidated)**:

1. **SUB-T1**: Fix TypeScript Contract Drift + Restore Type Safety (Modularity)
2. **SUB-T2**: Refactor Monolithic Components (Modularity)
3. **SUB-T3**: Improve Test Coverage to 60%+ Threshold (CI/Tests)
4. **SUB-T4**: Add Performance Monitoring & Golden Signals (Observability)
5. **SUB-T5**: Reduce CI Continue-on-Error Leniency (CI/Tests)
6. **SUB-T6**: Fix Build Font Fetch Warnings (Performance)
7. **SUB-T7**: Extract Storage Layer to Separate Modules (Modularity)
8. **SUB-T8**: Add Complexity Guards & Enforce P0 Limits (CI/Tests)
9. **SUB-T9**: Document Component Architecture with Mermaid Diagrams (Docs)
10. **SUB-T10**: Add End-to-End Performance Benchmarks (Performance)
11. **SUB-T11**: Create Runbook for Production Monitoring (Observability/Docs)
12. **SUB-T12**: Dependency Upgrade Strategy & Policy (Security/Deps)

**Top 5 by ROI (Debt Interest)**:

1. **SUB-T1** - Unblocks development (49 type errors)
2. **SUB-T2** - Highest maintainability impact (1,846 → ~400 LOC)
3. **SUB-T3** - Unblocks CI enforcement
4. **SUB-T5** - Hardens CI reliability
5. **SUB-T4** - Enables data-driven optimization

---

## 📝 Labels Set

```json
[
  "refactor",
  "tech-debt",
  "performance",
  "modularity",
  "ci",
  "observability",
  "security",
  "docs"
]
```

---

## 🎫 EPIC ISSUE

### Title

```
Epic: Refactor to Cut Tech Debt + Boost Velocity/Performance
```

### Body

```markdown
## 🎯 Mode & Approach

**Mode**: Incremental, measurable, issues-only execution  
**Repository**: `Vibe-coding-nvm-delete-repo/yt`  
**Public Contracts**: All preserved; versioned if breaking changes required  
**Execution**: Create GitHub Issues ONLY; no code changes in this epic

---

## 📊 Goals & Targets

### DORA Metrics

- **Lead Time**: ≤2h (PR open → merge)
- **Deploy Frequency**: ≥1/day (automated via CI/CD)
- **Change Failure Rate**: ≤5%
- **MTTR**: ≤30 minutes

### Performance Targets (Critical Paths)

- **P50 Latency**: ≤200ms (image-to-prompt generation)
- **P95 Latency**: ≤500ms
- **Error Rate**: ≤1%

### CI/CD Targets

- **Total Wall Clock**: ≤120 seconds (lint + typecheck + tests + build)
- **Flaky Tests**: ≤1%
- **Coverage**: ≥60% (all metrics: statements, branches, functions, lines)

### Maintainability

- **Function Cyclomatic Complexity**: ≤10
- **File Size**: ≤500 LOC (strict P0 enforcement)
- **No Critical Lints**: Zero warnings on `npm run lint -- --max-warnings=0`

### Dependencies

- **No Critical/High CVEs**: 0 vulnerabilities
- **Key Libraries**: ≤1 minor version behind latest

---

## 📈 Baseline (Quick Audit - 2025-10-18)

| Metric                | Current      | Target       | Gap                      |
| --------------------- | ------------ | ------------ | ------------------------ |
| TypeScript Errors     | 49 errors    | 0            | -49 ❌                   |
| Coverage (Statements) | 58.74%       | 60%          | -1.26% ❌                |
| Coverage (Branches)   | 44.68%       | 60%          | -15.32% ❌               |
| Coverage (Functions)  | 51.3%        | 60%          | -8.7% ❌                 |
| Coverage (Lines)      | 59.67%       | 60%          | -0.33% ❌                |
| Largest File          | 1,846 LOC    | 500 LOC      | +1,346 ❌                |
| CI Wall Clock         | ~40s (tests) | ≤120s (full) | ⚠️ Need full measurement |
| Security CVEs         | 0            | 0            | ✅ Good                  |
| Flaky Tests           | 0            | 0            | ✅ Good                  |

### Top 5 Pain Points

1. **TypeScript Contract Drift**: 49 errors blocking type safety
2. **Monolithic Components**: 3 files exceed 800 lines (2-4.6x over limit)
3. **Test Coverage Gap**: All 4 metrics below 60% threshold
4. **Uncovered Hooks**: `usePerformance` (363 LOC) and `useResponsive` (181 LOC) at 0%
5. **CI Leniency**: 7 jobs allow failures with `continue-on-error`

---

## 🗂️ Workstreams & Sub-Issues

### Category: Modularity (3 issues)

- [ ] #T1: Fix TypeScript Contract Drift + Restore Type Safety
- [ ] #T2: Refactor Monolithic Components (SettingsTab, PromptCreatorTab, ImageToPromptTab)
- [ ] #T7: Extract Storage Layer to Separate Modules

### Category: CI/CD & Tests (3 issues)

- [ ] #T3: Improve Test Coverage to 60%+ Threshold
- [ ] #T5: Reduce CI Continue-on-Error Leniency
- [ ] #T8: Add Complexity Guards & Enforce P0 Limits

### Category: Performance (2 issues)

- [ ] #T6: Fix Build Font Fetch Warnings
- [ ] #T10: Add End-to-End Performance Benchmarks

### Category: Observability (2 issues)

- [ ] #T4: Add Performance Monitoring & Golden Signals
- [ ] #T11: Create Runbook for Production Monitoring

### Category: Docs (1 issue)

- [ ] #T9: Document Component Architecture with Mermaid Diagrams

### Category: Security/Deps (1 issue)

- [ ] #T12: Dependency Upgrade Strategy & Policy

---

## 🔝 Prioritized Order (Top 5 by ROI)

1. **#T1** - TypeScript Contract Drift (unblocks development, prevents bugs)
2. **#T2** - Monolithic Components (highest maintainability debt)
3. **#T3** - Test Coverage Gap (enables CI enforcement)
4. **#T5** - CI Leniency (hardens reliability)
5. **#T4** - Performance Monitoring (enables data-driven optimization)

---

## ✅ Exit Criteria

All sub-issues completed AND:

- ✅ All targets met (TypeScript errors = 0, Coverage ≥60%, files ≤500 LOC)
- ✅ CI fully enforced (no `continue-on-error` on critical jobs)
- ✅ Performance monitoring in place (golden signals instrumented)
- ✅ Documentation complete (architecture diagrams, runbook, ADRs)
- ✅ No regressions (all 393+ tests passing)
- ✅ Ownership assigned (CODEOWNERS updated if needed)

---

## 🔍 Search Filter

To view all related issues:
```

is:issue is:open label:refactor label:tech-debt repo:Vibe-coding-nvm-delete-repo/yt

```

Or by category:
- Performance: `label:performance`
- Modularity: `label:modularity`
- CI/Tests: `label:ci`
- Observability: `label:observability`
- Security: `label:security`
- Docs: `label:docs`

---

## 📚 References

- **Engineering Standards**: `docs/ENGINEERING_STANDARDS.md`
- **P0 Enforcement**: `docs/P0_ENFORCEMENT_SYSTEM.md`
- **PQA Policy**: `docs/PQA_POLICY.md`
- **Existing Issues**: `issues/` directory
```

### GitHub REST API Payload

````json
{
  "title": "Epic: Refactor to Cut Tech Debt + Boost Velocity/Performance",
  "body": "## 🎯 Mode & Approach\n\n**Mode**: Incremental, measurable, issues-only execution  \n**Repository**: `Vibe-coding-nvm-delete-repo/yt`  \n**Public Contracts**: All preserved; versioned if breaking changes required  \n**Execution**: Create GitHub Issues ONLY; no code changes in this epic\n\n---\n\n## 📊 Goals & Targets\n\n### DORA Metrics\n- **Lead Time**: ≤2h (PR open → merge)\n- **Deploy Frequency**: ≥1/day (automated via CI/CD)\n- **Change Failure Rate**: ≤5%\n- **MTTR**: ≤30 minutes\n\n### Performance Targets (Critical Paths)\n- **P50 Latency**: ≤200ms (image-to-prompt generation)\n- **P95 Latency**: ≤500ms\n- **Error Rate**: ≤1%\n\n### CI/CD Targets\n- **Total Wall Clock**: ≤120 seconds (lint + typecheck + tests + build)\n- **Flaky Tests**: ≤1%\n- **Coverage**: ≥60% (all metrics: statements, branches, functions, lines)\n\n### Maintainability\n- **Function Cyclomatic Complexity**: ≤10\n- **File Size**: ≤500 LOC (strict P0 enforcement)\n- **No Critical Lints**: Zero warnings on `npm run lint -- --max-warnings=0`\n\n### Dependencies\n- **No Critical/High CVEs**: 0 vulnerabilities\n- **Key Libraries**: ≤1 minor version behind latest\n\n---\n\n## 📈 Baseline (Quick Audit - 2025-10-18)\n\n| Metric | Current | Target | Gap |\n|--------|---------|--------|-----|\n| TypeScript Errors | 49 errors | 0 | -49 ❌ |\n| Coverage (Statements) | 58.74% | 60% | -1.26% ❌ |\n| Coverage (Branches) | 44.68% | 60% | -15.32% ❌ |\n| Coverage (Functions) | 51.3% | 60% | -8.7% ❌ |\n| Coverage (Lines) | 59.67% | 60% | -0.33% ❌ |\n| Largest File | 1,846 LOC | 500 LOC | +1,346 ❌ |\n| CI Wall Clock | ~40s (tests) | ≤120s (full) | ⚠️ Need full measurement |\n| Security CVEs | 0 | 0 | ✅ Good |\n| Flaky Tests | 0 | 0 | ✅ Good |\n\n### Top 5 Pain Points\n1. **TypeScript Contract Drift**: 49 errors blocking type safety\n2. **Monolithic Components**: 3 files exceed 800 lines (2-4.6x over limit)\n3. **Test Coverage Gap**: All 4 metrics below 60% threshold\n4. **Uncovered Hooks**: `usePerformance` (363 LOC) and `useResponsive` (181 LOC) at 0%\n5. **CI Leniency**: 7 jobs allow failures with `continue-on-error`\n\n---\n\n## 🗂️ Workstreams & Sub-Issues\n\n### Category: Modularity (3 issues)\n- [ ] #T1: Fix TypeScript Contract Drift + Restore Type Safety\n- [ ] #T2: Refactor Monolithic Components (SettingsTab, PromptCreatorTab, ImageToPromptTab)\n- [ ] #T7: Extract Storage Layer to Separate Modules\n\n### Category: CI/CD & Tests (3 issues)\n- [ ] #T3: Improve Test Coverage to 60%+ Threshold\n- [ ] #T5: Reduce CI Continue-on-Error Leniency\n- [ ] #T8: Add Complexity Guards & Enforce P0 Limits\n\n### Category: Performance (2 issues)\n- [ ] #T6: Fix Build Font Fetch Warnings\n- [ ] #T10: Add End-to-End Performance Benchmarks\n\n### Category: Observability (2 issues)\n- [ ] #T4: Add Performance Monitoring & Golden Signals\n- [ ] #T11: Create Runbook for Production Monitoring\n\n### Category: Docs (1 issue)\n- [ ] #T9: Document Component Architecture with Mermaid Diagrams\n\n### Category: Security/Deps (1 issue)\n- [ ] #T12: Dependency Upgrade Strategy & Policy\n\n---\n\n## 🔝 Prioritized Order (Top 5 by ROI)\n\n1. **#T1** - TypeScript Contract Drift (unblocks development, prevents bugs)\n2. **#T2** - Monolithic Components (highest maintainability debt)\n3. **#T3** - Test Coverage Gap (enables CI enforcement)\n4. **#T5** - CI Leniency (hardens reliability)\n5. **#T4** - Performance Monitoring (enables data-driven optimization)\n\n---\n\n## ✅ Exit Criteria\n\nAll sub-issues completed AND:\n\n- ✅ All targets met (TypeScript errors = 0, Coverage ≥60%, files ≤500 LOC)\n- ✅ CI fully enforced (no `continue-on-error` on critical jobs)\n- ✅ Performance monitoring in place (golden signals instrumented)\n- ✅ Documentation complete (architecture diagrams, runbook, ADRs)\n- ✅ No regressions (all 393+ tests passing)\n- ✅ Ownership assigned (CODEOWNERS updated if needed)\n\n---\n\n## 🔍 Search Filter\n\nTo view all related issues:\n\n```\nis:issue is:open label:refactor label:tech-debt repo:Vibe-coding-nvm-delete-repo/yt\n```\n\nOr by category:\n- Performance: `label:performance`\n- Modularity: `label:modularity`\n- CI/Tests: `label:ci`\n- Observability: `label:observability`\n- Security: `label:security`\n- Docs: `label:docs`\n\n---\n\n## 📚 References\n\n- **Engineering Standards**: `docs/ENGINEERING_STANDARDS.md`\n- **P0 Enforcement**: `docs/P0_ENFORCEMENT_SYSTEM.md`\n- **PQA Policy**: `docs/PQA_POLICY.md`\n- **Existing Issues**: `issues/` directory",
  "labels": ["refactor", "tech-debt"],
  "assignees": [],
  "milestone": null
}
````

---

## 🎫 SUB-ISSUE #T1: Fix TypeScript Contract Drift + Restore Type Safety

### Title

```
SUB: Fix TypeScript Contract Drift + Restore Type Safety (Category: Modularity)
```

### Body

````markdown
## Why (quantified)

**Current State**:

- **49 TypeScript errors** across 4 test files
- Files affected:
  - `src/lib/__tests__/batchQueue.test.ts` (1 error)
  - `src/lib/__tests__/bestPracticesStorage.test.ts` (34 errors)
  - `src/lib/__tests__/historyStorage.test.ts` (9 errors)
  - `src/lib/__tests__/storage.additional.test.ts` (5 errors)
- **Root Cause**: Type definitions updated but test fixtures not synchronized
- **Impact**: Type safety compromised, false sense of test coverage

**Specific Issues**:

1. `BestPracticeCategory` enum mismatch (string literals vs enum values)
2. Missing properties in `ModelResult` type (test fixtures incomplete)
3. `HistoryEntry` using deprecated `timestamp` field
4. `QueueOptions` interface changed (removed `delayMs`)

**Baseline**:

- `npm run typecheck` → **49 errors** (exit code 2)
- Blocks: Production type safety, IDE autocomplete accuracy

---

## Plan (small, reversible)

- [ ] **Step 1**: Update `BestPracticeCategory` test fixtures to use enum values
  - File: `src/lib/__tests__/bestPracticesStorage.test.ts`
  - Replace string literals `"prompt-engineering"` → `BestPracticeCategory.PromptEngineering` (etc.)
  - Estimated: 34 fixes
- [ ] **Step 2**: Fix `ModelResult` type in test fixtures
  - File: `src/lib/__tests__/storage.additional.test.ts`
  - Add missing required properties: `inputTokens`, `outputTokens`, `inputCost`, `outputCost`
  - Remove deprecated `isLoading` property
  - Estimated: 5 fixes

- [ ] **Step 3**: Replace `timestamp` with correct `HistoryEntry` fields
  - File: `src/lib/__tests__/historyStorage.test.ts`
  - Use `createdAt` instead of `timestamp`
  - Add all required fields per `HistoryEntry` type
  - Estimated: 9 fixes

- [ ] **Step 4**: Fix `QueueOptions` in batchQueue test
  - File: `src/lib/__tests__/batchQueue.test.ts`
  - Remove `delayMs` property or update to correct option name
  - Estimated: 1 fix

- [ ] **Step 5**: Run full typecheck and verify zero errors
  - Command: `npm run typecheck`
  - Expected: Exit code 0, no errors

- [ ] **Step 6**: Run tests to ensure no behavioral regressions
  - Command: `npm test -- --runInBand`
  - Expected: All 393+ tests pass

---

## Acceptance

### Type Safety

- ✅ `npm run typecheck` → **0 errors**
- ✅ All 4 affected test files pass TypeScript validation
- ✅ No `@ts-ignore` or `@ts-expect-error` workarounds added

### Tests

- ✅ All existing tests pass (393+ tests)
- ✅ No behavioral changes in test coverage
- ✅ Test fixtures accurately represent production types

### Maintainability

- ✅ No new complexity introduced (CC ≤10)
- ✅ Type definitions and tests remain in sync
- ✅ Type-driven development restored

### Contracts

- ✅ Public API types unchanged
- ✅ Internal type contracts enforced by TypeScript compiler

---

## Evidence

**Before**:

```bash
$ npm run typecheck
Found 49 errors in 4 files.
```
````

**After**:

```bash
$ npm run typecheck
# (Attach screenshot/output showing 0 errors)
```

**Test Results**:

```bash
$ npm test -- --runInBand
# (Attach output showing all tests pass)
```

---

## Docs Updated

- [ ] **README**: N/A (internal refactor)
- [ ] **Code Map**: Update type relationship diagram if exists
- [ ] **Runbook**: N/A
- [ ] **ADR**: N/A (fixing existing contracts, no new decisions)

---

## Related

- **Parent Epic**: #EPIC (link after creation)
- **Existing Issue**: Similar to patterns in `issues/ISSUE-002-lint-errors.md`
- **Priority**: P0 (blocks development)

````

### GitHub REST API Payload

```json
{
  "title": "SUB: Fix TypeScript Contract Drift + Restore Type Safety (Category: Modularity)",
  "body": "## Why (quantified)\n\n**Current State**:\n- **49 TypeScript errors** across 4 test files\n- Files affected:\n  - `src/lib/__tests__/batchQueue.test.ts` (1 error)\n  - `src/lib/__tests__/bestPracticesStorage.test.ts` (34 errors)\n  - `src/lib/__tests__/historyStorage.test.ts` (9 errors)\n  - `src/lib/__tests__/storage.additional.test.ts` (5 errors)\n- **Root Cause**: Type definitions updated but test fixtures not synchronized\n- **Impact**: Type safety compromised, false sense of test coverage\n\n**Specific Issues**:\n1. `BestPracticeCategory` enum mismatch (string literals vs enum values)\n2. Missing properties in `ModelResult` type (test fixtures incomplete)\n3. `HistoryEntry` using deprecated `timestamp` field\n4. `QueueOptions` interface changed (removed `delayMs`)\n\n**Baseline**:\n- `npm run typecheck` → **49 errors** (exit code 2)\n- Blocks: Production type safety, IDE autocomplete accuracy\n\n---\n\n## Plan (small, reversible)\n\n- [ ] **Step 1**: Update `BestPracticeCategory` test fixtures to use enum values\n  - File: `src/lib/__tests__/bestPracticesStorage.test.ts`\n  - Replace string literals `\"prompt-engineering\"` → `BestPracticeCategory.PromptEngineering` (etc.)\n  - Estimated: 34 fixes\n  \n- [ ] **Step 2**: Fix `ModelResult` type in test fixtures\n  - File: `src/lib/__tests__/storage.additional.test.ts`\n  - Add missing required properties: `inputTokens`, `outputTokens`, `inputCost`, `outputCost`\n  - Remove deprecated `isLoading` property\n  - Estimated: 5 fixes\n\n- [ ] **Step 3**: Replace `timestamp` with correct `HistoryEntry` fields\n  - File: `src/lib/__tests__/historyStorage.test.ts`\n  - Use `createdAt` instead of `timestamp`\n  - Add all required fields per `HistoryEntry` type\n  - Estimated: 9 fixes\n\n- [ ] **Step 4**: Fix `QueueOptions` in batchQueue test\n  - File: `src/lib/__tests__/batchQueue.test.ts`\n  - Remove `delayMs` property or update to correct option name\n  - Estimated: 1 fix\n\n- [ ] **Step 5**: Run full typecheck and verify zero errors\n  - Command: `npm run typecheck`\n  - Expected: Exit code 0, no errors\n\n- [ ] **Step 6**: Run tests to ensure no behavioral regressions\n  - Command: `npm test -- --runInBand`\n  - Expected: All 393+ tests pass\n\n---\n\n## Acceptance\n\n### Type Safety\n- ✅ `npm run typecheck` → **0 errors**\n- ✅ All 4 affected test files pass TypeScript validation\n- ✅ No `@ts-ignore` or `@ts-expect-error` workarounds added\n\n### Tests\n- ✅ All existing tests pass (393+ tests)\n- ✅ No behavioral changes in test coverage\n- ✅ Test fixtures accurately represent production types\n\n### Maintainability\n- ✅ No new complexity introduced (CC ≤10)\n- ✅ Type definitions and tests remain in sync\n- ✅ Type-driven development restored\n\n### Contracts\n- ✅ Public API types unchanged\n- ✅ Internal type contracts enforced by TypeScript compiler\n\n---\n\n## Evidence\n\n**Before**: \n```bash\n$ npm run typecheck\nFound 49 errors in 4 files.\n```\n\n**After**: \n```bash\n$ npm run typecheck\n# (Attach screenshot/output showing 0 errors)\n```\n\n**Test Results**:\n```bash\n$ npm test -- --runInBand\n# (Attach output showing all tests pass)\n```\n\n---\n\n## Docs Updated\n\n- [ ] **README**: N/A (internal refactor)\n- [ ] **Code Map**: Update type relationship diagram if exists\n- [ ] **Runbook**: N/A\n- [ ] **ADR**: N/A (fixing existing contracts, no new decisions)\n\n---\n\n## Related\n\n- **Parent Epic**: #EPIC (link after creation)\n- **Existing Issue**: Similar to patterns in `issues/ISSUE-002-lint-errors.md`\n- **Priority**: P0 (blocks development)",
  "labels": ["refactor", "tech-debt", "modularity"],
  "assignees": [],
  "milestone": null
}
````

---

## 🎫 SUB-ISSUE #T2: Refactor Monolithic Components

### Title

```
SUB: Refactor Monolithic Components (SettingsTab, PromptCreatorTab, ImageToPromptTab) (Category: Modularity)
```

### Body

````markdown
## Why (quantified)

**Current State**:

- **3 components exceed P0 file size limit (400 LOC)**:
  - `src/components/SettingsTab.tsx`: **1,846 lines** (4.6x over limit)
  - `src/components/PromptCreatorTab.tsx`: **974 lines** (2.4x over limit)
  - `src/components/ImageToPromptTab.tsx`: **838 lines** (2.1x over limit)
- **Total monolithic LOC**: 3,658 lines (40% of component codebase)

**Pain Points**:

- Difficult to reason about component state and logic
- High cognitive load for contributors
- Violates P0 enforcement system (`custom/max-file-size` rule)
- Increased merge conflict risk
- Slower IDE performance (autocomplete, type-checking)

**Baseline**:

- `npm run lint` currently passes (but P0 enforcement not active for existing files)
- Manual review shows multiple responsibilities per component

---

## Plan (small, reversible)

### Phase 1: SettingsTab.tsx (1,846 → ~400 LOC)

- [ ] **Step 1.1**: Extract sub-tab components
  - Create: `components/settings/ApiKeysTab.tsx` (~300 LOC)
  - Create: `components/settings/ModelSelectionTab.tsx` (~350 LOC)
  - Create: `components/settings/CustomPromptsTab.tsx` (~250 LOC)
  - Create: `components/settings/PromptCreatorConfigTab.tsx` (~300 LOC)
  - Create: `components/settings/CategoriesTab.tsx` (~200 LOC)

- [ ] **Step 1.2**: Extract shared utilities
  - Create: `components/settings/utils/formatters.ts` (formatTimestamp, formatPrice)
  - Create: `components/settings/utils/validators.ts` (API key validation)
  - Create: `components/settings/types.ts` (SettingsSubTab, PromptCreatorFieldForm)

- [ ] **Step 1.3**: Refactor main SettingsTab to orchestrator
  - Keep: Sub-tab routing logic only
  - Final target: ~300-400 LOC

### Phase 2: PromptCreatorTab.tsx (974 → ~400 LOC)

- [ ] **Step 2.1**: Extract form sections
  - Create: `components/promptCreator/FieldsEditor.tsx` (~200 LOC)
  - Create: `components/promptCreator/GenerationControls.tsx` (~150 LOC)
  - Create: `components/promptCreator/ResultsDisplay.tsx` (~200 LOC)

- [ ] **Step 2.2**: Extract business logic hooks
  - Create: `hooks/usePromptGeneration.ts` (~150 LOC)
  - Create: `hooks/usePromptRating.ts` (~100 LOC)

- [ ] **Step 2.3**: Refactor main component
  - Final target: ~350-400 LOC

### Phase 3: ImageToPromptTab.tsx (838 → ~400 LOC)

- [ ] **Step 3.1**: Extract feature sections
  - Create: `components/imageToPrompt/ImageUploader.tsx` (~150 LOC)
  - Create: `components/imageToPrompt/ModelSelector.tsx` (~120 LOC)
  - Create: `components/imageToPrompt/ResultsPanel.tsx` (~180 LOC)
  - Create: `components/imageToPrompt/BatchProcessor.tsx` (~150 LOC)

- [ ] **Step 3.2**: Extract business logic
  - Create: `hooks/useImageGeneration.ts` (~120 LOC)

- [ ] **Step 3.3**: Refactor main component
  - Final target: ~350-400 LOC

---

## Acceptance

### File Size

- ✅ All 3 components ≤500 LOC (target: 300-400 LOC)
- ✅ No extracted module >400 LOC
- ✅ P0 `custom/max-file-size` rule passes

### Maintainability

- ✅ Each extracted module has single responsibility
- ✅ Function CC ≤10 maintained
- ✅ Improved code navigation (IDE perf improvement measurable)

### Tests

- ✅ All existing tests pass (393+ tests)
- ✅ No behavioral changes to component API
- ✅ Coverage maintained or improved (≥60%)

### Contracts

- ✅ Component props interfaces unchanged (public API stable)
- ✅ Internal refactor only (no external impact)

---

## Evidence

**Before**:

```bash
$ wc -l src/components/*.tsx | grep -E "SettingsTab|PromptCreatorTab|ImageToPromptTab"
1846 SettingsTab.tsx
974 PromptCreatorTab.tsx
838 ImageToPromptTab.tsx
```
````

**After**:

```bash
# (Attach output showing all files ≤500 LOC)
# (Attach tree view of new component structure)
```

**P0 Lint Check**:

```bash
$ npm run lint -- src/components/SettingsTab.tsx --rule custom/max-file-size
# (Attach passing output)
```

---

## Docs Updated

- [ ] **README**: Update project structure section
- [x] **Code Map**: Create Mermaid diagram showing component hierarchy
- [ ] **Runbook**: N/A
- [x] **ADR**: Document extraction strategy (composition over inheritance)

---

## Related

- **Parent Epic**: #EPIC
- **Existing Issue**: `issues/ISSUE-004-massive-files.md`
- **Depends On**: #T1 (TypeScript errors must be fixed first)
- **Priority**: P0 (highest maintainability debt)

````

### GitHub REST API Payload

```json
{
  "title": "SUB: Refactor Monolithic Components (SettingsTab, PromptCreatorTab, ImageToPromptTab) (Category: Modularity)",
  "body": "## Why (quantified)\n\n**Current State**:\n- **3 components exceed P0 file size limit (400 LOC)**:\n  - `src/components/SettingsTab.tsx`: **1,846 lines** (4.6x over limit)\n  - `src/components/PromptCreatorTab.tsx`: **974 lines** (2.4x over limit)\n  - `src/components/ImageToPromptTab.tsx`: **838 lines** (2.1x over limit)\n- **Total monolithic LOC**: 3,658 lines (40% of component codebase)\n\n**Pain Points**:\n- Difficult to reason about component state and logic\n- High cognitive load for contributors\n- Violates P0 enforcement system (`custom/max-file-size` rule)\n- Increased merge conflict risk\n- Slower IDE performance (autocomplete, type-checking)\n\n**Baseline**:\n- `npm run lint` currently passes (but P0 enforcement not active for existing files)\n- Manual review shows multiple responsibilities per component\n\n---\n\n## Plan (small, reversible)\n\n### Phase 1: SettingsTab.tsx (1,846 → ~400 LOC)\n\n- [ ] **Step 1.1**: Extract sub-tab components\n  - Create: `components/settings/ApiKeysTab.tsx` (~300 LOC)\n  - Create: `components/settings/ModelSelectionTab.tsx` (~350 LOC)\n  - Create: `components/settings/CustomPromptsTab.tsx` (~250 LOC)\n  - Create: `components/settings/PromptCreatorConfigTab.tsx` (~300 LOC)\n  - Create: `components/settings/CategoriesTab.tsx` (~200 LOC)\n\n- [ ] **Step 1.2**: Extract shared utilities\n  - Create: `components/settings/utils/formatters.ts` (formatTimestamp, formatPrice)\n  - Create: `components/settings/utils/validators.ts` (API key validation)\n  - Create: `components/settings/types.ts` (SettingsSubTab, PromptCreatorFieldForm)\n\n- [ ] **Step 1.3**: Refactor main SettingsTab to orchestrator\n  - Keep: Sub-tab routing logic only\n  - Final target: ~300-400 LOC\n\n### Phase 2: PromptCreatorTab.tsx (974 → ~400 LOC)\n\n- [ ] **Step 2.1**: Extract form sections\n  - Create: `components/promptCreator/FieldsEditor.tsx` (~200 LOC)\n  - Create: `components/promptCreator/GenerationControls.tsx` (~150 LOC)\n  - Create: `components/promptCreator/ResultsDisplay.tsx` (~200 LOC)\n\n- [ ] **Step 2.2**: Extract business logic hooks\n  - Create: `hooks/usePromptGeneration.ts` (~150 LOC)\n  - Create: `hooks/usePromptRating.ts` (~100 LOC)\n\n- [ ] **Step 2.3**: Refactor main component\n  - Final target: ~350-400 LOC\n\n### Phase 3: ImageToPromptTab.tsx (838 → ~400 LOC)\n\n- [ ] **Step 3.1**: Extract feature sections\n  - Create: `components/imageToPrompt/ImageUploader.tsx` (~150 LOC)\n  - Create: `components/imageToPrompt/ModelSelector.tsx` (~120 LOC)\n  - Create: `components/imageToPrompt/ResultsPanel.tsx` (~180 LOC)\n  - Create: `components/imageToPrompt/BatchProcessor.tsx` (~150 LOC)\n\n- [ ] **Step 3.2**: Extract business logic\n  - Create: `hooks/useImageGeneration.ts` (~120 LOC)\n\n- [ ] **Step 3.3**: Refactor main component\n  - Final target: ~350-400 LOC\n\n---\n\n## Acceptance\n\n### File Size\n- ✅ All 3 components ≤500 LOC (target: 300-400 LOC)\n- ✅ No extracted module >400 LOC\n- ✅ P0 `custom/max-file-size` rule passes\n\n### Maintainability\n- ✅ Each extracted module has single responsibility\n- ✅ Function CC ≤10 maintained\n- ✅ Improved code navigation (IDE perf improvement measurable)\n\n### Tests\n- ✅ All existing tests pass (393+ tests)\n- ✅ No behavioral changes to component API\n- ✅ Coverage maintained or improved (≥60%)\n\n### Contracts\n- ✅ Component props interfaces unchanged (public API stable)\n- ✅ Internal refactor only (no external impact)\n\n---\n\n## Evidence\n\n**Before**:\n```bash\n$ wc -l src/components/*.tsx | grep -E \"SettingsTab|PromptCreatorTab|ImageToPromptTab\"\n1846 SettingsTab.tsx\n974 PromptCreatorTab.tsx\n838 ImageToPromptTab.tsx\n```\n\n**After**:\n```bash\n# (Attach output showing all files ≤500 LOC)\n# (Attach tree view of new component structure)\n```\n\n**P0 Lint Check**:\n```bash\n$ npm run lint -- src/components/SettingsTab.tsx --rule custom/max-file-size\n# (Attach passing output)\n```\n\n---\n\n## Docs Updated\n\n- [ ] **README**: Update project structure section\n- [x] **Code Map**: Create Mermaid diagram showing component hierarchy\n- [ ] **Runbook**: N/A\n- [x] **ADR**: Document extraction strategy (composition over inheritance)\n\n---\n\n## Related\n\n- **Parent Epic**: #EPIC\n- **Existing Issue**: `issues/ISSUE-004-massive-files.md`\n- **Depends On**: #T1 (TypeScript errors must be fixed first)\n- **Priority**: P0 (highest maintainability debt)",
  "labels": ["refactor", "tech-debt", "modularity"],
  "assignees": [],
  "milestone": null
}
````

---

## 🎫 SUB-ISSUE #T3: Improve Test Coverage to 60%+ Threshold

### Title

```
SUB: Improve Test Coverage to 60%+ Threshold (Category: CI/Tests)
```

### Body

````markdown
## Why (quantified)

**Current State**:

- **4/4 coverage metrics below 60% threshold**:
  - Statements: **58.74%** (target: 60%, gap: -1.26%)
  - Branches: **44.68%** (target: 60%, gap: -15.32%)
  - Functions: **51.3%** (target: 60%, gap: -8.7%)
  - Lines: **59.67%** (target: 60%, gap: -0.33%)

**Critical Uncovered Modules**:
| Module | Coverage | Uncovered Lines | Priority |
|--------|----------|-----------------|----------|
| `usePerformance.ts` | 0% | 363 lines | P0 (critical hook) |
| `useResponsive.ts` | 0% | 181 lines | P1 |
| `imageStorage.ts` | 35.29% | ~139 lines | P1 |
| `useSettings.ts` | 49.55% | ~83 lines | P2 |
| `validation.ts` | 60.86% branches | Error paths | P2 |

**Impact**:

- CI coverage enforcement disabled (`continue-on-error: true`)
- False confidence in code changes
- Regressions not caught until production

---

## Plan (small, reversible)

### Phase 1: Low-Hanging Fruit (Statements & Lines)

- [ ] **Step 1.1**: Add tests for `usePerformance.ts` (0% → 60%+)
  - Test: Performance metric recording
  - Test: Metric retrieval and aggregation
  - Test: Memory tracking
  - Test: Export functionality
  - Target: +218 covered lines

- [ ] **Step 1.2**: Add tests for `useResponsive.ts` (0% → 60%+)
  - Test: Breakpoint detection
  - Test: Window resize handling
  - Test: Mobile/desktop detection
  - Target: +109 covered lines

### Phase 2: Critical Business Logic

- [ ] **Step 2.1**: Improve `imageStorage.ts` (35% → 60%+)
  - Test: Error handling paths (current gap)
  - Test: Edge cases in saveImage/loadImage
  - Test: Cross-tab sync scenarios
  - Target: +84 covered lines

- [ ] **Step 2.2**: Improve `useSettings.ts` (49% → 60%+)
  - Test: Setting update edge cases
  - Test: API key validation flows
  - Test: Model selection logic
  - Target: +50 covered lines

### Phase 3: Branch Coverage

- [ ] **Step 3.1**: Add error path tests for `validation.ts`
  - Test: Invalid input handling
  - Test: Boundary conditions
  - Test: Type coercion edge cases
  - Target: +15% branch coverage

- [ ] **Step 3.2**: Add conditional path tests for `retry.ts`
  - Test: Retry exhaustion
  - Test: Exponential backoff edge cases
  - Target: +10% branch coverage

### Phase 4: Verification

- [ ] **Step 4.1**: Run coverage check
  - Command: `npm test -- --coverage --runInBand`
  - Verify: All 4 metrics ≥60%

- [ ] **Step 4.2**: Enable CI enforcement
  - Remove `continue-on-error: true` from coverage job
  - Verify: CI blocks PRs with coverage drops

---

## Acceptance

### Coverage Thresholds

- ✅ Statements: **≥60%** (currently 58.74%)
- ✅ Branches: **≥60%** (currently 44.68%)
- ✅ Functions: **≥60%** (currently 51.3%)
- ✅ Lines: **≥60%** (currently 59.67%)

### CI Enforcement

- ✅ `continue-on-error` removed from coverage threshold job
- ✅ CI fails on coverage drop below 60%
- ✅ No regressions in existing test suite (393+ tests pass)

### Test Quality

- ✅ New tests follow existing patterns (Jest + RTL)
- ✅ Tests cover edge cases and error paths
- ✅ No flaky tests introduced (CI runs 3x stable)

### Contracts

- ✅ No changes to public APIs
- ✅ Tests validate documented behavior

---

## Evidence

**Before**:

```bash
$ npm test -- --coverage --runInBand
Jest: "global" coverage threshold for statements (60%) not met: 58.74%
Jest: "global" coverage threshold for branches (60%) not met: 44.68%
Jest: "global" coverage threshold for functions (60%) not met: 51.3%
Jest: "global" coverage threshold for lines (60%) not met: 59.67%
```
````

**After**:

```bash
# (Attach coverage report showing all metrics ≥60%)
# (Attach CI status showing coverage enforcement enabled)
```

---

## Docs Updated

- [ ] **README**: N/A (internal testing)
- [ ] **Code Map**: N/A
- [ ] **Runbook**: Update with coverage monitoring guide
- [ ] **ADR**: N/A (testing best practices already documented)

---

## Related

- **Parent Epic**: #EPIC
- **Existing Issue**: `issues/ISSUE-003-test-coverage.md`
- **Blocks**: #T5 (CI leniency removal)
- **Priority**: P1 (unblocks CI enforcement)

````

### GitHub REST API Payload

```json
{
  "title": "SUB: Improve Test Coverage to 60%+ Threshold (Category: CI/Tests)",
  "body": "## Why (quantified)\n\n**Current State**:\n- **4/4 coverage metrics below 60% threshold**:\n  - Statements: **58.74%** (target: 60%, gap: -1.26%)\n  - Branches: **44.68%** (target: 60%, gap: -15.32%)\n  - Functions: **51.3%** (target: 60%, gap: -8.7%)\n  - Lines: **59.67%** (target: 60%, gap: -0.33%)\n\n**Critical Uncovered Modules**:\n| Module | Coverage | Uncovered Lines | Priority |\n|--------|----------|-----------------|----------|\n| `usePerformance.ts` | 0% | 363 lines | P0 (critical hook) |\n| `useResponsive.ts` | 0% | 181 lines | P1 |\n| `imageStorage.ts` | 35.29% | ~139 lines | P1 |\n| `useSettings.ts` | 49.55% | ~83 lines | P2 |\n| `validation.ts` | 60.86% branches | Error paths | P2 |\n\n**Impact**:\n- CI coverage enforcement disabled (`continue-on-error: true`)\n- False confidence in code changes\n- Regressions not caught until production\n\n---\n\n## Plan (small, reversible)\n\n### Phase 1: Low-Hanging Fruit (Statements & Lines)\n\n- [ ] **Step 1.1**: Add tests for `usePerformance.ts` (0% → 60%+)\n  - Test: Performance metric recording\n  - Test: Metric retrieval and aggregation\n  - Test: Memory tracking\n  - Test: Export functionality\n  - Target: +218 covered lines\n\n- [ ] **Step 1.2**: Add tests for `useResponsive.ts` (0% → 60%+)\n  - Test: Breakpoint detection\n  - Test: Window resize handling\n  - Test: Mobile/desktop detection\n  - Target: +109 covered lines\n\n### Phase 2: Critical Business Logic\n\n- [ ] **Step 2.1**: Improve `imageStorage.ts` (35% → 60%+)\n  - Test: Error handling paths (current gap)\n  - Test: Edge cases in saveImage/loadImage\n  - Test: Cross-tab sync scenarios\n  - Target: +84 covered lines\n\n- [ ] **Step 2.2**: Improve `useSettings.ts` (49% → 60%+)\n  - Test: Setting update edge cases\n  - Test: API key validation flows\n  - Test: Model selection logic\n  - Target: +50 covered lines\n\n### Phase 3: Branch Coverage\n\n- [ ] **Step 3.1**: Add error path tests for `validation.ts`\n  - Test: Invalid input handling\n  - Test: Boundary conditions\n  - Test: Type coercion edge cases\n  - Target: +15% branch coverage\n\n- [ ] **Step 3.2**: Add conditional path tests for `retry.ts`\n  - Test: Retry exhaustion\n  - Test: Exponential backoff edge cases\n  - Target: +10% branch coverage\n\n### Phase 4: Verification\n\n- [ ] **Step 4.1**: Run coverage check\n  - Command: `npm test -- --coverage --runInBand`\n  - Verify: All 4 metrics ≥60%\n\n- [ ] **Step 4.2**: Enable CI enforcement\n  - Remove `continue-on-error: true` from coverage job\n  - Verify: CI blocks PRs with coverage drops\n\n---\n\n## Acceptance\n\n### Coverage Thresholds\n- ✅ Statements: **≥60%** (currently 58.74%)\n- ✅ Branches: **≥60%** (currently 44.68%)\n- ✅ Functions: **≥60%** (currently 51.3%)\n- ✅ Lines: **≥60%** (currently 59.67%)\n\n### CI Enforcement\n- ✅ `continue-on-error` removed from coverage threshold job\n- ✅ CI fails on coverage drop below 60%\n- ✅ No regressions in existing test suite (393+ tests pass)\n\n### Test Quality\n- ✅ New tests follow existing patterns (Jest + RTL)\n- ✅ Tests cover edge cases and error paths\n- ✅ No flaky tests introduced (CI runs 3x stable)\n\n### Contracts\n- ✅ No changes to public APIs\n- ✅ Tests validate documented behavior\n\n---\n\n## Evidence\n\n**Before**:\n```bash\n$ npm test -- --coverage --runInBand\nJest: \"global\" coverage threshold for statements (60%) not met: 58.74%\nJest: \"global\" coverage threshold for branches (60%) not met: 44.68%\nJest: \"global\" coverage threshold for functions (60%) not met: 51.3%\nJest: \"global\" coverage threshold for lines (60%) not met: 59.67%\n```\n\n**After**:\n```bash\n# (Attach coverage report showing all metrics ≥60%)\n# (Attach CI status showing coverage enforcement enabled)\n```\n\n---\n\n## Docs Updated\n\n- [ ] **README**: N/A (internal testing)\n- [ ] **Code Map**: N/A\n- [ ] **Runbook**: Update with coverage monitoring guide\n- [ ] **ADR**: N/A (testing best practices already documented)\n\n---\n\n## Related\n\n- **Parent Epic**: #EPIC\n- **Existing Issue**: `issues/ISSUE-003-test-coverage.md`\n- **Blocks**: #T5 (CI leniency removal)\n- **Priority**: P1 (unblocks CI enforcement)",
  "labels": ["refactor", "tech-debt", "ci"],
  "assignees": [],
  "milestone": null
}
````
