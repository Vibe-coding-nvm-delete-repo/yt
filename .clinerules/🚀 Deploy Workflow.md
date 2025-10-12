# .cline/workflows/deploy.yml
trigger: manual
steps:
  - run: npm run build
  - run: npm run test:ci
  - run: npm run deploy
