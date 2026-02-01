---
description: Refresh project documentation (README, stats, and contribute guide)
---
# Documentation Hygiene Ritual

This workflow ensures the project documentation is in sync with the latest code, commits, and portfolio pages.

## Steps

1. **Sync GitHub activity stats** (for the stats table)
// turbo
run_command("node scripts/fetch-github.js")

2. **Fetch project deep-dive data** (READMEs, commits, files)
// turbo
run_command("node scripts/fetch-project-details.js")

3. **Agentic Project Chronicler** (LLM council synthesis)
// turbo
run_command("python3 scripts/agentic_chronicler.py --provider gemini --output project-details-ai.json")

4. **Generate Dynamic README** (Applies insights to template)
// turbo
run_command("node scripts/update-readme.js")

5. **Verify & Persist Changes**
// turbo
run_command("git add README.md data.json project-details-ai.json project-details.json scripts/summary_cache.json && git commit -m 'docs: agentic sifting & dynamic readme update' && git push")
