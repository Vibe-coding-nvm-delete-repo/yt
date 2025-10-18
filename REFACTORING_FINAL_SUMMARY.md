# Refactoring Sub-Issues (Part 4) - Issues T10-T12 + Summary

## 🎫 SUB-ISSUE #T10: Add End-to-End Performance Benchmarks

### Title

```
SUB: Add End-to-End Performance Benchmarks (Category: Performance)
```

### Body

````markdown
## Why (quantified)

**Current State**:

- **No performance benchmarks** for critical user flows
- **No regression detection** for performance changes
- Manual performance testing only (unreliable, time-consuming)
- No CI performance gate

**Critical Flows (unbenchmarked)**:

1. Image-to-Prompt generation (full flow)
2. Batch prompt processing (10 items)
3. Settings save/load cycle
4. History search/filter
5. Best practices CRUD operations

**Impact**:

- Performance regressions go unnoticed
- No objective data for optimization decisions
- Cannot track improvement over time
- No SLO enforcement

---

## Plan (small, reversible)

### Phase 1: Setup Benchmark Infrastructure

- [ ] **Step 1.1**: Install benchmarking library
  - Option A: `@sitespeed.io/benchmark.js` (Node.js)
  - Option B: Playwright with performance APIs
  - Choose: Based on E2E vs. unit benchmark needs

- [ ] **Step 1.2**: Create benchmark test suite
  - Create: `src/__benchmarks__/` directory
  - Structure: Similar to `__tests__/` pattern

### Phase 2: Implement Critical Flow Benchmarks

- [ ] **Step 2.1**: Benchmark image-to-prompt generation
  - File: `src/__benchmarks__/image-to-prompt.bench.ts`
  - Measure: Time from upload → all models complete
  - Target: P95 ≤500ms (mock API responses)

- [ ] **Step 2.2**: Benchmark batch processing
  - File: `src/__benchmarks__/batch-processing.bench.ts`
  - Measure: Throughput (items/sec), queue latency
  - Target: ≥10 items/sec

- [ ] **Step 2.3**: Benchmark storage operations
  - File: `src/__benchmarks__/storage.bench.ts`
  - Measure: localStorage read/write latency
  - Target: P95 ≤50ms

- [ ] **Step 2.4**: Benchmark component render
  - File: `src/__benchmarks__/components.bench.ts`
  - Measure: Initial mount time, re-render time
  - Target: ≤100ms for largest components

### Phase 3: CI Integration

- [ ] **Step 3.1**: Add benchmark CI job
  - File: `.github/workflows/benchmarks.yml`
  - Run: On PR, compare to main branch baseline
  - Report: Performance diff as PR comment

- [ ] **Step 3.2**: Set performance budgets
  - Create: `.benchmarkrc.json` with thresholds
  - Warn: If regression >10%
  - Block: If regression >25% (optional, can start as warn-only)

### Phase 4: Reporting & Visualization

- [ ] **Step 4.1**: Generate benchmark report
  - Format: JSON, Markdown table
  - Include: P50, P95, P99, min, max, stddev

- [ ] **Step 4.2**: Track performance over time
  - Store: Benchmark results in repo (or external DB)
  - Visualize: Trend charts (optional GitHub Pages)

---

## Acceptance

### Benchmarks

- ✅ All 5 critical flows benchmarked
- ✅ Benchmarks run in <5 minutes total
- ✅ Repeatable (consistent results ±5%)

### CI Integration

- ✅ Benchmark job added to CI
- ✅ PR comments show performance diff
- ✅ Performance regression warnings visible

### Thresholds

- ✅ Performance budgets documented
- ✅ Image-to-prompt: P95 ≤500ms
- ✅ Batch processing: ≥10 items/sec
- ✅ Storage ops: P95 ≤50ms
- ✅ Component render: ≤100ms

### Documentation

- ✅ Benchmarking guide in docs
- ✅ How to run locally
- ✅ How to interpret results

---

## Evidence

**Benchmark Results (Baseline)**:

```markdown
| Benchmark        | P50  | P95  | P99  | Target     |
| ---------------- | ---- | ---- | ---- | ---------- |
| Image-to-Prompt  | XXms | XXms | XXms | P95 ≤500ms |
| Batch (10 items) | XXms | XXms | XXms | ≥10/sec    |
| Storage Ops      | XXms | XXms | XXms | P95 ≤50ms  |
| Component Render | XXms | XXms | XXms | ≤100ms     |
```
````

