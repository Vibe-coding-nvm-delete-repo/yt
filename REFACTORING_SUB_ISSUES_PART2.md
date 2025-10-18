# Refactoring Sub-Issues (Part 2) - Issues T4-T12

## 🎫 SUB-ISSUE #T4: Add Performance Monitoring & Golden Signals

### Title

```
SUB: Add Performance Monitoring & Golden Signals (Top 5 Paths) (Category: Observability)
```

### Body

```markdown
## Why (quantified)

**Current State**:

- **No production performance monitoring** for critical user paths
- **No baseline metrics** for optimization targets
- `usePerformance` hook exists (363 LOC) but **0% test coverage**
- No alerting or SLO tracking

**Critical Paths (unmonitored)**:

1. Image-to-Prompt generation (OpenRouter API call)
2. Batch prompt processing
3. localStorage I/O operations
4. Model selection/fetch
5. Settings persistence

**Golden Signals Missing**:

- **Latency**: No P50/P95/P99 tracking
- **Traffic**: No request rate monitoring
- **Errors**: Error rates not aggregated
- **Saturation**: No resource utilization metrics

**Business Impact**:

- Cannot set data-driven SLOs
- Slow performance goes unnoticed
- No early warning for regressions
- Cannot prioritize optimization work

---

## Plan (small, reversible)

### Phase 1: Instrument Critical Paths

- [ ] **Step 1.1**: Add latency tracking for Image-to-Prompt generation
  - Location: `src/lib/openrouter.ts` (vision model calls)
  - Metrics: duration, model, success/failure
  - Storage: Add to `usePerformance` hook

- [ ] **Step 1.2**: Add latency tracking for batch processing
  - Location: `src/lib/batchQueue.ts`
  - Metrics: queue depth, processing time, throughput

- [ ] **Step 1.3**: Add storage I/O performance tracking
  - Location: `src/lib/storage.ts`, `src/lib/historyStorage.ts`
  - Metrics: read/write latency, payload size

### Phase 2: Implement Golden Signals Dashboard

- [ ] **Step 2.1**: Create performance dashboard component
  - Create: `src/components/PerformanceDashboard.tsx` (~200 LOC)
  - Display: P50/P95/P99 latency, error rates, throughput

- [ ] **Step 2.2**: Add metrics export functionality
  - Format: JSON export for external monitoring
  - Include: Time-series data with timestamps

### Phase 3: Set Baseline SLOs

- [ ] **Step 3.1**: Collect 7-day baseline data
  - Run in dev/staging environment
  - Calculate: P50, P95, P99 for each critical path

- [ ] **Step 3.2**: Document SLO targets
  - Create: `docs/PERFORMANCE_SLOS.md`
  - Include: Targets, measurement methodology, alerting thresholds

### Phase 4: Add Client-Side Error Tracking

- [ ] **Step 4.1**: Aggregate error rates by category
  - Network errors (API failures)
  - Validation errors (user input)
  - Runtime errors (caught by ErrorBoundary)

- [ ] **Step 4.2**: Add error rate dashboard
  - Display: Error percentage, error types, time-series

---

## Acceptance

### Instrumentation

- ✅ All 5 critical paths instrumented with latency tracking
- ✅ Golden signals (Latency, Traffic, Errors, Saturation) measured
- ✅ Metrics persisted to localStorage (exportable)

### Dashboard

- ✅ Performance dashboard component created and functional
- ✅ Real-time metrics display (P50/P95/P99)
- ✅ Export functionality (JSON format)

### SLOs

- ✅ Baseline SLOs documented in `docs/PERFORMANCE_SLOS.md`
- ✅ Targets defined for each critical path:
  - Image-to-Prompt: P95 ≤500ms
  - Batch processing: Throughput ≥10 items/sec
  - Storage I/O: P95 ≤50ms

### Tests

- ✅ `usePerformance` hook coverage ≥60% (from 0%)
- ✅ Performance tracking logic tested
- ✅ No regressions in existing tests

### Contracts

- ✅ Public API unchanged (internal observability only)
- ✅ Instrumentation non-intrusive (minimal overhead <5ms)

---

## Evidence

**Dashboard Screenshot**:
```

# (Attach screenshot of PerformanceDashboard showing metrics)

