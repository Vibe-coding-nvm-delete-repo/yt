# GitHub Branch Protection Setup Instructions

## Overview

This document provides **exact step-by-step instructions** for configuring GitHub branch protection rules to prevent broken code from entering the `main` branch.

## Prerequisites

- Repository owner or admin access
- Repository: `pixel-pilot/yt`
- GitHub account with appropriate permissions

## Setup Steps

### 1. Navigate to Repository Settings

1. Go to: https://github.com/pixel-pilot/yt
2. Click **Settings** tab (top right, requires admin access)
3. In left sidebar, click **Branches** under "Code and automation"

### 2. Add Branch Protection Rule

1. Click **Add branch protection rule** button
2. In "Branch name pattern" field, enter: `main`

### 3. Configure Protection Settings

**Enable these checkboxes in order:**

#### A. Pull Request Requirements

- ☑ **Require a pull request before merging**
  - ☑ **Required number of approvals before merging:** `1`
  - ☑ **Dismiss stale pull request approvals when new commits are pushed**
  - ☐ Require review from Code Owners (optional)

#### B. Status Check Requirements

- ☑ **Require status checks to pass before merging**
  - ☑ **Require branches to be up to date before merging**
  - In search box "Search for status checks...", add these **5 required checks**:
    1. `TypeScript Type Check`
    2. `ESLint`
    3. `Test Suite`
    4. `Build Verification`
    5. `All Checks Passed`

  **Note:** These checks will appear in the dropdown after the first PR with `.github/workflows/required-checks.yml` runs.

#### C. Conversation Resolution

- ☑ **Require conversation resolution before merging**

#### D. Push Restrictions

- ☑ **Require signed commits** (optional but recommended)
- ☑ **Require linear history** (optional - forces rebase/squash)
- ☑ **Do not allow bypassing the above settings**
  - **CRITICAL:** This prevents even admins from bypassing protections

#### E. Force Push and Deletion Protection

- ☑ **Restrict who can push to matching branches**
  - In "Restrict pushes that create matching branches", select:
    - **Include administrators: NO**
- ☐ **Allow force pushes: NO** (keep unchecked)
- ☐ **Allow deletions: NO** (keep unchecked)

### 4. Save Configuration

1. Scroll to bottom
2. Click **Create** button
3. Verify the rule appears in the branch protection rules list

## Verification

After setup, verify protection is active:

### Test 1: Direct Push Should Fail

```bash
git checkout main
git commit --allow-empty -m "test: direct push"
git push origin main
```

**Expected result:**

```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Changes must be made through a pull request.
To https://github.com/pixel-pilot/yt.git
 ! [remote rejected] main -> main (protected branch hook declined)
error: failed to push some refs
```

### Test 2: PR Without Passing Checks Should Block Merge

1. Create a feature branch with a TypeScript error
2. Push and create PR
3. Verify "Merge" button is disabled
4. Verify status checks appear and show failure

### Test 3: PR With Passing Checks Should Allow Merge

1. Create a feature branch with clean code
2. Push and create PR
3. Wait for all 5 status checks to pass (green checkmarks)
4. Verify "Merge" button is enabled
5. Verify merge options show "Squash and merge" (recommended)

## Troubleshooting

### Status checks don't appear in dropdown

**Solution:** The workflow must run at least once:

1. Create a test PR from any branch
2. Wait for `.github/workflows/required-checks.yml` to run
3. After first run, check names will appear in settings
4. Return to branch protection settings and add them

### "Do not allow bypassing" not available

**Reason:** You may not have owner permissions

**Solution:**

1. Contact repository owner
2. Request owner/admin access
3. Or ask owner to configure these settings

### Admins can still force push

**Check:** "Do not allow bypassing the above settings" must be enabled

**Fix:**

1. Go to branch protection rule
2. Edit the rule
3. Enable "Do not allow bypassing the above settings"
4. Ensure "Restrict pushes" → "Include administrators" is **unchecked**
5. Save changes

## Additional Configuration (Optional)

### Require Code Owners Review

Create `.github/CODEOWNERS` file:

```
# Global owners
* @pixel-pilot

# Specific areas
/src/lib/** @pixel-pilot
/.github/** @pixel-pilot
```

Then enable in branch protection:

- ☑ **Require review from Code Owners**

### Require Signed Commits

Enforce cryptographic signatures:

- ☑ **Require signed commits**

Team members must configure GPG keys:

```bash
git config --global commit.gpgsign true
```

### Automatic Branch Deletion

In repository settings → General:

- ☑ **Automatically delete head branches**

Cleans up merged feature branches automatically.

## Maintenance

**Review quarterly:**

- Check if protection rules are still active
- Verify status check names haven't changed
- Update required approvals if team grows
- Review bypass permissions (should be none)

**After workflow changes:**

- If renaming jobs in `.github/workflows/required-checks.yml`
- Update branch protection status check names to match
- Test with a dummy PR

## Reference Documentation

- GitHub Docs: [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- GitHub Docs: [Managing a branch protection rule](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)

## Summary Checklist

Before considering branch protection complete:

- [ ] Branch protection rule created for `main`
- [ ] Require pull request before merging: **ON**
- [ ] Require 1 approval: **ON**
- [ ] Require status checks to pass: **ON**
- [ ] 5 required status checks added: **TypeScript Type Check**, **ESLint**, **Test Suite**, **Build Verification**, **All Checks Passed**
- [ ] Require branches up to date: **ON**
- [ ] Require conversation resolution: **ON**
- [ ] Do not allow bypassing: **ON**
- [ ] Restrict pushes (exclude admins): **ON**
- [ ] Allow force pushes: **OFF**
- [ ] Allow deletions: **OFF**
- [ ] Verified direct push fails: **TESTED**
- [ ] Verified PR with failing checks blocks merge: **TESTED**
- [ ] Verified PR with passing checks allows merge: **TESTED**

**All items must be checked before protection is considered production-ready.**
