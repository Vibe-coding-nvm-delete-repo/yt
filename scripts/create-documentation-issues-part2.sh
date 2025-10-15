#!/bin/bash

# Documentation Issues Creation Script - Part 2
# Creates issues #10-15

set -e

echo "🚀 Creating Documentation Issues (Part 2: Issues #10-15)..."
echo ""

# Issue #10: Changelog & Feature Catalog
echo "📝 Creating Issue #10: Create Changelog and Feature Catalog..."
gh issue create \
  --title "docs: Features - Create Changelog and Feature Catalog" \
  --label "documentation,priority-high" \
  --milestone "Documentation Update" \
  --body "## 🎯 Objective
Create CHANGELOG.md following Keep a Changelog format and user-friendly FEATURES_CATALOG.md.

## 📄 Files to Create
- \`CHANGELOG.md\`
- \`FEATURES_CATALOG.md\`

## ✅ CHANGELOG.md Requirements
- [ ] Follow [Keep a Changelog](https://keepachangelog.com/) format
- [ ] [Unreleased] section for current changes
- [ ] Version History from git history:
  - v0.3.0 - October 2025: History tab, usage tracking, vertical layout
  - v0.2.0 - October 2025: Best Practices, multi-model support
  - v0.1.0 - Initial: Basic image-to-prompt generation
- [ ] For each version: Added, Changed, Deprecated, Removed, Fixed, Security
- [ ] Link PRs and issues where relevant

## ✅ FEATURES_CATALOG.md Requirements
- [ ] User Features (end-user focused):
  - Image Upload & Processing
  - Model Selection
  - Prompt Generation
  - History & Analytics
  - Best Practices Library
- [ ] For each feature: Description, How to use, Screenshots, Status, Version, Limitations
- [ ] Developer Features (P0, Performance, Error Handling, Testing)
- [ ] Integration Features (OpenRouter, Cost, Models)

## 🎓 Acceptance Criteria
- [ ] Changelog follows standard format
- [ ] All major changes from git history included
- [ ] Feature catalog is user-friendly
- [ ] Links work and point to correct resources
- [ ] Versions align with package.json if versioned

## ⏱️ Estimated Time
2-3 hours

## 🔗 References
- See \`DOCUMENTATION_AUDIT.md\` for detailed requirements
- Depends on: Issue #9
- Use: \`git log --oneline --all\` to review history"

echo "   ✅ Issue #10 created"
echo ""

# Issue #11: API Integration
echo "📝 Creating Issue #11: Create API Integration and OpenRouter documentation..."
gh issue create \
  --title "docs: API - Create API Integration and OpenRouter documentation" \
  --label "documentation,priority-medium" \
  --milestone "Documentation Update" \
  --body "## 🎯 Objective
Document OpenRouter API integration comprehensively for developers.

## 📄 Files to Create
- \`API_INTEGRATION.md\`
- \`docs/OPENROUTER_API.md\`

## ✅ API_INTEGRATION.md Requirements
- [ ] Overview (purpose, why OpenRouter, architecture decisions)
- [ ] OpenRouter Integration (how it works, endpoints, request/response, errors)
- [ ] Authentication (API key format, validation, storage, security)
- [ ] API Client (\`src/lib/openrouter.ts\` - class, methods, usage)
- [ ] Supported Operations (validate key, fetch models, generate prompt, cost calculation)
- [ ] Error Handling (ApiError class, codes, recovery, user messages)
- [ ] Rate Limiting (OpenRouter limits, throttling, retry logic)
- [ ] Testing (how to test, mocking, test keys)

## ✅ docs/OPENROUTER_API.md Requirements
- [ ] What is OpenRouter (overview, models, pricing)
- [ ] Getting API Key (signup steps, free vs paid, management)
- [ ] API Usage (authentication, request/response format, headers)
- [ ] Vision Models (listing, filtering, metadata, pricing)
- [ ] Chat Completions Endpoint (vision usage, request structure, image encoding, response parsing)
- [ ] Cost Tracking (billing, token-based pricing, input vs output, monitoring)
- [ ] Best Practices (model selection, prompt engineering, cost optimization, errors)
- [ ] Limits & Quotas (rate limits, token limits, spending limits)
- [ ] Troubleshooting (common errors, solutions, support)

## 🎓 Acceptance Criteria
- [ ] Covers all OpenRouter features we use
- [ ] Includes working code examples
- [ ] Error scenarios are documented
- [ ] Links to OpenRouter official docs
- [ ] Tested against actual API

## ⏱️ Estimated Time
2-3 hours

## 🔗 References
- See \`DOCUMENTATION_AUDIT.md\` for detailed requirements
- Reference: \`src/lib/openrouter.ts\`
- OpenRouter Docs: https://openrouter.ai/docs"

echo "   ✅ Issue #11 created"
echo ""

# Issue #12: Cost & Usage
echo "📝 Creating Issue #12: Create Cost Calculation and Usage documentation..."
gh issue create \
  --title "docs: API - Create Cost Calculation and Usage Tracking documentation" \
  --label "documentation,priority-medium" \
  --milestone "Documentation Update" \
  --body "## 🎯 Objective
Document cost calculation methodology and usage tracking system.

## 📄 Files to Create
- \`docs/COST_CALCULATION.md\`
- \`docs/USAGE_TRACKING.md\`

## ✅ docs/COST_CALCULATION.md Requirements
- [ ] Overview (why cost matters, accuracy, token-based pricing)
- [ ] Token Estimation:
  - Image tokens (how it works, size-based, accuracy)
  - Text tokens (4 chars per token rule, limitations)
- [ ] Cost Calculation Logic (\`src/lib/cost.ts\` functions)
- [ ] Pricing Sources (OpenRouter API, format, updates, caching)
- [ ] Cost Display (formatting, precision, currency)
- [ ] Examples (small/large image costs, multi-model, real-world)
- [ ] Accuracy (estimation vs actual, differences, verification)
- [ ] Cost Optimization (model selection, prompt length, batching)

## ✅ docs/USAGE_TRACKING.md Requirements
- [ ] Overview (what's tracked, LocalStorage, privacy)
- [ ] Usage Data Structure (UsageEntry type, fields, schema versioning)
- [ ] Storage Implementation (\`src/lib/usage.ts\` - UsageStorage class, limits, cleanup)
- [ ] Data Collection (when recorded, triggers, failed attempts)
- [ ] Usage Analytics (total spend, filtering, model-specific, trends)
- [ ] Data Management (export/import if any, clearing, limits)
- [ ] Privacy & Security (no server storage, LocalStorage, retention, user control)

## 🎓 Acceptance Criteria
- [ ] Cost calculation formulas clearly explained
- [ ] Examples include real numbers
- [ ] Usage tracking system fully documented
- [ ] Privacy implications are clear
- [ ] Links to relevant code files

## ⏱️ Estimated Time
2 hours

## 🔗 References
- See \`DOCUMENTATION_AUDIT.md\` for detailed requirements
- Depends on: Issue #11
- Reference: \`src/lib/cost.ts\`, \`src/lib/usage.ts\`"

echo "   ✅ Issue #12 created"
echo ""

# Issue #13: Testing Guide
echo "📝 Creating Issue #13: Create Testing Guide and update Engineering Standards..."
gh issue create \
  --title "docs: Testing - Create Testing Guide and update Engineering Standards" \
  --label "documentation,priority-high" \
  --milestone "Documentation Update" \
  --body "## 🎯 Objective
Create comprehensive testing guide and expand Engineering Standards with testing patterns.

## 📄 Files to Create
- \`TESTING_GUIDE.md\`

## 📄 Files to Update
- \`docs/ENGINEERING_STANDARDS.md\`

## ✅ TESTING_GUIDE.md Requirements
- [ ] Testing Philosophy (why, what, pyramid, coverage goals 60%+)
- [ ] Testing Tools (Jest config, RTL, best practices, tsd)
- [ ] Unit Testing (what to test, how to write, mocking, examples)
- [ ] Component Testing (what to test, render/interaction/a11y tests, examples)
- [ ] Integration Testing (what to test, flows, multi-component, examples)
- [ ] Hook Testing (how to test, renderHook, act warnings, examples)
- [ ] Mocking (localStorage, API calls, contexts, modules, setup files)
- [ ] Test Organization (naming, co-location, structure, describe blocks)
- [ ] Running Tests (all, specific, watch, coverage, CI)
- [ ] Test Quality (AAA pattern, descriptive names, one assertion, avoiding interdependence/flaky tests)
- [ ] Common Patterns (async, errors, loading, forms, modals)
- [ ] Troubleshooting (failures, act warnings, timeouts, mocks)

## ✅ ENGINEERING_STANDARDS.md Updates
- [ ] Expand Section 6: Testing Requirements
  - Minimum coverage: 60% global, 80% new code
  - Required tests for features/bugs
  - Test file naming/location
  - What must be tested (critical paths)
  - What can be skipped (trivial getters)
- [ ] Add: Storage Testing Patterns
- [ ] Add: Hook Testing Patterns
- [ ] Add: Component Testing Patterns

## 🎓 Acceptance Criteria
- [ ] Testing guide covers all test types
- [ ] Examples are runnable and current
- [ ] Engineering standards updated consistently
- [ ] Links between docs functional
- [ ] Reviewed by someone who writes tests

## ⏱️ Estimated Time
2-3 hours

## 🔗 References
- See \`DOCUMENTATION_AUDIT.md\` for detailed requirements
- Reference: Existing test files in \`src/**/__tests__/\`"

echo "   ✅ Issue #13 created"
echo ""

# Issue #14: Deployment & Operations
echo "📝 Creating Issue #14: Update Deployment Guide and create Operations docs..."
gh issue create \
  --title "docs: Operations - Update Deployment Guide and create Operations documentation" \
  --label "documentation,priority-medium" \
  --milestone "Documentation Update" \
  --body "## 🎯 Objective
Update deployment guide with app-specific details and create operations documentation.

## 📄 Files to Update
- \`DEPLOYMENT_SETUP_GUIDE.md\`

## 📄 Files to Create
- \`docs/DEPLOYMENT_CHECKLIST.md\`
- \`docs/MONITORING.md\`

## ✅ DEPLOYMENT_SETUP_GUIDE.md Updates
- [ ] Add app-specific configuration (env vars, build config, Next.js 15, Turbopack)
- [ ] Add Vercel-specific settings (framework preset, build command, output, env vars, previews)
- [ ] Add post-deployment verification (smoke tests, key features, API check, LocalStorage)
- [ ] Add rollback procedures (how to rollback on Vercel, emergency procedures, monitoring)

## ✅ docs/DEPLOYMENT_CHECKLIST.md Requirements
- [ ] Pre-Deployment checklist (tests, lint, build, env vars, API keys, changelog, docs)
- [ ] Deployment Steps (branch/tag, push, verify build, monitor, check logs)
- [ ] Post-Deployment checklist (verify URL, smoke test, API test, console check, analytics, error monitoring)
- [ ] Rollback Plan (steps, when to rollback, communication)

## ✅ docs/MONITORING.md Requirements
- [ ] What to Monitor (builds, runtime errors, API errors, performance, feedback)
- [ ] Where to Monitor (Vercel dashboard, GitHub Actions, browser console, error tracking)
- [ ] Key Metrics (build success rate, deployment frequency, time to deploy, error rate, API success)
- [ ] Alerts if configured (build/deployment failures, high error rates)
- [ ] Incident Response (who to contact, escalation, communication channels)

## 🎓 Acceptance Criteria
- [ ] Deployment guide is app-specific
- [ ] Checklist is comprehensive
- [ ] Monitoring covers key areas
- [ ] Tested with actual deployment
- [ ] Rollback procedures are clear

## ⏱️ Estimated Time
2 hours

## 🔗 References
- See \`DOCUMENTATION_AUDIT.md\` for detailed requirements
- Reference: Existing \`DEPLOYMENT_SETUP_GUIDE.md\`"

echo "   ✅ Issue #14 created"
echo ""

# Issue #15: Reference Documentation
echo "📝 Creating Issue #15: Create API, Hooks, and Types Reference documentation..."
gh issue create \
  --title "docs: Reference - Create API, Hooks, and Types Reference documentation" \
  --label "documentation,priority-low" \
  --milestone "Documentation Update" \
  --body "## 🎯 Objective
Create comprehensive reference documentation for APIs, utilities, and types.

## 📄 Files to Create
- \`docs/API_REFERENCE.md\`
- \`docs/UTILITIES_REFERENCE.md\`
- \`docs/TYPES_REFERENCE.md\`

## ✅ docs/API_REFERENCE.md Requirements
- [ ] Storage Classes (SettingsStorage, ImageStateStorage, UsageStorage, HistoryStorage, BestPracticesStorage)
- [ ] API Clients (OpenRouterClient)
- [ ] For each method: Signature, Parameters with types, Return type, Description, Example, Throws, Notes

## ✅ docs/UTILITIES_REFERENCE.md Requirements
- [ ] Cost Utilities (\`src/lib/cost.ts\` - all functions)
- [ ] Error Utilities (\`src/lib/errorUtils.ts\`)
- [ ] Retry Utilities (\`src/utils/retry.ts\`)
- [ ] Batch Queue (\`src/lib/batchQueue.ts\`)
- [ ] For each: Signature, Parameters, Return value, Description, Example, Edge cases

## ✅ docs/TYPES_REFERENCE.md Requirements
- [ ] Core Types (\`src/types/index.ts\` - VisionModel, AppSettings, all types)
- [ ] Usage Types (\`src/types/usage.ts\`)
- [ ] History Types (\`src/types/history.ts\`)
- [ ] Error Types (\`src/types/errors.ts\`)
- [ ] Validation Types (\`src/types/validation.ts\`)
- [ ] For each: Type definition, Field descriptions, Default values, Usage example, Related types

## 🎓 Acceptance Criteria
- [ ] All public APIs documented
- [ ] All utility functions documented
- [ ] All exported types documented
- [ ] Examples are accurate and runnable
- [ ] Cross-references between docs work
- [ ] Generated from actual source (stay in sync)

## ⏱️ Estimated Time
3-4 hours

## 🔗 References
- See \`DOCUMENTATION_AUDIT.md\` for detailed requirements
- Depends on: Issue #6, Issue #7
- Reference: All source files in \`src/lib/\`, \`src/types/\`, \`src/hooks/\`

## 💡 Tip
Consider using TypeDoc or similar tool to auto-generate some of this documentation from JSDoc comments."

echo "   ✅ Issue #15 created"
echo ""

echo "✅ All remaining issues (#10-15) created successfully!"
echo ""
echo "📊 Complete Summary:"
echo "   Total Issues Created: 15"
echo "   - User-Facing Docs: 3 issues (#1-3)"
echo "   - Developer Docs: 2 issues (#4-5)"
echo "   - Architecture Docs: 3 issues (#6-8)"
echo "   - Feature Docs: 2 issues (#9-10)"
echo "   - API Docs: 2 issues (#11-12)"
echo "   - Testing Docs: 1 issue (#13)"
echo "   - Operations Docs: 1 issue (#14)"
echo "   - Reference Docs: 1 issue (#15)"
echo ""
echo "🔗 View all issues: gh issue list --milestone 'Documentation Update'"
echo "📋 Track progress: gh issue list --milestone 'Documentation Update' --state all"
echo ""
echo "Next steps:"
echo "  1. Review all created issues"
echo "  2. Assign issues to team members or self"
echo "  3. Start with Phase 1 (Critical user-facing docs)"
echo "  4. Update DOCUMENTATION_AUDIT.md as issues are completed"
