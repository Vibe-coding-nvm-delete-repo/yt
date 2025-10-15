# Design System

## Overview
This design system ensures consistent, minimal, and cohesive UI/UX across the entire app. All new components and features must follow these guidelines.

---

## Color Palette (Dark Theme)

### Backgrounds
- **Canvas**: `#0F1216` - App background
- **Surface**: `#151A21` - Card backgrounds
- **Elevated**: `#1A212A` - Hover states, modals

### Borders
- **Subtle**: `rgba(255,255,255,0.06)` - Use sparingly; prefer elevation over hard borders

### Text
- **High contrast**: `#F2F5F7` - Primary text
- **Secondary**: `#C9D1D9` - Metadata, labels
- **Tertiary**: `#8D99A6` - Disabled, subtle info

### Semantic Colors
- **Primary/Accent**: `#3B82F6` (blue) - Buttons, focus states
- **Success**: `#22C55E` (green) - Success states, positive indicators
- **Warning**: `#F59E0B` (amber) - Warnings
- **Danger**: `#EF4444` (red) - Errors, destructive actions

---

## Spacing Scale

Use these values consistently:
- `4px` - Tiny gaps
- `8px` - Small gaps
- `12px` - Compact spacing
- `16px` - **Standard gaps** (default for most layouts)
- `20px` - Medium spacing
- `24px` - **Card padding** (default for card interiors)
- `32px` - **Section spacing** (between major sections)
- `40px` - Large spacing
- `48px` - Extra large
- `64px` - Mega spacing

---

## Elevation & Shadows

**Soft shadows, no hard borders**

### Card (default)
```css
box-shadow: 0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03);
```

### Hover
```css
box-shadow: 0 12px 32px rgba(0,0,0,0.45);
```

### Modal/Popover
```css
box-shadow: 0 24px 56px rgba(0,0,0,0.55);
```

---

## Border Radii

- **Cards**: `14px` (`rounded-xl`)
- **Inputs/Buttons**: `10px` (`rounded-lg`)
- **Modals**: `18px` (`rounded-2xl`)
- **Pills/Badges**: `999px` (`rounded-full`)

---

## Typography

### Font Family
Inter or system San-Serif fallback:
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", Arial, sans-serif;
```

### Scale
- **H1**: `28px` / `font-bold` - Page titles
- **H2**: `20px` / `font-semibold` - Section headings
- **H3**: `16px` / `font-medium` - Card titles
- **Body**: `16px` / `font-normal` - Standard text
- **Label**: `14px` / `font-medium` - Form labels
- **Meta**: `12px` / `font-normal` - Timestamps, secondary info

### Line Length
60–72 characters for text blocks

---

## Motion & Transitions

### Timing
- **Hover**: `160ms ease-out`
- **Standard**: `220ms ease-out`
- **Entrance**: `320ms ease-out`

### Examples
- Card hover: `translateY(-2px)`
- Dropdown: fade + scale `98% → 100%`

---

## Components

### Cards
```tsx
<div className="bg-[#151A21] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
  {/* Card content */}
</div>
```
- Padding: `24px` (p-6)
- Radius: `14px` (rounded-xl)
- Use gradient hairlines for dividers, not solid borders

### Buttons

**Primary**
```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  Primary Action
</button>
```

**Secondary**
```tsx
<button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
  Secondary Action
</button>
```

**Ghost/Quiet**
```tsx
<button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-lg transition-colors">
  <Icon className="h-4 w-4" />
</button>
```

### Inputs
```tsx
<input 
  className="w-full px-4 py-2 bg-white/5 rounded-lg border-none focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 transition-colors"
  type="text"
/>
```
- Height: `40px` (py-2)
- Radius: `10px` (rounded-lg)
- No borders, use background + focus glow

### Pills/Status Badges
```tsx
<span className="px-3 py-1 bg-white/10 rounded-full text-xs">
  Status
</span>
```

---

## Lists & Tables

### Row Design
- **Min height**: `64px`
- **Padding**: `16px` vertical
- **Hover**: Subtle elevation, no zebra stripes
- **Separators**: 1px `rgba(255,255,255,0.06)` between rows

### Numbers
- **Right-align** all numeric columns
- Use consistent decimal places (e.g., `$0.000123`)

### Error Rows
- Left red bar (4px) + error pill + details link

---

## Empty/Error/Success States

### Empty State
```tsx
<div className="py-12 text-center">
  <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
  <p className="text-gray-400">No items yet.</p>
  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
    Create First Item
  </button>
</div>
```

### Error State
```tsx
<div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
  <div className="flex items-center gap-2 text-red-400">
    <AlertCircle className="h-4 w-4" />
    <span className="text-sm">Error message here</span>
  </div>
  <button className="mt-2 text-sm text-red-400 hover:underline">
    Retry
  </button>
</div>
```

### Success Toast (not inline banner)
Use toast system for non-blocking success messages. Only use inline for blocking warnings.

---

## Focus States

```css
:focus-visible {
  outline: 2px solid rgba(59, 130, 246, 0.45);
  outline-offset: 3px;
}
```

All interactive elements must have visible focus indicators.

---

## Hit Targets

**Minimum touch/click target: 24px × 24px**

Even if an icon is 16px, wrap it in padding to reach 24px minimum.

---

## Accessibility

- **Contrast**: All text meets WCAA AA minimum
- **Motion**: Respect `prefers-reduced-motion`
- **Icons**: Include `aria-label` or `aria-hidden="true"`
- **Truncation**: Add tooltip on hover for truncated text

---

## Layout

### Grid
- 12-column grid
- Max content width: `1280–1440px`
- Page padding: `24px` (desktop), `16px` (tablet), `12px` (mobile)

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Responsive Cards
- 1 column (sm)
- 2 columns (md)
- 3 columns (lg+)

---

## Usage Examples

### Model Result Card (Generate Tab)
```tsx
<div className="flex flex-col bg-[#151A21] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.35)] overflow-hidden">
  {/* Header */}
  <div className="p-4 border-b border-white/10">
    <h3 className="font-semibold text-white">Model Name</h3>
    <p className="text-xs text-gray-400">model-id</p>
  </div>
  
  {/* Body - scrollable */}
  <div className="flex-1 p-4 overflow-y-auto max-h-64">
    <p className="text-sm text-white">{content}</p>
  </div>
  
  {/* Footer */}
  <div className="p-4 bg-white/5 border-t border-white/10">
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div>
        <div className="text-gray-400">Input</div>
        <div className="font-medium text-white">1,234</div>
      </div>
      <div>
        <div className="text-gray-400">Cost</div>
        <div className="font-medium text-green-400">$0.0012</div>
      </div>
    </div>
  </div>
</div>
```

---

## Implementation Notes

### Tailwind Config
Extend your `tailwind.config.js` with custom colors and shadows:
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: '#0F1216',
        surface: '#151A21',
        elevated: '#1A212A',
      },
      boxShadow: {
        'card': '0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)',
        'card-hover': '0 12px 32px rgba(0,0,0,0.45)',
        'modal': '0 24px 56px rgba(0,0,0,0.55)',
      },
    },
  },
}
```

### CSS Variables
See `globals.css` for implementation of design tokens.

---

## Enforcement

1. **All new components** must reference this doc
2. **All PRs** should verify compliance with design system
3. **Refactoring**: Gradually migrate existing components to match these patterns
4. **Questions**: If unsure, default to the simplest, most minimal approach

---

## Changelog

- **2025-10-15**: Initial design system documentation created
