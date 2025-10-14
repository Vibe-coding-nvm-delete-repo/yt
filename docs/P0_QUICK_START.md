# P0 Enforcement - Quick Start Guide

## What is P0 Enforcement?

P0 (Priority Zero) Enforcement is a **critical architecture guard system** that prevents code quality regression by **blocking** commits and PRs that violate core standards.

## 🚨 What Gets Blocked?

### 1. **Files Over 400 Lines**

```
❌ BLOCKED: MyComponent.tsx has 450 lines
✅ Fix: Split into smaller focused modules
```

### 2. **Architectural Boundary Violations**

```
❌ BLOCKED: src/components/Header.tsx imports from src/app/actions
✅ Fix: Use contexts or hooks to bridge layers
```

### 3. **Complex Components**

```
❌ BLOCKED: Component has 12 props (max: 10)
✅ Fix: Group related props or use composition
```

## 🛠️ How to Use

### Before You Commit:

1. **Check for violations:**

   ```bash
   npm run lint
   ```

2. **Auto-fix what's possible:**

   ```bash
   npm run lint:fix
   ```

3. **Run tests:**

   ```bash
   npm test
   ```

4. **Commit normally:**

   ```bash
   git add .
   git commit -m "Your message"
   ```

   ✅ **If clean:** Commit succeeds  
   ❌ **If violations:** Commit blocked - fix and retry

### During PR Review:

The **Architecture Guard** CI workflow runs automatically and checks:

- ✅ All ESLint rules pass
- ✅ No files exceed 400 lines
- ✅ No architectural boundaries violated
- ✅ Test coverage maintained

**PR merging is blocked** until all checks pass.

## 🔧 Common Fixes

### "File too large"

**Split the file:**

```typescript
// Before: BigComponent.tsx (500 lines)

// After:
MyComponent.tsx; // Main component (150 lines)
components / Header.tsx; // Sub-component (100 lines)
components / Body.tsx; // Sub-component (120 lines)
hooks / useMyLogic.ts; // Custom hook (130 lines)
```

### "Too many props"

**Group related props:**

```typescript
// Before ❌
function MyComponent({ a, b, c, d, e, f, g, h, i, j, k }: Props);

// After ✅
interface UserProps {
  a: string;
  b: number;
  c: boolean;
}
interface ConfigProps {
  d: string;
  e: number;
}
function MyComponent({ user, config, style }: Props);
```

### "Too many useState calls"

**Use useReducer:**

```typescript
// Before ❌
const [a, setA] = useState();
const [b, setB] = useState();
// ...10 more

// After ✅
const [state, dispatch] = useReducer(reducer, initialState);
```

### "Architecture violation"

**Use proper layers:**

```typescript
// Before ❌ (Component importing from app)
import { serverAction } from "@/app/actions";

// After ✅ (Use hook to bridge)
import { useServerAction } from "@/hooks/useServerAction";
```

## 📚 Full Documentation

See [P0_ENFORCEMENT_SYSTEM.md](./P0_ENFORCEMENT_SYSTEM.md) for complete details.

## 🆘 Need Help?

1. Run `npm run lint` to see all violations
2. Each error includes a clear message with fix suggestion
3. Check [P0_ENFORCEMENT_SYSTEM.md](./P0_ENFORCEMENT_SYSTEM.md) for examples
4. Ask in #engineering channel

## ⚠️ Emergency Override

**Rare cases only** - if you absolutely must bypass enforcement:

1. **ESLint exception** (specific rule on specific line):

   ```typescript
   // eslint-disable-next-line custom/max-file-size
   ```

2. **PR override** (maintainers only):
   - Add `maintainer-override` label to PR
   - Requires justification in PR description

**Use sparingly** - exceptions should be documented and temporary.

---

**Remember**: P0 enforcement exists to keep our codebase maintainable. If a rule feels too restrictive, let's discuss adjusting thresholds rather than bypassing checks.
