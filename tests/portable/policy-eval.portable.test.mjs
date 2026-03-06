import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';

const root = process.cwd();
const policy = `${root}/.pai/config/policy.json`;

function run(cmd) {
  try {
    const out = execSync(cmd, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
    return { ok: true, out };
  } catch (e) {
    return { ok: false, out: (e.stdout || '').toString(), err: (e.stderr || '').toString(), code: e.status };
  }
}

test('proposal_only allows non-mutating child command', () => {
  const r = run(`scripts/pai_policy_eval.py --policy ${policy} --mode proposal_only --actor child --command "echo ok" --root .`);
  assert.equal(r.ok, true);
  assert.match(r.out, /ALLOW/);
});

test('proposal_only denies mutating child command', () => {
  const r = run(`scripts/pai_policy_eval.py --policy ${policy} --mode proposal_only --actor child --command "touch /tmp/x" --root .`);
  assert.equal(r.ok, false);
  assert.equal(r.code, 7);
  assert.match(r.out, /DENY mutation_disallowed_in_mode/);
});
