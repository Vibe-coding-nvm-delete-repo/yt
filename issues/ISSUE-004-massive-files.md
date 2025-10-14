# ISSUE-004: Massive Component Files (>500 Lines)

**Status:** 🟡 HIGH PRIORITY  
**Impact:** 8/10  
**Difficulty:** 6/10 ⭐⭐⭐⭐⭐⭐  
**Estimated Time:** 7-8 days  
**Assignee:** TBD  
**Created:** 2025-10-14

---

## 📋 Problem Statement

Three files exceed the recommended **300-line limit** by 2-3x, making them hard to understand, test, and maintain. These "god components" violate the Single Responsibility Principle and create cognitive overload for developers.

### Files Exceeding Limits

```
SettingsTab.tsx:       874 lines (2.9x over limit) 🔴
ImageToPromptTab.tsx:  713 lines (2.4x over limit) 🔴
storage.ts:            720 lines (2.4x over limit) 🔴
────────────────────────────────────────────────────
Total:                 2,307 lines that should be ~900 lines
Excess:                1,407 lines (156% bloat)
```

---

## 🔍 Root Causes

### 1. God Component Anti-Pattern

- One component does 10+ things
- All state management in one place
- No clear boundaries

### 2. Lack of Composition

- No sub-components extracted
- Inline JSX for complex UI
- Repeated patterns not abstracted

### 3. Technical Debt Accumulation

- Features added incrementally
- No refactoring during feature work
- "It works, don't touch it" mentality

---

## 📦 Sub-Issues Breakdown

### [ISSUE-004-A] Split SettingsTab.tsx (874 → ~150 lines)

**Current:** 874 lines  
**Target:** 7 files, ~125 lines each  
**Time:** 3-4 days  
**Difficulty:** 7/10

#### Component Responsibility Analysis

**Current Single Component Handles:**

```typescript
1. ✗ API key validation (50 lines)
2. ✗ Model fetching (40 lines)
3. ✗ Model selection UI (300 lines) ⭐ Largest
4. ✗ Model dropdown logic (100 lines)
5. ✗ Model search/filter (50 lines)
6. ✗ Pin/unpin models (40 lines)
7. ✗ Custom prompts (50 lines)
8. ✗ Model categorization (80 lines)
9. ✗ Cost calculations (30 lines)
10. ✗ Settings persistence (20 lines)
11. ✗ Tab navigation (30 lines)
12. ✗ State management (15 useState hooks!)
```

#### Proposed Architecture

```
src/components/SettingsTab/
├── SettingsTab.tsx (150 lines) ← Main orchestrator
├── ApiKeysSection/
│   ├── ApiKeysSection.tsx (120 lines)
│   ├── ApiKeyInput.tsx (60 lines)
│   └── ApiKeyValidationStatus.tsx (40 lines)
├── ModelSelection/
│   ├── ModelSelectionSection.tsx (180 lines)
│   ├── ModelDropdown.tsx (150 lines)
│   ├── ModelCard.tsx (80 lines)
│   ├── ModelSearchInput.tsx (50 lines)
│   └── PinButton.tsx (30 lines)
├── CustomPrompts/
│   ├── CustomPromptsSection.tsx (100 lines)
│   └── PromptEditor.tsx (60 lines)
├── Categories/
│   ├── CategoriesSection.tsx (100 lines)
│   └── CategoryItem.tsx (50 lines)
├── hooks/
│   ├── useModelSelection.ts (80 lines)
│   ├── useApiValidation.ts (60 lines)
│   └── useSettingsState.ts (70 lines)
└── types/
    └── index.ts (40 lines)

Total: 1,310 lines (spread across 18 focused files)
Main orchestrator: 150 lines ✅
Avg per file: 73 lines ✅
```

#### Implementation Plan

**Phase 1: Extract API Keys Section (Day 1, 6 hours)**