**CI Output**:

```
# (Attach screenshot of PR comment with benchmark comparison)
# (Attach workflow run showing benchmarks passing)
```

---

## Docs Updated

- [x] **README**: Add "Performance" section with benchmark link
- [ ] **Code Map**: N/A
- [x] **Runbook**: Create `docs/PERFORMANCE_BENCHMARKS.md`
- [ ] **ADR**: N/A (testing infrastructure, not architecture)

---

## Related

- **Parent Epic**: #EPIC
- **Depends On**: #T4 (performance monitoring must exist)
- **Priority**: P2 (enables regression detection)

````

### GitHub REST API Payload

```json
{
  "title": "SUB: Add End-to-End Performance Benchmarks (Category: Performance)",
  "body": "## Why (quantified)\n\n**Current State**:\n- **No performance benchmarks** for critical user flows\n- **No regression detection** for performance changes\n- Manual performance testing only (unreliable, time-consuming)\n- No CI performance gate\n\n**Critical Flows (unbenchmarked)**:\n1. Image-to-Prompt generation (full flow)\n2. Batch prompt processing (10 items)\n3. Settings save/load cycle\n4. History search/filter\n5. Best practices CRUD operations\n\n**Impact**:\n- Performance regressions go unnoticed\n- No objective data for optimization decisions\n- Cannot track improvement over time\n- No SLO enforcement\n\n---\n\n## Plan (small, reversible)\n\n### Phase 1: Setup Benchmark Infrastructure\n\n- [ ] **Step 1.1**: Install benchmarking library\n  - Option A: `@sitespeed.io/benchmark.js` (Node.js)\n  - Option B: Playwright with performance APIs\n  - Choose: Based on E2E vs. unit benchmark needs\n\n- [ ] **Step 1.2**: Create benchmark test suite\n  - Create: `src/__benchmarks__/` directory\n  - Structure: Similar to `__tests__/` pattern\n\n### Phase 2: Implement Critical Flow Benchmarks\n\n- [ ] **Step 2.1**: Benchmark image-to-prompt generation\n  - File: `src/__benchmarks__/image-to-prompt.bench.ts`\n  - Measure: Time from upload → all models complete\n  - Target: P95 ≤500ms (mock API responses)\n\n- [ ] **Step 2.2**: Benchmark batch processing\n  - File: `src/__benchmarks__/batch-processing.bench.ts`\n  - Measure: Throughput (items/sec), queue latency\n  - Target: ≥10 items/sec\n\n- [ ] **Step 2.3**: Benchmark storage operations\n  - File: `src/__benchmarks__/storage.bench.ts`\n  - Measure: localStorage read/write latency\n  - Target: P95 ≤50ms\n\n- [ ] **Step 2.4**: Benchmark component render\n  - File: `src/__benchmarks__/components.bench.ts`\n  - Measure: Initial mount time, re-render time\n  - Target: ≤100ms for largest components\n\n### Phase 3: CI Integration\n\n- [ ] **Step 3.1**: Add benchmark CI job\n  - File: `.github/workflows/benchmarks.yml`\n  - Run: On PR, compare to main branch baseline\n  - Report: Performance diff as PR comment\n\n- [ ] **Step 3.2**: Set performance budgets\n  - Create: `.benchmarkrc.json` with thresholds\n  - Warn: If regression >10%\n  - Block: If regression >25% (optional, can start as warn-only)\n\n### Phase 4: Reporting & Visualization\n\n- [ ] **Step 4.1**: Generate benchmark report\n  - Format: JSON, Markdown table\n  - Include: P50, P95, P99, min, max, stddev\n\n- [ ] **Step 4.2**: Track performance over time\n  - Store: Benchmark results in repo (or external DB)\n  - Visualize: Trend charts (optional GitHub Pages)\n\n---\n\n## Acceptance\n\n### Benchmarks\n- ✅ All 5 critical flows benchmarked\n- ✅ Benchmarks run in <5 minutes total\n- ✅ Repeatable (consistent results ±5%)\n\n### CI Integration\n- ✅ Benchmark job added to CI\n- ✅ PR comments show performance diff\n- ✅ Performance regression warnings visible\n\n### Thresholds\n- ✅ Performance budgets documented\n- ✅ Image-to-prompt: P95 ≤500ms\n- ✅ Batch processing: ≥10 items/sec\n- ✅ Storage ops: P95 ≤50ms\n- ✅ Component render: ≤100ms\n\n### Documentation\n- ✅ Benchmarking guide in docs\n- ✅ How to run locally\n- ✅ How to interpret results\n\n---\n\n## Evidence\n\n**Benchmark Results (Baseline)**:\n```markdown\n| Benchmark | P50 | P95 | P99 | Target |\n|-----------|-----|-----|-----|--------|\n| Image-to-Prompt | XXms | XXms | XXms | P95 ≤500ms |\n| Batch (10 items) | XXms | XXms | XXms | ≥10/sec |\n| Storage Ops | XXms | XXms | XXms | P95 ≤50ms |\n| Component Render | XXms | XXms | XXms | ≤100ms |\n```\n\n**CI Output**:\n```\n# (Attach screenshot of PR comment with benchmark comparison)\n# (Attach workflow run showing benchmarks passing)\n```\n\n---\n\n## Docs Updated\n\n- [x] **README**: Add \"Performance\" section with benchmark link\n- [ ] **Code Map**: N/A\n- [x] **Runbook**: Create `docs/PERFORMANCE_BENCHMARKS.md`\n- [ ] **ADR**: N/A (testing infrastructure, not architecture)\n\n---\n\n## Related\n\n- **Parent Epic**: #EPIC\n- **Depends On**: #T4 (performance monitoring must exist)\n- **Priority**: P2 (enables regression detection)",
  "labels": ["refactor", "tech-debt", "performance"],
  "assignees": [],
  "milestone": null
}
````

