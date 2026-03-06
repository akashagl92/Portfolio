# Universal Adoption Plan: Plug Into Any Project, Any IDE, Publicly Forkable

## Outcome
Create a portable, secure, quality-controlled orchestration core that can be dropped into any workspace and used from any IDE/CLI, while being maintained as an independent public repository.

## North Star Requirements
- IDE-agnostic core runtime and policy engine.
- Optional IDE-native adapters for productivity gains.
- One-command project bootstrap.
- Non-breaking compatibility mode for legacy projects.
- Public repo ready for forks (individual and enterprise).

## Delivery Tracks

### Track A: Portable Core (Repo-agnostic)
1. Stabilize core artifacts:
- `scripts/pai_core_lib.sh`
- `scripts/pai_event_bus.sh`
- `scripts/pai_policy_eval.py`
- `.pai/config/runtime.env`
- `.pai/config/policy.json`

2. Publish schemas:
- `core/schemas/event.schema.json`
- `core/schemas/policy.schema.json`

3. Add compatibility contracts:
- Legacy mode map (`research_only` => `proposal_only`)
- Policy fallback path when evaluator is missing.

Acceptance:
- Core passes smoke tests in plain terminal without IDE hooks.

### Track B: Project Plug-In Model (Any Workspace)
1. Create bootstrap installer:
- `install.sh` + `install.ps1`
- `portable-pai init` command (or script alias)

2. Bootstrap behavior:
- Detect workspace root.
- Create `.pai/` structure.
- Copy default runtime/policy templates.
- Install script wrappers into `scripts/`.
- Register optional adapter if IDE is detected.

3. Non-breaking onboarding modes:
- `--mode shadow-safe` (default)
- `--mode compatibility` (legacy tolerant)
- `--mode strict` (enterprise policy-enforced)

Acceptance:
- New project bootstrapped in <2 minutes with default-safe behavior.

### Track C: IDE/CLI Adapter Layer
1. Adapter interface:
- `on_session_start`
- `on_pre_tool_use`
- `on_post_tool_use`
- `on_subagent_stop`
- `on_session_end`

2. Initial adapters:
- `adapters/cli`
- `adapters/claude`
- `adapters/codex`
- `adapters/cursor`
- `adapters/opencode`

3. Capability matrix per adapter:
- Native hook support
- Notification support
- Artifact/task panel integration
- Approval/escalation integration

Acceptance:
- Same core policy decisions and event semantics across all adapters.

### Track D: Public Repo (Forkable + Maintainable)
1. Create standalone repo `portable-pai-core` with layout from `REPO_BLUEPRINT.md`.
2. Add OSS essentials:
- `README.md` quickstart for 3 personas: solo dev, startup team, enterprise team.
- `LICENSE` (MIT or Apache-2.0).
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`.
- Issue and PR templates.

3. Release model:
- SemVer (`v0.x` while stabilizing, `v1.0` after adapter contracts freeze).
- Changelog and migration notes for each release.

4. Governance model:
- Core maintainers own policy/event schema.
- Adapter maintainers own IDE integrations.
- Backward compatibility policy for one minor cycle.

Acceptance:
- Public users can fork, run installer, and pass smoke checks without custom support.

### Track E: Enterprise Readiness
1. Policy overlays:
- `policy.enterprise.json`
- stage/environment overrides (`dev`, `pre_merge`, `pre_deploy`, `post_deploy`).

2. Auditability:
- Signed/reproducible event logs.
- Optional SIEM export connector.

3. Team operations:
- Role-based config ownership (platform, security, dev-experience).
- Approval workflow for scoped-write mode.

Acceptance:
- Enterprise can enforce strict mode without modifying core code.

## Phased Timeline

### Phase 1 (1-2 weeks): Hardening Current Workspace
- Resolve stale-job reconciliation utility.
- Add JSON schemas and schema validation tests.
- Add bootstrap script for local workspace init.

### Phase 2 (2-3 weeks): Standalone Repo Extraction
- Split core/adapters/docs/tests into new repository.
- Publish initial CLI + one IDE adapter.
- Release `v0.1.0` with install + smoke test.

### Phase 3 (3-5 weeks): Multi-IDE + Enterprise Pack
- Add remaining adapters.
- Add enterprise policy overlay and audit exporters.
- Release `v0.5.0`.

### Phase 4 (6-8 weeks): Stability and v1.0
- Freeze schemas and adapter interface.
- Formal migration docs for early adopters.
- Release `v1.0.0`.

## Quality/Security Gates (Must Keep)
- SHADOW default at install.
- Proposal-only default for child lanes.
- Parent-only orchestration artifact writes.
- Structured policy evaluation before child spawn.
- Stage-aware quality gate before merge/deploy.

## Success Metrics
- Bootstrap success rate >= 95% across sample repos.
- Zero critical policy bypasses in test suite.
- Adapter parity score >= 0.8 across core events.
- Median setup time < 10 minutes for first-time users.
- Public repo adoption: forks/stars/issues triaged with SLA.

## Immediate Execution Backlog
1. Implement `scripts/pai_reconcile_jobs.sh` for stale running job cleanup.
2. Add `core/schemas/event.schema.json` + validator script.
3. Add `install.sh` bootstrap for any project workspace.
4. Scaffold standalone `portable-pai-core/` directory in this repo as extraction preview.
5. Add CI workflow that runs policy, event, runtime, and quality smoke checks.
