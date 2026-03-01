# ADR-0001: Skill-Workflow Reliability Framework (v1.0)

## Status
Hardened

## Context
As the PAI ecosystem scales, we need a reliable way to inject global capabilities (Skills) into local project rituals (Workflows) without manual duplication. We also need strict project isolation to prevent architectural signals from leaking between unrelated projects.

## Decision
We implement a "Bridge & Guard" architecture:

### 1. The Skill Controller (`scripts/pai_skill_ctl.sh`)
- Acts as a proxy between local workflows and the global `~/.gemini/antigravity/skills/` directory.
- **Precedence**: Local overrides in `.agent/skills/` take priority over global skills.

### 2. Runtime Project Isolation
- All scripts (RGC, Skills) must perform a "PAI Boundary Check".
- **Rule**: If the script is running in a directory without a `.pai/` folder, it must abort to prevent state pollution.

### 3. Stage-Aware QA Gates
- Documentation and security audits are triggered via a unified `/qa_gate` ritual.
- Results are recorded in the SHADOW profile (`.pai/tasks/todo.md`).

## Consequences

### Positive
- **Reliability**: Every project inherits the same hardened security and architectural checks.
- **Isolation**: prevents accidental data leakage between projects.
- **Maintainability**: Global skills can be updated once and propagated to all linked projects.

### Negative
- **Dependency**: Local projects depend on the presence of the global `~/.gemini/` structure.
- **Complexity**: Adds a layer of indirection via the `pai_skill_ctl.sh` script.

## Verification
- Verified by running `./scripts/pai_skill_ctl.sh run quality-gate`.
- Project isolation verified by running RGC scripts outside the project root.
