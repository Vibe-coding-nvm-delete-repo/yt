# Code Splitting Implementation Guide

This guide provides practical examples of implementing code splitting in our Next.js application to reduce initial bundle sizes and improve performance.

## Overview

Code splitting is the practice of dividing your application's JavaScript bundle into smaller chunks that can be loaded on demand. This reduces the initial load time and improves the Time to Interactive (TTI) metric.

## Automatic Code Splitting (Next.js Built-in)

Next.js automatically implements several code splitting strategies:

1. **Page-based splitting**: Each page is automatically split into its own bundle
2. **Shared code splitting**: Common code between pages is extracted into shared bundles
3. **Vendor splitting**: Third-party libraries are split into separate chunks

### Example: Automatic Route Splitting

```typescript
// app/page.tsx - Automatically split into its own bundle
export default function Home() {
  return <div>Home Page</div>;
}

// app/dashboard/page.tsx - Separate bundle
export default function Dashboard() {
  return <div>Dashboard Page</div>;
}
```

## Dynamic Imports for Components

Use dynamic imports to lazy-load components that are not immediately needed on page load.

### Basic Dynamic Import

```typescript
import dynamic from 'next/dynamic';

// Component is loaded only when rendered
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false, // Optional: disable server-side rendering
});

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart data={chartData} />
    </div>
  );
}
```

### Dynamic Import with Named Exports

```typescript
import dynamic from 'next/dynamic';

// Import a specific named export
const AdvancedEditor = dynamic(
  () => import('@/components/editors').then(mod => mod.AdvancedEditor),
  {
    loading: () => <div>Loading editor...</div>,
  }
);
```

### Conditional Dynamic Loading

```typescript
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Load component only when needed
const ImageEditor = dynamic(() => import('@/components/ImageEditor'), {
  loading: () => <div>Loading image editor...</div>,
});

export default function PhotoTab() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div>
      <button onClick={() => setShowEditor(true)}>
        Edit Image
      </button>
      {showEditor && <ImageEditor />}
    </div>
  );
}
```

## Dynamic Imports for Libraries

Split large third-party libraries into separate chunks.

### Example: Loading Heavy Libraries

```typescript
'use client';

import { useState } from 'react';

export default function DataProcessor() {
  const [result, setResult] = useState(null);

  const processData = async () => {
    // Load heavy library only when function is called
    const { default: heavyLib } = await import('heavy-data-processing-lib');
    const processed = heavyLib.process(data);
    setResult(processed);
  };

  return (
    <div>
      <button onClick={processData}>Process Data</button>
      {result && <div>{result}</div>}
    </div>
  );
}
```

### Example: Icon Libraries

```typescript
"use client";

// Instead of importing all icons at once
// ❌ Bad: Imports entire icon library
import * as Icons from "lucide-react";

// ✅ Good: Import only what you need (tree-shaking works)
import { Search, Menu, X } from "lucide-react";

// ✅ Better: Dynamic import for rarely-used icons
const RareIcon = dynamic(() =>
  import("lucide-react").then((mod) => ({ default: mod.Sparkles })),
);
```

## Application-Specific Examples

### Example 1: ImageToPromptTab Optimization

The ImageToPromptTab can be split since it's not needed on initial page load:

```typescript
// app/page.tsx
import dynamic from 'next/dynamic';

const ImageToPromptTab = dynamic(
  () => import('@/components/ImageToPromptTab').then(mod => ({
    default: mod.ImageToPromptTab
  })),
  {
    loading: () => <div className="p-4">Loading image tools...</div>,
    ssr: false, // Image upload doesn't need SSR
  }
);
```

### Example 2: Settings Tab Optimization

Settings are typically accessed less frequently:

```typescript
// app/page.tsx
import dynamic from 'next/dynamic';

const SettingsTab = dynamic(() => import('@/components/SettingsTab'), {
  loading: () => <div className="p-4">Loading settings...</div>,
});
```

### Example 3: Rating Widget Optimization

If ratings are shown conditionally:

```typescript
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const RatingWidget = dynamic(() =>
  import('@/components/RatingWidget').then(mod => ({
    default: mod.RatingWidget
  })),
  {
    loading: () => <div>Loading rating...</div>,
  }
);

export default function ContentCard() {
  const [showRating, setShowRating] = useState(false);

  return (
    <div>
      <button onClick={() => setShowRating(true)}>Rate this</button>
      {showRating && <RatingWidget />}
    </div>
  );
}
```

