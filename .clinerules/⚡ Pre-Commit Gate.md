# .cline/workflows/pre_commit.yml
trigger: pre-commit
steps:
  - run: npm run lint:staged
  - run: tsc --noEmit
  - run: npm test -- --bail --passWithNoTests
