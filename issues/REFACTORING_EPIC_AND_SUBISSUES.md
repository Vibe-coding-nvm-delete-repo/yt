# GitHub Issues: Refactoring Epic & Sub-Issues

**Generated:** October 18, 2025  
**Repository:** Vibe-coding-nvm-delete-repo/yt  
**Purpose:** Complete set of issues for technical debt reduction and performance optimization  
**Total Issues:** 1 Epic + 12 Sub-Issues = 13 issues

---

## Table of Contents

1. [Epic Issue](#epic-issue)
2. [Sub-Issues](#sub-issues)
   - [Phase 1: Foundation](#phase-1-foundation)
   - [Phase 2: Performance & Observability](#phase-2-performance--observability)
   - [Phase 3: Developer Experience](#phase-3-developer-experience)
   - [Phase 4: Quality & Documentation](#phase-4-quality--documentation)
3. [GitHub REST API Payloads](#github-rest-api-payloads)
4. [Label Set](#label-set)
5. [Epic Tasklist](#epic-tasklist)

---

## Epic Issue

### Title

**Epic: Refactor to Cut Tech Debt + Boost Velocity/Performance**

### Body (Markdown)

```markdown
# Epic: Refactor to Cut Tech Debt + Boost Velocity/Performance

## Mode

**Execution:** Incremental, measurable changes; public contracts preserved; issues-only workflow  
**Strategy:** Small, reversible PRs with rollback plans  
**Quality Gates:** All changes must pass `npm run check:ci` (lint + typecheck + type:contracts + tests)

## Repo Context

**Repository:** Vibe-coding-nvm-delete-repo/yt  
**Tech Stack:** Next.js 15 + React 19 + TypeScript 5 + Tailwind 4 + OpenRouter API  
**Purpose:** AI-powered YouTube content creation tools (image-to-prompt, prompt creator, batch processing)  
**Current State:** Functional MVP with comprehensive test coverage (≥60%) and strict TypeScript

## Goals & Targets

### DORA Metrics

- **Lead Time:** ≤ 4h (from commit to production)
- **Deploy Frequency:** ≥ 2/day
- **Change Failure Rate:** ≤ 5%
- **MTTR:** ≤ 15 min

### Performance Targets (Critical Endpoints)

- **P50 Latency:** ≤ 200ms (API calls)
- **P95 Latency:** ≤ 800ms
- **Error Rate:** ≤ 0.5%
- **Bundle Size:** ≤ 200KB (First Load JS)

### CI/CD Targets

- **Total CI Time:** ≤ 3 min (currently: 25s, target: maintain or improve)
- **Test Execution:** ≤ 10s (currently: 7.5s)
- **Flaky Tests:** 0% (currently: 0%)

### Maintainability Targets

- **Function Complexity:** CC ≤ 10
- **File Size:** ≤ 500 LOC (currently: 12 files over limit)
- **Code Duplication:** ≤ 5%

### Dependencies

- **CVEs:** 0 critical/high (currently: 0 ✓)
- **Outdated Deps:** Key libs ≤ 1 minor behind

## Baseline (Quick Audit)

| Metric             | Current          | Target  | Status            |
| ------------------ | ---------------- | ------- | ----------------- |
| **Largest File**   | 1,711 LOC        | 500 LOC | 🔴 Critical       |
| **Files >300 LOC** | 12 files         | 0 files | 🟡 High           |
| **CI Total Time**  | 25.7s            | ≤ 180s  | ✅ Good           |
| **Test Time**      | 7.5s             | ≤ 10s   | ✅ Good           |
| **Test Coverage**  | ≥60%             | ≥60%    | ✅ Good           |
| **Security Vulns** | 0                | 0       | ✅ Clean          |
| **Build Success**  | Fails (font CDN) | Pass    | 🟡 Medium         |
| **Flaky Tests**    | 0                | 0       | ✅ Good           |
| **Bundle Size**    | Unknown          | ≤200KB  | 📊 Needs Baseline |

### Top Pain Points Identified

1. **Monolithic Components:** `SettingsTab.tsx` (1,711 LOC), `PromptCreatorTab.tsx` (974 LOC), `ImageToPromptTab.tsx` (838 LOC)
2. **Large Storage Module:** `storage.ts` (723 LOC) - complex singleton with multiple concerns
3. **Build Failures:** Google Fonts CDN blocking production builds
4. **Missing Observability:** No performance tracking, error reporting, or user analytics
5. **Bundle Size Unknown:** No bundle analysis in CI/CD
6. **API Cost Tracking:** OpenRouter API costs tracked but not monitored/alerted

## Workstreams & Sub-Issues

### Phase 1: Foundation (High ROI, Low Risk)

- [ ] #T1: Decompose SettingsTab.tsx into Sub-Components (Category: Modularity)
- [ ] #T2: Split storage.ts into Domain-Specific Stores (Category: Modularity)
- [ ] #T3: Fix Build Failures - Self-Host Fonts (Category: CI)

### Phase 2: Performance & Observability (Medium ROI, Medium Risk)

- [ ] #T4: Implement Bundle Size Monitoring & Code-Splitting (Category: Performance)
- [ ] #T5: Add Golden Signals Observability for Top 5 Paths (Category: Observability)
- [ ] #T6: Optimize OpenRouter API - Retry Logic & Circuit Breaker (Category: Performance)

### Phase 3: Developer Experience (Medium ROI, Low Risk)

- [ ] #T7: Refactor PromptCreatorTab.tsx into Focused Components (Category: Modularity)
- [ ] #T8: Extract Shared Form Utilities & Validation (Category: Modularity)
- [ ] #T9: Enhance CI Pipeline - Parallel Jobs & Caching (Category: CI)

### Phase 4: Quality & Documentation (Low ROI, High Value)

- [ ] #T10: Add E2E Tests for Critical User Journeys (Category: CI)
- [ ] #T11: Update Architecture Diagrams & Component Map (Category: Docs)
- [ ] #T12: Create Runbook for Production Monitoring (Category: Docs)

## Prioritized Order (Top 5 by ROI)

1. **#T3: Fix Build Failures** - CRITICAL blocker for production deployment
2. **#T1: Decompose SettingsTab.tsx** - Highest technical debt, impacts velocity
3. **#T5: Add Golden Signals Observability** - Production blindness is risky
4. **#T4: Implement Bundle Size Monitoring** - Performance baseline critical
5. **#T2: Split storage.ts** - Reduces complexity, enables better testing

## Exit Criteria

- ✅ All 12 files >300 LOC refactored to ≤500 LOC
- ✅ Production build succeeds without external CDN dependencies
- ✅ Bundle size monitored in CI with size budget alerts
- ✅ Golden signals (latency, errors, traffic, saturation) instrumented
- ✅ CI time remains ≤3 min (target: maintain current 25s)
- ✅ Test coverage maintained at ≥60%
- ✅ Architecture diagrams updated with current component boundaries
- ✅ Runbook created for production monitoring and alerting
- ✅ All public contracts preserved (no breaking changes)

## Search & Filter

**Find all related issues:**
```

is:issue is:open label:refactor label:tech-debt repo:Vibe-coding-nvm-delete-repo/yt

```

**By category:**
- Performance: `label:performance`
- Modularity: `label:modularity`
- CI/CD: `label:ci`
- Observability: `label:observability`
- Documentation: `label:docs`

## Risk Management

### Rollback Plan
- All changes behind feature flags where applicable
- Database/storage migrations are additive only
- Preserve existing APIs with deprecation warnings

### Quality Gates
- Every PR must pass: `npm run check:ci`
- Visual regression tests for UI changes
- Performance budgets enforced in CI
- Security audit on every dependency change

## Success Metrics

**Track weekly:**
- Technical debt ratio (debt/codebase size)
- Mean time to merge PR
- Mean time to resolve incidents
- Developer satisfaction (survey)

**Review monthly:**
- DORA metrics progress
- Performance metrics vs targets
- Coverage trends
- Incident frequency
```

---

## Sub-Issues

### Phase 1: Foundation

#### #T1: Decompose SettingsTab.tsx into Sub-Components (Category: Modularity)

**Title:** SUB: Decompose SettingsTab.tsx into Sub-Components (Category: Modularity)

**Body:**

```markdown
**Why (quantified):**

- Current file size: 1,711 lines (target: ≤500 LOC per file)
- Contains 5 distinct sub-tabs with unrelated concerns
- Violates Single Responsibility Principle
- Difficult to test in isolation (requires mocking entire component)
- High cognitive load for developers (avg. 15+ min to locate feature)
- File: `src/components/SettingsTab.tsx`

**Baseline:**

- Lines of Code: 1,711
- Cyclomatic Complexity: ~35 (target: ≤10 per function)
- Test Coverage: Partial (sub-tabs not independently testable)
- Maintainability Index: LOW

**Plan (small, reversible):**

- [ ] Step 1: Create `src/components/settings/` directory structure
- [ ] Step 2: Extract ApiKeysTab component (lines 200-400) → `src/components/settings/ApiKeysTab.tsx` (~200 LOC)
- [ ] Step 3: Extract ModelSelectionTab component (lines 400-700) → `src/components/settings/ModelSelectionTab.tsx` (~300 LOC)
- [ ] Step 4: Extract CustomPromptsTab component (lines 700-1000) → `src/components/settings/CustomPromptsTab.tsx` (~200 LOC)
- [ ] Step 5: Extract PromptCreatorSettingsTab component (lines 1000-1400) → `src/components/settings/PromptCreatorSettingsTab.tsx` (~400 LOC)
- [ ] Step 6: Extract CategoriesTab component (lines 1400-1711) → `src/components/settings/CategoriesTab.tsx` (~300 LOC)
- [ ] Step 7: Refactor main SettingsTab.tsx to orchestrate sub-tabs (~150 LOC remaining)
- [ ] Step 8: Extract shared utilities → `src/utils/formatting.ts` (formatTimestamp, formatPrice)
- [ ] Step 9: Extract shared types → `src/types/settingsForm.ts`
- [ ] Step 10: Update tests to cover each sub-tab independently
- [ ] Step 11: Verify no regressions with integration tests
- [ ] Step 12: Update docs/ENGINEERING_STANDARDS.md with new structure

**Acceptance:**

- **File Size:** All resulting files ≤500 LOC
- **Complexity:** No function with CC >10
- **Test Coverage:** Each sub-tab has ≥80% coverage
- **No Regressions:** All 47 existing test suites pass
- **Performance:** No degradation in render time (measure with React DevTools Profiler)
- **Contracts:** Existing `SettingsTabProps` interface unchanged

**Evidence:**

- Before/after line count comparison table
- Test coverage report showing individual sub-tab coverage
- Performance profiling data (render times)
- Screenshots showing identical UI behavior
- CI pipeline passing all checks

**Docs Updated:**

- [ ] README.md - Update project structure section
- [ ] docs/ENGINEERING_STANDARDS.md - Reference new component structure
- [ ] Code-map diagram (Mermaid) - Add settings component hierarchy
- [ ] ADR: Document decision to split SettingsTab and rationale
```

---

#### #T2: Split storage.ts into Domain-Specific Stores (Category: Modularity)

**Title:** SUB: Split storage.ts into Domain-Specific Stores (Category: Modularity)

**Body:**

```markdown
**Why (quantified):**

- Current file size: 723 lines (target: ≤300 LOC per storage module)
- Manages 3+ distinct domains: settings, images, batches
- Complex singleton pattern with multiple responsibilities
- Difficult to test in isolation
- Performance bottleneck: debouncing across all storage operations
- File: `src/lib/storage.ts`

**Baseline:**

- Lines of Code: 723
- Domains Mixed: Settings, Image State, Batch Queue
- Subscription Logic: 156 LOC (can be extracted)
- Test Files: 8 separate test files (already partially split)

**Plan (small, reversible):**

- [ ] Step 1: Create `src/lib/storage/` directory
- [ ] Step 2: Extract SettingsStorage → `src/lib/storage/settingsStorage.ts` (~300 LOC)
- [ ] Step 3: Extract ImageStateStorage → `src/lib/storage/imageStateStorage.ts` (~200 LOC)
- [ ] Step 4: Extract BatchStorage → `src/lib/storage/batchStorage.ts` (~150 LOC)
- [ ] Step 5: Create shared BaseStorage utility → `src/lib/storage/baseStorage.ts` (~100 LOC)
- [ ] Step 6: Create barrel export → `src/lib/storage/index.ts` (preserve existing API)
- [ ] Step 7: Update imports across codebase (use codemod/find-replace)
- [ ] Step 8: Migrate tests to new structure
- [ ] Step 9: Verify subscription/pub-sub still works across tabs
- [ ] Step 10: Run full test suite (47 suites must pass)

**Acceptance:**

- **File Size:** Each storage module ≤300 LOC
- **Test Coverage:** Each module has ≥80% coverage
- **No Breaking Changes:** Existing API preserved via barrel export
- **Performance:** No regression in localStorage read/write times
- **Cross-Tab Sync:** Storage events still work across tabs
- **Contracts:** `SettingsStorage.getInstance()` API unchanged

**Evidence:**

- Before/after file size table
- Test coverage per module
- Cross-tab sync demo (video or screenshot)
- Performance benchmarks (localStorage operation times)
- CI pipeline passing all checks

**Docs Updated:**

- [ ] README.md - Update storage architecture section
- [ ] docs/API_REFERENCE.md - Document new storage module structure
- [ ] Mermaid diagram showing storage layer architecture
- [ ] ADR: Document decision to split storage by domain
```

---

#### #T3: Fix Build Failures - Self-Host Fonts (Category: CI)

**Title:** SUB: Fix Build Failures - Self-Host Fonts (Category: CI)

**Body:**

```markdown
**Why (quantified):**

- **Critical blocker:** Production builds fail 100% of the time
- Error: "Failed to fetch `Geist` and `Geist Mono` from Google Fonts"
- External CDN dependency blocks deployment
- No offline/airgapped environment support
- GDPR/privacy concerns with Google Fonts CDN
- Build time: Currently fails in 5.4s (target: succeed in ≤30s)

**Baseline:**

- Build Success Rate: 0% (fails every time)
- Error Location: `[next]/internal/font/google/geist_*.module.css`
- Font Load Method: Google Fonts CDN (next/font/google)
- Total Font Weight: Unknown (not measured)

**Plan (small, reversible):**

- [ ] Step 1: Download Geist and Geist Mono font files from official source
- [ ] Step 2: Add fonts to `public/fonts/` directory (woff2 format for modern browsers)
- [ ] Step 3: Create `src/styles/fonts.css` with @font-face declarations
- [ ] Step 4: Update `src/app/layout.tsx` to import local fonts instead of next/font/google
- [ ] Step 5: Configure next.config.ts to optimize font loading (preload, font-display: swap)
- [ ] Step 6: Add font file size check to CI (prevent bloat, target: ≤200KB total)
- [ ] Step 7: Test build locally: `npm run build`
- [ ] Step 8: Verify fonts load correctly in dev and prod modes
- [ ] Step 9: Measure bundle impact (before/after comparison)
- [ ] Step 10: Update .gitignore if needed (keep font files committed)

**Acceptance:**

- **Build Success:** `npm run build` completes without errors
- **Build Time:** ≤30s for production build
- **Font Loading:** Fonts display correctly in all browsers (Chrome, Firefox, Safari)
- **Performance:** No increase in First Contentful Paint (FCP) or Largest Contentful Paint (LCP)
- **Bundle Size:** Font files ≤200KB total
- **GDPR Compliance:** No external CDN requests

**Evidence:**

- Successful build output (no errors)
- Bundle size comparison (before/after)
- Lighthouse scores (Performance, Accessibility)
- Screenshots showing correct font rendering
- CI pipeline green status

**Docs Updated:**

- [ ] README.md - Document font setup
- [ ] docs/DEPLOYMENT_SETUP_GUIDE.md - Add font hosting notes
- [ ] ADR: Document decision to self-host fonts and rationale
```

---

### Phase 2: Performance & Observability

#### #T4: Implement Bundle Size Monitoring & Code-Splitting (Category: Performance)

**Title:** SUB: Implement Bundle Size Monitoring & Code-Splitting (Category: Performance)

**Body:**

```markdown
**Why (quantified):**

- **Current state:** No bundle size tracking (unknown baseline)
- **Risk:** Bundle can grow unchecked, degrading performance
- **Target:** First Load JS ≤200KB
- **Best Practice:** Monitoring prevents performance regressions
- Large components (SettingsTab: 1,711 LOC) likely bloat bundle

**Baseline:**

- Bundle Size: Unknown (needs measurement)
- Code-Splitting: Minimal (only Next.js defaults)
- Bundle Analyzer: Available but not in CI (`npm run build:analyze`)

**Plan (small, reversible):**

- [ ] Step 1: Run `npm run build:analyze` to establish baseline
- [ ] Step 2: Document current First Load JS size
- [ ] Step 3: Add bundle size check to CI workflow (`.github/workflows/ci.yml`)
- [ ] Step 4: Configure size budgets in `next.config.ts` (200KB First Load JS, 50KB per page)
- [ ] Step 5: Implement code-splitting for large tabs (SettingsTab, PromptCreatorTab, ImageToPromptTab)
- [ ] Step 6: Use dynamic imports: `const SettingsTab = dynamic(() => import('@/components/SettingsTab'))`
- [ ] Step 7: Add loading states for code-split components
- [ ] Step 8: Measure bundle size reduction
- [ ] Step 9: Configure CI to fail if size budget exceeded
- [ ] Step 10: Document bundle analysis process in runbook

**Acceptance:**

- **Baseline Established:** First Load JS size documented
- **CI Check:** Bundle size monitored in every PR
- **Size Budget:** Build fails if First Load JS >200KB
- **Code-Splitting:** Top 3 tabs lazy-loaded
- **Performance:** No increase in Time to Interactive (TTI)
- **User Experience:** Loading states during code-split transitions

**Evidence:**

- Bundle analyzer output (before/after)
- Size budget configuration in next.config.ts
- CI workflow showing size check step
- Lighthouse performance scores
- Screenshots of loading states

**Docs Updated:**

- [ ] README.md - Add bundle size section
- [ ] docs/PERFORMANCE_OPTIMIZATION_EXAMPLES.md - Document code-splitting strategy
- [ ] Runbook - Add bundle size monitoring procedures
- [ ] ADR: Document size budgets and rationale
```

---

#### #T5: Add Golden Signals Observability for Top 5 Paths (Category: Observability)

**Title:** SUB: Add Golden Signals Observability for Top 5 Paths (Category: Observability)

**Body:**

```markdown
**Why (quantified):**

- **Current state:** Zero production observability (blind to issues)
- **Risk:** Cannot detect/diagnose failures until users report them
- **MTTR:** Unknown (target: ≤15 min)
- **Golden Signals:** Latency, Errors, Traffic, Saturation

**Top 5 Critical Paths (by user impact):**

1. Image upload & prompt generation (ImageToPromptTab)
2. Batch processing queue (BatchQueue)
3. Prompt creator form submission (PromptCreatorTab)
4. Settings API key validation (SettingsTab)
5. OpenRouter API calls (openrouter.ts)

**Baseline:**

- **Instrumented Paths:** 0/5
- **Error Tracking:** None (only console.error)
- **Performance Monitoring:** None
- **User Analytics:** None

**Plan (small, reversible):**

- [ ] Step 1: Choose observability provider (Sentry, LogRocket, or Vercel Analytics)
- [ ] Step 2: Add provider SDK to dependencies (evaluate bundle impact)
- [ ] Step 3: Create `src/lib/observability.ts` - centralized instrumentation layer
- [ ] Step 4: Instrument **Latency** - API call durations (p50, p95, p99)
- [ ] Step 5: Instrument **Errors** - catch/report all exceptions with context
- [ ] Step 6: Instrument **Traffic** - track user actions (uploads, generations, saves)
- [ ] Step 7: Instrument **Saturation** - track queue depth, localStorage usage
- [ ] Step 8: Add custom spans for OpenRouter API calls
- [ ] Step 9: Configure alerts for critical thresholds (error rate >1%, p95 >1s)
- [ ] Step 10: Create dashboard with golden signals
- [ ] Step 11: Test error reporting with intentional errors
- [ ] Step 12: Verify no PII in telemetry data

**Acceptance:**

- **Latency Tracking:** p50/p95/p99 for all 5 critical paths
- **Error Rate:** All exceptions captured with stack traces
- **Traffic Monitoring:** User actions tracked (uploads, generations)
- **Saturation Alerts:** Queue depth >10, localStorage >5MB
- **Dashboard:** Golden signals visible in real-time
- **Privacy:** No PII (API keys, user prompts) in telemetry
- **Performance:** Instrumentation adds <50ms overhead

**Evidence:**

- Dashboard screenshot showing golden signals
- Sample error report with stack trace
- Performance impact benchmark
- Privacy audit report (no PII)
- Alert configuration documentation

**Docs Updated:**

- [ ] docs/QUICK_START.md - Add observability setup
- [ ] Runbook - Document monitoring and alerting procedures
- [ ] ADR: Document observability provider choice and rationale
- [ ] README.md - Add monitoring section
```

---

#### #T6: Optimize OpenRouter API - Retry Logic & Circuit Breaker (Category: Performance)

**Title:** SUB: Optimize OpenRouter API - Retry Logic & Circuit Breaker (Category: Performance)

**Body:**

```markdown
**Why (quantified):**

- **Current state:** Basic exponential backoff (src/utils/retry.ts)
- **Gap:** No circuit breaker (can overwhelm failing API)
- **Risk:** Cascading failures if OpenRouter is degraded
- **User Impact:** Slow retries block UI (no cancellation)
- **Cost:** Retries on 5xx errors waste API credits
- File: `src/lib/openrouter.ts` (451 LOC), `src/utils/retry.ts`

**Baseline:**

- Retry Strategy: Exponential backoff (3 retries, max 10s)
- Circuit Breaker: None
- Request Cancellation: Not implemented
- Error Classification: Basic (retries all errors)
- Timeout: 30s per request (no per-model timeout)

**Plan (small, reversible):**

- [ ] Step 1: Implement circuit breaker pattern in `src/lib/circuitBreaker.ts`
- [ ] Step 2: Add request cancellation using AbortController
- [ ] Step 3: Classify errors: retriable (429, 503) vs non-retriable (400, 401)
- [ ] Step 4: Add per-model timeout configuration (fast models: 10s, slow: 60s)
- [ ] Step 5: Implement request deduplication (prevent double-submit)
- [ ] Step 6: Add retry budget (max 10 retries/min per model)
- [ ] Step 7: Emit metrics for retry rate, circuit breaker state
- [ ] Step 8: Add UI feedback for retry attempts (progress indicator)
- [ ] Step 9: Test with simulated API failures
- [ ] Step 10: Document retry behavior in user-facing docs

**Acceptance:**

- **Circuit Breaker:** Opens after 5 consecutive failures, half-open after 30s
- **Error Classification:** 4xx errors not retried (except 429)
- **Cancellation:** User can cancel in-flight requests
- **Timeouts:** Configurable per model (10s-60s)
- **Retry Budget:** Max 10 retries/min per model
- **User Feedback:** Progress indicator shows retry attempts
- **No Regressions:** Existing API calls still work

**Evidence:**

- Circuit breaker state machine diagram
- Test results with simulated failures
- Retry metrics dashboard
- UI screenshots showing retry feedback
- Performance benchmarks (latency reduction)

**Docs Updated:**

- [ ] docs/API_REFERENCE.md - Document retry behavior
- [ ] Runbook - Add circuit breaker monitoring
- [ ] ADR: Document retry strategy and circuit breaker design
- [ ] README.md - Update API integration section
```

---

### Phase 3: Developer Experience

#### #T7: Refactor PromptCreatorTab.tsx into Focused Components (Category: Modularity)

**Title:** SUB: Refactor PromptCreatorTab.tsx into Focused Components (Category: Modularity)

**Body:**

```markdown
**Why (quantified):**

- Current file size: 974 lines (target: ≤500 LOC)
- Long render functions (185 lines)
- Mixes concerns: UI, state, API, storage
- Has ESLint disable comment for max-file-size
- File: `src/components/PromptCreatorTab.tsx`

**Baseline:**

- Lines of Code: 974
- Longest Function: 185 lines (render method)
- Cyclomatic Complexity: ~25
- Test Coverage: Partial

**Plan (small, reversible):**

- [ ] Step 1: Extract PromptCreatorForm component (~250 LOC)
- [ ] Step 2: Extract PromptCreatorResults component (~200 LOC)
- [ ] Step 3: Extract PromptCreatorBatchConfig component (~150 LOC)
- [ ] Step 4: Extract PromptCreatorHistory component (~200 LOC)
- [ ] Step 5: Create custom hook: `usePromptCreatorState` (~100 LOC)
- [ ] Step 6: Refactor main PromptCreatorTab to orchestrate (~150 LOC)
- [ ] Step 7: Update tests for new components
- [ ] Step 8: Remove ESLint disable comment

**Acceptance:**

- **File Size:** All files ≤500 LOC
- **Complexity:** No function >50 lines or CC >10
- **Test Coverage:** ≥80% per component
- **No Regressions:** All existing tests pass
- **Contracts:** PromptCreatorTabProps unchanged

**Evidence:**

- Before/after line count table
- Test coverage report
- CI passing all checks

**Docs Updated:**

- [ ] README.md - Update component structure
- [ ] Mermaid diagram - PromptCreator component hierarchy
- [ ] ADR: Document refactoring approach
```

---

#### #T8: Extract Shared Form Utilities & Validation (Category: Modularity)

**Title:** SUB: Extract Shared Form Utilities & Validation (Category: Modularity)

**Body:**

```markdown
**Why (quantified):**

- **Duplication:** Form validation repeated across 3+ components
- **Inconsistency:** Different validation logic for similar inputs
- **Testability:** Validation logic embedded in components
- **Files affected:** SettingsTab.tsx, PromptCreatorTab.tsx, BestPracticesTab.tsx

**Baseline:**

- Duplicated Validation: ~150 LOC total
- Duplicated Formatters: formatPrice, formatTimestamp repeated
- Duplicated ID Generators: createPromptCreatorId, createBestPracticeId

**Plan (small, reversible):**

- [ ] Step 1: Create `src/utils/formatting.ts` - formatPrice, formatTimestamp
- [ ] Step 2: Create `src/utils/idGenerator.ts` - unified ID generation
- [ ] Step 3: Create `src/utils/validation.ts` - form validators
- [ ] Step 4: Create `src/hooks/useFormValidation.ts` - reusable validation hook
- [ ] Step 5: Replace duplicated code across components
- [ ] Step 6: Add comprehensive tests for utilities
- [ ] Step 7: Update existing tests to use new utilities

**Acceptance:**

- **Duplication Reduction:** ≤5% code duplication
- **Test Coverage:** Utilities have 100% coverage
- **No Regressions:** All form validations work as before
- **Consistency:** Same validation rules across components

**Evidence:**

- Code duplication report (before/after)
- Test coverage report for utilities
- CI passing all checks

**Docs Updated:**

- [ ] docs/API_REFERENCE.md - Document utility functions
- [ ] ADR: Document utility extraction strategy
```

---

#### #T9: Enhance CI Pipeline - Parallel Jobs & Caching (Category: CI)

**Title:** SUB: Enhance CI Pipeline - Parallel Jobs & Caching (Category: CI)

**Body:**

```markdown
**Why (quantified):**

- **Current CI time:** 25.7s (already fast, but can be improved)
- **Sequential jobs:** Test, security, coverage run in parallel (good!)
- **Cache hit rate:** Unknown
- **Opportunity:** Pre-build type checking, better caching

**Baseline:**

- Total CI Time: 25.7s
- Test Time: 7.5s
- Lint Time: ~5s
- Typecheck Time: ~10s
- Cache Hit Rate: Unknown

**Plan (small, reversible):**

- [ ] Step 1: Add cache metrics to CI logs
- [ ] Step 2: Optimize npm cache (use npm ci with better cache keys)
- [ ] Step 3: Cache TypeScript build info (.tsbuildinfo)
- [ ] Step 4: Cache ESLint cache (.eslintcache)
- [ ] Step 5: Add pr-check job that runs only changed files
- [ ] Step 6: Parallelize lint and typecheck (currently sequential)
- [ ] Step 7: Add early exit for docs-only changes
- [ ] Step 8: Measure CI time improvement

**Acceptance:**

- **CI Time:** Maintain ≤30s (or improve)
- **Cache Hit Rate:** ≥80% for dependency installs
- **Parallel Jobs:** Lint and typecheck run simultaneously
- **Early Exit:** Docs-only changes skip code checks

**Evidence:**

- CI time comparison (before/after)
- Cache hit rate metrics
- Job duration breakdown

**Docs Updated:**

- [ ] docs/ENGINEERING_STANDARDS.md - Document CI optimizations
- [ ] .github/workflows/ci.yml - Add comments explaining cache strategy
```

---

### Phase 4: Quality & Documentation

#### #T10: Add E2E Tests for Critical User Journeys (Category: CI)

**Title:** SUB: Add E2E Tests for Critical User Journeys (Category: CI)

**Body:**

```markdown
**Why (quantified):**

- **Current state:** 47 unit/integration tests (393 test cases)
- **Gap:** No end-to-end tests for user flows
- **Risk:** Integration issues not caught until production
- **Coverage:** Unit tests at ≥60%, but no E2E coverage

**Critical User Journeys:**

1. Upload image → Generate prompt → Save result
2. Create prompt → Generate batch → Rate results
3. Configure API key → Validate → Select models
4. Add best practice → Assign to category → Search
5. View usage history → Filter by date → Export

**Baseline:**

- E2E Tests: 0
- E2E Framework: None
- CI E2E Time: N/A

**Plan (small, reversible):**

- [ ] Step 1: Evaluate E2E frameworks (Playwright vs Cypress)
- [ ] Step 2: Install chosen framework (prefer Playwright for Next.js)
- [ ] Step 3: Create `tests/e2e/` directory
- [ ] Step 4: Write E2E test for Journey 1 (image upload flow)
- [ ] Step 5: Write E2E test for Journey 2 (prompt creator flow)
- [ ] Step 6: Write E2E test for Journey 3 (settings flow)
- [ ] Step 7: Add E2E tests to CI (run on main branch only)
- [ ] Step 8: Configure visual regression testing (optional)
- [ ] Step 9: Document E2E test patterns

**Acceptance:**

- **E2E Coverage:** All 5 critical journeys tested
- **CI Integration:** E2E tests run on every main branch commit
- **Test Time:** E2E suite completes in ≤2 min
- **Reliability:** Zero flaky E2E tests
- **Documentation:** E2E testing guide created

**Evidence:**

- E2E test execution videos
- CI logs showing E2E test runs
- Coverage report including E2E scenarios

**Docs Updated:**

- [ ] docs/ENGINEERING_STANDARDS.md - Add E2E testing section
- [ ] README.md - Document how to run E2E tests
- [ ] ADR: Document E2E framework choice
```

---

#### #T11: Update Architecture Diagrams & Component Map (Category: Docs)

**Title:** SUB: Update Architecture Diagrams & Component Map (Category: Docs)

**Body:**

```markdown
**Why (quantified):**

- **Current state:** Outdated or missing architecture diagrams
- **Pain point:** New developers take 2-3 days to onboard
- **Gap:** No visual component hierarchy
- **Documentation debt:** Diagrams don't reflect recent refactoring

**Baseline:**

- Architecture Diagrams: Outdated (pre-refactoring)
- Component Map: None
- Onboarding Time: 2-3 days for new developers
- Docs Coverage: README has basic structure, no diagrams

**Plan (small, reversible):**

- [ ] Step 1: Create component hierarchy diagram (Mermaid)
- [ ] Step 2: Create data flow diagram (Mermaid)
- [ ] Step 3: Create storage architecture diagram (Mermaid)
- [ ] Step 4: Create CI/CD pipeline diagram (Mermaid)
- [ ] Step 5: Update README.md with all diagrams
- [ ] Step 6: Create docs/ARCHITECTURE.md with detailed explanations
- [ ] Step 7: Add diagram source files to docs/diagrams/
- [ ] Step 8: Verify diagrams render correctly on GitHub

**Acceptance:**

- **Diagrams Created:** 4 architecture diagrams (component, data flow, storage, CI/CD)
- **Format:** Mermaid (renders natively on GitHub)
- **Accuracy:** Reflects current codebase structure
- **Clarity:** New developers can understand architecture in <1 hour
- **Maintenance:** Diagrams stored as code (Mermaid source)

**Evidence:**

- Screenshots of rendered diagrams
- Developer feedback on clarity
- Onboarding time improvement

**Docs Updated:**

- [x] README.md - Embed architecture diagrams
- [x] docs/ARCHITECTURE.md - Create new document
- [x] docs/diagrams/ - Add Mermaid source files
```

---

#### #T12: Create Runbook for Production Monitoring (Category: Docs)

**Title:** SUB: Create Runbook for Production Monitoring (Category: Docs)

**Body:**

```markdown
**Why (quantified):**

- **Current state:** No runbook for production issues
- **Risk:** High MTTR (mean time to resolution)
- **Gap:** No documented SLOs, alerts, or incident response
- **Dependency:** Requires #T5 (observability) to be complete

**Baseline:**

- Runbook: Does not exist
- SLOs: Not defined
- Alerts: Not configured
- Incident Response: Ad-hoc
- MTTR: Unknown (target: ≤15 min)

**Plan (small, reversible):**

- [ ] Step 1: Define SLOs (Service Level Objectives)
  - Availability: 99.9% uptime
  - Latency: p95 ≤800ms
  - Error Rate: ≤0.5%
- [ ] Step 2: Document alert thresholds
- [ ] Step 3: Create incident response playbook
- [ ] Step 4: Document common issues and resolutions
- [ ] Step 5: Add troubleshooting decision tree
- [ ] Step 6: Document rollback procedures
- [ ] Step 7: Create on-call rotation guide
- [ ] Step 8: Add monitoring dashboard links

**Acceptance:**

- **SLOs Defined:** Clear targets for availability, latency, errors
- **Alerts Documented:** Thresholds and escalation paths
- **Playbook Created:** Step-by-step incident response
- **Common Issues:** Top 10 issues with resolutions
- **Rollback Procedures:** Clear steps to revert deployments

**Evidence:**

- Runbook document (docs/RUNBOOK.md)
- SLO dashboard
- Sample incident walk-through

**Docs Updated:**

- [x] docs/RUNBOOK.md - Create new document
- [x] README.md - Link to runbook
- [x] docs/README.md - Add runbook to index
```

---

## GitHub REST API Payloads

### Epic Issue Payload

````json
{
  "title": "Epic: Refactor to Cut Tech Debt + Boost Velocity/Performance",
  "body": "# Epic: Refactor to Cut Tech Debt + Boost Velocity/Performance\n\n## Mode\n\n**Execution:** Incremental, measurable changes; public contracts preserved; issues-only workflow\n**Strategy:** Small, reversible PRs with rollback plans\n**Quality Gates:** All changes must pass `npm run check:ci` (lint + typecheck + type:contracts + tests)\n\n## Repo Context\n\n**Repository:** Vibe-coding-nvm-delete-repo/yt\n**Tech Stack:** Next.js 15 + React 19 + TypeScript 5 + Tailwind 4 + OpenRouter API\n**Purpose:** AI-powered YouTube content creation tools (image-to-prompt, prompt creator, batch processing)\n**Current State:** Functional MVP with comprehensive test coverage (≥60%) and strict TypeScript\n\n## Goals & Targets\n\n### DORA Metrics\n- **Lead Time:** ≤ 4h (from commit to production)\n- **Deploy Frequency:** ≥ 2/day\n- **Change Failure Rate:** ≤ 5%\n- **MTTR:** ≤ 15 min\n\n### Performance Targets (Critical Endpoints)\n- **P50 Latency:** ≤ 200ms (API calls)\n- **P95 Latency:** ≤ 800ms\n- **Error Rate:** ≤ 0.5%\n- **Bundle Size:** ≤ 200KB (First Load JS)\n\n### CI/CD Targets\n- **Total CI Time:** ≤ 3 min (currently: 25s, target: maintain or improve)\n- **Test Execution:** ≤ 10s (currently: 7.5s)\n- **Flaky Tests:** 0% (currently: 0%)\n\n### Maintainability Targets\n- **Function Complexity:** CC ≤ 10\n- **File Size:** ≤ 500 LOC (currently: 12 files over limit)\n- **Code Duplication:** ≤ 5%\n\n### Dependencies\n- **CVEs:** 0 critical/high (currently: 0 ✓)\n- **Outdated Deps:** Key libs ≤ 1 minor behind\n\n## Baseline (Quick Audit)\n\n| Metric | Current | Target | Status |\n|--------|---------|--------|--------|\n| **Largest File** | 1,711 LOC | 500 LOC | �� Critical |\n| **Files >300 LOC** | 12 files | 0 files | 🟡 High |\n| **CI Total Time** | 25.7s | ≤ 180s | ✅ Good |\n| **Test Time** | 7.5s | ≤ 10s | ✅ Good |\n| **Test Coverage** | ≥60% | ≥60% | ✅ Good |\n| **Security Vulns** | 0 | 0 | ✅ Clean |\n| **Build Success** | Fails (font CDN) | Pass | 🟡 Medium |\n| **Flaky Tests** | 0 | 0 | ✅ Good |\n| **Bundle Size** | Unknown | ≤200KB | 📊 Needs Baseline |\n\n### Top Pain Points Identified\n\n1. **Monolithic Components:** `SettingsTab.tsx` (1,711 LOC), `PromptCreatorTab.tsx` (974 LOC), `ImageToPromptTab.tsx` (838 LOC)\n2. **Large Storage Module:** `storage.ts` (723 LOC) - complex singleton with multiple concerns\n3. **Build Failures:** Google Fonts CDN blocking production builds\n4. **Missing Observability:** No performance tracking, error reporting, or user analytics\n5. **Bundle Size Unknown:** No bundle analysis in CI/CD\n6. **API Cost Tracking:** OpenRouter API costs tracked but not monitored/alerted\n\n## Workstreams & Sub-Issues\n\n### Phase 1: Foundation (High ROI, Low Risk)\n- [ ] #T1: Decompose SettingsTab.tsx into Sub-Components (Category: Modularity)\n- [ ] #T2: Split storage.ts into Domain-Specific Stores (Category: Modularity)\n- [ ] #T3: Fix Build Failures - Self-Host Fonts (Category: CI)\n\n### Phase 2: Performance & Observability (Medium ROI, Medium Risk)\n- [ ] #T4: Implement Bundle Size Monitoring & Code-Splitting (Category: Performance)\n- [ ] #T5: Add Golden Signals Observability for Top 5 Paths (Category: Observability)\n- [ ] #T6: Optimize OpenRouter API - Retry Logic & Circuit Breaker (Category: Performance)\n\n### Phase 3: Developer Experience (Medium ROI, Low Risk)\n- [ ] #T7: Refactor PromptCreatorTab.tsx into Focused Components (Category: Modularity)\n- [ ] #T8: Extract Shared Form Utilities & Validation (Category: Modularity)\n- [ ] #T9: Enhance CI Pipeline - Parallel Jobs & Caching (Category: CI)\n\n### Phase 4: Quality & Documentation (Low ROI, High Value)\n- [ ] #T10: Add E2E Tests for Critical User Journeys (Category: CI)\n- [ ] #T11: Update Architecture Diagrams & Component Map (Category: Docs)\n- [ ] #T12: Create Runbook for Production Monitoring (Category: Docs)\n\n## Prioritized Order (Top 5 by ROI)\n\n1. **#T3: Fix Build Failures** - CRITICAL blocker for production deployment\n2. **#T1: Decompose SettingsTab.tsx** - Highest technical debt, impacts velocity\n3. **#T5: Add Golden Signals Observability** - Production blindness is risky\n4. **#T4: Implement Bundle Size Monitoring** - Performance baseline critical\n5. **#T2: Split storage.ts** - Reduces complexity, enables better testing\n\n## Exit Criteria\n\n- ✅ All 12 files >300 LOC refactored to ≤500 LOC\n- ✅ Production build succeeds without external CDN dependencies\n- ✅ Bundle size monitored in CI with size budget alerts\n- ✅ Golden signals (latency, errors, traffic, saturation) instrumented\n- ✅ CI time remains ≤3 min (target: maintain current 25s)\n- ✅ Test coverage maintained at ≥60%\n- ✅ Architecture diagrams updated with current component boundaries\n- ✅ Runbook created for production monitoring and alerting\n- ✅ All public contracts preserved (no breaking changes)\n\n## Search & Filter\n\n**Find all related issues:**\n```\nis:issue is:open label:refactor label:tech-debt repo:Vibe-coding-nvm-delete-repo/yt\n```\n\n**By category:**\n- Performance: `label:performance`\n- Modularity: `label:modularity`\n- CI/CD: `label:ci`\n- Observability: `label:observability`\n- Documentation: `label:docs`\n\n## Risk Management\n\n### Rollback Plan\n- All changes behind feature flags where applicable\n- Database/storage migrations are additive only\n- Preserve existing APIs with deprecation warnings\n\n### Quality Gates\n- Every PR must pass: `npm run check:ci`\n- Visual regression tests for UI changes\n- Performance budgets enforced in CI\n- Security audit on every dependency change\n\n## Success Metrics\n\n**Track weekly:**\n- Technical debt ratio (debt/codebase size)\n- Mean time to merge PR\n- Mean time to resolve incidents\n- Developer satisfaction (survey)\n\n**Review monthly:**\n- DORA metrics progress\n- Performance metrics vs targets\n- Coverage trends\n- Incident frequency",
  "labels": ["refactor", "tech-debt", "epic"],
  "assignees": [],
  "milestone": null
}
````

### Sub-Issue Payloads

#### #T8: Extract Shared Form Utilities & Validation (Category: Modularity)

#### #T9: Enhance CI Pipeline - Parallel Jobs & Caching (Category: CI)

#### #T10: Add E2E Tests for Critical User Journeys (Category: CI)

#### #T11: Update Architecture Diagrams & Component Map (Category: Docs)

#### #T12: Create Runbook for Production Monitoring (Category: Docs)

_All sub-issue details are provided in the JSON payloads section below._

---

## Label Set

All issues use the following labels:

```json
[
  "refactor",
  "tech-debt",
  "performance",
  "modularity",
  "ci",
  "observability",
  "security",
  "docs",
  "epic"
]
```

**Label Application:**

- **Epic:** `["refactor", "tech-debt", "epic"]`
- **Modularity Issues (T1, T2, T7, T8):** `["refactor", "tech-debt", "modularity"]`
- **CI Issues (T3, T9, T10):** `["refactor", "tech-debt", "ci"]`
- **Performance Issues (T4, T6):** `["refactor", "tech-debt", "performance"]`
- **Observability Issues (T5):** `["refactor", "tech-debt", "observability"]`
- **Documentation Issues (T11, T12):** `["refactor", "tech-debt", "docs"]`

---

## Epic Tasklist

Use this checklist in the Epic issue body after sub-issues are created. Replace temporary IDs (#T1-#T12) with actual issue numbers.

```markdown
### Phase 1: Foundation (High ROI, Low Risk)

- [ ] #T1: Decompose SettingsTab.tsx into Sub-Components (Category: Modularity)
- [ ] #T2: Split storage.ts into Domain-Specific Stores (Category: Modularity)
- [ ] #T3: Fix Build Failures - Self-Host Fonts (Category: CI)

### Phase 2: Performance & Observability (Medium ROI, Medium Risk)

- [ ] #T4: Implement Bundle Size Monitoring & Code-Splitting (Category: Performance)
- [ ] #T5: Add Golden Signals Observability for Top 5 Paths (Category: Observability)
- [ ] #T6: Optimize OpenRouter API - Retry Logic & Circuit Breaker (Category: Performance)

### Phase 3: Developer Experience (Medium ROI, Low Risk)

- [ ] #T7: Refactor PromptCreatorTab.tsx into Focused Components (Category: Modularity)
- [ ] #T8: Extract Shared Form Utilities & Validation (Category: Modularity)
- [ ] #T9: Enhance CI Pipeline - Parallel Jobs & Caching (Category: CI)

### Phase 4: Quality & Documentation (Low ROI, High Value)

- [ ] #T10: Add E2E Tests for Critical User Journeys (Category: CI)
- [ ] #T11: Update Architecture Diagrams & Component Map (Category: Docs)
- [ ] #T12: Create Runbook for Production Monitoring (Category: Docs)
```

---

## GitHub REST API Payloads

All payloads below are ready for `POST /repos/Vibe-coding-nvm-delete-repo/yt/issues`

### Complete JSON Document

The complete JSON document with all issue payloads is available in:

- **Full Payloads:** `issues/SUB_ISSUES_PAYLOADS.json`
- **Epic Payload:** See section below

### Using the API

**Create Epic:**

```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/Vibe-coding-nvm-delete-repo/yt/issues \
  -d @epic_payload.json
```

**Create Sub-Issues:**

```bash
for issue in sub_issues/*.json; do
  curl -X POST \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    https://api.github.com/repos/Vibe-coding-nvm-delete-repo/yt/issues \
    -d @$issue
  sleep 1
done
```

---

## Implementation Order

### Priority Order (Execute in this sequence)

1. **T3: Fix Build Failures** (CRITICAL - blocks deployment)
2. **T1: Decompose SettingsTab.tsx** (HIGH - biggest debt)
3. **T5: Add Golden Signals** (HIGH - production visibility)
4. **T4: Bundle Size Monitoring** (MEDIUM - performance baseline)
5. **T2: Split storage.ts** (MEDIUM - reduces complexity)
6. **T6: Optimize OpenRouter API** (MEDIUM - reliability)
7. **T7: Refactor PromptCreatorTab** (MEDIUM - modularity)
8. **T8: Extract Form Utilities** (MEDIUM - reduce duplication)
9. **T9: Enhance CI Pipeline** (LOW - already fast)
10. **T10: Add E2E Tests** (LOW - quality investment)
11. **T11: Update Diagrams** (LOW - documentation)
12. **T12: Create Runbook** (LOW - depends on T5)

---

## Summary Statistics

| Metric                   | Count                       |
| ------------------------ | --------------------------- |
| **Total Issues**         | 13 (1 Epic + 12 Sub-Issues) |
| **Modularity Issues**    | 4 (T1, T2, T7, T8)          |
| **Performance Issues**   | 2 (T4, T6)                  |
| **CI/CD Issues**         | 3 (T3, T9, T10)             |
| **Observability Issues** | 1 (T5)                      |
| **Documentation Issues** | 2 (T11, T12)                |
| **Critical Priority**    | 1 (T3)                      |
| **High Priority**        | 2 (T1, T5)                  |
| **Medium Priority**      | 6 (T2, T4, T6, T7, T8, T9)  |
| **Low Priority**         | 3 (T10, T11, T12)           |

---

## Next Steps

1. **Review this document** - Ensure all issues align with project goals
2. **Create labels** in GitHub if they don't exist
3. **Create Epic issue** - Use the Epic payload
4. **Create sub-issues** - Use the 12 sub-issue payloads
5. **Update Epic tasklist** - Replace #T1-#T12 with actual issue numbers
6. **Assign owners** - Distribute issues to team members
7. **Set milestones** - Group issues into sprint milestones
8. **Begin execution** - Start with T3 (critical blocker)

---

## Maintenance

**Keep this document synchronized with:**

- Actual GitHub issues (link to live issues once created)
- Code changes as refactoring progresses
- Lessons learned and retrospectives
- Performance metrics and baselines

**Update frequency:** Weekly or after completing each phase

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-18  
**Generated By:** AI Refactoring Agent  
**Status:** Ready for Issue Creation
