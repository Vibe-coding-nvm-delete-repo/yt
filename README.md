This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Prompt Creator Feature

The **Prompt Creator** tab lets you assemble structured prompt inputs, generate batches of prompts, and score them automatically.

1. Open **Settings → Prompt Creator** to configure the available fields, prompt generation instructions, rating rubric, and OpenRouter model ID.
2. The builder persists every selection to `localStorage`, so you can switch tabs without losing your draft.
3. Use the Generate buttons on the **Prompt Creator** tab to request 1, 3, 5, or 10 prompts. Each prompt is rated via OpenRouter and saved to a permanent history so you can copy or favorite the results.

> ℹ️ Prompt generation and scoring both require a valid OpenRouter API key. Add the key in **Settings → API Keys** before using the Prompt Creator workflow.

## Project Standards and Workflows

- Engineering Standards: see `docs/ENGINEERING_STANDARDS.md`
- P0 Enforcement System (architecture guards, pre-commit, CI): see `docs/P0_ENFORCEMENT_SYSTEM.md`
- Merge Conflict Prevention and required checks: see `docs/MERGE_CONFLICT_PREVENTION.md`

When developing a new feature, follow the Feature Development DoD in `docs/ENGINEERING_STANDARDS.md` and complete the DoD checklist in the PR template.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
