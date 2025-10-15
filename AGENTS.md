# AGENTS.md

> AI coding agent briefing for this Next.js + TypeScript project.

## Core Commands

• **Lint**: `npm run lint` (zero warnings required)
• **Type-check**: `npm run typecheck` or `npx tsc --noEmit`
• **Type contracts**: `npm run type:contracts`
• **Tests**: `npm test -- --runInBand`
• **Full check (CI)**: `npm run check:ci`
• **Dev server**: `npm run dev` (starts on http://localhost:3000)
• **Build**: `npm run build`
• **Format**: `npm run format`

All changes must pass `npm run check:ci` before committing.

## Project Layout

```
src/
├─ app/               → Next.js 15 app directory (pages, layouts, routes)
├─ components/        → React components (UI layer only)
│  ├─ __tests__/      → Component tests
│  ├─ layout/         → Layout components
│  ├─ settings/       → Settings-related components
│  └─ ...
├─ contexts/          → React contexts (Settings, Toast, Error)
├─ domain/            → Domain logic (business rules, models)
├─ hooks/             → Custom React hooks
├─ lib/               → Shared utilities and helpers
├─ types/             → TypeScript type definitions
└─ utils/             → Utility functions
```

**Allowed paths**: `src/**`, `app/**`, `tests/**`, `docs/**`  
**DO NOT touch**: `.github/**`, `scripts/**`, `.env*`, CI workflows, `next.config.ts`

## Conventions & Patterns

### TypeScript
• **Strict mode enabled**: `noImplicitAny`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
• Use precise types and unions; avoid `any`
• Export typed interfaces/types from modules
• Path alias: `@/*` maps to `./src/*`

### Code Style
• Enforced by ESLint + Prettier (auto-formats on save)
• No `console.log` in production code
• `console.warn`/`console.error` allowed only for error reporting

### React/JSX
• Make small, incremental JSX edits (1–5 lines per change)
• Verify immediately with: lint → typecheck → test → build
• UI components must NOT import server/DB logic
• Each page must have exactly one `<h1>`
• All interactive controls must be accessible and labeled

### Testing
• Test runner: Jest + React Testing Library
• Place tests in `__tests__/` or as `*.test.ts(x)` near code
• Add/update tests for any new or changed behavior
• Maintain ≥60% coverage baseline

### Component Boundaries
• UI components in `src/components/` (no server logic)
• Domain logic in `src/domain/*`
• Shared utilities in `src/lib/*`
• Avoid circular dependencies
• Flag files >300 lines for future refactor (non-blocking)

## Git Workflow

1. **Never push to `main` directly**
2. Branch from `main`:
   • `feature/<short-slug>` or
   • `ai/<issue-number>-<short-name>-<YYYYMMDDHHmm>`
3. Commit using Conventional Commits:
   • Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`
   • Example: `feat: add X to Y (Fixes #43)`
4. Pre-commit hooks run lint-staged (auto-format + lint)
5. All checks must pass before PR merge: lint, typecheck, tests, build

## PR Requirements

Before requesting review, verify locally:
- [ ] `npm run check:ci` passes
- [ ] Tests added/updated covering changes
- [ ] Build passes: `npm run build`
- [ ] Docs updated if user-visible change
- [ ] Accessibility: single `<h1>`, labeled controls
- [ ] No secrets/PII in code or logs

## 🔍 Fix Verification Mandate

**Trigger**: This directive activates immediately after a fix is completed and a Pull Request is opened.

**Goal**: Perform final, objective verification to confirm the fix is complete, adheres to all governance policies, and introduces no regressions. Do NOT rely on local test results alone—treat this as an independent audit.

### Fix or Flag Rule

**Fix Immediately (Minor Issues)**: If the issue is minor (logic error, clean-up, missing log hook, policy violation), resolve it with a new commit and restart verification.

**Create New Issue (Major Issues)**: If the issue is systemic or architectural, create a new PQA issue and continue verification on the current PR.

### 1. Core Acceptance Criteria Check

- **Original Issue Resolved**: Provide evidence (log output, test output, screen validation) that the problem is 100% resolved
- **Test Coverage**: Confirm ≥1 unit test added/adjusted to cover the fix and prevent recurrence
- **Audit Score Improvement**: If issue was PQA-generated, confirm underlying score issue is structurally improved
- **Documentation Update**: Confirm all necessary docs (API refs, README, CHANGELOG) are updated
- **Functional Testing**: Confirm fix works across all scenarios including error flows and edge cases

### 2. Policy & Regression Check

- **Policy Compliance**: Confirm fix adhered to approved Execution Policy Mode; state final list of modified files
- **No New Warnings**: Re-run `npm run lint -- --max-warnings=0` and `npx tsc --noEmit`—confirm zero new warnings/errors (FAILURE = IMMEDIATE FIX/RETRY)
- **Regression Suite**: Run `npm test -- --runInBand`—confirm zero previously passing tests now fail
- **Deployment Artifact**: Run `npm run build`—confirm successful build with no unnecessary size regression
- **Operational Readiness**:
  - **Config Review**: If new env vars/secrets introduced, explicitly state names and flag for production setup
  - **Observability Hook**: Confirm logging/metrics/tracing hooks added for production monitoring

### 3. Architectural & Clean-Up Audit

- **Clean Artifacts**: Confirm zero commented-out code, `console.log`, or temporary test files in final diff (FAILURE = IMMEDIATE FIX/RETRY)
- **Dependency Delta**: Confirm no unnecessary new dependencies; all added deps in `package.json` are consumed
- **Architectural Integrity**: Confirm implementation adheres to agreed interface contracts and architectural boundaries
- **Future-Proofing & Systemic Flaws**:
  - **Minor Fixes**: If fix revealed simple refactoring opportunity (extract helper, simplify conditional), perform fix immediately and recommit
  - **Major Systemic Flaws**: If fix was blocked by deep structural flaw (poor schema, shared mutable state, legacy module), generate new high-priority PQA issue linking current PR

### 4. PR Hygiene Check

- **Branch Integrity**: Confirm branch name starts with `ai/` and PR title starts with `[fix/feat/refactor]:` including issue number
- **Artifact Review**: Confirm commit message contains required `Mode:` and `RCA:` sections
- **Non-Merge Rule**: Agent MUST NOT merge the PR—final action is to set status to "ready" and request human review

### Final Verification Output Format

```
✅ VERIFICATION STATUS: [PASS or FAIL]

---
### 🧪 Fix Audit for Issue #[ISSUE_NUMBER]

**Original Goal:** [Copy original acceptance criteria or PQA summary]

**1. Core Fix Status:**
* Issue Resolved: [PASS/FAIL] — [Evidence/Confirmation]
* New Test Added: [YES/NO] — [File reference]
* Docs Updated: [YES/NO] — [List files]
* Error Paths Validated: [PASS/FAIL]

**2. Policy & Regression Status:**
* Policy Mode Used: [Mode N] — Files Touched: [List]
* Linter/TS Check: [PASS/FAIL] — (Zero new warnings)
* Full Test Suite: [PASS/FAIL] — (Zero regressions)
* Deployment Build: [PASS/FAIL] — (Successful build)
* Operational Readiness: [PASS/FAIL] — (Config/Secrets: [list or N/A])

**3. Architectural & Clean-Up Status:**
* Clean Artifacts: [NO/YES] — (Zero console.logs or temp files)
* Dependency Audit: [PASS/FAIL] — (No unnecessary installs)
* Architectural Adherence: [PASS/N/A]
* Simplicity Audit: [PASS/FLAGGED] — (No new complexity, major issues flagged)

**4. Next Step:**
* If PASS: PR ready for human review—set to "Ready for Review" and assign to user
* If FAIL: Create follow-up commit to address failure and restart verification
```

## Security & Environment

• Never commit `.env*` or secrets
• Validate environment at build time
• Redact sensitive data in logs

## Architecture Guardrails

• Component hierarchy: UI → hooks → contexts → domain → lib
• No circular dependencies
• Prefer smaller modules
• Keep business logic separate from presentation

## External Services

• **OpenAI API**: Used for prompt generation/image analysis
• Environment variables should be in `.env.local` (not committed)

## Gotchas

• Next.js 15 with Turbopack enabled (`--turbopack` flag)
• React 19 is used (check for compatibility with hooks/APIs)
• Jest tests must run with `--runInBand` for stability
• TypeScript is configured with strict null checks and indexed access checks
• Husky pre-commit hooks auto-format but may fail on lint errors

## Reference Documentation

For deeper context, see:
• `docs/ENGINEERING_STANDARDS.md` - Complete development standards
• `docs/P0_ENFORCEMENT_SYSTEM.md` - Architecture guards and CI
• `docs/MERGE_CONFLICT_PREVENTION.md` - Branch protection setup
• `docs/DESIGN_SYSTEM.md` - UI/UX patterns
• `README.md` - Project overview

---

**TL;DR**: This is a strictly-typed Next.js 15 app with comprehensive pre-commit checks. Run `npm run check:ci` before every commit. Keep UI separate from business logic. Follow Conventional Commits. Never touch `.github/` or `scripts/`.
