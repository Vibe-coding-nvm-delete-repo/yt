# .cline/workflows/pre_push.yml
trigger: pre-push
steps:
  - run: npm run build
  - run: npm run test:ci
  - run: npm audit --omit=dev
