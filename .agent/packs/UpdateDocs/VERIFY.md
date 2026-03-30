# UpdateDocs - Verification & Execution

## 1. Metrics Audit (OBSERVE)
- [ ] Verify `GITHUB_TOKEN` is available.
- [ ] Check `data.json` for latest repo count.

## 2. Sync Logic (EXECUTE)
- [ ] Run `node scripts/fetch-github.js`.
- [ ] Run `node scripts/update-readme.js`.

## 3. Stability Check (VERIFY)
- [ ] Verify `README.md` formatting is intact.
- [ ] Check for broken image links or mismatched stats.

## 4. Documentation Lifecycle (LEARN)
- [ ] Note any changes in contribution patterns in `.pai/learnings/`.