---

## 🎫 SUB-ISSUE #T11: Create Runbook for Production Monitoring

### Title

```
SUB: Create Runbook for Production Monitoring (Category: Observability/Docs)
```

### Body

````markdown
## Why (quantified)

**Current State**:

- **No production runbook** exists
- No documented SLOs or alerting strategy
- No incident response procedures
- Observability tools exist but usage not documented

**What's Missing**:

- SLO definitions and targets
- Monitoring dashboard setup
- Alert thresholds and escalation
- Troubleshooting playbooks
- On-call procedures

**Impact**:

- Slow incident response (no documented procedures)
- Inconsistent monitoring practices
- Knowledge gaps when on-call
- Difficulty diagnosing production issues

---

## Plan (small, reversible)

### Phase 1: SLO Documentation

- [ ] **Step 1.1**: Define Service Level Objectives
  - Create: `docs/SLOS.md`
  - Include:
    - Availability target: 99.9% (43.8 min downtime/month)
    - Latency targets: P95 ≤500ms (critical paths)
    - Error rate: ≤1%
    - Throughput: Document expected ranges

- [ ] **Step 1.2**: Define Service Level Indicators
  - Document: How to measure each SLO
  - Tools: Browser DevTools, localStorage metrics, error tracking
  - Data sources: `usePerformance` hook, ErrorBoundary

### Phase 2: Monitoring Setup Guide

