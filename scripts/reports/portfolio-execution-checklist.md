# Portfolio Execution Checklist (PoC)

Scope: Address `priority >= 7` opportunities for `akashagl92/Portfolio`.

## Opportunity 1: `missing-dependabot` (Priority 7)

### PR-1: Add Dependabot
- Create `.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```
- Commit message: `chore: add dependabot weekly npm updates`

### Definition of Done
- File exists at `.github/dependabot.yml`.
- GitHub shows Dependabot enabled for the repo.
- First Dependabot PR is created (or scheduled).

### Verification
- Repo Settings / Security & analysis confirms Dependabot alerts and updates.
- One dependency update PR appears in open PRs.

---

## Opportunity 2: `low-test-signal` (Priority 7)

### PR-2: Add smoke tests for critical flows
- Pick 2-3 critical flows:
  - Home page renders.
  - Main data load succeeds (`data.json` integrity/basic schema).
  - One representative project page route renders.
- Add test framework (choose one based on current stack):
  - Unit/smoke: `vitest` or `jest`
  - Optional browser smoke: `playwright`
- Add minimal tests under `tests/` (or `__tests__/`).
- Add `npm run test` script in `package.json`.
- Commit message: `test: add smoke coverage for critical portfolio flows`

### Definition of Done
- `npm run test` passes locally and in CI.
- At least 2-3 smoke tests exist and are stable.
- Failing app behavior causes test failure reliably.

### Verification
- Run `npm test` locally.
- Confirm CI fails on intentional break and passes when reverted.

---

## PR-3: Gate merges with CI

- Add `.github/workflows/ci.yml`:
  - install dependencies
  - run lint (if available)
  - run tests
  - optional build check
- Commit message: `ci: enforce test gate for pull requests`

### Definition of Done
- CI runs on `pull_request` and `push`.
- PR cannot be merged when tests fail.

### Verification
- Open a test PR and confirm required checks are enforced.

---

## Suggested Sequence and Ownership

1. PR-1 Dependabot (fastest, low risk)
2. PR-2 Smoke tests (core quality baseline)
3. PR-3 CI gate (enforce quality)

Tracker updates in CSV after each PR:
- `status`: `todo -> in_progress -> done -> verified`
- `owner`: assign one person
- `target_date`: set completion date per PR
- `notes`: PR link and validation notes

---

## Re-run Analysis

After PR-3 merges, run:
```bash
npm run repo:intel -- --limit 20 --recent-days 365 --repo Portfolio --min-priority 7 --export-csv --autofix --refresh
```

Expected result:
- `missing-dependabot` removed
- `low-test-signal` removed or downgraded
