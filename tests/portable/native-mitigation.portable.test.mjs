import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const initScript = path.join(root, 'portable-pai-core', 'scripts', 'init-project.sh');

function run(cmd, cwd = root) {
  try {
    const out = execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
    return { ok: true, out };
  } catch (e) {
    return {
      ok: false,
      out: (e.stdout || '').toString(),
      err: (e.stderr || '').toString(),
      code: e.status
    };
  }
}

function mkProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pai-native-test-'));
  const project = path.join(dir, 'proj');
  fs.mkdirSync(project, { recursive: true });
  const r = run(`bash ${initScript} --project ${project}`);
  assert.equal(r.ok, true, r.err || r.out);
  return { dir, project };
}

function setRuntime(project, lines) {
  const runtime = path.join(project, '.pai', 'config', 'runtime.env');
  fs.appendFileSync(runtime, `\n${lines.join('\n')}\n`);
}

test('native mutations are serialized through one lock lane', () => {
  const { dir, project } = mkProject();
  try {
    setRuntime(project, ['PROFILE=NATIVE', 'LOCKED=0']);
    const timeline = path.join(project, 'timeline.log');
    const mut = path.join(project, 'scripts', 'pai_native_mutation.sh');

    const cmd = [
      `(${mut} run op1 -- "echo start1 >> ${timeline}; sleep 1; echo end1 >> ${timeline}") &`,
      `(${mut} run op2 -- "echo start2 >> ${timeline}; sleep 1; echo end2 >> ${timeline}") &`,
      'wait'
    ].join(' ');

    const r = run(`bash -lc '${cmd}'`, project);
    assert.equal(r.ok, true, r.err || r.out);

    const lines = fs.readFileSync(timeline, 'utf8').trim().split('\n').map((s) => s.trim());
    assert.equal(lines.length, 4, `unexpected timeline: ${lines.join(',')}`);

    const seq = lines.join(',');
    const overlapA = 'start1,start2,end1,end2';
    const overlapB = 'start2,start1,end2,end1';
    assert.notEqual(seq, overlapA, `overlap detected: ${seq}`);
    assert.notEqual(seq, overlapB, `overlap detected: ${seq}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('watchdog timeout opens circuit and triggers shadow fallback', () => {
  const { dir, project } = mkProject();
  try {
    setRuntime(project, [
      'PROFILE=NATIVE',
      'LOCKED=0',
      'PAI_NATIVE_TIMEOUT_SEC=1',
      'PAI_NATIVE_BREAKER_THRESHOLD=1',
      'PAI_NATIVE_BREAKER_COOLDOWN_SEC=60',
      'PAI_NATIVE_AUTO_SHADOW_ON_OPEN=1'
    ]);

    const mut = path.join(project, 'scripts', 'pai_native_mutation.sh');
    const r = run(`${mut} run op-timeout -- "sleep 4"`, project);
    assert.equal(r.ok, false, 'timeout should fail');

    const c = run(`${path.join(project, 'scripts', 'pai_native_circuit.sh')} status`, project);
    assert.equal(c.ok, true);
    assert.match(c.out, /STATE=open/);

    const s = run(`${path.join(project, 'scripts', 'pai_runtime_guard.sh')} status`, project);
    assert.equal(s.ok, true);
    assert.match(s.out, /PROFILE=SHADOW/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('retry/replay queue processes idempotent operation and avoids duplicates', () => {
  const { dir, project } = mkProject();
  try {
    setRuntime(project, [
      'PROFILE=NATIVE',
      'LOCKED=0',
      'PAI_NATIVE_TIMEOUT_SEC=5',
      'PAI_NATIVE_BREAKER_THRESHOLD=5',
      'PAI_NATIVE_AUTO_SHADOW_ON_OPEN=0',
      'PAI_NATIVE_RETRY_MAX=2',
      'PAI_NATIVE_REPLAY_ENABLED=1'
    ]);

    const failOnce = path.join(project, 'fail-once.sh');
    const marker = path.join(project, '.first_fail_marker');
    fs.writeFileSync(
      failOnce,
      `#!/usr/bin/env bash\nset -euo pipefail\nif [[ ! -f ${marker} ]]; then touch ${marker}; exit 1; fi\necho ok\n`,
      'utf8'
    );
    fs.chmodSync(failOnce, 0o755);

    const mut = path.join(project, 'scripts', 'pai_native_mutation.sh');
    const replay = path.join(project, 'scripts', 'pai_native_replay.sh');

    const first = run(`${mut} run op-retry -- "${failOnce}"`, project);
    assert.equal(first.ok, false, 'first run should fail and enqueue');

    const pending = path.join(project, '.pai', 'runtime', 'native_queue', 'pending', 'op-retry.env');
    assert.equal(fs.existsSync(pending), true, 'pending item should exist');

    const proc = run(`${replay} process --max 5`, project);
    assert.equal(proc.ok, true, proc.err || proc.out);

    const processedFlag = path.join(project, '.pai', 'runtime', 'native_queue', 'processed', 'op-retry.ok');
    assert.equal(fs.existsSync(processedFlag), true, 'processed marker should exist');
    assert.equal(fs.existsSync(pending), false, 'pending should be cleared after success');

    const dedupe = run(`${mut} run op-retry -- "echo should-not-run"`, project);
    assert.equal(dedupe.ok, true);
    assert.match(dedupe.out, /already_processed/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('shadow profile blocks native artifact start updates', () => {
  const { dir, project } = mkProject();
  try {
    setRuntime(project, [
      'PROFILE=SHADOW',
      'LOCKED=1',
      'PAI_NATIVE_SHADOW_ENFORCE_BLOCK=1'
    ]);
    const guard = path.join(project, 'scripts', 'pai_native_artifact_guard.sh');
    const r = run(`${guard} guard --target task --phase start --op-key native-task-1`, project);
    assert.equal(r.ok, false, 'shadow should block native artifact start');
    assert.equal(r.code, 11);
    assert.match(r.out, /NATIVE_ARTIFACT_DENY/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('artifact fallback is one-way (NATIVE -> SHADOW only)', () => {
  const { dir, project } = mkProject();
  try {
    setRuntime(project, [
      'PROFILE=NATIVE',
      'LOCKED=0',
      'PAI_NATIVE_ARTIFACT_AUTO_FALLBACK_ENABLED=1',
      'PAI_NATIVE_ARTIFACT_OBSERVE_ONLY=0',
      'PAI_NATIVE_ARTIFACT_ONE_WAY_SHADOW=1'
    ]);
    const guard = path.join(project, 'scripts', 'pai_native_artifact_guard.sh');
    const runtime = path.join(project, 'scripts', 'pai_runtime_guard.sh');

    const fail = run(`${guard} guard --target implementation_plan --phase end --op-key plan-1 --result stalled`, project);
    assert.equal(fail.ok, true, fail.err || fail.out);

    const s1 = run(`${runtime} status`, project);
    assert.equal(s1.ok, true);
    assert.match(s1.out, /PROFILE=SHADOW/);

    const success = run(`${guard} guard --target implementation_plan --phase end --op-key plan-1 --result success`, project);
    assert.equal(success.ok, true);

    const s2 = run(`${runtime} status`, project);
    assert.equal(s2.ok, true);
    assert.match(s2.out, /PROFILE=SHADOW/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('artifact bridge observes native file updates and triggers fallback on stall', async () => {
  const { dir, project } = mkProject();
  try {
    const sourceRoot = path.join(dir, 'fake-antigravity', 'brain');
    const session = path.join(sourceRoot, 'session-1');
    fs.mkdirSync(session, { recursive: true });

    const metadata = path.join(session, 'task.md.metadata.json');
    fs.writeFileSync(
      metadata,
      JSON.stringify(
        {
          artifactType: 'ARTIFACT_TYPE_TASK',
          summary: 'initial',
          updatedAt: new Date().toISOString()
        },
        null,
        2
      )
    );

    setRuntime(project, [
      'PROFILE=NATIVE',
      'LOCKED=0',
      'PAI_NATIVE_ARTIFACT_AUTO_FALLBACK_ENABLED=1',
      'PAI_NATIVE_ARTIFACT_OBSERVE_ONLY=0',
      'PAI_NATIVE_ARTIFACT_ONE_WAY_SHADOW=1',
      'PAI_NATIVE_ARTIFACT_STALL_TIMEOUT_SEC=2',
      'PAI_NATIVE_ARTIFACT_BRIDGE_ENABLED=1',
      `PAI_NATIVE_ARTIFACT_SOURCE_ROOT=${sourceRoot}`,
      'PAI_NATIVE_ARTIFACT_BRIDGE_POLL_SEC=1',
      'PAI_NATIVE_ARTIFACT_BRIDGE_IDLE_END_SEC=60'
    ]);

    const bridge = path.join(project, 'scripts', 'pai_native_artifact_bridge.sh');
    const runtime = path.join(project, 'scripts', 'pai_runtime_guard.sh');

    const start = run(`${bridge} start`, project);
    assert.equal(start.ok, true, start.err || start.out);

    await new Promise((r) => setTimeout(r, 2200));

    fs.writeFileSync(
      metadata,
      JSON.stringify(
        {
          artifactType: 'ARTIFACT_TYPE_TASK',
          summary: 'changed',
          updatedAt: new Date().toISOString()
        },
        null,
        2
      )
    );

    await new Promise((r) => setTimeout(r, 3500));

    const s = run(`${runtime} status`, project);
    assert.equal(s.ok, true);
    assert.match(s.out, /PROFILE=SHADOW/);
  } finally {
    const bridge = path.join(project, 'scripts', 'pai_native_artifact_bridge.sh');
    run(`${bridge} stop`, project);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('runtime guard status auto-ensures bridge daemon when enabled', () => {
  const { dir, project } = mkProject();
  try {
    const sourceRoot = path.join(dir, 'fake-antigravity', 'brain');
    fs.mkdirSync(sourceRoot, { recursive: true });
    setRuntime(project, [
      'PAI_NATIVE_ARTIFACT_BRIDGE_ENABLED=1',
      `PAI_NATIVE_ARTIFACT_SOURCE_ROOT=${sourceRoot}`,
      'PAI_RUNTIME_AUTO_ENSURE_BRIDGE=1'
    ]);

    const bridge = path.join(project, 'scripts', 'pai_native_artifact_bridge.sh');
    const runtime = path.join(project, 'scripts', 'pai_runtime_guard.sh');

    run(`${bridge} stop`, project);
    const before = run(`${bridge} status`, project);
    assert.equal(before.ok, true);
    assert.match(before.out, /RUNNING=0/);

    const status = run(`${runtime} status`, project);
    assert.equal(status.ok, true, status.err || status.out);
    assert.match(status.out, /BRIDGE_DAEMON_RUNNING=1/);

    const after = run(`${bridge} status`, project);
    assert.equal(after.ok, true);
    assert.match(after.out, /RUNNING=1/);
  } finally {
    const bridge = path.join(project, 'scripts', 'pai_native_artifact_bridge.sh');
    run(`${bridge} stop`, project);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
