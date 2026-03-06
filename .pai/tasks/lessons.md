# Session Lessons

*Capture corrections, patterns, and gotchas here during work.*

## 2026-02-23: Native Verification Stalled
- **Problem:** Native feedback loop (Step 4) consistently resulted in `Step was canceled by user` or stalls during `replace_file_content` on native artifacts.
- **Decision:** Triggered circuit breaker. Switching to `SHADOW` mode (working exclusively within `.pai/` and project files, avoiding further `~/.gemini/antigravity/brain/` mutations for now).
- **Pattern:** Isolated writes pass, but "chained" or "feedback-driven" native writes appear unstable in the current environment configuration.

## 2026-02-25: Batch Rollout Across 19 Pages
- **Problem:** Updating the same research card content across 19 HTML files is error-prone and repetitive.
- **Pattern:** Using flexible line ranges (±5 lines of the estimated position) works reliably but generates noise.
- **Recommendation:** Consider a templating system (e.g., Handlebars partials or a build step) to DRY out the shared card HTML across all 19 pages.

## 2026-02-25: Pure CSS Mobile Viewport Scaling
- **Problem:** Mobile horizontal scroll blowouts and asymmetric padding issues were prevalent across all customized sub-pages (Fetch, Ambience, etc.).
- **Pattern:** Reliance on `100vw` ignores scrollbar width reservations. Absolute positioning for decorative background glows can expand the browser's layout container if not explicitly clipped.
- **Decision:** Deployed hardened CSS rules: `body {max-width: 100%}`, `.projects-grid { minmax(min(350px, 100%), 1fr) }`, and `clip-path` overlay containment.

## 2026-03-01: SHADOW Profile Compliance
- **Problem:** Task tracking and walkthroughs were being written to `~/.gemini/antigravity/brain/` (native artifacts) instead of `.pai/` (orchestration artifacts).
- **Pattern:** SHADOW profile = orchestration artifacts only. All task tracking, plans, and lessons must live in `.pai/tasks/`, `.pai/plans/`, and `.pai/learnings/`.
- **Decision:** Migrated tracking to `.pai/tasks/todo.md`. No native artifact mutations for task management.

## 2026-03-01: Showcase Card/Persona Overlap
- **Problem:** Glass card description text and council persona avatars overlap vertically when all 3 personas appear, and `max-height` + `overflow: hidden` truncates description text.
- **Pattern:** Fixed layouts with absolute positioning require explicit spatial budgets. A `max-height` hack clips content unpredictably when text length varies per stage.
- **Decision:** Removed `max-height` constraint, shortened stage descriptions instead, reduced card padding, and pushed council section lower (`bottom: 25px`).

## 2026-03-01: The Trap of Literal Historical Repetition
- **Problem:** When asked to "sound like the user," initial attempts overused historical catchphrases (e.g., "professional mémoire"), making the copy sound like it was "trying too hard" or forced.
- **Pattern:** Persona research should identify the *spirit* and *traits* (intellectual wit, friction-focus) rather than just literal strings.
- **Decision:** Shifted to an "Organic Persona Synthesis" model. Defined the "Pragmatic Intellectual" persona in a persistent artifact (`.pai/personas/user_voice.md`) using traits and writing signatures instead of fixed phrases.

## 2026-03-05: Stale Global Stats and Propagation Failures
- **Problem:** Portfolio pages (including the root hompage) were displaying stale engineering velocity stats (e.g., 430 commits instead of 457) because the automated GitHub Action (`update-stats.yml`) was using a hardcoded list of directories to copy `data.json` into. New tailored pages like `aifoundry` were completely missed, and local caching exacerbated the issue.
- **Pattern:** Hardcoded file paths in CI/CD pipelines break silently when new project directories are logically added.
- **Decision:** Replaced the hardcoded `cp` commands with a dynamic `find` command that automatically discovers all valid sub-portfolios. Additionally, implemented cache-busting (e.g., `?v=17`) in `app.js` to ensure browsers fetch the latest `.json` payloads instead of relying on stale session caches.
