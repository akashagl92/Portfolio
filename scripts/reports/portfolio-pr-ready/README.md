# Portfolio PR-Ready Quality Baseline

Prepared for `akashagl92/Portfolio` using live GitHub metadata.

## Live Repo Snapshot Used
- Existing workflow detected: `.github/workflows/update-stats.yml`
- Missing: test directory, `SECURITY.md`, `CODEOWNERS`
- `package.json` currently has placeholder test script

## Files in this bundle
- `.github/dependabot.yml`
- `.github/workflows/ci.yml`
- `SECURITY.md`
- `CODEOWNERS`
- `tests/smoke/portfolio.smoke.test.mjs`
- `package-json.patch.diff`
- `docs/bugfix-rca-template.md`

## How to apply in the Portfolio repo

1. Create branch:
```bash
git checkout -b chore/portfolio-quality-baseline
```

2. Copy these files into the `Portfolio` repo:
- `.github/dependabot.yml`
- `.github/workflows/ci.yml`
- `SECURITY.md`
- `CODEOWNERS`
- `tests/smoke/portfolio.smoke.test.mjs`
- `docs/bugfix-rca-template.md`

3. Update `package.json` scripts using `package-json.patch.diff`.

4. Commit and push:
```bash
git add .github/dependabot.yml .github/workflows/ci.yml SECURITY.md CODEOWNERS tests/smoke/portfolio.smoke.test.mjs docs/bugfix-rca-template.md package.json
git commit -m "chore: add quality baseline (ci, dependabot, tests, security, ownership)"
git push -u origin chore/portfolio-quality-baseline
```

5. Open PR and set required status checks in branch protection:
- Require `CI / checks` before merge.

## Opportunity Coverage

- `missing-dependabot`: resolved by `.github/dependabot.yml`
- `no-ci` / `ci-unverified`: handled by `.github/workflows/ci.yml`
- `low-test-signal`: handled by smoke tests + `package.json` script patch
- `missing-security-policy`: handled by `SECURITY.md`
- `missing-codeowners`: handled by `CODEOWNERS`
- `bugfix-churn`: handled by RCA process template (`docs/bugfix-rca-template.md`)

## Recommended PR Sequence

1. PR-1: `dependabot + ci.yml`
2. PR-2: `smoke tests + package.json test scripts`
3. PR-3: `SECURITY.md + CODEOWNERS`
4. PR-4: adopt RCA template for next recurring bug fix cycle
