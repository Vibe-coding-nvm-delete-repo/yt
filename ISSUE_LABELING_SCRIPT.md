# Issue Labeling and Organization Script

## Overview

This document provides the exact GitHub CLI commands to label all 18 issues appropriately.

## Prerequisites

- GitHub CLI (`gh`) must be authenticated
- Repository: `Vibe-coding-nvm-delete-repo/yt`
- Required permissions: Issue write access

## Label Application Commands

### Critical Priority Issues (P1)

```bash
# Issue #182: Testing: Missing ts-jest preset blocks all test execution
gh issue edit 182 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "bug" \
  --add-label "testing" \
  --add-label "priority-P1" \
  --add-label "tooling-ci-cd"

# Issue #180: TypeScript: Fix exactOptionalPropertyTypes error in UsageTab
gh issue edit 180 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "bug" \
  --add-label "types" \
  --add-label "priority-P1" \
  --add-label "technical-debt"

# Issue #181: ESLint: Direct DOM manipulation in SettingsTab blocks commits
gh issue edit 181 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "bug" \
  --add-label "code-quality" \
  --add-label "priority-P1" \
  --add-label "technical-debt"
```

### High Priority Issues (P2)

```bash
# Issue #188: TypeScript: Fix 'any' type usage in error handling code
gh issue edit 188 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "bug" \
  --add-label "types" \
  --add-label "priority-P2" \
  --add-label "code-quality" \
  --add-label "security"

# Issue #187: ESLint: React Hooks dependency warnings in SettingsTab
gh issue edit 187 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "bug" \
  --add-label "code-quality" \
  --add-label "priority-P2" \
  --add-label "technical-debt"

# Issue #186: ESLint: Improve error handling with try-catch blocks
gh issue edit 186 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "enhancement" \
  --add-label "code-quality" \
  --add-label "priority-P2" \
  --add-label "security"
```

### Medium Priority Issues (P3)

```bash
# Issue #189: Testing: Fix empty block statements in test files
gh issue edit 189 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "testing" \
  --add-label "code-quality" \
  --add-label "priority-P3"

# Issue #185: TypeScript: Use ts-expect-error instead of ts-ignore
gh issue edit 185 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "technical-debt" \
  --add-label "types" \
  --add-label "priority-P3" \
  --add-label "good first issue"

# Issue #184: ESLint: Unused variables and imports cleanup needed
gh issue edit 184 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "technical-debt" \
  --add-label "code-quality" \
  --add-label "priority-P3" \
  --add-label "good first issue"

# Issue #183: TypeScript: Inconsistent type imports throughout codebase
gh issue edit 183 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "technical-debt" \
  --add-label "types" \
  --add-label "priority-P3" \
  --add-label "good first issue"
```

### PQA Automation Epic (P2)

```bash
# Issue #124: PQA Automation Rollout - Tracking Epic
gh issue edit 124 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "enhancement" \
  --add-label "tooling-ci-cd" \
  --add-label "priority-P2" \
  --add-label "governance"

# Issue #125: CI: PR fast checks (S-1/S-4) - incremental and cached
gh issue edit 125 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "enhancement" \
  --add-label "tooling-ci-cd" \
  --add-label "priority-P2"

# Issue #126: CI: Nightly full PQA scan on main - auto-file Priority >= 6
gh issue edit 126 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "enhancement" \
  --add-label "tooling-ci-cd" \
  --add-label "priority-P2"

# Issue #127: CI: Weekly deep scan focus (S-3/S-6) - rotated directories
gh issue edit 127 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "enhancement" \
  --add-label "tooling-ci-cd" \
  --add-label "priority-P2" \
  --add-label "performance"

# Issue #128: Tooling: PQA triage (de-dup + PII masking) and reporting
gh issue edit 128 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "enhancement" \
  --add-label "tooling" \
  --add-label "priority-P2" \
  --add-label "security"

# Issue #129: Reporting: Monthly PQA trends and audit summary
gh issue edit 129 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "enhancement" \
  --add-label "tooling" \
  --add-label "priority-P2" \
  --add-label "quality-assurance"
```

### Feature Requests

```bash
# Issue #137: Add Usage & Cost tracking tab with detailed logs and total cost display
gh issue edit 137 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "enhancement" \
  --add-label "priority-P2"

# Issue #37: Overly complex functions needing refactoring
# Note: This issue already has labels, we're just adding priority-P3 if not set
gh issue edit 37 --repo Vibe-coding-nvm-delete-repo/yt \
  --add-label "priority-P3"
```

