# Simple Daily Rhythm

## During the day (per feature):

- Build feature → run Bug Sweep → add 1–2 tests → tiny refactor → merge.

## End of day (optional):

- If you spot bigger structural pain, open tech debt issues titled “Refactor: <module>” with 3 bullets (why, scope, acceptance).

## End of week / milestone:

- If several tech-debt issues cluster, run the Big Refactor PLAN prompt and do Stage 1 only. Keep it safe and small.

## Guardrails (keep these active)

- CI on every PR: lint, typecheck, test must be green.
- Branch protection on main (no direct pushes).
- “Global Rules” prompt at the start of every Cline session (the bumpers).
- Keep each PR single-purpose and small (easy to review, easy to revert).

## TL;DR

Yes—your sequence is right. Do the bug sweep → small tests → tiny refactor after each feature, then ship. Save big refactors for milestones and split them into small stages. Use the prompts above verbatim in Cline, one branch/PR per step, and you’ll stay fast and clean.
