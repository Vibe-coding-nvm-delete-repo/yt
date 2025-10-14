# Contributing Guide

Thank you for contributing! This guide summarizes how to propose changes safely and efficiently.

## Quick Start (TL;DR)
- Pick or open an issue with clear scope.
- Create a branch:
  - `feature/<short-slug>` (human) or `ai/<issue-number>-<short-name>-<YYYYMMDDHHmm>` (agent)
- Follow our Engineering Standards: see `docs/ENGINEERING_STANDARDS.md`.
- Declare a Mode in your PR and follow the acceptance checklist: see `docs/AUTONOMOUS_AGENT_POLICY.md`.
- Keep diffs small and focused; add/adjust at least one unit test.

## Pull Requests
- Use Conventional Commit messages in PR titles and commits.
- Include a clear PR body: What changed, Why, How to verify, Risks, Size.
- Ensure:
  - Lint clean: `npm run lint -- --max-warnings=0`
  - Typecheck clean: `npx tsc --noEmit`
  - Tests pass: `npm test -- --runInBand`
  - Build passes: `npm run build`

## Modes (Scope & Escalation)
- Start with **Mode 0 (Normal)**. For small cleanups, consider **Mode 0.5 (Refactor)**.
- Use **Mode 1 (Local Tooling Repair)** only to fix local config breakages (tsconfig/jest/scripts) with the limits described.
- **Mode 2 (CI Repair)** is only for `.github/**` workflow fixes.
- If you must touch disallowed paths or add runtime deps, request **Mode 3 (Scoped Override)** using the template in `docs/AUTONOMOUS_AGENT_POLICY.md`.
- If risk is high or you are blocked, use **Mode 4 (Emergency Freeze)** and request guidance.

## Communication & Review
- Link the issue number in your PR title and description.
- Avoid scope creep; propose follow-ups as separate issues if needed.
- Respond to review feedback promptly; keep PRs under ~300 added lines and 4 files when possible.

For full details, read `docs/AUTONOMOUS_AGENT_POLICY.md`.
