/**
 * ESM-friendly ESLint config for the project.
 * Uses flat config format, no FlatCompat to avoid ESM issues.
 * Includes Next.js, TypeScript, React hooks, unused-imports.
 */

// Core
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { languageOptions: { globals: globals.browser } },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
  },
  {
    ignores: ['next-env.d.ts'],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { "argsIgnorePattern": "^_" }],
      '@typescript-eslint/consistent-type-imports': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'warn',
    },
  },
  {
    // Disable type-aware rules for config/generated JS files and enable node globals there
    files: ["**/*.config.*", "eslint.config.mjs", "jest.config.js", "coverage/**"],
    languageOptions: { globals: globals.node },
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/strict-boolean-expressions": "off"
    },
  },
  {
    files: ['jest.config.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'coverage/**',
      'jest.setup.js',
      'next-env.d.ts',
    ],
  },
);
