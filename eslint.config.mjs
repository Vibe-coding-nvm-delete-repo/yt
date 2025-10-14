/**
 * ESM-friendly ESLint flat config - EMERGENCY FIX VERSION
 * Fixed syntax errors and duplicate entries causing build failures
 */
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
  // Base configurations
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Global configuration
  {
    languageOptions: {
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
      // General rules
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'warn',
      
      // React hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Unused imports
      'unused-imports/no-unused-imports': 'warn',
    },
  },

  // TypeScript-specific rules
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
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Test files configuration
  {
    files: ['**/__tests__/**', '**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: globals.jest,
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'off',
    },
  },

  // Configuration files
  {
    files: ['**/*.config.*', 'jest.config.js', 'jest.setup.js'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'coverage/**',
      'next-env.d.ts',
    ],
  }
);
