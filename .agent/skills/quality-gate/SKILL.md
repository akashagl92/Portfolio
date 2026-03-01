# Skill: Quality Gate (Local)

## Description
A static analysis and security auditing tool designed to prevent credential leaks and verify structural integrity before commits.

## Capabilities
- **Secret Detection**: Scans for high-entropy strings and known API key patterns.
- **Exclusion Management**: Respects `.pai-protected.json` and `.env` boundaries.
- **Stage Aware**: Adjusts rigor based on PAI_STAGE (dev, pre_merge, pre_deploy).

## Usage
`./scripts/pai_skill_ctl.sh run quality-gate`
