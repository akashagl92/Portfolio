# Dedicated Repo Blueprint (Forkable by Individuals and Enterprises)

## Objective
Package this system as a standalone repo users can fork and apply in any IDE/CLI while preserving local governance and security controls.

## Proposed Repository Layout

```text
portable-pai-core/
  adapters/
    claude/
    codex/
    cursor/
    opencode/
    cli/
  core/
    scripts/
      pai_core_lib.sh
      pai_event_bus.sh
      pai_policy_eval.py
    config/
      runtime.env.example
      policy.json
      policy.enterprise.json
    schemas/
      event.schema.json
      policy.schema.json
  packs/
    security/
    quality/
    observability/
  examples/
    portfolio-example/
  docs/
    quickstart.md
    migration.md
    enterprise-governance.md
  tests/
    policy/
    runtime/
    adapters/
```

## Enterprise Readiness Controls
- Policy profiles by environment (`dev`, `pre_merge`, `pre_deploy`, `post_deploy`).
- Team-owned policy overlays and approvals.
- Audit-ready event and decision logs.
- Optional SSO/identity integration in adapters.

## Distribution Model
- OSS core: runtime + policy + event schemas + base adapters.
- Optional enterprise overlays:
  - stricter policy packs,
  - compliance templates,
  - SIEM connectors.

## Adoption Path
1. Start with CLI adapter and shadow mode defaults.
2. Enable sub-agent proposal mode.
3. Enable scoped write in approved projects.
4. Add IDE-native adapters for productivity boosts.
