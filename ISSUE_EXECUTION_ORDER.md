# Issue Execution Order & Implementation Roadmap

## Overview

This document provides the recommended execution order for all 18 open issues, organized by priority, dependencies, and team capacity.

## Quick Reference

| Phase                  | Issues                       | Priority | Total Effort | Timeline           |
| ---------------------- | ---------------------------- | -------- | ------------ | ------------------ |
| 1 - Critical Fixes     | #182, #180, #181             | P1       | ~3 hours     | Week 1, Days 1-2   |
| 2 - High Priority      | #188, #187, #186             | P2       | ~4 hours     | Week 1-2, Days 3-5 |
| 3 - Quick Wins         | #189, #185, #184, #183       | P3       | ~1.5 hours   | Week 2, Day 1      |
| 4 - PQA Infrastructure | #128, #125, #126, #127, #129 | P2       | ~30-40 hours | Weeks 3-6          |
| 5 - Features           | #137, #37                    | P2/P3    | Variable     | Ongoing            |

## Detailed Execution Order

### 🔴 Phase 1: Critical Blockers (MUST FIX FIRST)

**Objective:** Unblock development workflow (testing, builds, commits)
**Timeline:** Week 1, Days 1-2
**Total Effort:** ~3 hours

#### 1. Issue #182: Testing: Missing ts-jest preset blocks all test execution

**Why First:** Blocks ALL testing across entire project

- **Priority:** P1 (Critical)
- **Difficulty:** Easy
- **Effort:** 15 minutes
- **Dependencies:** None
- **Assignee:** Any developer (Good first issue for new team members)

**Implementation Steps:**

1. Install ts-jest: `npm install --save-dev ts-jest @types/jest`
2. Fix jest.config typo: `moduleNameMapping` → `moduleNameMapper`
3. Run tests: `npm test -- --runInBand`
4. Verify all tests pass

**Success Criteria:**

- [ ] Tests execute without preset error
- [ ] All existing tests pass
- [ ] CI test step succeeds

**Estimated Completion:** Day 1, Morning

---

#### 2. Issue #180: TypeScript: Fix exactOptionalPropertyTypes error in UsageTab

**Why Second:** Blocks production builds

- **Priority:** P1 (Critical)
- **Difficulty:** Medium
- **Effort:** 30 minutes
- **Dependencies:** None
- **Assignee:** Developer familiar with TypeScript strict mode

**Implementation Steps:**

1. Review `src/components/UsageTab.tsx:20`
2. Implement conditional object construction (avoid explicit `undefined`)
3. Update `UsageFilter` type if needed
4. Run: `npm run build`
5. Verify build succeeds

**Success Criteria:**

- [ ] TypeScript compilation succeeds
- [ ] Production build completes
- [ ] No type errors in UsageTab

**Estimated Completion:** Day 1, Late Morning

---

#### 3. Issue #181: ESLint: Direct DOM manipulation in SettingsTab blocks commits

**Why Third:** Blocks git commits via pre-commit hook

- **Priority:** P1 (Critical)
- **Difficulty:** Medium
- **Effort:** 1-2 hours
- **Dependencies:** None
- **Assignee:** React developer

**Implementation Steps:**

1. Review `src/components/SettingsTab.tsx` lines 170, 171, 287, 289
2. Replace `document.getElementById` with React refs
3. Replace `appendChild`/`removeChild` with React state
4. Add unit tests for affected functionality
5. Run: `npm run lint` and `npm test`
6. Test commit: `git commit -m "test"`

**Success Criteria:**

- [ ] No direct DOM manipulation
- [ ] Pre-commit hook passes
- [ ] Component behavior unchanged
- [ ] Tests verify functionality

**Risk:** Medium - Could introduce behavioral changes. Needs thorough testing.

**Estimated Completion:** Day 2, End of Day

---

**Phase 1 Checkpoint:**

- ✅ All tests can run
- ✅ Production builds succeed
- ✅ Developers can commit freely

---

