# P0 Enforcement System - Architecture Guards

## Overview

This document describes the **P0 Critical Path** enforcement system implemented to prevent codebase degradation and maintain architectural standards. This is a **blocking system** - violations prevent code from being committed or merged.

## 🎯 Goals

1. **Prevent Monolithic Files**: No file should exceed 400 lines (excluding comments)
2. **Enforce Architectural Boundaries**: Maintain clean layered architecture
3. **Limit Component Complexity**: Keep components focused and maintainable
4. **Ensure Code Quality**: Block common anti-patterns and enforce best practices

## 🏗️ Architecture Layers

The codebase follows a strict layered architecture:

```
app (Next.js pages/routes)
  ↓ can import from ↓
components (React UI components)
  ↓ can import from ↓
contexts + hooks (State management & logic)
  ↓ can import from ↓
domain (Business logic & types)
  ↓ can import from ↓
lib (Utilities & external integrations)
  ↓ can import from ↓
external packages (npm dependencies)
```

### Rules:

- **Lower layers CANNOT import from higher layers**
- **Components CANNOT import from app/**
- **lib/ CANNOT import from components/contexts/hooks/app/**
- Horizontal imports within the same layer are allowed

## 🛡️ Enforcement Layers

### Layer 1: Custom ESLint Rules (`eslint-rules/index.js`)

#### Rule: `custom/max-file-size`

- **Severity**: ERROR
- **Limit**: 400 lines (code only, excluding comments)
- **Message**: "File has {actual} lines but maximum allowed is {max} lines"
- **Action**: Split file into smaller, focused modules

#### Rule: `custom/architecture-boundaries`

- **Severity**: ERROR
- **Enforces**:
  - Components cannot import from app/
  - lib/ cannot import from components/contexts/hooks/app/
  - Respect layer hierarchy (no upward imports)
- **Message**: "{{layer}} layer cannot import from {{targetLayer}} layer"

#### Rule: `custom/component-complexity`

- **Severity**: ERROR
- **Limits**:
  - Max 10 props per component
  - Max 8 `useState` calls per component
  - Max 10 event handlers per component
- **Action**: Use composition, useReducer, or extract to custom hooks

#### Rule: `custom/no-dom-manipulation`

- **Severity**: WARNING
- **Prevents**: Direct DOM manipulation outside React patterns
- **Allowed**: Within `useEffect` and `useLayoutEffect`
- **Message**: "Direct DOM manipulation detected. Use React refs and state"

#### Rule: `custom/require-error-handling`

- **Severity**: WARNING
- **Requires**: try-catch blocks in async functions with await
- **Exceptions**: Functions named `*Unsafe` or `*NoThrow`

### Layer 2: Pre-Commit Hooks (`.husky/pre-commit`)

Runs automatically before every commit:

1. **lint-staged**: Runs ESLint + Prettier on staged files only
2. **Blocks commit** if any ESLint errors exist
3. **Provides immediate feedback** at development time

### Layer 3: CI Architecture Guard (`.github/workflows/architecture-guard.yml`)

Runs on every PR and push to main/develop:

#### Checks Performed:

1. **ESLint Architectural Rules**
   - All custom rules enforced
   - Zero warnings/errors allowed (`--max-warnings=0`)

2. **File Size Validation**
   - Scans all `.ts`, `.tsx`, `.js`, `.jsx` files
   - Excludes tests and configs
   - Fails if any file exceeds 400 lines

3. **Layer Boundary Validation**
   - Grep-based scan for violations
   - Checks components not importing from app/
   - Checks lib/ not importing from higher layers

4. **Direct DOM Manipulation Check**
   - Scans for `querySelector`, `getElementById`, etc.
   - Warns but doesn't fail

5. **Import Statement Limits**
   - Warns if file has >20 import statements
   - Indicates tight coupling

6. **Test Coverage Validation**
   - Runs full test suite with coverage
   - Generates coverage reports

7. **TODO/FIXME Detection**
   - Finds unresolved TODOs in production code
   - Warns to create GitHub issues

### Layer 4: Existing CI Checks (`.github/workflows/ci.yml`)

Already in place:

- TypeScript type checking
- Full test suite execution
- Security audit
- Dependency review
- Commit message linting

## 📝 Configuration Files

### eslint.config.mjs

```javascript
// P0 rules enabled:
'custom/max-file-size': ['error', { max: 400, ignoreComments: true }]
'custom/architecture-boundaries': 'error'
'custom/component-complexity': ['error', { maxProps: 10, maxStateVars: 8, maxHandlers: 10 }]
```

### package.json

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

## 🚀 Developer Workflow

### During Development:

1. Write code as usual
2. ESLint shows violations in IDE (if configured)
3. Run `npm run lint:fix` to auto-fix issues

### Before Commit:

1. Stage files: `git add .`
2. Attempt commit: `git commit -m "message"`
3. Pre-commit hook runs automatically
4. **If violations exist**: Commit blocked, fix issues
5. **If clean**: Commit succeeds

### During PR Review:

1. Push branch to GitHub
2. Architecture Guard workflow runs automatically
3. **If violations exist**: PR fails CI, red ❌ appears
4. **If clean**: PR passes, green ✅ appears

### Breaking the Rules:

In rare cases where you must violate rules:

1. **ESLint exceptions**:

   ```typescript
   // eslint-disable-next-line custom/max-file-size
   ```

2. **CI override**: Add `maintainer-override` label to PR (maintainers only)

⚠️ **Use sparingly** - exceptions should be rare and well-justified

## 🔧 Maintenance

### Adding New Rules:

1. Edit `eslint-rules/index.js`
2. Add rule implementation
3. Export in `module.exports.rules`
4. Enable in `eslint.config.mjs`
5. Test with `npm run lint`

### Adjusting Thresholds:

```javascript
// In eslint.config.mjs
'custom/max-file-size': ['error', { max: 500 }] // Increase limit
'custom/component-complexity': ['error', {
  maxProps: 12,      // Adjust as needed
  maxStateVars: 10,
  maxHandlers: 12
}]
```

### Debugging Custom Rules:

```bash
# Test custom rules on specific file
npx eslint src/components/MyComponent.tsx --rule 'custom/max-file-size: error'

# Run with verbose output
npx eslint src/ --debug
```

## 📊 Metrics & Monitoring

### Current Enforcement:

- ✅ Pre-commit hooks: **ACTIVE**
- ✅ CI Architecture Guard: **ACTIVE**
- ✅ 5 custom ESLint rules: **ENFORCED**
- ✅ Zero tolerance: **max-warnings=0**

### Success Criteria:

- No files over 400 lines in `src/` (excluding tests)
- No architectural boundary violations
- All PRs pass Architecture Guard
- Zero ESLint errors in codebase

## 🆘 Common Violations & Fixes

### "File has 450 lines but maximum is 400"

**Fix**: Split file into smaller modules

```typescript
// Before: BigComponent.tsx (450 lines)

// After:
// BigComponent.tsx (100 lines) - Main component
// components/BigComponentHeader.tsx (80 lines)
// components/BigComponentForm.tsx (120 lines)
// hooks/useBigComponentLogic.ts (150 lines)
```

### "Components cannot import from app directory"

**Fix**: Use contexts or hooks

```typescript
// ❌ Bad
import { serverAction } from "@/app/actions";

// ✅ Good
import { useServerAction } from "@/hooks/useServerAction";
```

### "Component has 12 props but maximum is 10"

**Fix**: Group related props

```typescript
// ❌ Bad
function MyComponent({ a, b, c, d, e, f, g, h, i, j, k, l }: Props) {

// ✅ Good
function MyComponent({
  userProps,
  configProps,
  styleProps
}: Props) {
```

### "Component has 10 useState calls but maximum is 8"

**Fix**: Use useReducer or consolidate state

```typescript
// ❌ Bad
const [a, setA] = useState();
const [b, setB] = useState();
// ... 8 more

// ✅ Good
const [state, dispatch] = useReducer(reducer, initialState);
```

## 📚 References

- [ESLint Custom Rules Documentation](https://eslint.org/docs/latest/extend/custom-rules)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Husky Pre-Commit Hooks](https://typicode.github.io/husky/)
- [lint-staged Configuration](https://github.com/okonet/lint-staged)

## 🎓 Training & Onboarding

New developers should:

1. Read this document thoroughly
2. Review `eslint-rules/index.js` to understand rules
3. Set up ESLint IDE integration for real-time feedback
4. Try intentionally breaking a rule to see enforcement in action
5. Review a few PRs to see CI Architecture Guard in action

---

**Last Updated**: 2025-10-13  
**Owner**: Architecture Team  
**Status**: ✅ ACTIVE & ENFORCED
