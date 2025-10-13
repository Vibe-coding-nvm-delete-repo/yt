# 🚨 EMERGENCY SETUP CHECKLIST

## Immediate Actions Required After PR #81 Merge

**⚠️ This checklist MUST be completed to prevent main branch from breaking again.**

---

## Step 1: Merge PR #81 ✅

- [ ] Review PR #81: https://github.com/pixel-pilot/yt/pull/81
- [ ] Verify all CI checks pass
- [ ] Merge using "Squash and merge" (recommended)

---

## Step 2: Configure GitHub Branch Protection (CRITICAL)

**Time Required:** ~5 minutes  
**Required Permission:** Repository Owner or Admin

### Quick Setup:

1. **Go to:** https://github.com/pixel-pilot/yt/settings/branches
2. Click **"Add branch protection rule"**
3. **Branch name pattern:** `main`

### Enable These Settings:

#### ✅ Pull Request Requirements

- [x] Require a pull request before merging
  - Required approvals: **1**
  - [x] Dismiss stale reviews when new commits are pushed

#### ✅ Status Check Requirements

- [x] Require status checks to pass before merging
  - [x] Require branches to be up to date before merging
  - **Add these 5 required checks:**
    - `TypeScript Type Check`
    - `ESLint`
    - `Test Suite`
    - `Build Verification`
    - `All Checks Passed`

#### ✅ Additional Protections

- [x] Require conversation resolution before merging
- [x] **Do not allow bypassing the above settings** ← CRITICAL
- [x] Restrict who can push to matching branches
  - **Include administrators:** NO ← CRITICAL
- [ ] Allow force pushes: **NO** (keep unchecked)
- [ ] Allow deletions: **NO** (keep unchecked)

4. Click **"Create"** button

**Detailed instructions:** See `docs/GITHUB_BRANCH_PROTECTION_SETUP.md`

---

## Step 3: Verify Branch Protection Works

### Test 1: Direct Push Should Fail ❌

```bash
git checkout main
git pull origin main
git commit --allow-empty -m "test: direct push should fail"
git push origin main
```

**Expected result:**

```
remote: error: GH006: Protected branch update failed
remote: error: Changes must be made through a pull request
```

If you see this error, **branch protection is working correctly!** ✅

### Test 2: PR With Failing Checks Should Block Merge

1. Create test branch with a TypeScript error
2. Push and create PR
3. Verify **"Merge" button is disabled**
4. Verify status checks show failures

### Test 3: PR With Passing Checks Should Allow Merge

1. Create test branch with clean code
2. Push and create PR
3. Wait for all 5 checks to pass (green checkmarks)
4. Verify **"Merge" button is enabled**
5. Merge successfully

---

## Step 4: Team Communication

**Send this message to all contributors:**

```
🚨 IMPORTANT: Main branch protection is now active

Starting now, all changes MUST go through pull requests.

What changed:
- Direct pushes to main are blocked
- All PRs require CI checks to pass
- TypeScript errors will block merges
- Linting errors will block merges
- Test failures will block merges

Workflow:
1. Create feature branch
2. Make changes
3. Run: npm run typecheck && npm run lint && npm test
4. Push and create PR
5. Wait for CI checks to pass
6. Merge via GitHub UI

Documentation:
- docs/MERGE_CONFLICT_PREVENTION.md
- docs/GITHUB_BRANCH_PROTECTION_SETUP.md

Questions? Ask in #dev channel
```

---

## Step 5: Update README (Optional but Recommended)

Add this badge to README.md:

```markdown
## Status

[![CI](https://github.com/pixel-pilot/yt/workflows/Required%20Checks/badge.svg)](https://github.com/pixel-pilot/yt/actions)

All pull requests must pass:

- TypeScript Type Check (0 errors)
- ESLint (0 errors)
- Test Suite (all passing)
- Build Verification (success)
- Security Audit (no high/critical)
```

---

## Troubleshooting

### ❓ "Status checks don't appear in dropdown"

**Solution:** Wait for first PR with the new workflow to run, then:

1. Go back to branch protection settings
2. The check names will now appear in dropdown
3. Add all 5 required checks

### ❓ "I don't see branch protection settings"

**Reason:** You need Owner or Admin permissions

**Solution:**

1. Contact repository owner
2. Request admin access
3. Or ask owner to follow this checklist

### ❓ "Admins can still force push"

**Fix:**

1. Edit branch protection rule
2. Enable **"Do not allow bypassing the above settings"**
3. Ensure **"Include administrators"** is **NO**

---

## Success Criteria

Branch protection is successfully configured when:

- [x] PR #81 is merged to main
- [x] Branch protection rule exists for `main`
- [x] All 5 status checks are required
- [x] Direct push to main fails with error
- [x] PR with failing checks cannot be merged
- [x] PR with passing checks can be merged
- [x] Team has been notified
- [x] Test PR created and merged successfully

---

## Maintenance

**Monthly Review:**

- Verify branch protection is still active
- Check that all 5 status checks are required
- Confirm "Do not allow bypassing" is enabled
- Test with a dummy PR

**After Workflow Changes:**

- If renaming jobs in `.github/workflows/required-checks.yml`
- Update branch protection status check names
- Test with a PR

---

## What We Prevented

**Before this setup:**

- ❌ 90+ TypeScript syntax errors in main
- ❌ Duplicate code blocks from bad merges
- ❌ Merge conflict artifacts in committed code
- ❌ 11 failing test suites
- ❌ Completely broken main branch

**After this setup:**

- ✅ All changes validated by CI
- ✅ TypeScript errors caught before merge
- ✅ Linting enforced automatically
- ✅ Tests must pass before merge
- ✅ Clean, working main branch always

---

## Questions or Issues?

1. Check: `docs/MERGE_CONFLICT_PREVENTION.md`
2. Check: `docs/GITHUB_BRANCH_PROTECTION_SETUP.md`
3. Create issue with label `help-wanted`
4. Reference this checklist

---

**The main branch will only stay healthy if branch protection is configured.**  
**This is not optional. It's critical infrastructure.**

✅ Complete Steps 1-5 above within 24 hours of PR #81 merge.
