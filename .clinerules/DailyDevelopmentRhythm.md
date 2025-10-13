# Dev Process Stack - Bulletproof Development

## 🔄 Daily Development Rhythm (Updated)

### During the day (per feature):
- **Build feature** → **run JSX Syntax Check** → **tiny refactor** → **add 1-2 tests** → **merge**

### Pre-commit checklist:
```bash
✅ npm run jsx:check        # TypeScript JSX validation
✅ npm run lint:tsx         # ESLint React rules (zero warnings)
✅ npm run build:local      # Local build verification
✅ npm run test             # Passing tests
```

### End of day (optional):
- If you spot bigger structural pain, open tech debt issues titled "Refactor: <module>" with 3 bullets (why, scope, acceptance).

### End of week / milestone:
- If several tech-debt issues cluster, run the Big Refactor PLAN prompt and do Stage 1 only. Keep it safe and small.

## 🚫 JSX Edit Protocol (Mandatory)

### When touching JSX files:
```bash
1. MAKE TINY CHANGES (1-5 lines) - NEVER edit large blocks
2. npm run jsx:check        # TypeScript JSX validation
3. npm run lint:tsx         # ESLint React rules
4. npm run build:local      # Local build verification
5. git add/commit           # Immediate verification
```

### Emergency JSX Repair:
```bash
git checkout HEAD -- [corrupted-file.tsx]
npm run jsx:check
# Apply minimal fixes (max 8 chars per iteration)
npm run build:local
```

## ⚡ **Guardrails (ALL ACTIVE)**

### CI Protection:
- ✅ **JSX Syntax Validation** (`tsc --noEmit --jsx react`)
- ✅ **JSX ESLint Rules** (React hooks, JSX safety)
- ✅ **Turbopack Build Verification** (prevents deploy fails)
- ✅ **TypeScript Strict** (catches API issues)
- ✅ **Test Coverage 60%+** (maintains quality)

### Process Protection:
- 🔒 Branch protection on main (PR required)
- 📝 Conventional commit linting
- 🚦 Security audits on dependencies
- 📊 Code coverage reporting

## 🛡️ Prevention System

### Files Added:
- `.clinerules/JSX Code Quality Standards.md` - JSX safety protocol
- Enhanced `eslint.config.mjs` - React/JSX rules
- Updated `package.json` - JSX validation scripts
- Enhanced `.github/workflows/ci.yml` - JSX CI checks

### Scripts Added:
```json
{
  "jsx:check": "tsc --noEmit --jsx react",
  "lint:tsx": "eslint 'src/**/*.{tsx}' --max-warnings=0",
  "check:jsxsyntax": "npm run jsx:check && npm run lint:tsx && npm run build:local"
}
```

## 📊 TL;DR

**Sequence: Build → JSX Check → Test → Ship**  
**Safety: Pre-commit validation prevents disasters**  
**Disaster Recovery: Git restore + tiny fixes**  

No more "Vercel build crashing from syntax errors" ever again. 🚀

**Original:** October 13, 2025  
**Updated:** October 13, 2025 (Post-JSX Disaster Prevention)
