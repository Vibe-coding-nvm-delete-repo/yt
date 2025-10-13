# Merge Conflict Prevention Guide

## The Problem We're Solving

The `main` branch was catastrophically broken by bad merges, resulting in:

- 90+ TypeScript syntax errors
- Duplicate code blocks and imports
- Merge conflict artifacts (`<<<<<<< HEAD`, `=======`, `>>>>>>>`)
- 11 failing test suites
- Completely unusable codebase

## Root Causes

1. **Direct pushes to main** - Changes pushed without PR review
2. **Failed merge conflict resolution** - Conflicts not properly resolved
3. **Missing CI validation** - No automated checks before merge
4. **No branch protection** - Main branch not protected

## Prevention System (4 Layers)

### Layer 1: GitHub Branch Protection Rules

**REQUIRED SETUP** (Owner/Admin must configure):

1. Go to: `Settings` → `Branches` → `Add branch protection rule`
2. Branch name pattern: `main`
3. Enable these settings:
   - ✅ **Require a pull request before merging**
     - Required approvals: 1
     - Dismiss stale reviews when new commits are pushed
   - ✅ **Require status checks to pass before merging**
     - Require branches to be up to date before merging
     - Required status checks:
       - `TypeScript Type Check`
       - `ESLint`
       - `Test Suite`
       - `Build Verification`
       - `All Checks Passed`
   - ✅ **Require conversation resolution before merging**
   - ✅ **Do not allow bypassing the above settings**
   - ✅ **Restrict who can push to matching branches**
     - Include administrators: NO
   - ✅ **Allow force pushes: NO**
   - ✅ **Allow deletions: NO**

### Layer 2: Required CI Checks

The `.github/workflows/required-checks.yml` workflow enforces:

1. **TypeScript Type Check** - Zero compilation errors
2. **ESLint** - Zero linting errors (warnings OK)
3. **Test Suite** - All tests must pass
4. **Build Verification** - Production build must succeed
5. **Security Audit** - No high/critical vulnerabilities

**All 5 checks MUST pass** before a PR can be merged.

### Layer 3: Pre-Commit Hooks

Local validation before commits:

- Husky runs lint-staged on changed files
- Catches issues before they reach CI
- Fast feedback loop

### Layer 4: Pull Request Workflow

**ALWAYS follow this workflow:**

```bash
# 1. Start from clean main
git checkout main
git pull --ff-only origin main

# 2. Create feature branch
git checkout -b fix/my-feature

# 3. Make changes
# ... code changes ...

# 4. Run local checks BEFORE committing
npm run typecheck    # Must be clean
npm run lint         # Must pass
npm test             # Must pass
npm run build        # Must succeed

# 5. Commit if all checks pass
git add .
git commit -m "fix: description"

# 6. Push to feature branch
git push origin fix/my-feature

# 7. Create Pull Request
# GitHub UI will show status checks

# 8. Wait for ALL checks to pass
# DO NOT merge if any check fails

# 9. Merge via GitHub UI (squash recommended)
# "Squash and merge" keeps main history clean
```

## Handling Merge Conflicts

**If you see merge conflicts:**

```bash
# STOP! Do not force push or manually edit conflict markers

# Option 1: Rebase (preferred)
git checkout main
git pull --ff-only origin main
git checkout your-feature-branch
git rebase main

# Resolve conflicts ONE FILE AT A TIME
# Test after each resolution
npm run typecheck
npm run lint
npm test

# Continue rebase
git rebase --continue

# Option 2: Merge (alternative)
git checkout your-feature-branch
git merge main

# Resolve conflicts carefully
# NEVER leave <<<<<<< HEAD markers
# Test thoroughly after resolution

# Verify everything works
npm run typecheck  # MUST be clean
npm run lint       # MUST pass
npm test          # MUST pass
npm run build     # MUST succeed
```

## Emergency Main Branch Restoration

**If main branch becomes broken:**

```bash
# 1. Identify last known-good commit
git log --oneline main | head -20
# Test each commit:
git checkout <commit-hash>
npm ci
npm run typecheck

# 2. Create restoration branch from clean commit
git checkout -b fix/restore-clean-main <good-commit-hash>

# 3. Cherry-pick only essential fixes
git cherry-pick <commit-hash>

# 4. Validate thoroughly
npm ci
npm run typecheck  # 0 errors
npm run lint       # 0 errors
npm test          # All passing
npm run build     # Success

# 5. Create PR to restore main
# Include evidence of validation
```

## Red Flags to Watch For

🚩 **NEVER DO THESE:**

- ❌ Direct push to main
- ❌ Merge with failing CI checks
- ❌ Force push to main (`git push -f`)
- ❌ Bypass branch protection
- ❌ Ignore TypeScript errors
- ❌ Leave merge conflict markers in code
- ❌ Skip running tests locally

✅ **ALWAYS DO THESE:**

- ✅ Work on feature branches
- ✅ Run all checks locally before pushing
- ✅ Wait for CI to pass before merging
- ✅ Use "Squash and merge" for clean history
- ✅ Test after resolving conflicts
- ✅ Document any intentional breaking changes

## Monitoring and Alerts

**Set up GitHub notifications:**

1. Watch repository → All activity
2. Enable email notifications for:
   - Failed CI checks
   - Failed deployments
   - Security alerts

**Regular health checks:**

```bash
# Weekly: verify main is healthy
git checkout main
git pull --ff-only origin main
npm ci
npm run typecheck  # Should be clean
npm run lint       # Should pass
npm test          # Should pass
```

## Questions?

If you encounter merge conflicts or CI failures:

1. DO NOT merge
2. DO NOT force push
3. Ask for help in PR comments
4. Reference this guide

## Summary

**The Golden Rule:** If CI checks fail, DO NOT MERGE. Fix the issues first.

**Prevention = 4 layers:**

1. Branch protection (prevents bad merges)
2. Required CI checks (catches errors automatically)
3. Pre-commit hooks (fast local feedback)
4. Pull request workflow (human review)

**All 4 layers must be active** to prevent future catastrophic failures.
