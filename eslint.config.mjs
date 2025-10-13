/**
 * Next.js ESLint Configuration
 * Using Next.js built-in configuration with core web vitals
 */
export default [
  'next/core-web-vitals',
  'next/typescript',
  {
    rules: {
      // Core TypeScript rules
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    // JSX-specific safety rules
    files: ['**/*.{jsx,tsx}'],
    rules: {
      // React-specific rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // JSX-specific safety rules
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/prop-types': 'off', // TypeScript handles this

      // Prevent common JSX mistakes
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'error',
    },
  },
  {
    // Config file overrides
    files: ['jest.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // Ignore build artifacts and dependencies
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'coverage/**',
      'jest.setup.js',
    ],
  },
];