### 🟡 Phase 2: High-Priority Code Quality

**Objective:** Improve type safety and error handling
**Timeline:** Week 1-2, Days 3-5
**Total Effort:** ~4 hours

#### 4. Issue #188: TypeScript: Fix 'any' type usage in error handling code

**Why Fourth:** Type safety is foundation for error handling improvements

- **Priority:** P2 (High)
- **Difficulty:** Medium
- **Effort:** 1 hour
- **Dependencies:** None
- **Assignee:** TypeScript-experienced developer

**Implementation Steps:**

1. Review `src/types/errors.ts` lines 37 and 152
2. Replace `any` with `unknown` or specific types
3. Add type guards where needed
4. Update consuming code
5. Run: `npx tsc --noEmit`

**Success Criteria:**

- [ ] Zero `any` types in error handling
- [ ] Type guards implemented
- [ ] No TypeScript errors

**Estimated Completion:** Day 3

---

#### 5. Issue #187: ESLint: React Hooks dependency warnings in SettingsTab

**Why Fifth:** Prevents subtle runtime bugs from stale closures

- **Priority:** P2 (High)
- **Difficulty:** Medium
- **Effort:** 1 hour
- **Dependencies:** None
- **Assignee:** React hooks expert

**Implementation Steps:**

1. Review `src/components/RatingTab.tsx:93`
2. Review `src/components/SettingsTab.tsx:762`
3. Add missing dependencies or use functional updates
4. Test component behavior thoroughly
5. Run: `npm run lint`

**Success Criteria:**

- [ ] Zero hooks dependency warnings
- [ ] Component behavior verified
- [ ] No stale closure bugs

**Risk:** Medium - Could change component behavior. Needs thorough testing.

**Estimated Completion:** Day 4

---

#### 6. Issue #186: ESLint: Improve error handling with try-catch blocks

**Why Sixth:** Builds on #188 error types

- **Priority:** P2 (High)
- **Difficulty:** Medium
- **Effort:** 1-2 hours
- **Dependencies:** #188 (error types)
- **Assignee:** Any mid-level developer

**Implementation Steps:**

1. Add try-catch to `src/components/ImageToPromptTab.tsx:229`
2. Add error handling to `src/lib/batchQueue.ts:60`
3. Add error handling to `src/utils/retry.ts:39`
4. Use existing error utilities from `src/lib/errorUtils.ts`
5. Run: `npm run lint` and test error flows

**Success Criteria:**

- [ ] All async operations have error handling
- [ ] Error messages show to users
- [ ] No unhandled promise rejections

**Estimated Completion:** Day 5

---

**Phase 2 Checkpoint:**

- ✅ Type safety improved
- ✅ No React hooks warnings
- ✅ Comprehensive error handling

---

### 🟢 Phase 3: Quick Wins (Code Quality Cleanup)

**Objective:** Fast, low-risk improvements for code cleanliness
**Timeline:** Week 2, Day 1
**Total Effort:** ~1.5 hours
**Note:** These can be batched into a single PR

#### 7. Issue #189: Testing: Fix empty block statements in test files

- **Priority:** P3 (Medium)
- **Difficulty:** Easy
- **Effort:** 30 minutes
- **Dependencies:** #182 (tests must run first)
- **Files:** `src/__tests__/integration.test.ts`, `src/utils/__tests__/retry.test.ts`

**Implementation:**

```typescript
// Replace empty catch blocks with proper assertions
await expect(operation()).rejects.toThrow();
```

---

#### 8. Issue #185: TypeScript: Use ts-expect-error instead of ts-ignore

- **Priority:** P3 (Medium)
- **Difficulty:** Easy (1 line change)
- **Effort:** 5 minutes
- **File:** `src/hooks/useResponsive.ts:59`

**Implementation:**

```typescript
// @ts-expect-error - [reason for suppression]
problematicCode();
```

---

#### 9. Issue #184: ESLint: Unused variables and imports cleanup needed