- [ ] **Step 2.1**: Document dashboard setup
  - Create: `docs/MONITORING_SETUP.md`
  - Include: How to access/create performance dashboard (#T4)
  - Screenshots: Example dashboards

- [ ] **Step 2.2**: Document metric collection
  - Explain: How `usePerformance` hook works
  - Guide: Exporting metrics for external tools
  - Integration: With APM tools (optional)

### Phase 3: Alerting & Incident Response

- [ ] **Step 3.1**: Define alert thresholds
  - Create: `docs/ALERTING.md`
  - Thresholds:
    - Error rate >2% (warn), >5% (critical)
    - Latency P95 >750ms (warn), >1000ms (critical)
    - Availability <99.5% (warn), <99% (critical)

- [ ] **Step 3.2**: Create incident response playbook
  - Create: `docs/INCIDENT_RESPONSE.md`
  - Include:
    - Severity definitions (P0-P3)
    - Escalation procedures
    - Communication templates
    - Post-mortem template

### Phase 4: Troubleshooting Guides

- [ ] **Step 4.1**: Common issues playbook
  - Create: `docs/TROUBLESHOOTING.md`
  - Scenarios:
    - "API calls failing" → Check network, API key validity
    - "Slow performance" → Check browser console, localStorage size
    - "UI not updating" → Check React DevTools, subscription issues
    - "Build failures" → Check TypeScript errors, dependency issues

- [ ] **Step 4.2**: Debugging guides
  - Browser DevTools usage
  - React DevTools for state inspection
  - Network tab for API debugging

### Phase 5: Operational Checklists

- [ ] **Step 5.1**: Create deployment checklist
  - Pre-deployment: Tests pass, coverage met, build succeeds
  - Post-deployment: Smoke tests, monitoring check
  - Rollback procedure: Revert to previous version

- [ ] **Step 5.2**: Create on-call checklist
  - Daily: Check error rates, review metrics
  - Weekly: Review SLO compliance, performance trends
  - Monthly: Update runbook, review incidents

---

## Acceptance

### Documentation Created

- ✅ `docs/SLOS.md` - Service Level Objectives
- ✅ `docs/MONITORING_SETUP.md` - Dashboard setup
- ✅ `docs/ALERTING.md` - Alert thresholds
- ✅ `docs/INCIDENT_RESPONSE.md` - Incident procedures
- ✅ `docs/TROUBLESHOOTING.md` - Common issues

### Quality

- ✅ All docs reviewed for accuracy
- ✅ Links between docs (cross-references)
- ✅ Indexed in main README
- ✅ Runbook tested with real scenarios

### SLOs

- ✅ All SLOs quantified and measurable
- ✅ Measurement methodology documented
- ✅ Alert thresholds defined
- ✅ Escalation procedures documented

---

## Evidence

**Runbook Table of Contents**:

```markdown
## Production Runbook

1. [SLOs](docs/SLOS.md)
2. [Monitoring Setup](docs/MONITORING_SETUP.md)
3. [Alerting](docs/ALERTING.md)
4. [Incident Response](docs/INCIDENT_RESPONSE.md)
5. [Troubleshooting](docs/TROUBLESHOOTING.md)
```
````

**Sample SLO**:

```markdown
### Image-to-Prompt Generation

**SLI**: Time from image upload to first model result
**SLO**: P95 ≤500ms, P99 ≤1000ms
**Measurement**: `usePerformance` hook metric `imageToPrompt.duration`
**Alert Threshold**: P95 >750ms (warn), >1000ms (critical)
```

---

## Docs Updated

- [x] **README**: Add "Operations" section with runbook links
- [ ] **Code Map**: N/A
- [x] **Runbook**: Complete operational documentation
- [ ] **ADR**: N/A (operational procedures, not architecture)

---

## Related

- **Parent Epic**: #EPIC
- **Depends On**: #T4 (performance monitoring)
- **Priority**: P2 (production readiness)

````

### GitHub REST API Payload

```json
{
  "title": "SUB: Create Runbook for Production Monitoring (Category: Observability/Docs)",
  "body": "## Why (quantified)\n\n**Current State**:\n- **No production runbook** exists\n- No documented SLOs or alerting strategy\n- No incident response procedures\n- Observability tools exist but usage not documented\n\n**What's Missing**:\n- SLO definitions and targets\n- Monitoring dashboard setup\n- Alert thresholds and escalation\n- Troubleshooting playbooks\n- On-call procedures\n\n**Impact**:\n- Slow incident response (no documented procedures)\n- Inconsistent monitoring practices\n- Knowledge gaps when on-call\n- Difficulty diagnosing production issues\n\n---\n\n## Plan (small, reversible)\n\n### Phase 1: SLO Documentation\n\n- [ ] **Step 1.1**: Define Service Level Objectives\n  - Create: `docs/SLOS.md`\n  - Include:\n    - Availability target: 99.9% (43.8 min downtime/month)\n    - Latency targets: P95 ≤500ms (critical paths)\n    - Error rate: ≤1%\n    - Throughput: Document expected ranges\n\n- [ ] **Step 1.2**: Define Service Level Indicators\n  - Document: How to measure each SLO\n  - Tools: Browser DevTools, localStorage metrics, error tracking\n  - Data sources: `usePerformance` hook, ErrorBoundary\n\n### Phase 2: Monitoring Setup Guide\n\n- [ ] **Step 2.1**: Document dashboard setup\n  - Create: `docs/MONITORING_SETUP.md`\n  - Include: How to access/create performance dashboard (#T4)\n  - Screenshots: Example dashboards\n\n- [ ] **Step 2.2**: Document metric collection\n  - Explain: How `usePerformance` hook works\n  - Guide: Exporting metrics for external tools\n  - Integration: With APM tools (optional)\n\n### Phase 3: Alerting & Incident Response\n\n- [ ] **Step 3.1**: Define alert thresholds\n  - Create: `docs/ALERTING.md`\n  - Thresholds:\n    - Error rate >2% (warn), >5% (critical)\n    - Latency P95 >750ms (warn), >1000ms (critical)\n    - Availability <99.5% (warn), <99% (critical)\n\n- [ ] **Step 3.2**: Create incident response playbook\n  - Create: `docs/INCIDENT_RESPONSE.md`\n  - Include:\n    - Severity definitions (P0-P3)\n    - Escalation procedures\n    - Communication templates\n    - Post-mortem template\n\n### Phase 4: Troubleshooting Guides\n\n- [ ] **Step 4.1**: Common issues playbook\n  - Create: `docs/TROUBLESHOOTING.md`\n  - Scenarios:\n    - \"API calls failing\" → Check network, API key validity\n    - \"Slow performance\" → Check browser console, localStorage size\n    - \"UI not updating\" → Check React DevTools, subscription issues\n    - \"Build failures\" → Check TypeScript errors, dependency issues\n\n- [ ] **Step 4.2**: Debugging guides\n  - Browser DevTools usage\n  - React DevTools for state inspection\n  - Network tab for API debugging\n\n### Phase 5: Operational Checklists\n\n- [ ] **Step 5.1**: Create deployment checklist\n  - Pre-deployment: Tests pass, coverage met, build succeeds\n  - Post-deployment: Smoke tests, monitoring check\n  - Rollback procedure: Revert to previous version\n\n- [ ] **Step 5.2**: Create on-call checklist\n  - Daily: Check error rates, review metrics\n  - Weekly: Review SLO compliance, performance trends\n  - Monthly: Update runbook, review incidents\n\n---\n\n## Acceptance\n\n### Documentation Created\n- ✅ `docs/SLOS.md` - Service Level Objectives\n- ✅ `docs/MONITORING_SETUP.md` - Dashboard setup\n- ✅ `docs/ALERTING.md` - Alert thresholds\n- ✅ `docs/INCIDENT_RESPONSE.md` - Incident procedures\n- ✅ `docs/TROUBLESHOOTING.md` - Common issues\n\n### Quality\n- ✅ All docs reviewed for accuracy\n- ✅ Links between docs (cross-references)\n- ✅ Indexed in main README\n- ✅ Runbook tested with real scenarios\n\n### SLOs\n- ✅ All SLOs quantified and measurable\n- ✅ Measurement methodology documented\n- ✅ Alert thresholds defined\n- ✅ Escalation procedures documented\n\n---\n\n## Evidence\n\n**Runbook Table of Contents**:\n```markdown\n## Production Runbook\n\n1. [SLOs](docs/SLOS.md)\n2. [Monitoring Setup](docs/MONITORING_SETUP.md)\n3. [Alerting](docs/ALERTING.md)\n4. [Incident Response](docs/INCIDENT_RESPONSE.md)\n5. [Troubleshooting](docs/TROUBLESHOOTING.md)\n```\n\n**Sample SLO**:\n```markdown\n### Image-to-Prompt Generation\n\n**SLI**: Time from image upload to first model result\n**SLO**: P95 ≤500ms, P99 ≤1000ms\n**Measurement**: `usePerformance` hook metric `imageToPrompt.duration`\n**Alert Threshold**: P95 >750ms (warn), >1000ms (critical)\n```\n\n---\n\n## Docs Updated\n\n- [x] **README**: Add \"Operations\" section with runbook links\n- [ ] **Code Map**: N/A\n- [x] **Runbook**: Complete operational documentation\n- [ ] **ADR**: N/A (operational procedures, not architecture)\n\n---\n\n## Related\n\n- **Parent Epic**: #EPIC\n- **Depends On**: #T4 (performance monitoring)\n- **Priority**: P2 (production readiness)",
  "labels": ["refactor", "tech-debt", "observability", "docs"],
  "assignees": [],
  "milestone": null
}
````

