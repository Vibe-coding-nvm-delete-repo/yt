{
  "scripts": {
    "lint": "eslint 'src/**/*.{ts,tsx}'",
    "format": "prettier --write 'src/**/*.{ts,tsx,js,jsx,json,css,md}'",
    "test": "vitest",
    "test:ci": "vitest run --coverage",
    "validate-env": "ts-node scripts/validateEnv.ts",
    "build": "next build",
    "deploy": "vercel --prod"
  }
}