- **Priority:** P3 (Medium)
- **Difficulty:** Easy
- **Effort:** 30 minutes
- **Files:** Multiple (ErrorContext, useErrorHandler, storage-optimized)

**Implementation:**

1. Remove unused imports
2. Check if `storage-optimized.ts` is used at all (may delete entire file)
3. Run: `npm run lint -- --fix`

---

#### 10. Issue #183: TypeScript: Inconsistent type imports throughout codebase

- **Priority:** P3 (Medium)
- **Difficulty:** Easy (auto-fixable)
- **Effort:** 15 minutes
- **Files:** ErrorBoundary, ErrorContext, useErrorHandler, validation-types

**Implementation:**

```bash
npm run lint -- --fix
```

---

**Phase 3 Batch PR:**

- Combine issues #189, #185, #184, #183 into single PR
- Total time: ~1.5 hours
- Title: "chore: code quality cleanup (Fixes #189, #185, #184, #183)"

**Phase 3 Checkpoint:**

- ✅ No empty test blocks
- ✅ Consistent TypeScript suppressions
- ✅ No unused code
- ✅ Consistent type imports

---

### 🔵 Phase 4: PQA Automation Infrastructure

**Objective:** Implement automated quality assurance system
**Timeline:** Weeks 3-6
**Total Effort:** ~30-40 hours
**Note:** Requires DevOps/CI expertise

**Parent Issue:** #124 (PQA Automation Rollout - Tracking Epic)

#### Order of Implementation:

```
#124 (Epic Tracking)
  └── #128 (Triage Tooling) ← DO THIS FIRST
        ├── #125 (PR Fast Checks)
        ├── #126 (Nightly Scan) ← Depends on #128
        ├── #127 (Weekly Scan) ← Depends on #128
        └── #129 (Monthly Reports) ← Depends on #126, #127, #128
```

---

#### 11. Issue #128: Tooling: PQA triage (de-dup + PII masking) and reporting

**Why First in Phase 4:** Foundation for automated issue filing

- **Priority:** P2 (High)
- **Difficulty:** Hard
- **Effort:** 8-12 hours
- **Dependencies:** None
- **Assignee:** Senior developer with scripting experience

**Deliverables:**

- CLI tool: `scripts/pqa_triage.sh`
- PII masking for logs
- De-duplication against existing issues
- JSON output for dashboards

**Success Criteria:**

- [ ] CLI supports `--min-priority`, `--mode`, `--artifact` flags
- [ ] Successfully masks PII in test logs
- [ ] Detects duplicate issues
- [ ] Emits structured JSON

**Estimated Completion:** Week 3

---

#### 12. Issue #125: CI: PR fast checks (S-1/S-4) - incremental and cached

- **Priority:** P2 (High)
- **Difficulty:** Hard
- **Effort:** 4-8 hours
- **Dependencies:** #124
- **Assignee:** DevOps engineer

**Deliverables:**

- GitHub Action: `.github/workflows/pqa-pr.yml`
- Incremental scanning (changed files only)
- Cache strategy

**Success Criteria:**

- [ ] Runtime ≤ 3 min median, 5 min p95
- [ ] Non-blocking for low severity
- [ ] Artifacts uploaded

**Estimated Completion:** Week 4

---

#### 13. Issue #126: CI: Nightly full PQA scan on main - auto-file Priority >= 6

- **Priority:** P2 (High)
- **Difficulty:** Hard
- **Effort:** 6-10 hours
- **Dependencies:** #124, #128
- **Assignee:** DevOps engineer

**Deliverables:**

- GitHub Action: `.github/workflows/pqa-nightly.yml`
- Scheduled weekday runs
- Auto-file issues with de-dup
- Rate limiting (≤10 issues/day)

**Success Criteria:**

- [ ] Runs nightly on main
- [ ] De-duplicates issues
- [ ] Posts summary to #124
- [ ] Rate-limited

**Estimated Completion:** Week 5

---

#### 14. Issue #127: CI: Weekly deep scan focus (S-3/S-6) - rotated directories

