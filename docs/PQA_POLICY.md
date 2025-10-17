# 🔍 PROACTIVE QUALITY ASSURANCE (PQA) POLICY - DEFINITIVE VERSION

## Mission

The Agent's sole purpose in this mode is to actively scan the codebase and system artifacts, identify potential bugs, security flaws, performance bottlenecks, and technical debt, and structure these findings into clear, prioritized reports for human review. The agent **MUST NOT** attempt to fix any discovered issues in this mode; its task is strictly identification and reporting.

---

## 0. Data Governance Guardrail (CRITICAL)

The Agent MUST adhere to data privacy rules when collecting evidence:

### PII Masking

If the Agent scans any logs, reports, or data structures containing Personally Identifiable Information (PII) (e.g., email addresses, names, tokens, financial details, passwords), it **MUST** sanitize, obfuscate, or replace the data with placeholders (e.g., `user-1234`, `[REDACTED_EMAIL]`) before including it in the proposal evidence.

### Security Principle

Never report sensitive production data in the issue description.

---

## 0.5 Issue Tracker Integrity (De-Duplication Mandate)

Before finalizing a New Issue Proposal, the Agent MUST perform the following check to prevent pollution and ensure efficient triage:

### Search

Check the existing backlog for open or recently closed issues that match the proposed finding's summary and area of impact.

### Action

- **If found**: The Agent MUST add the new evidence (logs, file:line data) to the existing issue as a comment instead of creating a duplicate issue. The proposal process is terminated for this finding.
- **If not found**: Proceed with creating the new issue proposal.

---

## 1. Issue Identification & Scanning Modes

The Agent must systematically examine the system using the following Scanning Modes.

### S-1: Code Scrutiny (Technical Debt & Quality)

**Focus**: Structural issues, maintainability, complexity, and Developer Friction.

**Target**: `app/**`, `src/**`, `tests/**`.

**Criteria**:

- Unused variables/imports
- Excessive function complexity (high cyclomatic score)
- Deep nesting
- Obvious code duplication (WET violations)
- Missing/stale documentation blocks
- Complex logic without unit test coverage

**New Criteria**:

- **Friction Debt**: Look for issues leading to excessive developer friction (e.g., highly coupled modules requiring cascading changes, reliance on outdated/complex internal tools, excessive cognitive load to maintain).

### S-2: Log & Runtime Analysis

**Focus**: Live system errors and unexpected behavior, including external dependencies.

**Target**: Build logs, test reports, runtime error aggregators, dependency vulnerability scans (`npm audit`).

**Criteria**:

- Warnings or errors not handled by current tests
- Build failures in non-primary environments
- Known high-severity vulnerability
- Silent type coercion issues
- Non-fatal runtime warnings that indicate potential future breakage

**External Contract Failures**:

- Look for issues related to outdated API usage
- Missing validation for third-party webhooks
- Breaking changes in external service contracts (e.g., payment gateways, microservices)

### S-3: Performance & Efficiency

**Focus**: Resource usage and speed regressions (Application & Build).

**Target**: Large file sizes, slow-running tests (≥2 seconds), highly-nested or inefficient data fetching patterns, excessive component re-renders (in UIs).

**Criteria**:

- Any component, function, or API that contributes disproportionately to latency or resource consumption.

### S-4: Policy & Standard Violations

**Focus**: Deviation from defined project standards.

**Target**: New files, modified interfaces, or components.

**Criteria**:

- Hardcoded strings (i18n failure)
- Missing error handling
- Non-standard component patterns
- Failure to follow rules from the project's `ENGINEERING_STANDARDS.md`

**Tooling Solution Preference**:

- For widespread S-4 violations, the Agent is encouraged to propose a P1/P2 issue to modify the relevant linting/tooling configuration rather than creating hundreds of issues to fix individual instances.

### S-5: User Experience (UX) & Accessibility (A11Y)

**Focus**: Human-computer interaction, compliance, and usability.

**Target**: All user-facing components (HTML, UI, CSS).

**Criteria**:

- Missing ARIA attributes
- Poor color contrast (WCAG violation)
- Lack of keyboard navigation support
- Confusing or non-actionable error messages
- Excessive Cumulative Layout Shift (CLS)

### S-6: Environment & Legacy Drift (Operational Risk)

**Focus**: Configuration synchronization, unowned code, and end-of-life systems.

**Target**: Configuration files (`.env*`, infra as code files), old directories, abandoned modules.

**Criteria**:

**Infrastructure Drift**:

- Differences in critical settings (timeouts, database credentials, feature flags) between development, staging, and production environments
- Errors resulting from local setup discrepancies

**Legacy/Unowned Code**:

- Identifying large, high-risk code modules (e.g., ≥1000 lines, low test coverage) using obsolete technology or libraries where ownership is unclear or the original developer has left the team

---

## 2. Triage & Priority Scoring Model (1-10 Scale)

All discovered issues MUST be rated on a **1 (lowest)** to **10 (highest)** scale. The score is determined by calculating the sum of the Severity and Urgency scores.

```
Priority Score = (Severity + Urgency)
```

The score will range from **2** (Trivial + Future) to **10** (Critical + Immediate). The final score should be rounded to the nearest whole number.

### A. Severity (Impact on Users/Business)

| Score | Level    | Description                                                                        | Example Impact                                                                          |
| ----- | -------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **5** | Critical | Production down, data loss, security vulnerability, or major financial/legal risk. | Leads to app crash, unauthenticated data access, or payment failure.                    |
| **4** | Major    | Core feature is broken, workflow blocked, or high-impact data corruption risk.     | Login loop, primary search function returns incorrect results, major UX breakage.       |
| **3** | Medium   | Non-core feature broken, minor UX disruption, or significant technical debt.       | Secondary page loads slowly, inconsistent mobile layout, excessive function complexity. |
| **2** | Minor    | Cosmetic bug, low-impact documentation error, or non-critical technical debt.      | Misalignment of a minor button, deprecated function usage in non-core module.           |
| **1** | Trivial  | Typo, non-blocking warning, or stylistic nit.                                      | Extra whitespace, redundant comment, minor code style deviation.                        |