---

## 🎫 SUB-ISSUE #T12: Dependency Upgrade Strategy & Policy

### Title

```
SUB: Dependency Upgrade Strategy & Policy (Category: Security/Deps)
```

### Body

````markdown
## Why (quantified)

**Current State**:

- **No documented upgrade policy**
- Dependencies updated ad-hoc
- No automated dependency updates (Dependabot not configured)
- No testing strategy for upgrades

**Current Dependency Health**:

- **0 security vulnerabilities** (✅ good)
- Next.js: 15.5.6 (latest)
- React: 19.2.0 (latest)
- TypeScript: 5.x (latest major)
- **2 deprecated packages**: `inflight`, `glob@7.2.3`

**Risks**:

- Security vulnerabilities accumulate over time
- Breaking changes become larger with time
- Technical debt grows
- Ecosystem drift (incompatibilities)

---

## Plan (small, reversible)

### Phase 1: Document Current State

- [ ] **Step 1.1**: Audit all dependencies
  - Command: `npm outdated --long`
  - Document: Current versions, latest versions, semver compatibility
  - Identify: Major, minor, patch updates available

- [ ] **Step 1.2**: Categorize dependencies
  - **Critical**: Security, core framework (Next.js, React, TypeScript)
  - **Important**: Build tools, testing, linting
  - **Optional**: Dev experience, utilities
  - **Deprecated**: Flag for replacement