````

**Baseline Report**:
```markdown
| Path | P50 | P95 | P99 | Error Rate |
|------|-----|-----|-----|------------|
| Image-to-Prompt | XXms | XXms | XXms | X% |
| Batch Processing | XXms | XXms | XXms | X% |
| Storage I/O | XXms | XXms | XXms | X% |
````

**Coverage Improvement**:

```bash
$ npm test -- --coverage src/hooks/usePerformance.ts
usePerformance.ts | 60%+ (from 0%)
```

---

## Docs Updated

- [x] **README**: Add link to Performance Dashboard
- [x] **Code Map**: Add observability layer diagram
- [x] **Runbook**: Create `docs/PERFORMANCE_SLOS.md` with SLO targets
- [ ] **ADR**: N/A (instrumentation, not architecture change)

---

## Related

- **Parent Epic**: #EPIC
- **Priority**: P1 (enables data-driven optimization)
- **Blocks**: #T10 (E2E performance benchmarks)

````

### GitHub REST API Payload

```json
{
  "title": "SUB: Add Performance Monitoring & Golden Signals (Top 5 Paths) (Category: Observability)",
  "body": "## Why (quantified)\n\n**Current State**:\n- **No production performance monitoring** for critical user paths\n- **No baseline metrics** for optimization targets\n- `usePerformance` hook exists (363 LOC) but **0% test coverage**\n- No alerting or SLO tracking\n\n**Critical Paths (unmonitored)**:\n1. Image-to-Prompt generation (OpenRouter API call)\n2. Batch prompt processing\n3. localStorage I/O operations\n4. Model selection/fetch\n5. Settings persistence\n\n**Golden Signals Missing**:\n- **Latency**: No P50/P95/P99 tracking\n- **Traffic**: No request rate monitoring\n- **Errors**: Error rates not aggregated\n- **Saturation**: No resource utilization metrics\n\n**Business Impact**:\n- Cannot set data-driven SLOs\n- Slow performance goes unnoticed\n- No early warning for regressions\n- Cannot prioritize optimization work\n\n---\n\n## Plan (small, reversible)\n\n### Phase 1: Instrument Critical Paths\n\n- [ ] **Step 1.1**: Add latency tracking for Image-to-Prompt generation\n  - Location: `src/lib/openrouter.ts` (vision model calls)\n  - Metrics: duration, model, success/failure\n  - Storage: Add to `usePerformance` hook\n\n- [ ] **Step 1.2**: Add latency tracking for batch processing\n  - Location: `src/lib/batchQueue.ts`\n  - Metrics: queue depth, processing time, throughput\n\n- [ ] **Step 1.3**: Add storage I/O performance tracking\n  - Location: `src/lib/storage.ts`, `src/lib/historyStorage.ts`\n  - Metrics: read/write latency, payload size\n\n### Phase 2: Implement Golden Signals Dashboard\n\n- [ ] **Step 2.1**: Create performance dashboard component\n  - Create: `src/components/PerformanceDashboard.tsx` (~200 LOC)\n  - Display: P50/P95/P99 latency, error rates, throughput\n\n- [ ] **Step 2.2**: Add metrics export functionality\n  - Format: JSON export for external monitoring\n  - Include: Time-series data with timestamps\n\n### Phase 3: Set Baseline SLOs\n\n- [ ] **Step 3.1**: Collect 7-day baseline data\n  - Run in dev/staging environment\n  - Calculate: P50, P95, P99 for each critical path\n\n- [ ] **Step 3.2**: Document SLO targets\n  - Create: `docs/PERFORMANCE_SLOS.md`\n  - Include: Targets, measurement methodology, alerting thresholds\n\n### Phase 4: Add Client-Side Error Tracking\n\n- [ ] **Step 4.1**: Aggregate error rates by category\n  - Network errors (API failures)\n  - Validation errors (user input)\n  - Runtime errors (caught by ErrorBoundary)\n\n- [ ] **Step 4.2**: Add error rate dashboard\n  - Display: Error percentage, error types, time-series\n\n---\n\n## Acceptance\n\n### Instrumentation\n- ✅ All 5 critical paths instrumented with latency tracking\n- ✅ Golden signals (Latency, Traffic, Errors, Saturation) measured\n- ✅ Metrics persisted to localStorage (exportable)\n\n### Dashboard\n- ✅ Performance dashboard component created and functional\n- ✅ Real-time metrics display (P50/P95/P99)\n- ✅ Export functionality (JSON format)\n\n### SLOs\n- ✅ Baseline SLOs documented in `docs/PERFORMANCE_SLOS.md`\n- ✅ Targets defined for each critical path:\n  - Image-to-Prompt: P95 ≤500ms\n  - Batch processing: Throughput ≥10 items/sec\n  - Storage I/O: P95 ≤50ms\n\n### Tests\n- ✅ `usePerformance` hook coverage ≥60% (from 0%)\n- ✅ Performance tracking logic tested\n- ✅ No regressions in existing tests\n\n### Contracts\n- ✅ Public API unchanged (internal observability only)\n- ✅ Instrumentation non-intrusive (minimal overhead <5ms)\n\n---\n\n## Evidence\n\n**Dashboard Screenshot**:\n```\n# (Attach screenshot of PerformanceDashboard showing metrics)\n```\n\n**Baseline Report**:\n```markdown\n| Path | P50 | P95 | P99 | Error Rate |\n|------|-----|-----|-----|------------|\n| Image-to-Prompt | XXms | XXms | XXms | X% |\n| Batch Processing | XXms | XXms | XXms | X% |\n| Storage I/O | XXms | XXms | XXms | X% |\n```\n\n**Coverage Improvement**:\n```bash\n$ npm test -- --coverage src/hooks/usePerformance.ts\nusePerformance.ts | 60%+ (from 0%)\n```\n\n---\n\n## Docs Updated\n\n- [x] **README**: Add link to Performance Dashboard\n- [x] **Code Map**: Add observability layer diagram\n- [x] **Runbook**: Create `docs/PERFORMANCE_SLOS.md` with SLO targets\n- [ ] **ADR**: N/A (instrumentation, not architecture change)\n\n---\n\n## Related\n\n- **Parent Epic**: #EPIC\n- **Priority**: P1 (enables data-driven optimization)\n- **Blocks**: #T10 (E2E performance benchmarks)",
  "labels": ["refactor", "tech-debt", "observability", "performance"],
  "assignees": [],
  "milestone": null
}
````

