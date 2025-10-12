# .cline/workflows/weekly_audit.yml
trigger: schedule
cron: "0 9 * * 1"
steps:
  - run: cline audit --ruleset ./cline/rules/
  - create_issues: true
  - notify: "slack:#dev-updates"