### Phase 2: Create Upgrade Policy

- [ ] **Step 2.1**: Define upgrade cadence
  - Create: `docs/DEPENDENCY_POLICY.md`
  - Cadence:
    - Patch versions: Automated (Dependabot)
    - Minor versions: Monthly review
    - Major versions: Quarterly review + testing
    - Security patches: Immediate (within 48 hours)

- [ ] **Step 2.2**: Define testing requirements
  - Patch: `npm run check:ci` must pass
  - Minor: Full test suite + smoke test
  - Major: Full regression test + manual QA

### Phase 3: Configure Automation

- [ ] **Step 3.1**: Enable Dependabot
  - Create: `.github/dependabot.yml`
  - Configure:
    - Schedule: Weekly for patch/minor
    - Grouping: Group patch updates
    - Auto-merge: For patch updates with passing CI

- [ ] **Step 3.2**: Add dependency CI check
  - Use: Existing `.github/workflows/ci.yml` dependency-review job
  - Ensure: Runs on all PRs

### Phase 4: Address Current Issues

- [ ] **Step 4.1**: Replace deprecated packages
  - `inflight` → Check dependents, upgrade if needed
  - `glob@7.2.3` → Upgrade to `glob@10.x` or remove

- [ ] **Step 4.2**: Audit for known vulnerabilities (even if 0 today)
  - Command: `npm audit`
  - Create: Template for vulnerability response

### Phase 5: Create Maintenance Playbook

- [ ] **Step 5.1**: Document upgrade procedure
  - Create: `docs/DEPENDENCY_UPGRADES.md`
  - Steps:
    1. Check `npm outdated`
    2. Review changelogs
    3. Update in separate branch
    4. Run full CI
    5. Manual smoke test
    6. Merge if green

- [ ] **Step 5.2**: Create upgrade checklist template
  - Use in PR description for dependency updates
  - Include: Version, changelog link, breaking changes, test results

---

## Acceptance

### Policy Documentation

- ✅ `docs/DEPENDENCY_POLICY.md` created
- ✅ `docs/DEPENDENCY_UPGRADES.md` created
- ✅ Upgrade cadence defined (patch/minor/major)
- ✅ Testing requirements documented

### Automation

- ✅ Dependabot configured (`.github/dependabot.yml`)
- ✅ Auto-merge policy for safe patches
- ✅ Security vulnerability alerts enabled
- ✅ Dependency review in CI

### Current Issues Resolved

- ✅ Deprecated packages replaced or upgrade planned
- ✅ All dependencies within 1 major version of latest (where feasible)
- ✅ 0 known security vulnerabilities maintained

### Maintainability

- ✅ Clear ownership of dependency updates
- ✅ Runbook for handling breaking changes
- ✅ Communication plan for major upgrades

---

## Evidence

**Dependency Audit**:

```bash
$ npm outdated --long
# (Attach current state)

$ npm audit
# (Verify 0 vulnerabilities)
```
````

**Dependabot Configuration**:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      patches:
        patterns: ["*"]
        update-types: ["patch"]
```

**Policy Document Snippet**:

```markdown
### Upgrade Cadence

