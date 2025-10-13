# 🔧 JSX Code Quality Standards

## Protocol for JSX Modifications

### **JSX Edit Protocol (IMMEDIATE REQUIREMENT)**
When touching JSX files (`*.tsx`):

```
1. MAKE TINY CHANGES (1-5 lines max per atomic change)
2. npm run jsx:check (typecheck with React)
3. npm run lint:tsx (ESLint React rules)
4. npm run build:local (local build verification)
5. REPEAT for each tiny incremental change
```

### **Emergency JSX Repair**
If JSX syntax corruption occurs:
```
1. git checkout HEAD -- [corrupted-file.tsx]  (immediate restore)
2. npm run jsx:check (verify clean state)
3. Add minimal fixes (max 8 chars per iteration)
4. npm run build:local (verify each iteration)
5. git add/commit immediately when verified
```

### **Prevention Rules**
- **NEVER edit large JSX blocks manually** (>10 lines)
- **ALWAYS have 1-person review** for JSX changes
- **FREQUENT commits** during JSX edits (every verified change)
- **IMMEDIATE build verification** after syntax changes

### **Build Pipeline Requirements**
- JSX typecheck (`tsc --noEmit --jsx react`) in CI
- ESLint React plugin validation
- Turbopack build verification
- No direct Vercel deployments of unverified JSX

## 📝 JSX Change Logging

**Log format for JSX modifications:**
```
<File> <Change-Type> <Lines-Changed> <Verification-Status>
SettingsTab.tsx Syntax-Fix 0-lines JSX-✅ Build-✅
```

---

## 🎯 **WHY THIS EXISTS**

Recent catastrophic JSX corruption revealed that syntax errors cascade exponentially. This protocol ensures **zero future JSX disasters** through:

1. **Atomic changes** prevent corruption cascades
2. **Mandatory verification** catches syntax errors early
3. **Git restoration** provides instant rollback
4. **Process enforcement** via lint rules and CI

**No more "Vercel build crashing from syntax errors" ever again.**
