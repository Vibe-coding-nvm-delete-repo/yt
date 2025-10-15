#!/bin/bash

# Documentation Issues Creation Script
# This script creates all 15 documentation issues systematically

set -e

echo "🚀 Creating Documentation Issues..."
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is ready"
echo ""

# Create milestone if it doesn't exist
echo "📌 Creating 'Documentation Update' milestone..."
gh api repos/:owner/:repo/milestones \
  --method POST \
  --field title='Documentation Update' \
  --field description='Comprehensive documentation update across all categories' \
  --field state='open' 2>/dev/null || echo "   Milestone may already exist"
echo ""

# Issue #1: README & Getting Started
echo "📝 Creating Issue #1: Update README and Create Getting Started Guide..."
gh issue create \
  --title "docs: User Docs - Update README and create Getting Started guide" \
  --label "documentation,priority-critical" \
  --milestone "Documentation Update" \
  --body "## 🎯 Objective
Update README.md from generic Next.js boilerplate to comprehensive project overview and create a Getting Started guide for new users.

## 📋 Files to Update
- \`README.md\` (complete rewrite)

## 📄 Files to Create
- \`GETTING_STARTED.md\`

## ✅ README.md Requirements
- [ ] Application overview and purpose
- [ ] Key features list with brief descriptions
- [ ] Technology stack (Next.js 15, React 19, TypeScript, OpenRouter API)
- [ ] Quick start instructions
- [ ] Link to detailed guides
- [ ] Screenshots/demo GIF
- [ ] Project structure overview
- [ ] Links to documentation
- [ ] License and contribution info

## ✅ GETTING_STARTED.md Requirements
- [ ] Prerequisites (Node.js version, npm/yarn)
- [ ] Installation steps
- [ ] OpenRouter API key setup
- [ ] Environment configuration
- [ ] First-time user walkthrough
- [ ] Common first steps
- [ ] Next steps / advanced usage links

## 🎓 Acceptance Criteria
- [ ] README is comprehensive but concise (<200 lines)
- [ ] Getting Started guide walks user through setup in <5 minutes
- [ ] All links work and point to correct resources
- [ ] Screenshots are clear and up-to-date
- [ ] Reviewed by at least one other developer

## ⏱️ Estimated Time
2-3 hours

## 🔗 References
- See \`DOCUMENTATION_AUDIT.md\` for detailed requirements
- Related to: User-facing documentation (Phase 1)"

echo "   ✅ Issue #1 created"
echo ""

# Issue #2: User Guide
echo "📝 Creating Issue #2: Create User Guide with Screenshots..."
gh issue create \
  --title "docs: User Docs - Create comprehensive User Guide with screenshots" \
  --label "documentation,priority-critical" \
  --milestone "Documentation Update" \
  --body "## 🎯 Objective
Create comprehensive user documentation with screenshots for all major features.

## 📄 Files to Create
- \`USER_GUIDE.md\`
- \`docs/assets/\` (directory for screenshots)

## ✅ Content Requirements

### Sections to Include
- [ ] Introduction (what, who, benefits)
- [ ] Configuration (API key, models, prompts, pinning)
- [ ] Image-to-Prompt Generation (upload, single/multi-model, results, costs)
- [ ] History & Analytics (viewing, searching, filtering, sorting)
- [ ] Usage Tracking (statistics, date ranges, cost analysis)
- [ ] Best Practices Management (creating, categories, types, importance)
- [ ] Tips & Tricks (shortcuts, performance, optimization)

### Screenshots Required
- [ ] Settings page with API key
- [ ] Model selection interface
- [ ] Image upload interface
- [ ] Multi-model generation in progress
- [ ] Results display
- [ ] History tab with filters
- [ ] Usage analytics
- [ ] Best Practices management

## 🎓 Acceptance Criteria
- [ ] Every major feature documented with screenshots
- [ ] Step-by-step instructions are clear and actionable
- [ ] Screenshots are annotated where helpful
- [ ] Guide is organized with clear navigation
- [ ] Tested by a user unfamiliar with the app

## ⏱️ Estimated Time
3-4 hours

## 🔗 References
- See \`DOCUMENTATION_AUDIT.md\` for detailed requirements
- Depends on: Issue #1

## 📸 Screenshot Tool Recommendations
- macOS: Cmd+Shift+4, Cmd+Shift+5 (built-in)
- Windows: Snipping Tool, Win+Shift+S
- Cross-platform: Flameshot, ShareX
- Annotation: Skitch, Greenshot"

echo "   ✅ Issue #2 created"
echo ""

# Issue #3: Troubleshooting & FAQ
echo "📝 Creating Issue #3: Create Troubleshooting and FAQ..."
gh issue create \
  --title "docs: User Docs - Create Troubleshooting and FAQ documentation" \
  --label "documentation,priority-high" \
  --milestone "Documentation Update" \
  --body "## 🎯 Objective
Create troubleshooting guide for common issues and FAQ for frequently asked questions.

## 📄 Files to Create
- \`TROUBLESHOOTING.md\`
- \`FAQ.md\`

## ✅ TROUBLESHOOTING.md Sections
- [ ] API Key Issues (invalid, not saving, validation failing)
- [ ] Image Upload Issues (file type, size, display, upload failing)
- [ ] Generation Issues (stuck/hanging, model errors, slow, no results)
- [ ] Cost Calculation Issues (incorrect cost, token counts, not updating)
- [ ] History & Data Issues (not saving, data loss, quota exceeded, export)
- [ ] Browser Issues (compatibility, LocalStorage, cookies, performance)
- [ ] Build/Deployment Issues (failures, env vars, Vercel, TypeScript)

## ✅ FAQ.md Sections
- [ ] General Questions (what, free?, models, cost calculation)
- [ ] API & Integration (API key source, OpenRouter, other providers, rate limits)
- [ ] Features (model limits, multiple images, history, export)
- [ ] Privacy & Security (server storage, API key storage, image upload, GDPR)
- [ ] Technical (browser support, self-hosting, contributing, bug reports)

## 🎓 Acceptance Criteria
- [ ] Covers 80% of common issues based on git issues
- [ ] Solutions are tested and verified
- [ ] FAQ answers are clear and concise
- [ ] Links to relevant documentation sections
- [ ] Organized with clear categories

## ⏱️ Estimated Time
2-3 hours

## 🔗 References
- See \`DOCUMENTATION_AUDIT.md\` for detailed requirements
- Depends on: Issue #2
- Review existing GitHub issues for common problems"

echo "   ✅ Issue #3 created"
echo ""

# Issue #4: Contributing & Dev Setup
echo "📝 Creating Issue #4: Create Contributing Guide and Development Setup..."
gh issue create \
  --title "docs: Developer Docs - Create Contributing guide and Development Setup" \
  --label "documentation,priority-high" \
  --milestone "Documentation Update" \
  --body "## 🎯 Objective
Create comprehensive guides for contributors and local development setup.

## 📄 Files to Create
- \`CONTRIBUTING.md\`
- \`DEVELOPMENT_SETUP.md\`

## ✅ CONTRIBUTING.md Requirements
- [ ] Welcome message
- [ ] Code of Conduct reference
- [ ] How to contribute (bugs, features, PRs)
- [ ] Development process (fork, clone, branches, commits, PRs)
- [ ] Code standards (ESLint, TypeScript, testing, documentation)
- [ ] Review process (expectations, how reviews work, merge requirements)
- [ ] Getting help (communication channels)

## ✅ DEVELOPMENT_SETUP.md Requirements
- [ ] Prerequisites (Node.js, npm/yarn, Git, editor)
- [ ] Installation (clone, dependencies, env vars, API key)
- [ ] Running locally (dev server, build, test, lint, typecheck)
- [ ] IDE Setup (VS Code extensions, ESLint, Prettier, TypeScript)
- [ ] Project structure (directories, key files, organization)
- [ ] Development workflow (branch, changes, tests, commit, PR)
- [ ] Common tasks (new component, hook, utility, tests, docs)

## 🎓 Acceptance Criteria
- [ ] A new developer can set up project in <10 minutes
- [ ] All commands are tested and work
- [ ] Prerequisites are clearly stated
- [ ] Links to relevant tools and resources
- [ ] Reviewed by someone new to the project

## ⏱️ Estimated Time
2-3 hours

## 🔗 References
- See \`DOCUMENTATION_AUDIT.md\` for detailed requirements
- Reference: \`docs/ENGINEERING_STANDARDS.md\`"

echo "   ✅ Issue #4 created"
echo ""

# Issue #5: Code of Conduct & Security
echo "📝 Creating Issue #5: Update Code of Conduct and Security Policy..."
gh issue create \
  --title "docs: Meta - Update Code of Conduct and Security Policy" \
  --label "documentation,priority-medium" \
  --milestone "Documentation Update" \
  --body "## 🎯 Objective
Update Code of Conduct with contact information and replace Security.md template with actual policy.

## 📄 Files to Update
- \`CODE_OF_CONDUCT.md\`
- \`SECURITY.md\`

## ✅ CODE_OF_CONDUCT.md Updates
- [ ] Update enforcement contact email (line 63)
- [ ] Add project-specific enforcement guidelines if needed
- [ ] Verify all sections are relevant

## ✅ SECURITY.md Updates
- [ ] Replace template with actual security policy
- [ ] Supported Versions (current version, supported, EOL)
- [ ] Reporting Vulnerabilities (how, what to include, response time, disclosure)
- [ ] Security Best Practices (API key storage, data privacy, dependencies, build)
- [ ] Known Security Considerations (LocalStorage, API key handling, CORS, XSS)
- [ ] Security Updates (communication, update process)

## 🎓 Acceptance Criteria
- [ ] Contact information is valid and monitored
- [ ] Security policy is clear and actionable
- [ ] Matches project's actual security posture
- [ ] References relevant security resources

## ⏱️ Estimated Time
1 hour

## 🔗 References
- See \`DOCUMENTATION_AUDIT.md\` for detailed requirements"

echo "   ✅ Issue #5 created"
echo ""

# Issue #6: Architecture Overview
echo "📝 Creating Issue #6: Create Architecture Overview and System Design..."
gh issue create \
  --title "docs: Architecture - Create Architecture Overview and System Design docs" \
  --label "documentation,priority-high" \
  --milestone "Documentation Update" \
  --body "## 🎯 Objective
Create comprehensive architecture documentation with diagrams and design decisions.

## 📄 Files to Create
- \`ARCHITECTURE.md\`
- \`docs/SYSTEM_DESIGN.md\`

## ✅ ARCHITECTURE.md Requirements
- [ ] Overview (diagram, tech stack, design principles, decisions)
- [ ] Application Layers (presentation, state, business logic, data, integrations)
- [ ] Layer Boundaries (import rules, patterns, enforcement)
- [ ] Component Architecture (hierarchy, types, composition)
- [ ] State Management (storage patterns, persistence, subscriptions, cross-tab sync)
- [ ] Data Flow (user action flow, API calls, real-time updates, errors)
- [ ] Performance Architecture (selective subscriptions, batch updates, memoization, parallel processing)
- [ ] Storage Architecture (LocalStorage schema, versioning, migrations, cleanup)

## ✅ SYSTEM_DESIGN.md Requirements
- [ ] Design Decisions (ADRs for key choices)
- [ ] Scalability Considerations (limits, caps)
- [ ] Performance Considerations (optimization strategies)
- [ ] Security Considerations (client-side architecture, API key, privacy)
- [ ] Future Considerations (backend, export/import, collaboration)

## 🎓 Acceptance Criteria
- [ ] Architecture diagrams are included (Mermaid or images)
- [ ] All major systems are documented
- [ ] Design decisions explained with rationale
- [ ] Useful for new developers and external reviewers

## ⏱️ Estimated Time
3-4 hours

## 🔗 References
- See \`DOCUMENTATION_AUDIT.md\` for detailed requirements
- Reference: \`docs/P0_ENFORCEMENT_SYSTEM.md\`"

echo "   ✅ Issue #6 created"
echo ""

# Issue #7: State Management & Hooks
echo "📝 Creating Issue #7: Create State Management and Hooks documentation..."
gh issue create \
  --title "docs: Architecture - Create State Management and Hooks documentation" \
  --label "documentation,priority-high" \
  --milestone "Documentation Update" \
  --body "## 🎯 Objective
Document state management patterns and custom hooks comprehensively.

## 📄 Files to Create
- \`docs/STATE_MANAGEMENT.md\`
- \`docs/HOOKS_REFERENCE.md\`

## ✅ STATE_MANAGEMENT.md Requirements
- [ ] Overview (philosophy, singleton pattern, why no Redux/Zustand)
- [ ] Storage System (all storage classes)
- [ ] Subscription System (how it works, selective subscriptions, batch updates, debouncing)
- [ ] Usage Patterns (basic, selective, batches, custom hooks)
- [ ] Best Practices (when to subscribe, avoiding re-renders, optimization, testing)
- [ ] Examples (simple component, optimized, batch update, custom hook)

## ✅ HOOKS_REFERENCE.md Requirements
- [ ] Custom Hooks Catalog (all custom hooks listed)
- [ ] Hook Details for each:
  - Purpose and use case
  - Parameters
  - Return values
  - Examples
  - Performance considerations
  - Common patterns
  - Gotchas and warnings
- [ ] Hook Composition (building, combining, best practices, anti-patterns)
- [ ] Testing Hooks (how to test, mock strategies, examples)

## 🎓 Acceptance Criteria
- [ ] All custom hooks are documented
- [ ] Code examples are tested and work
- [ ] Performance implications are clear
- [ ] Cross-references to architecture docs
- [ ] Useful for both new and experienced developers

## ⏱️ Estimated Time
2-3 hours

## 🔗 References
- See \`DOCUMENTATION_AUDIT.md\` for detailed requirements
- Depends on: Issue #6
- Reference: \`src/hooks/\`, \`src/lib/storage.ts\`"

echo "   ✅ Issue #7 created"
echo ""

# Issue #8: Component Guidelines
echo "📝 Creating Issue #8: Create Component Guidelines and React Patterns..."
gh issue create \
  --title "docs: Architecture - Create Component Guidelines and React Best Practices" \
  --label "documentation,priority-medium" \
  --milestone "Documentation Update" \
  --body "## 🎯 Objective
Document component structure, guidelines, and common React patterns.

## 📄 Files to Create
- \`docs/COMPONENT_GUIDELINES.md\`
- \`docs/REACT_PATTERNS.md\`

## ✅ COMPONENT_GUIDELINES.md Requirements
- [ ] Component Structure (file organization, naming, imports, anatomy)
- [ ] Component Types (presentational, container, layout, utility)
- [ ] Props Best Practices (interfaces, naming, defaults, validation, max 10 limit)
- [ ] State Management (when local, when global, max 8 useState, useReducer)
- [ ] Event Handlers (naming, composition, max 10 limit)
- [ ] Performance (React.memo, useCallback, useMemo, when to optimize)
- [ ] Styling (Tailwind usage, class organization, responsive, dark mode)
- [ ] Accessibility (ARIA, keyboard, focus, screen readers)
- [ ] Testing Components (what, how, organization)

## ✅ REACT_PATTERNS.md Requirements
- [ ] Common Patterns (compound components, render props, HOC, custom hooks, context providers)
- [ ] Error Handling (boundaries, error states, recovery)
- [ ] Loading States (skeleton, spinners, progressive loading)
- [ ] Form Patterns (controlled inputs, validation, error display, submit handling)
- [ ] Modal Patterns (structure, focus trapping, backdrop, accessibility)

## 🎓 Acceptance Criteria
- [ ] Covers all P0 component rules
- [ ] Includes practical examples
- [ ] References existing components as examples
- [ ] Aligns with ENGINEERING_STANDARDS.md

## ⏱️ Estimated Time
2-3 hours

## 🔗 References
- See \`DOCUMENTATION_AUDIT.md\` for detailed requirements
- Depends on: Issue #6
- Reference: \`docs/P0_ENFORCEMENT_SYSTEM.md\`, \`docs/ENGINEERING_STANDARDS.md\`"

echo "   ✅ Issue #8 created"
echo ""

# Continue with remaining issues...
# (Issues 9-15 following the same pattern)

# Issue #9: Feature Summary Update
echo "📝 Creating Issue #9: Update Feature Implementation Summary comprehensively..."
gh issue create \
  --title "docs: Features - Update Feature Implementation Summary comprehensively" \
  --label "documentation,priority-critical" \
  --milestone "Documentation Update" \
  --body "## 🎯 Objective
Expand FEATURE_IMPLEMENTATION_SUMMARY.md from Best Practices-only to comprehensive feature catalog.

## 📄 Files to Update
- \`FEATURE_IMPLEMENTATION_SUMMARY.md\` → Rename to \`FEATURES_COMPREHENSIVE.md\`

## ✅ Requirements
- [ ] Rename file to FEATURES_COMPREHENSIVE.md
- [ ] Add Overview Section (purpose, categories, status legend)
- [ ] Document Core Features:
  - Image-to-Prompt Generation (single, multi-model, parallel, costs, persistence)
  - Settings Management (API key, models, prompts, pinning)
  - History Tracking (search, filter, sort, detailed view, pagination)
  - Usage Analytics (cost tracking, date range, model-specific, total spend)
  - Best Practices Management (keep existing detailed section)
- [ ] Document Infrastructure Features (P0, Storage, Errors, Performance, Testing)
- [ ] Technical Implementation (stack, architecture, libraries)
- [ ] Feature Roadmap (if applicable)
- [ ] Change History (feature additions by date, breaking changes, deprecations)

## 🎓 Acceptance Criteria
- [ ] All implemented features are documented
- [ ] Status is accurate (implemented, planned, deprecated)
- [ ] Includes implementation dates where available
- [ ] Links to detailed docs where appropriate
- [ ] Reviewed against actual codebase

## ⏱️ Estimated Time
2-3 hours

## 🔗 References
- See \`DOCUMENTATION_AUDIT.md\` for detailed requirements
- Reference: Existing \`FEATURE_IMPLEMENTATION_SUMMARY.md\`"

echo "   ✅ Issue #9 created"
echo ""

echo "✅ All 9 issues created successfully!"
echo ""
echo "📊 Summary:"
echo "   - User-Facing Docs: 3 issues (#1-3)"
echo "   - Developer Docs: 2 issues (#4-5)"
echo "   - Architecture Docs: 3 issues (#6-8)"
echo "   - Feature Docs: 1 issue (#9)"
echo ""
echo "🔗 View issues: gh issue list --milestone 'Documentation Update'"
echo ""
echo "Note: Issues #10-15 templates are in DOCUMENTATION_AUDIT.md"
echo "Run this script again with updated content to create remaining issues."
