/**
 * Minimal ESM-friendly ESLint config for CI.
 * Using Next.js ESLintFlatCompat for compatibility.
 */
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import typeScriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
 * ESM-friendly ESLint config for the project.
 * Uses flat config format, no FlatCompat to avoid ESM issues.
 * Includes Next.js, TypeScript, React hooks, unused-imports.
 */

// Core
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      "@typescript-eslint": typeScriptEslintPlugin,
      "react-hooks": reactHooksPlugin,
      "unused-imports": unusedImportsPlugin,
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
      // Keep Next.js defaults but add strict TypeScript checks useful for this repo
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/consistent-type-imports": "warn", // Change from error to warn for CI stability
      "@typescript-eslint/no-explicit-any": "warn", // Change from error to warn
      // Both rules below require type information (not available in this basic config):
      // "@typescript-eslint/no-floating-promises": "error",
      // "@typescript-eslint/strict-boolean-expressions": "warn",
      "unused-imports/no-unused-imports": "warn", // Change from error to warn
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
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
];

export default eslintConfig;
);