## Batch Script

For convenience, here's a complete bash script to apply all labels:

```bash
#!/bin/bash
# apply-issue-labels.sh

REPO="Vibe-coding-nvm-delete-repo/yt"

echo "Applying labels to critical issues (P1)..."
gh issue edit 182 --repo $REPO --add-label "bug,testing,priority-P1,tooling-ci-cd"
gh issue edit 180 --repo $REPO --add-label "bug,types,priority-P1,technical-debt"
gh issue edit 181 --repo $REPO --add-label "bug,code-quality,priority-P1,technical-debt"

echo "Applying labels to high priority issues (P2)..."
gh issue edit 188 --repo $REPO --add-label "bug,types,priority-P2,code-quality,security"
gh issue edit 187 --repo $REPO --add-label "bug,code-quality,priority-P2,technical-debt"
gh issue edit 186 --repo $REPO --add-label "enhancement,code-quality,priority-P2,security"

echo "Applying labels to medium priority issues (P3)..."
gh issue edit 189 --repo $REPO --add-label "testing,code-quality,priority-P3"
gh issue edit 185 --repo $REPO --add-label "technical-debt,types,priority-P3,good first issue"
gh issue edit 184 --repo $REPO --add-label "technical-debt,code-quality,priority-P3,good first issue"
gh issue edit 183 --repo $REPO --add-label "technical-debt,types,priority-P3,good first issue"

echo "Applying labels to PQA automation epic (P2)..."
gh issue edit 124 --repo $REPO --add-label "enhancement,tooling-ci-cd,priority-P2,governance"
gh issue edit 125 --repo $REPO --add-label "enhancement,tooling-ci-cd,priority-P2"
gh issue edit 126 --repo $REPO --add-label "enhancement,tooling-ci-cd,priority-P2"
gh issue edit 127 --repo $REPO --add-label "enhancement,tooling-ci-cd,priority-P2,performance"
gh issue edit 128 --repo $REPO --add-label "enhancement,tooling,priority-P2,security"
gh issue edit 129 --repo $REPO --add-label "enhancement,tooling,priority-P2,quality-assurance"

echo "Applying labels to feature requests..."
gh issue edit 137 --repo $REPO --add-label "enhancement,priority-P2"
gh issue edit 37 --repo $REPO --add-label "priority-P3"

echo "Done! All issues labeled."
```

## Verification Commands

After applying labels, verify with:

```bash
# List all issues with their labels
gh issue list --repo Vibe-coding-nvm-delete-repo/yt --limit 100 --json number,title,labels

# List only P1 issues
gh issue list --repo Vibe-coding-nvm-delete-repo/yt --label "priority-P1" --json number,title,labels

# List only P2 issues
gh issue list --repo Vibe-coding-nvm-delete-repo/yt --label "priority-P2" --json number,title,labels

# List only P3 issues
gh issue list --repo Vibe-coding-nvm-delete-repo/yt --label "priority-P3" --json number,title,labels
```

## Manual Execution Instructions

1. **Save the batch script:**

   ```bash
   cat > /tmp/apply-issue-labels.sh << 'EOF'
   [paste script content here]
   EOF
   chmod +x /tmp/apply-issue-labels.sh
   ```

2. **Authenticate GitHub CLI (if needed):**

   ```bash
   gh auth login
   ```

3. **Run the script:**

   ```bash
   /tmp/apply-issue-labels.sh
   ```

4. **Verify the changes:**
   ```bash
   gh issue list --repo Vibe-coding-nvm-delete-repo/yt --limit 20 --json number,title,labels | jq
   ```

## Notes

- All existing labels on issues will be preserved
- Multiple labels can be added in a single command using comma separation
- If a label doesn't exist in the repository, it will be auto-created (depending on permissions)
- The GitHub CLI respects rate limits automatically

## Label Summary

### Priority Labels

- `priority-P1`: 3 issues (Critical - blocks development/deployment)
- `priority-P2`: 9 issues (High - significant impact)
- `priority-P3`: 5 issues (Medium - code quality)

### Category Labels

- `bug`: 7 issues
- `enhancement`: 9 issues
- `testing`: 2 issues
- `types`: 5 issues
- `code-quality`: 8 issues
- `technical-debt`: 6 issues
- `tooling-ci-cd`: 5 issues
- `security`: 3 issues
- `good first issue`: 3 issues

### Special Labels

- Issue #37 already has: `audit`, `enhancement`, `maintainability`, `priority-P2`
  - We're only adding `priority-P3` to correct its priority based on analysis
