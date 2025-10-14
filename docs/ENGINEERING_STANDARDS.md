# Engineering Standards

This document defines the minimal, enforceable standards for this repository to ensure fast, safe iteration.

## 1) Scope and Allowed Changes
- Allowed paths: `app/**`, `src/**`, `tests/**`, `docs/**`
- Do NOT touch: `.github/**`, `scripts/**`, environment files (`.env*`), CI workflows
- Idempotency: Re-running changes must update in place; no duplicate files or redundant commits
- Accessibility: Each page must contain exactly one `<h1>`; all interactive controls must be accessible and labeled

See also: `docs/AUTONOMOUS_AGENT_POLICY.md` for the definitive Mode ladder, escalation, diff budgets, and acceptance criteria that agents and contributors must follow when proposing changes.

## 2) Branching and Merge Policy
- Never push to `main` directly
- Create feature branches using:
  - `feature/<short-slug>` or
  - `ai/<issue-number>-<short-name>-<YYYYMMDDHHmm>`
- Open PR to `main`; ensure lint, typecheck, tests are green before requesting review
- Merge policy (solo mode): one approved review or explicit self-check with all checks green; rebase/merge without conflicts only

## 3) Commit Message Convention
- Use Conventional Commits
  - Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`
  - Example: `feat: add X to Y (Fixes #43)`
- Prefer small, focused commits

## 4) Lint, Typecheck, Formatting
- Lint must pass with zero warnings:
  - `npm run lint -- --max-warnings=0`
- TypeScript must compile cleanly:
  - `npx tsc --noEmit`
- Formatting: Prettier (respect repo settings)
- Production code: No `console.log`; `console.warn`/`console.error` allowed only for error reporting in non-production dev flows

## 5) TypeScript & React/JSX Rules
- TypeScript:
  - Prefer precise types and unions; avoid `any`
  - Export typed interfaces/types from modules
- React/JSX:
  - Make tiny JSX edits (1–5 lines per change) with immediate local validation
  - Local verification loop:
    - `npm run lint -- --max-warnings=0`
    - `npx tsc --noEmit`
    - `npm test -- --runInBand`
    - `npm run build` (when relevant)
  - Emergency JSX repair:
    - `git checkout HEAD -- <file>`
    - Re-run the loop above and apply minimal fixes

## 6) Testing Requirements
- Add or adjust at least one unit test for any new or changed behavior
- Test runner: Jest
- Run tests:
  - `npm test -- --runInBand`
- Coverage baseline: maintain reasonable coverage (≥60% global in CI if configured); increase over time
- Test placement:
  - Co-locate under `__tests__/` or as `*.test.ts(x)` near the code

## 7) Architecture Guardrails
- Component boundaries: UI components must not import server/DB logic
- Avoid circular dependencies
- Prefer smaller modules; flag files >300 lines for future refactor (non-blocking)
- Keep domain logic in `src/domain/*` and shared utilities in `src/lib/*`

## 8) Security & Secrets
- Never commit `.env*` or secrets
- Validate environment at startup/build when the validation script is available (e.g., `npm run typecheck` or a dedicated env validation step)
- Redact sensitive data in logs; use `console.warn`/`console.error` judiciously

## 9) PR Checklist (copy into PR description)
- [ ] Tests added/updated covering changes
- [ ] Lint + typecheck pass locally
- [ ] Build passes locally
- [ ] Docs updated if user-visible change
- [ ] ADR/Decision needed? Linked or state “N/A”
- [ ] Accessibility: single `<h1>`, labeled controls

## 10) Commands Reference
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`
- Tests: `npm test`
- Build: `npm run build`
- Dev: `npm run dev`

## 11) Feature Development Definition of Done (DoD)

Use this section when building any new feature or changing behavior.

- Planning & Scope
  - Acceptance criteria defined and linked to issue/epic
  - Decision captured (ADR) for non-trivial design choices or state "N/A"
- Compatibility & Rollout
  - Backward compatible by default; document breaking changes and migration path if unavoidable
  - Prefer feature flag/toggle with safe defaults and a kill switch
  - Rollout plan and rollback plan defined (how to disable or revert)
- Observability & Performance
  - Logging/metrics/traces updated where useful; avoid noisy logs in production
  - Performance budgets respected; verify no obvious regressions locally
- Security, Privacy, Accessibility
  - No secrets/PII in code or logs; run dependency audit if deps change
  - UI changes meet a11y basics (labels, keyboard nav, color contrast)
- Data & APIs
  - API/schema changes documented; dependent consumers updated or coordinated
  - Data/storage migrations include scripts, tests, and rollback plan or "N/A"
- Quality & Documentation
  - Tests added/updated (unit/integration/e2e as appropriate)
  - Developer and user docs updated where applicable
  - PR includes clear What/Why/How to verify + Risks + Size

See also: `docs/P0_ENFORCEMENT_SYSTEM.md` and `docs/MERGE_CONFLICT_PREVENTION.md` for automated and procedural safeguards.
