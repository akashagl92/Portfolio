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
