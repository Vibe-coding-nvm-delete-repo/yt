/**
 * ESLint Flat Config (v9) with P0 Architectural Enforcement
 * 
 * This configuration enforces:
 * - Architectural boundaries and layered design
 * - File size limits to prevent monolithic components
 * - Component complexity limits
 * - Best practices for React and TypeScript
 * - Strict no-any policy to prevent regressions
 * 
 * Custom rules located in: ./eslint-rules/index.js
 */

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import { createRequire } from 'module';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize FlatCompat for legacy config compatibility
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Load custom architectural rules
const require = createRequire(import.meta.url);
const customRules = require('./eslint-rules/index.js');

export default tseslint.config(
  // === GLOBAL IGNORES ===
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'coverage/**',
      'jest.setup.js',
      'next-env.d.ts',
      '.husky/**',
      'eslint-rules/**', // Don't lint our own rules
    ],
  },

  // === BASE CONFIGURATION ===
  js.configs.recommended,
  ...tseslint.configs.recommended,
  
  // === NEXT.JS CONFIGURATION ===
  // Use FlatCompat to integrate Next.js ESLint config (required for Next.js plugin detection)
  ...compat.extends('next/core-web-vitals'),

  // === GLOBAL DEFAULTS ===
  {
    plugins: {
      'react-hooks': reactHooks,
      'unused-imports': unusedImports,
      'custom': customRules,
    },
    rules: {
      // === GENERAL CODE QUALITY ===
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error', // STRICT: prevent regressions
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      
      // === STRICT PATTERNS TO PREVENT REGRESSIONS ===
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.object.name="document"][callee.property.name!=/^(createElement|getElementById|querySelector)$/]',
          message: 'Direct DOM manipulation outside useEffect/useLayoutEffect is forbidden. Use React refs.'
        }
      ],
      
      // === REACT HOOKS ===
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // === IMPORT MANAGEMENT ===
      'unused-imports/no-unused-imports': 'error',
      
      // === P0 CUSTOM ARCHITECTURAL RULES ===
      'custom/max-file-size': ['error', { max: 400, ignoreComments: true }],
      'custom/architecture-boundaries': 'error',
      'custom/component-complexity': ['error', { maxProps: 10, maxStateVars: 8, maxHandlers: 10 }],
      'custom/no-dom-manipulation': 'warn',
      'custom/require-error-handling': 'warn',
    },
  },

  // === TYPESCRIPT TYPE-AWARE RULES ===
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'off',
    },
  },

  // === LEGACY FILES: TEMPORARY EXCEPTIONS (P1 REFACTORING) ===
  {
    files: [
      'src/components/SettingsTab.tsx',
      'src/components/ImageToPromptTab.tsx',
      'src/lib/storage.ts',
    ],
    rules: {
      'custom/max-file-size': 'off', // Legacy files - scheduled for P1 decomposition
      'custom/component-complexity': 'off', // Complex legacy components
      '@typescript-eslint/no-unused-vars': 'warn',
      'unused-imports/no-unused-imports': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn', // Allow any in legacy until refactored
    },
  },

  // === TEST FILES: RELAXED RULES ===
  {
    files: ['**/__tests__/**', '**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'custom/max-file-size': 'off',
      'custom/component-complexity': 'off',
      'custom/require-error-handling': 'off',
    },
  },

  // === CONFIG FILES: MINIMAL RULES ===
  {
    files: ['**/*.config.*', 'jest.config.js', 'jest.setup.js'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'custom/max-file-size': 'off',
      'custom/architecture-boundaries': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