```typescript
// Step 1: Create new component
// File: src/components/SettingsTab/ApiKeysSection/ApiKeysSection.tsx

import React, { useState, useCallback } from 'react';
import { createOpenRouterClient, isValidApiKeyFormat } from '@/lib/openrouter';
import { ApiKeyInput } from './ApiKeyInput';
import { ApiKeyValidationStatus } from './ApiKeyValidationStatus';

interface ApiKeysSectionProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onValidationComplete: (isValid: boolean) => void;
}

export const ApiKeysSection: React.FC<ApiKeysSectionProps> = ({
  apiKey,
  onApiKeyChange,
  onValidationComplete,
}) => {
  const [validationState, setValidationState] = useState({
    isValidating: false,
    isValid: false,
    error: null,
  });

  const validateApiKey = useCallback(async () => {
    if (!apiKey.trim()) {
      setValidationState({
        isValidating: false,
        isValid: false,
        error: 'API key is required',
      });
      return;
    }

    if (!isValidApiKeyFormat(apiKey)) {
      setValidationState({
        isValidating: false,
        isValid: false,
        error: 'Invalid API key format',
      });
      return;
    }

    setValidationState(prev => ({ ...prev, isValidating: true }));

    try {
      const client = createOpenRouterClient(apiKey);
      const isValid = await client.validateApiKey();

      setValidationState({
        isValidating: false,
        isValid,
        error: isValid ? null : 'API key validation failed',
      });

      onValidationComplete(isValid);
    } catch (error) {
      setValidationState({
        isValidating: false,
        isValid: false,
        error: 'Network error during validation',
      });
    }
  }, [apiKey, onValidationComplete]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">API Keys</h3>

      <ApiKeyInput
        value={apiKey}
        onChange={onApiKeyChange}
        onValidate={validateApiKey}
      />

      <ApiKeyValidationStatus state={validationState} />
    </div>
  );
};

// ~120 lines total
```

```typescript
// Step 2: Update main SettingsTab
// File: src/components/SettingsTab.tsx

import { ApiKeysSection } from './ApiKeysSection/ApiKeysSection';

export const SettingsTab: React.FC<SettingsTabProps> = ({ settings, onSettingsUpdate }) => {
  const [apiKey, setApiKey] = useState(settings.openRouterApiKey);

  const handleValidationComplete = useCallback((isValid: boolean) => {
    // Update settings
    settingsStorage.validateApiKey(isValid);
  }, []);

  return (
    <div>
      {activeSubTab === 'api-keys' && (
        <ApiKeysSection
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          onValidationComplete={handleValidationComplete}
        />
      )}
      {/* Other tabs */}
    </div>
  );
};

// Removed ~150 lines from main component!
```

**Phase 2: Extract Model Selection (Day 2-3, 12 hours)**

This is the biggest section (300+ lines), so it needs careful decomposition:

```typescript
// File: src/components/SettingsTab/ModelSelection/ModelSelectionSection.tsx

import React from 'react';
import { ModelDropdown } from './ModelDropdown';
import { ModelCard } from './ModelCard';
import { ModelSearchInput } from './ModelSearchInput';
import { useModelSelection } from '../hooks/useModelSelection';

interface ModelSelectionSectionProps {
  models: VisionModel[];
  selectedModels: string[];
  onSelectionChange: (models: string[]) => void;
  onFetchModels: () => Promise<void>;
}

export const ModelSelectionSection: React.FC<ModelSelectionSectionProps> = ({
  models,
  selectedModels,
  onSelectionChange,
  onFetchModels,
}) => {
  const {
    filteredModels,
    searchQuery,
    setSearchQuery,
    pinnedModels,
    togglePin,
  } = useModelSelection(models);

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3>Vision Models (Select up to 5)</h3>
        <button onClick={onFetchModels}>
          Fetch Models
        </button>
      </div>

      <ModelSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
      />

      <div className="text-sm">
        Selected: {selectedModels.length} / 5
      </div>

      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((index) => (
          <ModelDropdown
            key={index}
            index={index}
            models={filteredModels}
            selectedModelId={selectedModels[index]}
            onSelect={(modelId) => {
              const newSelection = [...selectedModels];
              newSelection[index] = modelId;
              onSelectionChange(newSelection);
            }}
            pinnedModels={pinnedModels}
            onTogglePin={togglePin}
          />
        ))}
      </div>
    </div>
  );
};

// ~180 lines
```