- **Patch** (1.2.3 → 1.2.4): Automated via Dependabot
- **Minor** (1.2.x → 1.3.0): Monthly review cycle
- **Major** (1.x.x → 2.0.0): Quarterly + thorough testing
- **Security**: Immediate (≤48 hours from disclosure)
```

---

## Docs Updated

- [x] **README**: Add "Dependencies" section with policy link
- [ ] **Code Map**: N/A
- [x] **Runbook**: Create `docs/DEPENDENCY_POLICY.md`
- [ ] **ADR**: N/A (operational policy, not architecture)

---

## Related

- **Parent Epic**: #EPIC
- **Priority**: P2 (long-term health)
- **Quick Win**: Dependabot setup is <1 hour

````

### GitHub REST API Payload

```json
{
  "title": "SUB: Dependency Upgrade Strategy & Policy (Category: Security/Deps)",
  "body": "## Why (quantified)\n\n**Current State**:\n- **No documented upgrade policy**\n- Dependencies updated ad-hoc\n- No automated dependency updates (Dependabot not configured)\n- No testing strategy for upgrades\n\n**Current Dependency Health**:\n- **0 security vulnerabilities** (✅ good)\n- Next.js: 15.5.6 (latest)\n- React: 19.2.0 (latest)\n- TypeScript: 5.x (latest major)\n- **2 deprecated packages**: `inflight`, `glob@7.2.3`\n\n**Risks**:\n- Security vulnerabilities accumulate over time\n- Breaking changes become larger with time\n- Technical debt grows\n- Ecosystem drift (incompatibilities)\n\n---\n\n## Plan (small, reversible)\n\n### Phase 1: Document Current State\n\n- [ ] **Step 1.1**: Audit all dependencies\n  - Command: `npm outdated --long`\n  - Document: Current versions, latest versions, semver compatibility\n  - Identify: Major, minor, patch updates available\n\n- [ ] **Step 1.2**: Categorize dependencies\n  - **Critical**: Security, core framework (Next.js, React, TypeScript)\n  - **Important**: Build tools, testing, linting\n  - **Optional**: Dev experience, utilities\n  - **Deprecated**: Flag for replacement\n\n### Phase 2: Create Upgrade Policy\n\n- [ ] **Step 2.1**: Define upgrade cadence\n  - Create: `docs/DEPENDENCY_POLICY.md`\n  - Cadence:\n    - Patch versions: Automated (Dependabot)\n    - Minor versions: Monthly review\n    - Major versions: Quarterly review + testing\n    - Security patches: Immediate (within 48 hours)\n\n- [ ] **Step 2.2**: Define testing requirements\n  - Patch: `npm run check:ci` must pass\n  - Minor: Full test suite + smoke test\n  - Major: Full regression test + manual QA\n\n### Phase 3: Configure Automation\n\n- [ ] **Step 3.1**: Enable Dependabot\n  - Create: `.github/dependabot.yml`\n  - Configure:\n    - Schedule: Weekly for patch/minor\n    - Grouping: Group patch updates\n    - Auto-merge: For patch updates with passing CI\n\n- [ ] **Step 3.2**: Add dependency CI check\n  - Use: Existing `.github/workflows/ci.yml` dependency-review job\n  - Ensure: Runs on all PRs\n\n### Phase 4: Address Current Issues\n\n- [ ] **Step 4.1**: Replace deprecated packages\n  - `inflight` → Check dependents, upgrade if needed\n  - `glob@7.2.3` → Upgrade to `glob@10.x` or remove\n\n- [ ] **Step 4.2**: Audit for known vulnerabilities (even if 0 today)\n  - Command: `npm audit`\n  - Create: Template for vulnerability response\n\n### Phase 5: Create Maintenance Playbook\n\n- [ ] **Step 5.1**: Document upgrade procedure\n  - Create: `docs/DEPENDENCY_UPGRADES.md`\n  - Steps:\n    1. Check `npm outdated`\n    2. Review changelogs\n    3. Update in separate branch\n    4. Run full CI\n    5. Manual smoke test\n    6. Merge if green\n\n- [ ] **Step 5.2**: Create upgrade checklist template\n  - Use in PR description for dependency updates\n  - Include: Version, changelog link, breaking changes, test results\n\n---\n\n## Acceptance\n\n### Policy Documentation\n- ✅ `docs/DEPENDENCY_POLICY.md` created\n- ✅ `docs/DEPENDENCY_UPGRADES.md` created\n- ✅ Upgrade cadence defined (patch/minor/major)\n- ✅ Testing requirements documented\n\n### Automation\n- ✅ Dependabot configured (`.github/dependabot.yml`)\n- ✅ Auto-merge policy for safe patches\n- ✅ Security vulnerability alerts enabled\n- ✅ Dependency review in CI\n\n### Current Issues Resolved\n- ✅ Deprecated packages replaced or upgrade planned\n- ✅ All dependencies within 1 major version of latest (where feasible)\n- ✅ 0 known security vulnerabilities maintained\n\n### Maintainability\n- ✅ Clear ownership of dependency updates\n- ✅ Runbook for handling breaking changes\n- ✅ Communication plan for major upgrades\n\n---\n\n## Evidence\n\n**Dependency Audit**:\n```bash\n$ npm outdated --long\n# (Attach current state)\n\n$ npm audit\n# (Verify 0 vulnerabilities)\n```\n\n**Dependabot Configuration**:\n```yaml\n# .github/dependabot.yml\nversion: 2\nupdates:\n  - package-ecosystem: \"npm\"\n    directory: \"/\"\n    schedule:\n      interval: \"weekly\"\n    groups:\n      patches:\n        patterns: [\"*\"]\n        update-types: [\"patch\"]\n```\n\n**Policy Document Snippet**:\n```markdown\n### Upgrade Cadence\n\n- **Patch** (1.2.3 → 1.2.4): Automated via Dependabot\n- **Minor** (1.2.x → 1.3.0): Monthly review cycle\n- **Major** (1.x.x → 2.0.0): Quarterly + thorough testing\n- **Security**: Immediate (≤48 hours from disclosure)\n```\n\n---\n\n## Docs Updated\n\n- [x] **README**: Add \"Dependencies\" section with policy link\n- [ ] **Code Map**: N/A\n- [x] **Runbook**: Create `docs/DEPENDENCY_POLICY.md`\n- [ ] **ADR**: N/A (operational policy, not architecture)\n\n---\n\n## Related\n\n- **Parent Epic**: #EPIC\n- **Priority**: P2 (long-term health)\n- **Quick Win**: Dependabot setup is <1 hour",
  "labels": ["refactor", "tech-debt", "security"],
  "assignees": [],
  "milestone": null
}
````

