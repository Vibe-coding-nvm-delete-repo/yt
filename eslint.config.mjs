/**
 * ESM-friendly ESLint flat config for this project (ESLint v9).
 * TypeScript + React Hooks + unused-imports. No FlatCompat to avoid ESM issues.
 */
 * ESM-friendly ESLint config for the project.
 * Uses flat config format with Next.js, TypeScript, React hooks.
 */

// Core
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
  // Base JS and TS recommended sets
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Global defaults
  {
    languageOptions: {
      // IMPORTANT: Do NOT set parserOptions.project globally; only for TS files override below.
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'unused-imports': unusedImports,
    },
    rules: {
      // General
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off', // use @typescript-eslint version
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'warn',
      // React Hooks
    plugins: { 'react-hooks': reactHooks },
  },
  {
    ignores: ['next-env.d.ts', 'node_modules/**', '.next/**', 'out/**', 'build/**', 'coverage/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { "argsIgnorePattern": "^_" }],
      '@typescript-eslint/consistent-type-imports': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Unused imports
      'unused-imports/no-unused-imports': 'warn',
    },
  },

  // Type-aware rules only for TS files (supply project here)
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
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
    },
  },

  // Test files: relax console/unused rules and add jest globals
  {
    files: ['**/__tests__/**', '**/*.test.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'off',
    // Disable type-aware rules for config/generated JS files
    files: ["**/*.config.*", "eslint.config.mjs", "jest.config.js", "jest.setup.js"],
    languageOptions: { globals: globals.node },
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/strict-boolean-expressions": "off"
    },
  },

  // Config/generated files: looser type-aware rules
  {
    files: ['**/*.config.*', 'eslint.config.mjs', 'jest.config.js', 'postcss.config.mjs', 'coverage/**'],
    files: ['jest.config.js', 'jest.setup.js'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/consistent-type-imports': 'warn',
      'unused-imports/no-unused-imports': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Ignores
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
