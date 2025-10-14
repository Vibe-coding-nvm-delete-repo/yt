# P0 Enforcement - Known Issues & Exceptions

## Overview

This document tracks existing codebase violations that pre-date P0 enforcement. These are **legacy technical debt** items scheduled for resolution in P1 (Foundation) phase.

## Parse Errors (Pre-existing in main branch)

The following files have syntax/merge conflict issues in the main branch:

### 1. `src/lib/storage.ts`

- **Issue**: Duplicate imports and code blocks from merge conflicts
- **Error**: "Declaration or statement expected" at line 54
- **Impact**: TypeScript compilation fails
- **Priority**: HIGH - Must fix before P1
- **Owner**: TBD

### 2. `src/contexts/SettingsContext.tsx`

- **Issue**: Missing closing brace, duplicate code blocks
- **Error**: "'}' expected" at line 240
- **Impact**: TypeScript compilation fails
- **Priority**: HIGH - Must fix before P1
- **Owner**: TBD

### 3. `src/components/ImageToPromptTab.tsx`

- **Issue**: Malformed JSX, syntax errors
- **Error**: Multiple parse errors starting at line 267
- **Impact**: TypeScript compilation fails
- **Priority**: HIGH - Must fix before P1
- **Owner**: TBD

### 4. `src/components/__tests__/ImageToPromptTab.integration.test.tsx`

- **Issue**: Parse errors in test file
- **Error**: "':' expected" at line 7
- **Impact**: Tests may not run properly
- **Priority**: MEDIUM
- **Owner**: TBD

## File Size Violations

### 1. `src/components/SettingsTab.tsx` - 760 lines

- **Status**: EXEMPTED from P0 enforcement
- **Reason**: Legacy monolithic component
- **Plan**: Decompose in P1 phase (Week 2-3)
- **Target**: Split into 5-7 focused sub-components
- **Tracking**: See P1 task breakdown

## Warnings (Non-Blocking)

The following warnings exist but don't block commits/PRs:

### Async Error Handling

- Multiple files in `src/lib/` missing try-catch blocks
- **Rule**: `custom/require-error-handling`
- **Priority**: LOW - Address incrementally
- **Files affected**:
  - `src/lib/batchQueue.ts`
  - `src/lib/imageStorage.ts`

### React Hook Dependencies

- `src/components/SettingsTab.tsx` has exhaustive-deps warnings
- **Priority**: LOW - Will be resolved during P1 refactoring

### Direct DOM Manipulation

- `src/components/SettingsTab.tsx` uses appendChild/removeChild
- **Priority**: MEDIUM - Refactor to use refs
- **Plan**: Address during P1 decomposition

## Action Plan

### Immediate (Before P1):

1. ✅ **P0 Enforcement Active** - New code must meet standards
2. ❌ **Fix Parse Errors** - storage.ts, SettingsContext.tsx, ImageToPromptTab.tsx
3. ❌ **Verify Tests Pass** - Ensure test suite runs cleanly

### P1 Phase (Weeks 2-3):

1. Decompose SettingsTab.tsx (760 lines → 5-7 components)
2. Fix React Hook dependency warnings
3. Refactor DOM manipulation to use refs
4. Add error handling to async functions

### P2-P3 (Weeks 4-6):

1. Address remaining warnings incrementally
2. Add comprehensive tests for refactored code
3. Document architectural patterns

## Enforcement Status

| Check                       | Status     | Notes                     |
| --------------------------- | ---------- | ------------------------- |
| ESLint Custom Rules         | ✅ ACTIVE  | Blocking new violations   |
| Pre-commit Hooks            | ✅ ACTIVE  | lint-staged running       |
| CI Architecture Guard       | ✅ ACTIVE  | Workflow ready            |
| File Size Limit (400 lines) | ⚠️ PARTIAL | SettingsTab.tsx exempted  |
| Architecture Boundaries     | ✅ ACTIVE  | Blocking layer violations |
| Component Complexity        | ✅ ACTIVE  | Blocking new violations   |

## Developer Notes

- **P0 enforcement is live** - All new code must meet standards
- **Legacy code is exempted** - Pre-existing violations tracked here
- **Fix before P1** - Parse errors must be resolved before refactoring
- **Progressive improvement** - Address warnings incrementally

---

**Last Updated**: 2025-10-13  
**Review Cycle**: Weekly during P1 phase  
**Owner**: Architecture Team