```typescript
// File: src/components/SettingsTab/ModelSelection/ModelDropdown.tsx

export const ModelDropdown: React.FC<ModelDropdownProps> = ({
  index,
  models,
  selectedModelId,
  onSelect,
  pinnedModels,
  onTogglePin,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredModels = useMemo(() => {
    return models.filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [models, search]);

  const sortedModels = useMemo(() => {
    // Pinned first, then alphabetical
    return filteredModels.sort((a, b) => {
      const aPin = pinnedModels.includes(a.id) ? 0 : 1;
      const bPin = pinnedModels.includes(b.id) ? 0 : 1;
      if (aPin !== bPin) return aPin - bPin;
      return a.name.localeCompare(b.name);
    });
  }, [filteredModels, pinnedModels]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border rounded-lg"
      >
        {selectedModelId ? (
          <span>{models.find(m => m.id === selectedModelId)?.name}</span>
        ) : (
          <span>Select Model {index + 1}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models..."
            className="w-full px-4 py-2 border-b"
          />

          <div className="max-h-64 overflow-y-auto">
            {sortedModels.map((model) => (
              <ModelOption
                key={model.id}
                model={model}
                isSelected={model.id === selectedModelId}
                isPinned={pinnedModels.includes(model.id)}
                onSelect={() => {
                  onSelect(model.id);
                  setIsOpen(false);
                }}
                onTogglePin={() => onTogglePin(model.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ~150 lines
```

**Phase 3: Extract Hooks (Day 3, 4 hours)**

```typescript
// File: src/components/SettingsTab/hooks/useModelSelection.ts

export const useModelSelection = (models: VisionModel[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const pinnedModels = useSettings(["pinnedModels"]);

  const filteredModels = useMemo(() => {
    if (!searchQuery) return models;
    return models.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [models, searchQuery]);

  const togglePin = useCallback((modelId: string) => {
    settingsStorage.togglePinnedModel(modelId);
  }, []);

  return {
    filteredModels,
    searchQuery,
    setSearchQuery,
    pinnedModels: pinnedModels.pinnedModels,
    togglePin,
  };
};

// ~80 lines
```

**Phase 4: Extract Remaining Sections (Day 4, 6 hours)**

- Custom Prompts Section (100 lines)
- Categories Section (100 lines)

**Phase 5: Update Tests (Day 4, 2 hours)**

```typescript
// Update existing tests to import from new locations
import { SettingsTab } from "./SettingsTab";
// becomes
import { SettingsTab } from "./SettingsTab/SettingsTab";

// Add component-specific tests
describe("ApiKeysSection", () => {
  // Test API key section in isolation
});

describe("ModelDropdown", () => {
  // Test dropdown in isolation
});
```

#### Acceptance Criteria

- [ ] Main SettingsTab.tsx is <200 lines
- [ ] 7+ sub-components created
- [ ] Average file size <150 lines
- [ ] All tests still pass
- [ ] No functionality lost
- [ ] Imports updated across codebase
- [ ] Clear folder structure
- [ ] README.md in SettingsTab/ explaining structure

---

### [ISSUE-004-B] Split ImageToPromptTab.tsx (713 → ~150 lines)

**Current:** 713 lines  
**Target:** 5 files, ~140 lines each  
**Time:** 2-3 days  
**Difficulty:** 6/10

#### Component Responsibility Analysis

**Current Handles:**

```typescript
1. ✗ Image upload (100 lines)
2. ✗ Drag & drop (40 lines)
3. ✗ File validation (35 lines)
4. ✗ Image preview (50 lines)
5. ✗ Prompt generation (150 lines) ⭐ Largest
6. ✗ Model results display (200 lines)
7. ✗ Cost calculation (50 lines)
8. ✗ Copy to clipboard (20 lines)
9. ✗ History saving (30 lines)
10. ✗ State persistence (38 lines)
```

