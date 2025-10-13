import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Global settings / plugins
  {
    rules: {
      // Keep Next.js defaults but add safer TypeScript checks that don't require type-aware parsing.
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
      // Rules that require TypeScript type information are enabled only for TS source files
      // in a dedicated override (see below). This avoids lint attempting to type-check
      // config/generated files or JS artifacts.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    },
  },
  // Specific file overrides
  {
    // Disable rules that require type information when linting config/generated JS files
    files: ["**/*.config.*", "eslint.config.mjs", "jest.config.js", "coverage/**"],
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/strict-boolean-expressions": "off"
    },
  },
  {
    files: ["jest.config.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "jest.setup.js",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
