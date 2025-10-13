# JSX-Specific ESLint Rules for Next.js/React Apps

## Add these rules to your ESLint config for JSX safety:

```javascript
{
  files: ['**/*.{jsx,tsx}'],
  rules: {
    // React-specific rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // JSX-specific safety rules
    'react/jsx-key': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/prop-types': 'off', // TypeScript handles this

    // Prevent common JSX mistakes
    'react/jsx-uses-vars': 'error',
    'react/jsx-uses-react': 'error',
  },
}
```

## Quick Fix: Update your ESLint config to include these rules for safer JSX.
