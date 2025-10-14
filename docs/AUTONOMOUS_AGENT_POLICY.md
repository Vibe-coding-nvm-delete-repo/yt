# 🤖 Autonomous Agent Policy & Escalation Ladder (DEFINITIVE)

This policy defines strict boundaries, file allowlists/denylists, and a mandatory escalation process to ensure auditable, minimal, and safe code changes.

All contributors (human or agent) MUST declare a Mode in the PR and adhere to the Diff Budget and path rules below.

---

## Decision Escalation Ladder (How scope may expand)

### Mode 0 — Normal (Default)
- **Description**: Standard bug fix or feature implementation tied to an issue number.
- **Allow**: `app/**`, `src/**`, `tests/**`, `docs/**`.
- **Deny**: Root configs, dependencies, and CI (see Denylist below).
- **Action**: Proceed immediately.

### Mode 0.5 — Self-Initiated Refactor
- **Description**: Small, beneficial technical debt reduction (e.g., dead code removal, small type cleanup) not tied to an existing issue.
- **Rules**:
  - MUST NOT add/remove dependencies or change logic.
  - Max diff: ≤50 lines, ≤2 files.
- **Allow**: `app/**`, `src/**`, `tests/**`.
- **Action**: Announce switch in PR body; proceed. Use `refactor:` prefix in commit; state cleanup benefit.

### Mode 1 — LTRM (Local Tooling Repair Mode)
- **Description**: ONLY when baseline test/typecheck fails due to local configuration issues (Jest/tsconfig/scripts).
- **Temporarily Allow**: `jest.config.*`, `tsconfig*.json`, `tests/setup*.ts`, `package.json` (scripts + devDependencies only).
- **Deps**: Allow ONE devDependency addition (e.g., `@swc/jest` or `ts-jest`).
- **Lockfile**: Allow lockfile modification if a devDep is added.
- **Action**: Announce switch; proceed. Diff ≤120 lines, ≤2 files. Include 3–5 line RCA in commit.

### Mode 2 — CI_REPAIR_MODE
- **Description**: When workflows under `.github/**` are broken at baseline.
- **Allow**: ONLY `.github/**`.
- **Action**: Follow CI-Repair protocol (canary, tiny diff, pinned versions).

### Mode 3 — Scoped Override
- **Description**: A solution necessarily touches items outside Modes 0–2 (runtime deps, root configs, infra, or large asset addition).
- **Action**: STOP. Request human approval using the template in this doc. Changes limited only to approved paths.

### Mode 4 — Emergency Freeze (Stalled Work or High Risk)
- **Description**: Risk is high, impact unknown, ambiguity remains, or work is stalled pending human review.
- **Allow**: No file modifications allowed.
- **Action**: STOP. Report status and request immediate direction.

---

## “Ask Permission” — Exception Request Template (Mode 3)

The agent MUST use this template when proposing a Scoped Override (Mode 3):

```
🚨 OVERRIDE REQUEST (Mode 3 — Scoped)

Issue: #<NUM> — <TITLE>
Base ref: <ref/branch>
Why override is needed (≤5 lines):
- [What’s blocked, by what constraint, and why lesser modes are insufficient]

Options considered:
1) <Option A: minimal scope> — Pros/Cons, Est lines/files, Risk
2) <Option B: alt> — Pros/Cons, Est lines/files, Risk
3) <Option C: do nothing> — Impact

Proposed plan (chosen option):
- Paths touched (exact, must be saved to PROPOSED_FILES.txt): [files]
- Est diff: ~<lines>, <files> (Note: Diff budget applies to code/text; non-text assets are reviewed case-by-case)
- Dependency change: [npm install/update/remove, or N/A]
- Security/License Check: [brief summary of security review or N/A]
- Versioning Preference: [Caret (^), Tilde (~), or Pinned version]
- Rollback: `git revert <sha>` (single commit)
- Tests added: [file]
- Timebox: <N> hours

Evidence pack:
- Repro commands + outputs (tsc/test/build)
- Exact failing lines (file:line)
- Links (logs/builds)

APPROVAL NEEDED:
Reply with: APPROVE OVERRIDE: Mode 3 (Option X) and I’ll proceed.
```

---

## AGENT WORK ORDER (Feature/Bug) — Flexible w/ Overrides

### Core Policy & File Access
- Read vs. Write: Always permitted to read any file for context; ONLY modify files allowed by the current Mode.
- Non-Text Assets: Adding images/fonts/binaries is not permitted in Modes 0, 0.5, 1, or 2. Requires Mode 3 approval due to repo size/licensing.
- Initial Mode: Start in Mode 0 (Normal).

