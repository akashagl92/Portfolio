# Active Refactor Plan: Portfolio Templating System

**Target:** Eliminate the architectural debt of modifying 19 independent `index.html` files every time a new dynamic research card (like "Infinite Memory" or "Personal AI Infrastructure") is added.

## Problem Statement
(From `.pai/tasks/lessons.md - 2026-02-25`)
Updating the same research card content across 19 HTML files is error-prone and repetitive. Flexible line ranges work but generate noisy diffs and occasional clipping overlapping.

## Refactor Scope
1. **Consolidation**: Extract the standard `/abnormal/`, `/fetch/`, `/circle/` specific custom parts (like the Hero title and subtext) into JSON or YAML frontmatter configurations.
2. **Template Core**: Create a single `template.html` that contains the `projects-grid`, GitHub stats dashboard (`data.json` loading), and navigation.
3. **Build Pipeline**: Create a Node.js script (e.g., `scripts/build_pages.js`) using plain string replacement or Handlebars (`npm install handlebars`) to generate all 19 sub-pages dynamically.
4. **CI/CD**: Integrate this build step into the GitHub Actions pipeline so that changing a single shared "Card Component" cascades safely to all generated HTML pages.

## Execution Lane
Because this touches the foundational deployment format of 19 endpoints, this was selected during the `SHADOW` mode `refactor` hygiene scan. Actual execution will be deferred to a dedicated feature branch under `NATIVE` mode.
