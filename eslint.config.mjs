/**
 * Minimal ESM-friendly ESLint config for CI.
 * Replaced the previous FlatCompat usage which caused `require is not defined`
 * errors in the hosted runner. Keep extensions minimal and ESM-only.
 */
export default [
  'next/core-web-vitals',
  'next/typescript',
  {
    files: ['jest.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
];
