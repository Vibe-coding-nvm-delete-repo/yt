## Proactive Quality Assurance (PQA) – Policy & Runbook

### Mission
Proactively scan code and system artifacts to identify bugs, security risks, performance bottlenecks, and technical debt. In PQA mode the agent only identifies and reports; it does not fix.

### Guardrails (Data Governance)
- Mask PII in all evidence: emails, names, tokens, passwords, financial data.
- Never include sensitive production data in issues or logs.

### Scanning Modes (what to look for)
- S-1 Code Scrutiny: unused imports/vars, complexity, duplication, missing tests/docs, friction debt.
- S-2 Log & Runtime: build/test warnings, runtime errors, dependency vulns, third‑party contract drift.
- S-3 Performance: hot paths, large assets, slow tests (≥2s), inefficient data fetching.
- S-4 Policy/Standards: i18n, error handling, component patterns, project engineering standards.
- S-5 UX & A11Y: ARIA gaps, contrast, keyboard nav, confusing errors, layout shift.
- S-6 Env & Legacy: config drift, abandoned modules, EOL tech, unowned large files.

### De‑dup Rule (Issue Tracker Integrity)
- Search existing issues first. If similar exists: add new evidence as a comment.
- If not found: file a new issue using the PQA template below.

### Priority Scoring (1–10)
- Priority = Severity (1–5) + Urgency (1–5); round to nearest integer.
- Suggested filing threshold in automation: only auto‑file when Priority ≥ 6 (others attach to a rolling epic or report artifact).

### Recommended Cadence
- PR (fast subset ≤3 min): S‑1/S‑4 on changed paths; non‑blocking nit findings.
- Nightly (weekdays): full S‑1..S‑6; non‑blocking; artifacts + issues (Priority ≥ 6).
- Weekly deep scan: heavier S‑3/S‑6, rotate focus; cap ≤45 min.
- Monthly audit: trend review of findings, false‑positive rate, tooling tuning.

### Labels
- Umbrella: `pqa`
- Epic/tracking: `pqa-epic`
- Modes: `pqa-s1`, `pqa-s2`, `pqa-s3`, `pqa-s4`, `pqa-s5`, `pqa-s6`
- Also consider existing: `tooling-ci-cd`, `quality-assurance`, `code-quality`, `documentation`

### Issue Template (for human/automation)
Use this structure when filing:

```
🐛 NEW ISSUE PROPOSAL (PQA Scan)

Priority Score: <N/10>
Severity: <N> · Urgency: <N>
Scanning Mode: <S-1/S-2/S-3/S-4/S-5/S-6>
Area of Impact: <e.g., Auth, CI/CD, UI, Infrastructure>

Summary (1 sentence):
- <Clear statement of the problem>

Detailed Description:
- <Impact and likely root cause>

Evidence / Repro Steps:
- <file:line, function, minimal repro>
- <logs/build outputs with PII masked>

Estimated Fix Complexity:
- <Small/Medium/Large>
- Required Skillset/Team: <Infra/Frontend/Security/Docs>
- Fixing Mode: <reference appropriate execution mode>
```

### CI Jobs (overview)
- PR fast checks: run incremental S‑1/S‑4.
- Nightly: full scan, artifact upload, auto‑file Priority ≥ 6.
- Weekly deep scan: S‑3/S‑6 focus; rotated directories.
- Monthly audit: generate trends report.

See this file as the canonical reference during audits.
