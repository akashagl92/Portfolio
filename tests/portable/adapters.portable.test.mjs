import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = process.cwd();
const adapters = ['claude', 'codex', 'cursor', 'cli', 'opencode'];
const requiredHandlers = [
  'on_session_start',
  'on_pre_tool_use',
  'on_post_tool_use',
  'on_subagent_stop',
  'on_session_end'
];

for (const adapter of adapters) {
  test(`adapter manifest is valid for ${adapter}`, () => {
    const manifestPath = `${root}/portable-pai-core/adapters/${adapter}/adapter.json`;
    assert.ok(fs.existsSync(manifestPath), `missing ${manifestPath}`);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.name, adapter);
    for (const handler of requiredHandlers) {
      assert.ok(manifest.event_handlers.includes(handler), `missing handler ${handler}`);
    }
    assert.ok(fs.existsSync(`${root}/portable-pai-core/adapters/${adapter}/scripts/emit_event.sh`));
  });
}