---

## 📋 CONSOLIDATED JSON PAYLOADS FOR API CALLS

### Usage Instructions

To create these issues in GitHub, use the GitHub REST API v3:

```bash
# Create Epic
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/Vibe-coding-nvm-delete-repo/yt/issues \
  -d @epic_payload.json

# Create Sub-Issues (repeat for each)
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/Vibe-coding-nvm-delete-repo/yt/issues \
  -d @sub_issue_T1_payload.json
```

### Epic Tasklist (with Temporary IDs)

Once issues are created, update the Epic description with actual issue numbers:

```markdown
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
```

---

## 🏷️ Labels to Create (if they don't exist)

```json
[
  { "name": "refactor", "color": "0E8A16", "description": "Code refactoring" },
  {
    "name": "tech-debt",
    "color": "D93F0B",
    "description": "Technical debt reduction"
  },
  {
    "name": "performance",
    "color": "FBCA04",
    "description": "Performance optimization"
  },
  {
    "name": "modularity",
    "color": "1D76DB",
    "description": "Code modularity improvement"
  },
  { "name": "ci", "color": "5319E7", "description": "CI/CD pipeline" },
  {
    "name": "observability",
    "color": "006B75",
    "description": "Monitoring and observability"
  },
  {
    "name": "security",
    "color": "B60205",
    "description": "Security and dependencies"
  },
  { "name": "docs", "color": "0075CA", "description": "Documentation" }
]
```

---

## ✅ COMPLETION CHECKLIST

After creating all issues:

- [ ] Epic issue created (#EPIC)
- [ ] All 12 sub-issues created (#T1-#T12)
- [ ] Epic description updated with actual issue numbers
- [ ] All labels applied correctly
- [ ] Issues linked to Epic (mentioned in sub-issue descriptions)
- [ ] Priority labels added if using priority system
- [ ] Milestone created if planning specific release
- [ ] Team notified of new issues

---

**END OF REFACTORING EPIC SPECIFICATION**

Generated: 2025-10-18  
Repository: `Vibe-coding-nvm-delete-repo/yt`  
Total Issues: 1 Epic + 12 Sub-Issues = 13 Issues