---

## 🎫 SUB-ISSUE #T5: Reduce CI Continue-on-Error Leniency

### Title

```
SUB: Reduce CI Continue-on-Error Leniency (Category: CI/Tests)
```

### Body

````markdown
## Why (quantified)

**Current State**:

- **7 CI jobs** allow failures with `continue-on-error: true`:
  1. TypeScript type-check
  2. ESLint (with special restoration branch exception)
  3. Tests with coverage
  4. Security audit
  5. Dependency review
  6. Commit linting
  7. Coverage threshold check

**Impact**:

- **False green CI** - PRs appear to pass but have hidden failures
- **Degradation creep** - Quality erodes over time
- **False confidence** - Developers unaware of issues
- **Merge risk** - Broken code reaches main branch

**Baseline**:

- CI workflow: `.github/workflows/ci.yml`
- All critical checks should block PRs
- Non-critical checks can warn but not fail

---

## Plan (small, reversible)

### Phase 1: Fix Blockers (Prerequisites)

- [ ] **Step 1.1**: Fix TypeScript errors (#T1 must be completed)
  - Prerequisite: Zero TypeScript errors
  - Remove `continue-on-error` from typecheck job

- [ ] **Step 1.2**: Fix test coverage (#T3 must be completed)
  - Prerequisite: Coverage ≥60%
  - Remove `continue-on-error` from test and coverage jobs

### Phase 2: Harden Critical Checks

- [ ] **Step 2.1**: Make TypeScript type-check blocking
  - File: `.github/workflows/ci.yml`
  - Remove: `continue-on-error: true` from typecheck job
  - Expected: CI fails on type errors

- [ ] **Step 2.2**: Make ESLint blocking (remove restoration exception)
  - Remove: Branch-specific logic for `restore-clean-main`
  - Set: `--max-warnings=0` for all branches
  - Expected: CI fails on any lint warning

- [ ] **Step 2.3**: Make test suite blocking
  - Remove: `continue-on-error: true` from test job
  - Remove: `--passWithNoTests` flag (all modules should have tests)
  - Expected: CI fails on any test failure

- [ ] **Step 2.4**: Make coverage threshold blocking
  - Remove: Restoration branch exception
  - Remove: `continue-on-error: true`
  - Expected: CI fails if coverage drops below 60%

### Phase 3: Categorize Non-Critical Checks

- [ ] **Step 3.1**: Security audit - keep as warning only
  - Reason: External vulnerability disclosures unpredictable
  - Action: Keep `continue-on-error: true`, add PR comment on failures

- [ ] **Step 3.2**: Dependency review - keep as warning
  - Reason: Transitive dependencies may flag issues
  - Action: Keep `continue-on-error: true`, require manual review

- [ ] **Step 3.3**: Commit linting - keep as warning
  - Reason: Informational, should not block urgent hotfixes
  - Action: Keep `continue-on-error: true`, warn only

### Phase 4: Add PR Status Reporting

- [ ] **Step 4.1**: Add clear status badges
  - Show: ✅ Critical checks passed | ⚠️ Warnings present
  - Location: Automated PR comment

- [ ] **Step 4.2**: Document check severity
  - Create: `docs/CI_CHECKS_POLICY.md`
  - Define: Blocking vs. warning checks with rationale

---

## Acceptance

### Blocking Checks (CI must fail if these fail)

- ✅ TypeScript type-check (0 errors required)
- ✅ ESLint (0 warnings required)
- ✅ Test suite (all tests pass)
- ✅ Coverage threshold (≥60% on all metrics)

### Warning Checks (CI passes, but warns)

- ⚠️ Security audit (manual review required)
- ⚠️ Dependency review (manual review required)
- ⚠️ Commit linting (informational)

### CI Configuration

- ✅ No `continue-on-error: true` on critical checks
- ✅ No branch-specific exceptions (same rules for all branches)
- ✅ Clear documentation of check severity

### Verification

- ✅ CI blocks PR with type error
- ✅ CI blocks PR with lint warning
- ✅ CI blocks PR with test failure
- ✅ CI blocks PR with coverage drop

---

## Evidence

**Before**:

```yaml
# .github/workflows/ci.yml (showing continue-on-error: true)
- name: Run TypeScript type-check
  run: npm run typecheck || echo "Type errors present"
  continue-on-error: true # ❌ False green
```
````

**After**:

```yaml
# .github/workflows/ci.yml (blocking)
- name: Run TypeScript type-check
  run: npm run typecheck # ✅ Fails CI on error
```

**CI Status**:

```
# (Attach screenshot of PR with all checks passing, no warnings)
# (Attach screenshot of intentionally broken PR blocked by CI)
```

---

## Docs Updated

- [x] **README**: Update CI badge and status
- [ ] **Code Map**: N/A
- [x] **Runbook**: Create `docs/CI_CHECKS_POLICY.md`
- [ ] **ADR**: N/A (operational policy, not architecture)

---

## Related

- **Parent Epic**: #EPIC
- **Depends On**: #T1 (TypeScript errors fixed), #T3 (Coverage threshold met)
- **Priority**: P1 (CI reliability critical)

````

### GitHub REST API Payload

```json
{
  "title": "SUB: Reduce CI Continue-on-Error Leniency (Category: CI/Tests)",
  "body": "## Why (quantified)\n\n**Current State**:\n- **7 CI jobs** allow failures with `continue-on-error: true`:\n  1. TypeScript type-check\n  2. ESLint (with special restoration branch exception)\n  3. Tests with coverage\n  4. Security audit\n  5. Dependency review\n  6. Commit linting\n  7. Coverage threshold check\n\n**Impact**:\n- **False green CI** - PRs appear to pass but have hidden failures\n- **Degradation creep** - Quality erodes over time\n- **False confidence** - Developers unaware of issues\n- **Merge risk** - Broken code reaches main branch\n\n**Baseline**:\n- CI workflow: `.github/workflows/ci.yml`\n- All critical checks should block PRs\n- Non-critical checks can warn but not fail\n\n---\n\n## Plan (small, reversible)\n\n### Phase 1: Fix Blockers (Prerequisites)\n\n- [ ] **Step 1.1**: Fix TypeScript errors (#T1 must be completed)\n  - Prerequisite: Zero TypeScript errors\n  - Remove `continue-on-error` from typecheck job\n\n- [ ] **Step 1.2**: Fix test coverage (#T3 must be completed)\n  - Prerequisite: Coverage ≥60%\n  - Remove `continue-on-error` from test and coverage jobs\n\n### Phase 2: Harden Critical Checks\n\n- [ ] **Step 2.1**: Make TypeScript type-check blocking\n  - File: `.github/workflows/ci.yml`\n  - Remove: `continue-on-error: true` from typecheck job\n  - Expected: CI fails on type errors\n\n- [ ] **Step 2.2**: Make ESLint blocking (remove restoration exception)\n  - Remove: Branch-specific logic for `restore-clean-main`\n  - Set: `--max-warnings=0` for all branches\n  - Expected: CI fails on any lint warning\n\n- [ ] **Step 2.3**: Make test suite blocking\n  - Remove: `continue-on-error: true` from test job\n  - Remove: `--passWithNoTests` flag (all modules should have tests)\n  - Expected: CI fails on any test failure\n\n- [ ] **Step 2.4**: Make coverage threshold blocking\n  - Remove: Restoration branch exception\n  - Remove: `continue-on-error: true`\n  - Expected: CI fails if coverage drops below 60%\n\n### Phase 3: Categorize Non-Critical Checks\n\n- [ ] **Step 3.1**: Security audit - keep as warning only\n  - Reason: External vulnerability disclosures unpredictable\n  - Action: Keep `continue-on-error: true`, add PR comment on failures\n\n- [ ] **Step 3.2**: Dependency review - keep as warning\n  - Reason: Transitive dependencies may flag issues\n  - Action: Keep `continue-on-error: true`, require manual review\n\n- [ ] **Step 3.3**: Commit linting - keep as warning\n  - Reason: Informational, should not block urgent hotfixes\n  - Action: Keep `continue-on-error: true`, warn only\n\n### Phase 4: Add PR Status Reporting\n\n- [ ] **Step 4.1**: Add clear status badges\n  - Show: ✅ Critical checks passed | ⚠️ Warnings present\n  - Location: Automated PR comment\n\n- [ ] **Step 4.2**: Document check severity\n  - Create: `docs/CI_CHECKS_POLICY.md`\n  - Define: Blocking vs. warning checks with rationale\n\n---\n\n## Acceptance\n\n### Blocking Checks (CI must fail if these fail)\n- ✅ TypeScript type-check (0 errors required)\n- ✅ ESLint (0 warnings required)\n- ✅ Test suite (all tests pass)\n- ✅ Coverage threshold (≥60% on all metrics)\n\n### Warning Checks (CI passes, but warns)\n- ⚠️ Security audit (manual review required)\n- ⚠️ Dependency review (manual review required)\n- ⚠️ Commit linting (informational)\n\n### CI Configuration\n- ✅ No `continue-on-error: true` on critical checks\n- ✅ No branch-specific exceptions (same rules for all branches)\n- ✅ Clear documentation of check severity\n\n### Verification\n- ✅ CI blocks PR with type error\n- ✅ CI blocks PR with lint warning\n- ✅ CI blocks PR with test failure\n- ✅ CI blocks PR with coverage drop\n\n---\n\n## Evidence\n\n**Before**:\n```yaml\n# .github/workflows/ci.yml (showing continue-on-error: true)\n- name: Run TypeScript type-check\n  run: npm run typecheck || echo \"Type errors present\"\n  continue-on-error: true  # ❌ False green\n```\n\n**After**:\n```yaml\n# .github/workflows/ci.yml (blocking)\n- name: Run TypeScript type-check\n  run: npm run typecheck  # ✅ Fails CI on error\n```\n\n**CI Status**:\n```\n# (Attach screenshot of PR with all checks passing, no warnings)\n# (Attach screenshot of intentionally broken PR blocked by CI)\n```\n\n---\n\n## Docs Updated\n\n- [x] **README**: Update CI badge and status\n- [ ] **Code Map**: N/A\n- [x] **Runbook**: Create `docs/CI_CHECKS_POLICY.md`\n- [ ] **ADR**: N/A (operational policy, not architecture)\n\n---\n\n## Related\n\n- **Parent Epic**: #EPIC\n- **Depends On**: #T1 (TypeScript errors fixed), #T3 (Coverage threshold met)\n- **Priority**: P1 (CI reliability critical)",
  "labels": ["refactor", "tech-debt", "ci"],
  "assignees": [],
  "milestone": null
}
````

---

## 🎫 SUB-ISSUE #T6: Fix Build Font Fetch Warnings

### Title

```
SUB: Fix Build Font Fetch Warnings (Next.js Font Loading) (Category: Performance)
```

### Body

```markdown
## Why (quantified)

**Current State**:

- **Production build fails** with font fetch errors:
```

[next]/internal/font/google/geist_deef94d5.module.css
Failed to fetch `Geist` from Google Fonts.

[next]/internal/font/google/geist_mono_1bf8cbf6.module.css
Failed to fetch `Geist Mono` from Google Fonts.

````
- **Build exits with error** (non-zero exit code)
- Network-dependent build process (blocks offline development)

**Impact**:
- **Deployment blocked** - Cannot create production build
- **CI unreliable** - Build success depends on external network
- **Developer friction** - Cannot build offline
- **Performance risk** - Google Fonts FOIT (Flash of Invisible Text)

**Baseline**:
- Command: `npm run build`
- Exit code: Non-zero (build failure)
- Root cause: Sandboxed environment blocks fonts.googleapis.com

---

## Plan (small, reversible)

### Option A: Self-Host Fonts (Recommended)

- [ ] **Step A.1**: Download Geist and Geist Mono fonts
- Source: https://vercel.com/font (official Geist releases)
- Or: https://github.com/vercel/geist-font
- Store: `public/fonts/` directory

- [ ] **Step A.2**: Update font configuration
- File: `src/app/layout.tsx` (or wherever fonts are imported)
- Change: From `next/font/google` to local font files
- Example:
  ```typescript
  import localFont from 'next/font/local'

  const geist = localFont({
    src: '../../public/fonts/Geist-Variable.woff2',
    variable: '--font-geist',
  })
  ```

- [ ] **Step A.3**: Update CSS variables
- Ensure: Tailwind CSS uses new `--font-geist` variables
- Test: Font rendering in dev and production

### Option B: Use System Fonts (Fallback)

- [ ] **Step B.1**: Configure font stack with system fonts
- Update: `tailwind.config.ts`
- Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- No external dependency

### Option C: Use CDN Fonts (Alternative)

- [ ] **Step C.1**: Use Vercel's font CDN (no Google Fonts API)
- Source: Direct font file URLs (not API)
- Preload: Add `<link rel="preload">` to prevent FOIT

---

## Acceptance

### Build Success
- ✅ `npm run build` completes with exit code 0
- ✅ No network requests during build
- ✅ Fonts render correctly in production

### Performance
- ✅ No FOIT (Flash of Invisible Text)
- ✅ Fonts preloaded or inlined
- ✅ Build time <2 minutes (no external network dependency)

### Developer Experience
- ✅ Build works offline
- ✅ No external API dependencies
- ✅ Consistent font rendering across environments

### Contracts
- ✅ Visual appearance unchanged (same font family)
- ✅ No user-facing breaking changes

---

## Evidence

**Before**:
```bash
$ npm run build
> Build error occurred
[Error: Turbopack build failed with 2 errors:
Failed to fetch `Geist` from Google Fonts.
Failed to fetch `Geist Mono` from Google Fonts.]
````

**After**:

```bash
$ npm run build
✓ Compiled successfully
✓ Finished writing to disk in 15ms
# (Attach full successful build output)
```

**Visual Comparison**:

```
# (Attach screenshot showing fonts render correctly)
```

---

## Docs Updated

- [x] **README**: Update font configuration section
- [ ] **Code Map**: N/A
- [ ] **Runbook**: N/A
- [x] **ADR**: Document font hosting decision (self-hosted vs. CDN)

---

## Related

- **Parent Epic**: #EPIC
- **Priority**: P2 (blocks deployment)
- **Quick Win**: Can be completed in <2 hours

````

### GitHub REST API Payload

```json
{
  "title": "SUB: Fix Build Font Fetch Warnings (Next.js Font Loading) (Category: Performance)",
  "body": "## Why (quantified)\n\n**Current State**:\n- **Production build fails** with font fetch errors:\n  ```\n  [next]/internal/font/google/geist_deef94d5.module.css\n  Failed to fetch `Geist` from Google Fonts.\n  \n  [next]/internal/font/google/geist_mono_1bf8cbf6.module.css\n  Failed to fetch `Geist Mono` from Google Fonts.\n  ```\n- **Build exits with error** (non-zero exit code)\n- Network-dependent build process (blocks offline development)\n\n**Impact**:\n- **Deployment blocked** - Cannot create production build\n- **CI unreliable** - Build success depends on external network\n- **Developer friction** - Cannot build offline\n- **Performance risk** - Google Fonts FOIT (Flash of Invisible Text)\n\n**Baseline**:\n- Command: `npm run build`\n- Exit code: Non-zero (build failure)\n- Root cause: Sandboxed environment blocks fonts.googleapis.com\n\n---\n\n## Plan (small, reversible)\n\n### Option A: Self-Host Fonts (Recommended)\n\n- [ ] **Step A.1**: Download Geist and Geist Mono fonts\n  - Source: https://vercel.com/font (official Geist releases)\n  - Or: https://github.com/vercel/geist-font\n  - Store: `public/fonts/` directory\n\n- [ ] **Step A.2**: Update font configuration\n  - File: `src/app/layout.tsx` (or wherever fonts are imported)\n  - Change: From `next/font/google` to local font files\n  - Example:\n    ```typescript\n    import localFont from 'next/font/local'\n    \n    const geist = localFont({\n      src: '../../public/fonts/Geist-Variable.woff2',\n      variable: '--font-geist',\n    })\n    ```\n\n- [ ] **Step A.3**: Update CSS variables\n  - Ensure: Tailwind CSS uses new `--font-geist` variables\n  - Test: Font rendering in dev and production\n\n### Option B: Use System Fonts (Fallback)\n\n- [ ] **Step B.1**: Configure font stack with system fonts\n  - Update: `tailwind.config.ts`\n  - Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`\n  - No external dependency\n\n### Option C: Use CDN Fonts (Alternative)\n\n- [ ] **Step C.1**: Use Vercel's font CDN (no Google Fonts API)\n  - Source: Direct font file URLs (not API)\n  - Preload: Add `<link rel=\"preload\">` to prevent FOIT\n\n---\n\n## Acceptance\n\n### Build Success\n- ✅ `npm run build` completes with exit code 0\n- ✅ No network requests during build\n- ✅ Fonts render correctly in production\n\n### Performance\n- ✅ No FOIT (Flash of Invisible Text)\n- ✅ Fonts preloaded or inlined\n- ✅ Build time <2 minutes (no external network dependency)\n\n### Developer Experience\n- ✅ Build works offline\n- ✅ No external API dependencies\n- ✅ Consistent font rendering across environments\n\n### Contracts\n- ✅ Visual appearance unchanged (same font family)\n- ✅ No user-facing breaking changes\n\n---\n\n## Evidence\n\n**Before**:\n```bash\n$ npm run build\n> Build error occurred\n[Error: Turbopack build failed with 2 errors:\nFailed to fetch `Geist` from Google Fonts.\nFailed to fetch `Geist Mono` from Google Fonts.]\n```\n\n**After**:\n```bash\n$ npm run build\n✓ Compiled successfully\n✓ Finished writing to disk in 15ms\n# (Attach full successful build output)\n```\n\n**Visual Comparison**:\n```\n# (Attach screenshot showing fonts render correctly)\n```\n\n---\n\n## Docs Updated\n\n- [x] **README**: Update font configuration section\n- [ ] **Code Map**: N/A\n- [ ] **Runbook**: N/A\n- [x] **ADR**: Document font hosting decision (self-hosted vs. CDN)\n\n---\n\n## Related\n\n- **Parent Epic**: #EPIC\n- **Priority**: P2 (blocks deployment)\n- **Quick Win**: Can be completed in <2 hours",
  "labels": ["refactor", "tech-debt", "performance"],
  "assignees": [],
  "milestone": null
}
````

---
