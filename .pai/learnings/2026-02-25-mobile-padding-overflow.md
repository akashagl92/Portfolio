# Root Cause Analysis: Mobile Horizontal Scroll & Asymmetric Padding

**Date:** 2026-02-25
**Topic:** CSS Viewport Units vs Content Width on Mobile Layouts

## Issue Context
The portfolio's mobile layout (specifically around 412px Pixel 7 width) suffered from asymmetric padding (content shifted left) and an unwanted horizontal scrollbar, particularly visible on the `.hero-calendar` and `.projects-grid`.

## Root Cause
1. **Viewport vs Percent Width (`100vw` vs `100%`):** The `body` element and the calendar `--week-width` variable used `100vw`. On mobile and many desktop browsers, `100vw` includes the width of the system scrollbar if it takes up space, whereas `100%` calculates based on the available container width. This offset caused the content to permanently sit 15-20px wider than the visible screen, triggering overflow.
2. **Hardcoded padding with width offsets:** `#hero` had `padding: 0 8%` inherited from desktop but its container width wasn't constraining it cleanly when grid layouts changed in media queries. Overrides at 768px/600px created asymmetric gaps compared to `section` base rules.
3. **Unconstrained absolute positioning:** The `.main-viz::before` pseudo element used for the animated glow had `width: 200%; height: 200%; left: -50%`. Even with `pointer-events: none`, this expanded the browser's perceived scrollable area if not explicitly clipped by its parent (`.main-viz`).
4. **Grid Minmax rigidity:** The `.projects-grid` used `grid-template-columns: repeat(auto-fill, minmax(350px, 1fr))`. On a 320px or 412px screen, `350px` plus gaps instantly causes a horizontal blowout.

## Solution & Hardened Rule
1. **Never use `100vw` for max-width on structural containers.** Always use `width: 100%; max-width: 100%;` on `body` and general layout elements. 
2. **Contain pseudo-element backgrounds via `clip-path`** (`clip-path: inset(0 round Xrem)`) instead of relying purely on `.parent { overflow: hidden }` when the parent needs `overflow: visible` to prevent clipping inner content (like a wider calendar grid).
3. **Fluid Grid Minmax:** Use `minmax(min(350px, 100%), 1fr)` for responsive css grids. This ensures the column shrinks below the minimum pixel threshold if the viewport itself is smaller than `350px`.
4. **Wrapper Divs for Sub-Layouts:** Use a `.hero-wrapper` to own inner grid logic instead of overloading the structural `<section>` tag. This allows the `<section>` to maintain consistent global padding (`4rem 5%`).