### Denylist (unless in approved Mode 1/2/3)
- `.github/**`, `scripts/**`, `.env*`, `.devcontainer/**`, `.vscode/**`, `Dockerfile*`, `vercel.*`, `eslint*`, `eslint.config.*`, `prettier*`, `tsconfig*.json` (unless Mode 1), `husky/**`, `package*.json` (unless Mode 1), `pnpm-lock.yaml` (unless Mode 1), `yarn.lock` (unless Mode 1), `jest.config.*` (unless Mode 1), `babel.config.*`.

### Diff Budget
- ≤300 lines, ≤4 files for Mode 0 unless otherwise specified above. No runtime dependency changes outside Mode 3.

### Stale Work Policy
- Mode 3 Blockage: If a Mode 3 Override Request receives no response in 72 hours, switch to Mode 4 (Emergency Freeze), report Stalled, and stop work.
- Stale PR Branch: If a PR is open 10 days with pending changes or no interaction, switch to Mode 4, mark PR as Stale, and request re-triage/closure.

### Continuous Improvement Mandate
- Proactively identify small opportunities to improve code health and process efficiency.
- If outside current scope and cannot be handled under Mode 0.5, DO NOT implement in the current PR.
- Draft a New Issue Proposal in the PR body with scope, justification, and estimated complexity.

---

## Acceptance Criteria (must pass)
- `npm run lint -- --max-warnings=0`
- `npx tsc --noEmit`
- `npm test -- --runInBand` (add/adjust ≥1 unit test)
- `npm run build`
- Behavior verified (steps in PR)
- Diff within budget & approved Mode
- No scope creep beyond approved Mode(s)
- Non-Functional Check 1 (Performance): No significant regression
- Non-Functional Check 2 (Security): No new vulnerabilities; secrets via defined mechanisms only
- Non-Functional Check 3 (i18n): No new user-facing strings hardcoded; use i18n utility

---

## Step 1 — Reproduce (Branch Setup)
```
git fetch origin
git switch -c ai/[ISSUE_NUMBER]-[kebab]-[YYYYMMDDHHmm] [BASE_REF]

npm ci
npx tsc --noEmit || true
npm run build || true
npm test -- --runInBand || true
```
Paste exact failures; declare Mode 1/2 need if applicable. Otherwise prepare Mode 3 request.

## Step 2 — Plan
- If estimated change exceeds Mode 0 budget by >50% (>450 lines or >6 files), propose breaking into smaller tasks.
- Include Technical Debt findings and New Issue Proposals (if any).
- List files to edit/create (exact).
- State up to 3 assumptions; in/out of scope (≤3 each).
- Cite relevant `docs/ENGINEERING_STANDARDS.md` rules.

## Step 3 — Implement
- Make minimal diffs within the approved Mode.
- Add/adjust ≥1 unit test.
- Pre-commit guard: run lint, typecheck, tests, build locally.
- Enforce allowlist/denylist & diff budget per Mode.
- If APPROVED_OVERRIDE is set, ensure staged files ⊆ `PROPOSED_FILES.txt`.

### Commit message
```
fix: [short-name] (Fixes #[ISSUE_NUMBER])
Mode: [0|0.5 Refactor|1 LTRM|2 CI_REPAIR|3 Scoped]
RCA: [3–5 lines]
Minimal fix: [1–2 lines]
Tests: [file]
```

## Step 4 — PR Hygiene (Review Preparation)
- Confirm no unapproved paths; all checks green; small diff + tests.
- PR body: What/Why/How-to-verify, Risks/Limitations, and:
  - 🧩 Conformance: Verified per `docs/ENGINEERING_STANDARDS.md`
  - Mode used: [0|0.5|1|2|3], Reason: [short]
  - New Issue Proposals (if applicable): paste structured proposals

## Step 5 — Open PR (Non-Merging Policy)
- PR Title MUST start with `/ai` when opened by an agent (e.g., `/ai fix: [short-name] (Fixes #<NUM>)`).
- Agents MUST NEVER merge their own PRs. Require human review and merging.
- Return PR URL, changed files list, test summary.

## Step 6 — Final Review & Handoff (Final Check)
- Cross-link to issue in PR description.
- Ensure all Acceptance Criteria are documented in PR.
- Provide links (logs/builds) in Evidence Pack.
- Report current CI status (e.g., "CI Pending" or "CI Green").
