# Portfolio Update: Research Findings & Job Context Tailoring

## Research Findings (v4.1 Alpha)
- **Repo**: `stock_price_target_modelling`
- **Result**: 80.8% XIRR vs 20.5% S&P 500 (SPX).
- **Alpha**: ~60.3% over SPX (Money-Weighted).
- **Strategy**: 'v4.1 Steady Winner' (Calibrated Aug 1, 2021).
- **New Project**: `ide-agnostic-agent-orchestrator` (Portable PAI Core) - Production AI infrastructure for context-aware agents.

## Objectives
1. Update `agentic_chronicler.py` with the new V4.1 trading alpha figures (80.8% XIRR).
2. Tailor portfolio pages (`airbnb`, `stellantis`, `alivo`, etc.) by running the chronicler with their respective `job_description.md` contexts.
3. Ensure the dynamic summary cards in the HTML pages reflect these updates.

## Proposed Changes

### Scripts
#### [MODIFY] [agentic_chronicler.py](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/scripts/agentic_chronicler.py)
- Updated Groq model list to include `qwen/qwen3-32b` (500k TPD) and `openai/gpt-oss-120b` (200k TPD).
- Run with `--provider groq` using **Qwen 32B** for all tailored generations to bypass 70B rate limits.

### Portfolio Pages
#### [MODIFY] [project-details.json](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/project-details.json)
- Run `agentic_chronicler.py` with the `--force` flag once per tailored folder to produce a "static" tailored JSON.
- This produces the final descriptions that `app.js` will serve for that specific JD context.
- Include `portable-pai-core` in the summaries if relevant to the JD (especially for infrastructure/AI roles).

### Automation
- Run `scripts/agentic_chronicler.py` for each tailored folder SEQUENTIALLY to avoid rate limits.
- Process order: `airbnb`, `alivo`, `abnormal`, `consensys`, `fedex`, `happymoney`, `kraken`, `reku`, `root`, `stellantis`, `torq`.

## Verification Plan
- Check `project-details.json` for updated XIRR metrics in `stock_price_target_modelling`.
- Manually open `airbnb/index.html` and verify the "Autonomous Trading System" card shows 80.8% XIRR.
- Verify that other tailored pages (e.g., Alivo, Stellantis) have context-aware summaries.