- **Priority:** P2 (High)
- **Difficulty:** Hard
- **Effort:** 4-8 hours
- **Dependencies:** #124, #128
- **Assignee:** DevOps engineer

**Deliverables:**

- GitHub Action: `.github/workflows/pqa-weekly.yml`
- Directory rotation strategy
- Performance focus

**Success Criteria:**

- [ ] Runtime ≤ 45 minutes
- [ ] Rotates focus areas
- [ ] Actionable findings

**Estimated Completion:** Week 5

---

#### 15. Issue #129: Reporting: Monthly PQA trends and audit summary

- **Priority:** P2 (High)
- **Difficulty:** Medium
- **Effort:** 4-6 hours
- **Dependencies:** #124, #126, #127, #128
- **Assignee:** Developer with data/reporting skills

**Deliverables:**

- Monthly report generator
- Markdown report output
- Trend analysis

**Success Criteria:**

- [ ] Generates monthly report
- [ ] Attaches to #124 epic
- [ ] Links to created/closed issues
- [ ] Suggests improvements

**Estimated Completion:** Week 6

---

**Phase 4 Checkpoint:**

- ✅ PR checks running in < 5 min
- ✅ Nightly scans auto-filing issues
- ✅ Weekly performance scans
- ✅ Monthly trend reports
- ✅ False positive rate < 20%

---

### 🟣 Phase 5: Features & Ongoing Improvements

**Objective:** Feature enhancements and continuous refactoring
**Timeline:** Ongoing
**Total Effort:** Variable

#### 16. Issue #137: Add Usage & Cost tracking tab with detailed logs

- **Priority:** P2 (High)
- **Difficulty:** Medium-Hard
- **Effort:** 8-16 hours
- **Dependencies:** None
- **Assignee:** Full-stack developer

**Deliverables:**

- New Usage & Cost tab component
- Detailed logging for all API calls
- Total cost display in header
- Clickable images in logs

**Success Criteria:**

- [ ] Tab shows all generations
- [ ] Logs include: model, tokens, costs, image
- [ ] Total cost always visible
- [ ] OpenRouter calls tracked

**Estimated Completion:** 2-3 weeks

---

#### 17. Issue #37: Overly complex functions needing refactoring

- **Priority:** P3 (Medium)
- **Difficulty:** Medium-Hard
- **Effort:** 4-12 hours per file
- **Dependencies:** None
- **Assignee:** Any developer during downtime

**Files to Refactor:**

1. `src/lib/openrouter.ts` - getVisionModels method
2. `src/lib/storage.ts` - SettingsStorage class
3. `src/hooks/useSettings.ts` - updateSettings method

**Approach:**

- Break down into smaller sub-issues
- Tackle one file at a time
- Add unit tests for extracted functions
- Document architectural decisions

**Success Criteria:**

- [ ] Functions < 50 lines
- [ ] Single responsibility per function
- [ ] Unit tests for components
- [ ] Improved maintainability

**Estimated Completion:** Ongoing, 1 file per sprint

---

## Parallel Work Opportunities

### Week 1

- **Parallel Track A:** #182, #180, #181 (1 developer)
- **Parallel Track B:** Can start documentation updates

### Week 2

- **Parallel Track A:** #188, #187, #186 (1 developer)
- **Parallel Track B:** #189, #185, #184, #183 (1 developer - quick wins)

### Weeks 3-6

- **Parallel Track A:** #128 (1 senior dev)
- **Parallel Track B:** #137 (1 full-stack dev)
- **Parallel Track C:** Documentation and planning for #125-127

### Ongoing

- **Parallel Track:** #37 (any developer during downtime)

## Risk Management

### High-Risk Items (Require Extra Review)

1. **#181** - DOM refactoring could break functionality
   - **Mitigation:** Comprehensive testing, manual QA
2. **#126-127** - Auto-filing could spam issues
   - **Mitigation:** Rate limiting, dry-run mode first

### Medium-Risk Items (Standard Review)

