import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = process.cwd();

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

test('event schema declares required top-level fields and enums', () => {
  const schema = readJson(`${root}/portable-pai-core/core/schemas/event.schema.json`);
  assert.equal(schema.type, 'object');
  for (const key of ['ts', 'event', 'profile', 'mode', 'data']) {
    assert.ok(schema.required.includes(key));
  }
  assert.deepEqual(schema.properties.profile.enum, ['SHADOW', 'NATIVE']);
  assert.deepEqual(schema.properties.mode.enum, ['single_parent', 'proposal_only', 'scoped_write']);
});

test('policy schema requires mode rules and global controls', () => {
  const schema = readJson(`${root}/portable-pai-core/core/schemas/policy.schema.json`);
  assert.equal(schema.type, 'object');
  for (const key of ['version', 'global', 'mode_rules']) {
    assert.ok(schema.required.includes(key));
  }
  const requiredModes = schema.properties.mode_rules.required;
  assert.ok(requiredModes.includes('single_parent'));
  assert.ok(requiredModes.includes('proposal_only'));
  assert.ok(requiredModes.includes('scoped_write'));
});
