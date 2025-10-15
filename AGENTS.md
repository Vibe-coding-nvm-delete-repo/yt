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
