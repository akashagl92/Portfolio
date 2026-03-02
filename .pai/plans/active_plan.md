# Orchestration Plan - QA Gate & Skill Institutionalization

Expand the project's agentic capabilities by restoring QA infrastructure and institutionalizing the social media capture pipeline.

## Proposed Changes

### 1. Global Workflows
#### [MODIFY] [capture_social.md](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/.agent/workflows/capture_social.md)
Update the workflow to use the generic `pai_skill_ctl.sh` interface instead of hardcoded global paths.

### 2. PAI Skill Infrastructure
#### [MODIFY] [pai_skill_ctl.sh](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/scripts/pai_skill_ctl.sh)
Refactor to support arbitrary skills and argument passing.
- Entry point detection: `scripts/run.sh` -> `scripts/audit_codebase.sh` -> `scripts/capture.js`.
- Pass all trailing arguments to the skill entry point.

#### [NEW] [social-media-capture skill](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/.agent/skills/social-media-capture/)
Sync the global `social-media-capture` skill folder to the project-local `.agent/skills/` directory.
- Ensure `scripts/run.sh` is created/linked as the standard entry point.

### 3. Documentation Pipeline (Stability)
#### [MODIFY] [agentic_chronicler.py](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/scripts/agentic_chronicler.py)
[ALREADY APPLIED] Optimized with `pushed_at` incremental synthesis.

## Verification Plan

### Automated Tests
- Run `node scripts/pai_skill_ctl.sh run social-media-capture --help` (visual check).
- Verify `qa_gate` still passes after refactor.

### Manual Verification
- Capture a short test GIF using the project-local skill.