1. **#187** - Hooks changes could alter behavior
   - **Mitigation:** Thorough testing, code review
2. **#137** - Feature scope could expand
   - **Mitigation:** Clear requirements, MVP first

## Dependencies Graph

```
Phase 1 (Critical)
#182 ─────────────────┐
                      ├─→ Phase 2 (High Priority)
#180 ─────────────────┤   #188 ──────┐
                      │              ├─→ Phase 3 (Quick Wins)
#181 ─────────────────┘   #187       │   #189 (depends on #182)
                          #186 ──────┘   #185
                                          #184
                                          #183

Phase 4 (PQA Infrastructure)
#124 (Epic) ──→ #128 (Triage) ──┬─→ #125 (PR Checks)
                                ├─→ #126 (Nightly) ──┐
                                ├─→ #127 (Weekly) ───┼─→ #129 (Reports)
                                └────────────────────┘

Phase 5 (Features)
#137 (Independent)
#37 (Ongoing, Independent)
```

## Team Recommendations

### Suggested Team Roles

- **Critical Fixes Lead:** Mid-level React/TS developer (Phase 1-2)
- **Code Quality Lead:** Junior developer (Phase 3)
- **DevOps Lead:** Senior DevOps engineer (Phase 4)
- **Feature Lead:** Full-stack developer (Phase 5)

### Expertise Requirements

| Phase | Required Skills                          |
| ----- | ---------------------------------------- |
| 1-2   | TypeScript, React, Jest                  |
| 3     | ESLint, TypeScript basics                |
| 4     | GitHub Actions, Bash scripting, Security |
| 5     | Full-stack, React, API integration       |

## Success Metrics

### Phase 1 Metrics

- [ ] Test execution success rate: 100%
- [ ] Build success rate: 100%
- [ ] Pre-commit hook pass rate: 100%

### Phase 2-3 Metrics

- [ ] TypeScript errors: 0
- [ ] ESLint warnings: 0
- [ ] Code coverage: ≥60%

### Phase 4 Metrics

- [ ] PR check latency: p95 ≤ 5 min
- [ ] Nightly scan success: ≥95%
- [ ] False positive rate: <20%
- [ ] Weekly triage time: ≤2 hours

### Phase 5 Metrics

- [ ] Feature adoption rate
- [ ] Cost tracking accuracy
- [ ] Code maintainability score improvement

## Timeline Summary

| Week | Focus                          | Expected Outcomes                          |
| ---- | ------------------------------ | ------------------------------------------ |
| 1    | Critical Fixes + High Priority | All blockers removed, type safety improved |
| 2    | Quick Wins + Documentation     | Clean codebase, updated docs               |
| 3    | PQA Triage Tooling             | Foundation for automation                  |
| 4    | PQA PR Checks                  | Automated PR quality gates                 |
| 5    | PQA Nightly/Weekly Scans       | Proactive issue detection                  |
| 6    | PQA Reporting                  | Monthly trend analysis                     |
| 7+   | Features & Refactoring         | Usage tracking, ongoing improvements       |

## Next Actions

1. **Immediate (Today):**
   - [ ] Apply labels to all 18 issues (see `ISSUE_LABELING_SCRIPT.md`)
   - [ ] Create milestones: "Critical Fixes", "PQA Automation"
   - [ ] Assign #182 to available developer

2. **This Week:**
   - [ ] Complete Phase 1 (Critical Fixes)
   - [ ] Start Phase 2 (High Priority)
   - [ ] Update ENGINEERING_STANDARDS.md

3. **This Month:**
   - [ ] Complete Phases 1-3
   - [ ] Begin Phase 4 planning
   - [ ] Start #137 (Usage tracking)

4. **This Quarter:**
   - [ ] Complete PQA automation (Phase 4)
   - [ ] Establish quality metrics baseline
   - [ ] Begin #37 refactoring

---

**Document Version:** 1.0
**Created:** 2025-10-18
**Author:** GitHub Copilot Agent
**Status:** Ready for Implementation