## Tab-Based Code Splitting Pattern

For our tab-based interface, we can split each tab into its own bundle:

```typescript
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy load all tabs
const ImageToPromptTab = dynamic(() =>
  import('@/components/ImageToPromptTab').then(m => ({ default: m.ImageToPromptTab })),
  { loading: () => <TabLoading />, ssr: false }
);

const PromptCreatorTab = dynamic(() =>
  import('@/components/PromptCreatorTab'),
  { loading: () => <TabLoading /> }
);

const HistoryTab = dynamic(() =>
  import('@/components/HistoryTab'),
  { loading: () => <TabLoading /> }
);

const SettingsTab = dynamic(() =>
  import('@/components/SettingsTab'),
  { loading: () => <TabLoading /> }
);

export default function App() {
  const [activeTab, setActiveTab] = useState('image');

  return (
    <div>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'image' && <ImageToPromptTab />}
      {activeTab === 'creator' && <PromptCreatorTab />}
      {activeTab === 'history' && <HistoryTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
}

function TabLoading() {
  return <div className="flex items-center justify-center h-64">Loading...</div>;
}
```

## Prefetching Strategy

For better UX, prefetch tabs that users are likely to visit next:

```typescript
'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Preload on hover
const SettingsTab = dynamic(() => import('@/components/SettingsTab'));

export function TabButton({ name, onClick }) {
  const handleMouseEnter = () => {
    // Prefetch the tab component
    import('@/components/SettingsTab');
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
    >
      {name}
    </button>
  );
}
```

## Measuring Impact

### Before Optimization

```bash
npm run build
```

Look for output like:

```
Page                              Size     First Load JS
┌ ○ /                            5.2 kB          120 kB
└ ○ /dashboard                   8.4 kB          123 kB
```

### After Optimization

```bash
npm run build
```

Expected improvements:

```
Page                              Size     First Load JS
┌ ○ /                            2.1 kB           95 kB  ↓ 25 kB
└ ○ /dashboard                   3.2 kB           98 kB  ↓ 25 kB
```

### Using Bundle Analyzer

```bash
npm run build:analyze
```

This will:

1. Build your application
2. Generate bundle visualization
3. Open interactive treemap in browser
4. Show which packages/components are largest

## Best Practices

### ✅ DO

1. **Split large components** (>50KB) into dynamic imports
2. **Split rarely-used features** (settings, admin panels)
3. **Split third-party libraries** that are conditionally used
4. **Add loading states** for better UX
5. **Prefetch on user intent** (hover, focus)
6. **Measure bundle sizes** regularly with analyzer

### ❌ DON'T

1. **Don't split small components** (<10KB) - overhead isn't worth it
2. **Don't split above-the-fold content** - it should load immediately
3. **Don't split without loading states** - users need feedback
4. **Don't over-split** - too many chunks can hurt performance
5. **Don't split without measuring** - use the bundle analyzer

## Progressive Enhancement Pattern

Start with essential features, load advanced features on demand:

```typescript
'use client';

export default function Editor() {
  const [advanced, setAdvanced] = useState(false);

  return (
    <div>
      <BasicEditor />

      <button onClick={() => setAdvanced(true)}>
        Advanced Mode
      </button>

      {advanced && (
        <Suspense fallback={<div>Loading advanced features...</div>}>
          <AdvancedFeatures />
        </Suspense>
      )}
    </div>
  );
}
```

## Performance Monitoring

Track the impact of code splitting:

```typescript
'use client';

import { useEffect } from 'react';

export default function Component() {
  useEffect(() => {
    // Measure component load time
    const loadTime = performance.now();

    return () => {
      const renderTime = performance.now() - loadTime;
      console.log(`Component loaded in ${renderTime}ms`);
    };
  }, []);

  return <div>Content</div>;
}
```

## Summary

Code splitting improves:

- **Initial page load**: Users see content faster
- **Time to Interactive**: App becomes usable sooner
- **Bundle efficiency**: Load only what's needed
- **User experience**: Faster perceived performance

Expected results:

- 20-40% reduction in initial bundle size
- 30-50% improvement in Time to Interactive
- Better Lighthouse performance scores
- Improved mobile performance

Start with the largest, least-used components and measure the impact with the bundle analyzer!