#### Proposed Architecture

```
src/components/ImageToPromptTab/
├── ImageToPromptTab.tsx (150 lines) ← Main
├── ImageUpload/
│   ├── ImageUploadZone.tsx (120 lines)
│   ├── ImagePreview.tsx (80 lines)
│   └── useImageUpload.ts (60 lines)
├── Generation/
│   ├── GenerateButton.tsx (40 lines)
│   ├── GenerationMetrics.tsx (60 lines)
│   └── useGeneration.ts (100 lines)
├── Results/
│   ├── ModelResults.tsx (100 lines)
│   ├── ModelResultCard.tsx (120 lines)
│   ├── CostBreakdown.tsx (60 lines)
│   └── CopyButton.tsx (30 lines)
└── hooks/
    └── useImageState.ts (60 lines)

Total: 980 lines (across 13 files)
Main orchestrator: 150 lines ✅
Avg per file: 75 lines ✅
```

#### Implementation Plan (Abbreviated)

**Day 1: Extract Image Upload** (6 hours)

- Create ImageUploadZone component
- Create ImagePreview component
- Create useImageUpload hook
- Update main component

**Day 2: Extract Generation Logic** (6 hours)

- Create GenerateButton component
- Create useGeneration hook
- Extract parallel API call logic

**Day 3: Extract Results Display** (6 hours)

- Create ModelResults component
- Create ModelResultCard component
- Create CostBreakdown component

#### Acceptance Criteria

- [ ] Main ImageToPromptTab.tsx is <200 lines
- [ ] 5+ sub-components created
- [ ] Functionality unchanged
- [ ] Tests updated and passing
- [ ] Clear separation of concerns

---

### [ISSUE-004-C] Split storage.ts (720 → ~400 lines)

**Current:** 720 lines  
**Target:** 3 files, ~240 lines each  
**Time:** 2 days  
**Difficulty:** 5/10

#### Why Storage is Special

Unlike UI components, storage is a **singleton service**. We can't split it the same way. Instead:

**Proposed Architecture:**

```
src/lib/storage/
├── SettingsStorage.ts (300 lines) ← Core storage
├── ImageStateStorage.ts (200 lines) ← Already separate
├── utils/
│   ├── subscriptions.ts (80 lines) ← Subscription logic
│   ├── persistence.ts (60 lines) ← localStorage helpers
│   └── defaults.ts (40 lines) ← Default values
├── types.ts (60 lines) ← Storage types
└── index.ts (20 lines) ← Exports

Total: 760 lines (spread across 7 files)
Main file: 300 lines ✅
Avg per file: 108 lines ✅
```

#### Implementation Plan

**Day 1: Extract Utilities** (4 hours)

```typescript
// File: src/lib/storage/utils/subscriptions.ts

export class SubscriptionManager<T> {
  private subscriptions = new Map<string, Subscription<T>>();
  private counter = 0;
  private timeout: NodeJS.Timeout | null = null;

  subscribe(
    callback: (data: T) => void,
    options?: SubscribeOptions,
  ): () => void {
    const id = `sub_${++this.counter}`;
    this.subscriptions.set(id, { id, callback, ...options });
    return () => this.subscriptions.delete(id);
  }

  notify(data: T, changedKeys?: string[]): void {
    // Debounced notification logic
  }

  clear(): void {
    this.subscriptions.clear();
  }
}

// ~80 lines
```

```typescript
// File: src/lib/storage/utils/persistence.ts

export class LocalStoragePersistence<T> {
  constructor(
    private key: string,
    private defaults: T,
  ) {}

  load(): T {
    try {
      const stored = localStorage.getItem(this.key);
      if (!stored) return this.defaults;
      return { ...this.defaults, ...JSON.parse(stored) };
    } catch {
      return this.defaults;
    }
  }

  save(data: T): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save:", error);
    }
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }
}

// ~60 lines
```

**Day 2: Refactor Main Storage** (4 hours)

