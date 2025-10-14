## Title

<short imperative> (Fixes #<NUMBER>)

## What changed

-

## Why

-

## How to verify

1.
2.
3.

## Risks / Limitations

-

## Size

~<added>/<removed> lines

## Definition of Done (DoD)

- [ ] No secrets / .env added or modified
- [ ] No changes under `.github/**` unless intentional and approved
- [ ] Lint clean (zero warnings): `npm run lint -- --max-warnings=0`
- [ ] Typecheck clean: `npm run typecheck`
- [ ] Tests passing: `npm test -- --runInBand`
- [ ] Branch is up to date with `main`
- [ ] Clear PR body (What/Why/How to verify + Risks + Size)
- [ ] Screenshot/GIF if UI changed
 - [ ] Acceptance criteria met; linked issue/epic; ADR linked or "N/A"
 - [ ] Backward compatibility preserved, or breaking change documented with migration path
 - [ ] Feature guarded by a flag or has a safe rollout plan and kill switch
 - [ ] Observability updated: logs/metrics/traces; alerts/dashboards updated or "N/A"
 - [ ] Performance budgets respected; no regressions verified locally (note perf risks if any)
 - [ ] Security/privacy reviewed: no PII in logs; deps changes pass audit
 - [ ] Accessibility verified (labels, keyboard nav, color contrast)
 - [ ] API/schema changes documented; all consumers updated or "N/A"
 - [ ] Data/storage migrations include scripts, tests, and rollback plan or "N/A"
 - [ ] Documentation updated (user/dev); README/CHANGELOG updated if user-visible
 - [ ] Rollout and rollback plan captured in "How to verify" or "Risks"
 - [ ] Tests added/updated (unit/integration/e2e) for new behavior
 - [ ] i18n: user-facing strings externalized and ready for translation or "N/A"