### B. Urgency (Time Sensitivity / Exposure)

| Score | Level     | Description                                                               | Example Rationale                                                                                                                                           |
| ----- | --------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **5** | Immediate | Exploitable now, actively losing revenue, or blocking high-priority work. | Active dependency exploit, failing unit tests on main branch, critical feature velocity blocker (e.g., environment setup failure), imminent security audit. |
| **4** | High      | Will cause failure in the next release cycle or affects many components.  | Code marked for deprecation is still widely used, significant feature velocity impediment (e.g., 10+ minute build times), major refactor pending.           |
| **3** | Medium    | Requires attention before next major refactor or system update.           | A common utility function has minor performance issue, potential for future conflict.                                                                       |
| **2** | Low       | Can be addressed opportunistically during related work.                   | Simple code cleanup, minor documentation updates.                                                                                                           |
| **1** | Future    | Purely theoretical or cosmetic finding with zero immediate risk.          | Minor stylistic improvements, long-term optimization ideas.                                                                                                 |

---

## 3. New Issue Proposal Template

The Agent MUST use this template to formally report every discovered issue. All proposals must be sorted by **Priority Score** (Highest → Lowest).

```markdown
🐛 NEW ISSUE PROPOSAL (PQA Scan)

Priority Score: <N/10>
Severity: <N> · Urgency: <N>
Scanning Mode: <S-1/S-2/S-3/S-4/S-5/S-6>
Area of Impact: <e.g., Auth Service, Checkout Flow, CI/CD, UI/Accessibility, Infrastructure>

Summary (1 sentence):

- [Clear statement of the problem, e.g., "The user profile API endpoint is missing rate limiting."]

Detailed Description:

- [Why this is an issue (Impact), and the root cause (Technical Debt, Security, Bug).]

Evidence / Repro Steps:

- [If code: file:line, function name, and context. If bug: minimal steps to reproduce.]
- [Attach logs, build outputs, or vulnerability reports (links). NOTE: PII MUST be masked per Section 0.]

Estimated Fix Complexity:

- [Small/Medium/Large]
- **Required Skillset/Team:** [e.g., Infrastructure, Frontend, Security, Documentation]
- [Estimated required **Fixing Mode** (Mode 0, Mode 3, etc.) for the execution agent.]
```

---

## 4. Integration with Autonomous Agent Policy

The PQA Policy operates in a **read-only, discovery mode** and complements the existing [AUTONOMOUS_AGENT_POLICY.md](./AUTONOMOUS_AGENT_POLICY.md).

### When to Use PQA Mode

- **Scheduled Quality Audits**: Regular codebase health checks
- **Pre-Release Validation**: Before major releases or deployments
- **Post-Incident Analysis**: After production issues to identify related technical debt
- **Onboarding Support**: To help new team members understand code quality issues

### When NOT to Use PQA Mode

- **During Active Development**: Don't interrupt feature work with quality scans
- **In Fix/Implementation Mode**: Use the standard Autonomous Agent Policy (Modes 0-4)

### Escalation from PQA to Fix Mode

When a PQA scan identifies issues:

1. **Create Issue Proposals**: Use the template in Section 3
2. **Prioritize Issues**: Human reviewer triages based on Priority Score
3. **Switch to Autonomous Agent Policy**: Once an issue is approved for fixing, the agent switches to the appropriate Mode (0, 1, 2, or 3) from the Autonomous Agent Policy to implement the fix

---

## 5. Best Practices

### For Agents Running PQA Scans

1. **Be Thorough**: Scan all relevant areas systematically
2. **Be Precise**: Include exact file paths, line numbers, and code snippets
3. **Be Objective**: Focus on facts and measurable impact
4. **Be Respectful**: Mask all PII and sensitive data
5. **Be Efficient**: Check for duplicates before creating new issues

### For Human Reviewers

1. **Batch Review**: Review all PQA proposals together to identify patterns
2. **Prioritize**: Focus on high-priority issues first (scores 8-10)
3. **Group Similar Issues**: Combine related findings into single issues
4. **Provide Context**: Add business context to help with prioritization
5. **Decide on Tooling**: For widespread issues, consider tooling/linting solutions

---

## 6. Reporting Format

All PQA scan results should be compiled into a single report:

```markdown
# PQA Scan Report - [Date]

**Scan Coverage**: [List of directories/files scanned]
**Total Issues Found**: [N]
**Priority Breakdown**:

- Critical (9-10): [N]
- High (7-8): [N]
- Medium (5-6): [N]
- Low (3-4): [N]
- Trivial (1-2): [N]

---

## Issues (Sorted by Priority)

[Insert individual issue proposals here, highest priority first]

---

## Summary & Recommendations

[High-level summary of findings and recommended next steps]
```

---

## Appendix: Scanning Tools & Commands

### Code Quality Analysis

```bash
# Run linter
npm run lint -- --max-warnings=0

# Type checking
npm run typecheck

# Test coverage
npm test -- --coverage
```

### Dependency Security

```bash
# Check for vulnerabilities
npm audit

# Check for outdated packages
npm outdated
```

### Performance Analysis

```bash
# Build size analysis
npm run build -- --analyze

# Test performance
npm test -- --verbose --testTimeout=5000
```

### Accessibility Checks

```bash
# Run a11y linting (if configured)
npm run lint:a11y
```

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-10-17  
**Owner**: Engineering Team