```typescript
// File: src/lib/storage/SettingsStorage.ts

import { SubscriptionManager } from "./utils/subscriptions";
import { LocalStoragePersistence } from "./utils/persistence";
import { DEFAULT_SETTINGS } from "./utils/defaults";

export class SettingsStorage {
  private static instance: SettingsStorage;
  private persistence: LocalStoragePersistence<AppSettings>;
  private subscriptions: SubscriptionManager<AppSettings>;
  private settings: AppSettings;

  private constructor() {
    this.persistence = new LocalStoragePersistence(
      "image-to-prompt-settings",
      DEFAULT_SETTINGS,
    );
    this.subscriptions = new SubscriptionManager();
    this.settings = this.persistence.load();
  }

  static getInstance(): SettingsStorage {
    if (!SettingsStorage.instance) {
      SettingsStorage.instance = new SettingsStorage();
    }
    return SettingsStorage.instance;
  }

  getSettings(): AppSettings {
    return { ...this.settings };
  }

  batchUpdate(updates: Partial<AppSettings>): void {
    const newSettings = { ...this.settings, ...updates };
    const changedKeys = this.detectChanges(this.settings, newSettings);

    if (changedKeys.length > 0) {
      this.settings = newSettings;
      this.persistence.save(this.settings);
      this.subscriptions.notify(this.settings, changedKeys);
    }
  }

  subscribe(
    callback: SubscriptionCallback,
    options?: SubscribeOptions,
  ): () => void {
    return this.subscriptions.subscribe(callback, options);
  }

  // ... other methods
}

// ~300 lines (was 477)
```

#### Acceptance Criteria

- [ ] storage.ts split into 7 focused files
- [ ] Main SettingsStorage.ts is <350 lines
- [ ] Shared utilities extracted
- [ ] All tests still pass
- [ ] Exports from index.ts unchanged (for consumers)

---

## 🎯 Overall Implementation Timeline

### Week 1: SettingsTab Split

- **Mon-Tue:** Extract API Keys + Model Selection
- **Wed-Thu:** Extract remaining sections + hooks
- **Fri:** Test updates + verification

### Week 2: ImageToPromptTab + Storage Split

- **Mon-Tue:** ImageToPromptTab decomposition
- **Wed:** Storage refactoring
- **Thu:** Integration testing
- **Fri:** Documentation + cleanup

---

## 📊 Success Metrics

**Before:**

```
Files >500 lines:           3
Largest file:               874 lines
Avg component complexity:   High
Testability:                Low
Onboarding time:            3-5 days
```

**After:**

```
Files >500 lines:           0 ✅
Largest file:               <200 lines ✅
Avg component complexity:   Low ✅
Testability:                High ✅
Onboarding time:            1-2 days ✅
```

---

## 🧪 Testing Strategy

```bash
# Before starting
npm test  # All tests must pass

# After each file split
npm test -- --testPathPattern="<ComponentName>"

# Final verification
npm run build  # Must succeed
npm test       # All tests pass
npm run lint   # Zero errors

# Visual testing
npm run dev
# Manually test affected features
```

---

## 🚨 Risks & Mitigation

### Risk 1: Breaking Functionality

**Mitigation:**

- Split one component at a time
- Run tests after each split
- Keep comprehensive test coverage

### Risk 2: Import Path Updates

**Mitigation:**

- Use TypeScript to find all import sites
- Update imports incrementally
- Use IDE refactoring tools

### Risk 3: State Management Complexity

**Mitigation:**

- Keep state in main component initially
- Pass callbacks down as props
- Consider Context API only if deeply nested

---

## 🔗 Related Issues

- Complements: ISSUE-003 (easier to test smaller components)
- Complements: ISSUE-005 (storage cleanup)
- Enables: Future feature development (smaller files easier to modify)

---

## 📚 References

- [Component Composition](https://react.dev/learn/your-first-component)
- [Thinking in React](https://react.dev/learn/thinking-in-react)
- [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle)

---

**Last Updated:** 2025-10-14  
**Status:** Ready for implementation after ISSUE-001/002 resolved  
**Estimated Effort:** 7-8 days
