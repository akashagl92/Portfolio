# Refactor - Verification & Execution

## 1. Audit (OBSERVE)
- [ ] Scan files for `// TODO` or `// FIXME` tags.
- [ ] Run `scripts/pai_quality_gate_eval.sh`.

## 2. Refactor (EXECUTE)
- [ ] Execute the structural changes.
- [ ] Ensure `NATIVE` mode is active if writing to artifacts.

## 3. Verify (VERIFY)
- [ ] Assert file integrity.
- [ ] Ensure non-regression of core features.

## 4. Post-Mortem (LEARN)
- [ ] Record session corrections in `.pai/tasks/lessons.md`.
