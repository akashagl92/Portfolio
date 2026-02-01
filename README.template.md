# Akash Agrawal - 2026 Engineering Portfolio

## Executive Summary

{{EXECUTIVE_SUMMARY}}

## 🌐 Live Sites

{{LIVE_SITES}}

---

## Key Themes & Differentiators

### 1. Research-Backed Product Development
The hallmark of this portfolio is the integration of **scientific rigor** into product ideation and validation. Each project demonstrates data-driven hypothesis testing before and during development.

### 2. Agentic IDE Efficiency
A core insight from this portfolio: **agentic IDEs dramatically accelerate MVP velocity while reducing costs**. This is exemplified across all projects where AI-assisted development has scaled capabilities beyond traditional manual limits.

### 3. Marketing Technology Integration
Each project embeds measurement and analytics capabilities from day one, treating instrumentation as a first-class feature.

---

## Project Deep-Dives

{{PROJECT_DEEP_DIVES}}

---

## Technical Philosophy

### CI/CD with Security-First Mindset
- **Unit testing** throughout the codebase
- **Walk-forward validation** for financial models
- **LangSmith observability** for agentic systems

### Cost Efficiency Through Agentic Development
1. **Research acceleration**: Scaling calculations and dataDS tasks via AI agents.
2. **Rapid prototyping**: Production-ready MVPs with comprehensive documentation.

---

## Summary Statistics

{{STATS_TABLE}}

---

## 🛠 Tech Stack

- Vanilla JavaScript & TypeScript
- Python (FastAPI, SciPy, LangChain)
- Neo4j Knowledge Graphs
- GitHub Actions for automated daily data updates

## 📁 Structure

```
├── index.html          → General portfolio
├── alivo/              → Alivo-tailored (Product Enthusiast)
├── consensys/          → Consensys-tailored (Market Research)
├── airbnb/             → Airbnb-tailored (Research & Discovery)
├── data.json           → GitHub activity data (Synced DAILY)
└── scripts/            → Automation & Dynamic generation
```

## 🏗 Architecture & Data Flow

```mermaid
graph TD
    REPOS["GitHub Repos"] -->|"fetch-project-details.js"| DETAILS["project-details.json"]
    DETAILS -->|"agentic_chronicler.py"| CACHE["summary_cache.json"]
    CACHE -->|"update-readme.js"| README["README.md"]
    TEMPLATE["README.template.md"] --> README
```

## 🚀 Development

```bash
# Update GitHub stats & README (requires GITHUB_TOKEN)
node scripts/fetch-github.js
node scripts/update-readme.js
```

## 📝 License

MIT
