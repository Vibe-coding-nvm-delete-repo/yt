// Default values for Prompt Creator configuration

export const DEFAULT_LOCKED_IN_PROMPT = `🤖 Autonomous Agent Policy & Escalation Ladder (DEFINITIVE)
This policy defines the strict boundaries, file allowlists/denylists, and mandatory escalation process to ensure auditable, minimal, and safe code changes.

Decision Escalation Ladder (How the AI may expand scope)
Mode 0 — Normal (Default)
Description: Standard bug fix or feature implementation tied to an issue number.
Scope Rules:

Allow: app/**, src/**, tests/**, docs/**.

Deny: All root configs, dependencies, and CI UNLESS YOU BELIEVE UNEQUIVOCALLY AND CONCLUSIVELY THAT THESE MUST BE CHANGED IN ORDER TO FIX A CORE ISSUE! NEVER EVER EVER HOLD BACK FROM MAKING A CHANGE IF YOU THINK IT'S DEFINITIVELY NECESSARY TO PROVIDE A FIX OR SET OF FIXES TO AN ISSUE/FEATURE/ETC!
Action: Proceed immediately.

Mode 0.5 — Self-Initiated Refactor
Description: Used for small, beneficial technical debt reduction (e.g., dead code removal, small type-cleanup) not tied to an existing issue.
Scope Rules:

Must NOT include adding/removing dependencies or changing logic.

Max diff: ≤50 lines, ≤2 files.

Allow: app/**, src/**, tests/**.
Action: Announce switch, proceed immediately. Must use refactor: commit prefix and state the cleanup benefit in the PR body.

Mode 1 — LTRM (Local Tooling Repair Mode)
Description: Used ONLY when baseline test/typecheck fails due to local configuration issues (Jest/tsconfig/scripts).
Scope Rules:

Temporarily Allow: jest.config.*, tsconfig*.json, tests/setup*.ts, package.json (scripts + devDependencies only).

Allow ONE devDep addition (@swc/jest or ts-jest).

Allow lockfile modification (package-lock.json, pnpm-lock.yaml, or yarn.lock) if a devDep is added.
Action: Announce switch, proceed immediately. Diff ≤120 lines, ≤2 files. Must include 3–5 line RCA in commit.

Mode 2 — CI_REPAIR_MODE
Description: Used when workflows under .github/** are broken at baseline.
Scope Rules:

Only .github/** is allowed.
Action: Follow your CI-Repair Protocol (canary, tiny diff, pinned versions).

Mode 3 — Scoped Override
Description: A solution necessarily touches items outside Modes 0-2 (runtime deps, root configs, infra, or large asset addition).
Scope Rules:

Agent must request permission first using the template. Changes are limited only to paths explicitly listed in the approved request.
Action: Stop. Request human approval (must receive APPROVED_OVERRIDE token).

Mode 4 — Emergency Freeze (Stalled Work or High Risk)
Description: Risk is high, impact is unknown, ambiguity remains, or work is stalled pending human review.
Scope Rules:

No file modifications allowed.
Action: Stop. Report status and request immediate human direction.

🚨 "Ask Permission" — Exception Request Template (Mode 3)
The agent MUST use this template when proposing a Scoped Override (Mode 3).

🚨 OVERRIDE REQUEST (Mode 3 — Scoped)

Issue: #<NUM> — <TITLE>
Base ref: <ref/branch>
Why override is needed (≤5 lines):
- [What's blocked, by what constraint, and why lesser modes are insufficient]

Options considered:
1) <Option A: minimal scope> — Pros/Cons, Est lines/files, Risk
2) <Option B: alt> — Pros/Cons, Est lines/files, Risk
3) <Option C: do nothing> — Impact

Proposed plan (chosen option):
- Paths touched (exact, must be saved to PROPOSED_FILES.txt): [files]
- Est diff: ~<lines>, <files> (Note: Diff budget applies to code/text; non-text assets are reviewed case-by-case)
- **Dependency change:** [npm install/update/remove, or N/A]
- **Security/License Check:** [brief summary of security review or N/A]
- **Versioning Preference:** [State preference: Caret (^), Tilde (~), or Pinned version]
- Rollback: \`git revert <sha>\` (single commit)
- Tests added: [file]
- Timebox: <N> hours

Evidence pack:
- Repro commands + outputs (tsc/test/build)
- Exact failing lines (file:line)
- Links (logs/builds)

APPROVAL NEEDED:
Reply with: **APPROVE OVERRIDE: Mode 3 (Option X)** and I'll proceed.



📋 AGENT WORK ORDER (Feature/Bug) — Flexible w/ Overrides
Core Policy & File Access
Read vs. Write: The agent is always permitted to read any file for context, but can only modify files listed in the current approved Mode's allowlist.

Non-Text Assets: Adding non-text assets (images, fonts, binaries) is not permitted in Modes 0, 0.5, 1, or 2. They require Mode 3 Scoped Override approval due to potential repo size/licensing implications.

Initial Mode: Start in Mode 0 (Normal).

Denylist: .github/**, scripts/**, .env*, .devcontainer/**, .vscode/**, Dockerfile*, vercel.*, eslint*, eslint.config.*, prettier*, tsconfig*.json (unless Mode 1), husky/**, package*.json (unless Mode 1), pnpm-lock.yaml (unless Mode 1), yarn.lock (unless Mode 1), jest.config.* (unless Mode 1), babel.config.*.

Diff Budget: ≤**300** lines, ≤**4** files. No runtime deps.

Stale Work Policy
Mode 3 Blockage: If the agent submits a Mode 3 Override Request and does not receive a response (approval or denial) within 72 hours, the agent MUST automatically switch to Mode 4 (Emergency Freeze), report the issue as Stalled, and stop work on the task.

Stale PR Branch: If a Pull Request (PR) has been open for 10 days with pending requested changes or without human interaction, the agent MUST automatically switch to Mode 4 (Emergency Freeze), mark the PR as Stale, and request human re-triage or closure.

Continuous Improvement Mandate
The agent is mandated to prioritize code health and process efficiency.

TD Identification: During planning and implementation, the agent MUST actively look for opportunities to reduce unnecessary technical debt, improve testing (coverage/speed/clarity), or optimize development flow.

Scope Boundary: If an identified improvement/bug is outside the current issue's direct scope and cannot be handled safely under Mode 0.5 (Self-Initiated Refactor), the agent MUST NOT implement the fix in the current PR.

New Issue Proposal: The agent must draft a proposal for a new issue containing the scope, justification, and estimated complexity for the recommended change. This proposal must be included in the PR body for review.

Acceptance Criteria
✅ npm run lint -- --max-warnings=0

✅ npx tsc --noEmit

✅ npm test -- --runInBand (add/adjust ≥1 unit test)

✅ npm run build

✅ Behavior verified (steps in PR)

✅ Diff within budget & approved mode

✅ No scope creep beyond approved mode(s)

✅ Non-Functional Check 1 (Performance): No change introduces a significant performance regression (e.g., increased memory usage, blocking UI threads, or significant latency increase).

✅ Non-Functional Check 2 (Security): No new security vulnerabilities are introduced; all environment variables/secrets are handled via defined mechanisms, not hardcoded.

✅ Non-Functional Check 3 (i18n): No new user-facing strings are hardcoded in source files (.js, .ts, .jsx, .tsx, etc.). All strings must be added using the project's standard internationalization (i18n) utility or system.

Step 1 — Reproduce (Branch Setup)
Branching Policy: The agent MUST create a new, distinct branch for every issue, starting with the /ai prefix.

git fetch origin
git switch -c ai/[ISSUE_NUMBER]-[kebab]-[YYYYMMDDHHmm] [BASE_REF]

npm ci
npx tsc --noEmit || true
npm run build || true
npm test -- --runInBand || true



Paste exact failures; declare Mode 1/2 need if applicable. Otherwise prepare Mode 3 request.

Step 2 — Plan
Complexity Check: If the estimated change exceeds the Mode 0 budget by more than 50% (>450 lines or >6 files), the agent must propose breaking the task into smaller, independent sub-tasks before proceeding. (See Policy on Task Decomposition).

Technical Debt Review: Include any findings or New Issue Proposals from the Continuous Improvement Mandate here.

Files to edit/create (exact list).

Assumptions (≤3).

In scope (≤3) / Out of scope (≤3).

Cite relevant docs/ENGINEERING_STANDARDS.md rules.

Step 3 — Implement
Make minimal diffs in the currently approved mode.

Add/adjust one unit test.

Pre-commit guard

Enforce allowlist/denylist & diff budget per mode.

If APPROVED_OVERRIDE is set, ensure staged files ⊆ PROPOSED_FILES.txt.

Merge Conflict Resolution Policy:

If a merge conflict is encountered during development or before staging, the agent MUST rebase the current branch against the base ref (git rebase [BASE_REF]).

The agent MUST resolve all conflicts locally and verify that all acceptance criteria still pass before committing.

Commit message

fix: [short-name] (Fixes #[ISSUE_NUMBER])
Mode: [0|0.5 Refactor|1 LTRM|2 CI_REPAIR|3 Scoped]
RCA: [3–5 lines]
Minimal fix: [1–2 lines]
Tests: [file]



Step 4 — PR Hygiene (Review Preparation)
Confirm no unapproved paths, all checks green, small diff + tests.

PR body: What/Why/How-to-verify, Risks/Limitations, and:

🧩 Conformance: Verified per [ENGINEERING_STANDARDS.md]
Mode used: [0|0.5|1|2|3], Reason: [short]

[New Issue Proposals (if applicable): Paste structured proposals here for human review.]



Step 5 — Open PR (Non-Merging Policy)
PR Title Policy: The PR title MUST start with the /ai prefix to ensure immediate visibility and flagging for review. Example: /ai fix: [short-name] (Fixes #<NUM>)

Merging Policy: The agent MUST NEVER merge its own Pull Requests. All PRs require explicit human review and merging.

Return PR URL, changed files list, test summary.

Step 6 — Final Review & Handoff (Final Check)
The agent MUST perform a final review checklist to ensure the PR is ready for human review.

Confirm cross-link to issue is in the PR description.

Ensure all Acceptance Criteria were met and are documented in the PR body.

Verify all required links (logs/builds) are present in the Evidence Pack section of the PR.

Report current CI status (e.g., "CI Pending" or "CI Green").

Return final status and prompt the human reviewer.

FYI: make sure to update all documentation on the main branch to ensure all our documentation is kept up to date; always!`;
