# Plan: Zero-Scroll & Grid Stability Restoration

Restore the visual integrity of the portfolio by eliminating horizontal overflow and fixing the collapsed grid layout.

## Goals
1.  **Zero Horizontal Scroll**: Ensure `html`, `body`, and all section containers occupy exactly `100%` width with no overflow.
2.  **Gargle-Free Grid**: Fix the overlapping month labels and collapsed contribution squares on small screens.
3.  **Balanced Metrics**: Restore horizontal metrics layout on mobile while maintaining legible spacing.
4.  **Desktop Alignment**: Confirm the `1.2fr 1fr` ratio is active and looks premium.

## Proposed Changes

### [Portfolio Architecture]

#### [MODIFY] [style.css](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/style.css)
- **Global Containment**:
  - Enforce `overflow-x: hidden` on `html` and `body`.
  - Ensure `* { box-sizing: border-box; }` is strictly applied.
- **Hero & Viz Card**:
  - Set `.main-viz` to `max-width: 100%` and `.glass-card` to `overflow: hidden` to clip glow effects that trigger scrollbars.
  - Standardize `padding: 0 5%` for all sections below 1024px.
- **Metrics (viz-stats)**:
  - use `display: flex; flex-direction: row; justify-content: space-between;` for mobile.
  - Reduce `font-size` and `gap` to fit the 320px-412px range.
- **Calendar Grid**:
  - **Month Labels**: Switch from `position: absolute` to a `display: flex; justify-content: space-between;` layout with `width: 100%` to prevent overlap.
  - **Grid Scaling**: Increase the minimum `clamp` for `--week-width` to `8px` to maintain legibility.
  - **Container**: Ensure `.calendar-grid-wrapper` is `width: 100%` with `overflow: hidden`.

#### [MODIFY] [app.js](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/app.js)
- Ensure horizontal month rendering logic aligns with the new flex-based CSS.

## Verification
- **Pixel-Perfect Audit**: 1440px, 768px, 412px, 320px.
- **Scroll Test**: Manually verify `window.scrollX` is 0.
