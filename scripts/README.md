# Scripts Directory

This directory contains utility scripts for the project.

## Documentation Issue Creation Scripts

### Overview
These scripts automate the creation of 15 GitHub issues for the comprehensive documentation update.

### Prerequisites
- [GitHub CLI](https://cli.github.com/) installed and authenticated
- Repository access with issue creation permissions

### Usage

#### Create Issues 1-9 (User, Developer, Architecture Docs)
```bash
./scripts/create-documentation-issues.sh
```

This creates:
- Issue #1: Update README & Create Getting Started
- Issue #2: Create User Guide with Screenshots
- Issue #3: Create Troubleshooting & FAQ
- Issue #4: Create Contributing & Dev Setup
- Issue #5: Update Code of Conduct & Security
- Issue #6: Create Architecture Overview
- Issue #7: Create State Management & Hooks Docs
- Issue #8: Create Component Guidelines
- Issue #9: Update Feature Summary

#### Create Issues 10-15 (Features, API, Testing, Reference Docs)
```bash
./scripts/create-documentation-issues-part2.sh
```

This creates:
- Issue #10: Create Changelog & Feature Catalog
- Issue #11: Create API Integration Docs
- Issue #12: Create Cost & Usage Docs
- Issue #13: Create Testing Guide
- Issue #14: Update Deployment & Operations Docs
- Issue #15: Create API Reference Docs

### What the Scripts Do

1. **Check prerequisites** - Verifies GitHub CLI is installed and authenticated
2. **Create milestone** - Creates "Documentation Update" milestone if it doesn't exist
3. **Create issues** - Creates each issue with:
   - Descriptive title
   - Detailed description with checklists
   - Appropriate labels (`documentation`, priority)
   - Milestone assignment
   - Acceptance criteria
   - Time estimates
   - Dependencies and references

### Viewing Created Issues

```bash
# List all documentation issues
gh issue list --milestone "Documentation Update"

# List by state
gh issue list --milestone "Documentation Update" --state open
gh issue list --milestone "Documentation Update" --state closed

# List by priority
gh issue list --label "documentation,priority-critical"
gh issue list --label "documentation,priority-high"
gh issue list --label "documentation,priority-medium"
```

### Manual Creation Alternative

If you prefer not to use the scripts, all issue templates are available in:
- `DOCUMENTATION_AUDIT.md` - Contains detailed specifications for all 15 issues

You can copy the content from the audit document and create issues manually via:
- GitHub web UI
- `gh issue create` command

### Troubleshooting

**"gh: command not found"**
- Install GitHub CLI: https://cli.github.com/

**"Not authenticated with GitHub CLI"**
```bash
gh auth login
```

**"Milestone already exists"**
- This is fine! The script will continue and use the existing milestone.

**"Permission denied"**
- Make scripts executable: `chmod +x scripts/*.sh`

### Related Documentation

- `DOCUMENTATION_AUDIT.md` - Comprehensive audit with all issue details
- `DOCUMENTATION_UPDATE_PLAN.md` - Executive summary and implementation plan

---

**Need help?** Check the troubleshooting section in the scripts or review the audit document.
