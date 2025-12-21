# Akash Agrawal - 2025 Engineering Portfolio

## Executive Summary

This portfolio represents a **Data & AI Product Leader** who combines strategic product thinking with deep technical execution. With **231 commits across 10 repositories** in 2025, the work demonstrates a unique ability to architect and build production-grade systems that bridge **data science research**, **marketing technology**, and **agentic AI**—all while maintaining rigorous engineering practices.

## 🌐 Live Sites

- **General**: [https://akashagl92.github.io/Portfolio/](https://akashagl92.github.io/Portfolio/)
- **Fetch-tailored**: [https://akashagl92.github.io/Portfolio/fetch/](https://akashagl92.github.io/Portfolio/fetch/)

---

## Key Themes & Differentiators

### 1. Research-Backed Product Development
The hallmark of this portfolio is the integration of **scientific rigor** into product ideation and validation. Rather than building features speculatively, each project demonstrates data-driven hypothesis testing before and during development.

### 2. Agentic IDE Efficiency
A core insight from this portfolio: **agentic IDEs dramatically accelerate MVP velocity while reducing costs**. The AI Astrology project exemplifies this—running **3+ million chart calculations** and conducting large-scale statistical research that would traditionally require a dedicated data science team was accomplished efficiently through AI-assisted development.

### 3. Marketing Technology Integration
Each project embeds measurement and analytics capabilities from day one, treating instrumentation as a first-class feature rather than an afterthought.

---

## Project Deep-Dives

### 🔮 AI Astrology Platform (`aistro.ai`)
**152 commits | Python | [Live Demo](https://aistro-frontend-stage.onrender.com)**

**Research Scale:**
- **5,885 public figures** from AstroDataBank analyzed
- **239 countries** studied for geopolitical astrological patterns
- **3+ million chart calculations** processed using Swiss Ephemeris astronomical API
- **FDR-corrected significance** (q < 0.001) for statistical rigor

**Technical Architecture:**
| Component | Technology |
|-----------|------------|
| Astronomical Engine | Swiss Ephemeris (industry-standard) |
| AI Interpretations | Google Gemini API |
| Knowledge Base | 18 astrology books indexed via RAG |
| Vector Search | Semantic + Lexical hybrid retrieval |
| Frontend | Next.js |
| Backend | FastAPI + PostgreSQL |

**Key Features:**
- Multi-system support: Western (Tropical), Vedic (Sidereal), Horary
- Divisional charts (D1-D60), Dasha periods, Yoga detection
- Mundane astrology for country governance analysis
- Q&A system with natural language queries

---

### 📈 Autonomous Trading System (`stock_price_target_modelling`)
**23 commits | Python | Walk-Forward Validated**

**Performance:** 72.1% XIRR — a **3.5x improvement over S&P 500 benchmark** (20.5%) using the same cash flows for apples-to-apples comparison.

**Technical Innovation:**
- **Dual-Track Portfolio**: 10 Stocks + 20 Crypto positions
- **Market Timing Factors**:
  - BTC Momentum (20-day returns): Chi-square p=0.0001
  - VIX Volatility Factor (>25 threshold)
- **Tiered Allocation**: Forever Holdings (4x), Quality Growth (1.5x), Speculative (0.5x)
- **Walk-Forward Validation**: Training 2021-2023, OOS 2024-2025

**Automation:**
- Monthly rebalancing with email-based approval workflow
- Trend breakdown protection logic
- Fundamental safeguards (3-month Fund Score smoothing)

---

### 🎹 Sonic Geometry Visualizer (`Music-and-Math`)
**JavaScript | Zero Dependencies**

MIDI emulator for learning music theory through mathematical visualization of sound.

**Features:**
1. **Interactive Visualizations**: Oscilloscope, Spectrum Analyzer (FFT), Lissajous Figures, Interference Patterns
2. **Music Theory Lab**: Circle of Fifths, Harmony Explorer (interval ratios: 3:2, 4:3, 5:4)
3. **Virtual Instruments**: Polyphonic keyboard, Continuous drone, Dual-voice harmony mode

**Tech Stack:** Pure vanilla JavaScript with Web Audio API and HTML5 Canvas.

---

### 🤖 Databricks Genie Integration
**8 commits | Python + Flask**

- **Multi-Workspace Support**: Connect to multiple Databricks environments
- **Natural Language → SQL**: Business questions in plain English via Genie API
- **Bulk Data Processing**: Excel/CSV enrichment at scale
- **Multi-Criteria Matching**: Email, Org hierarchy, DHC mapping

---

### 💬 VOC & Buyer Journey Chatbot
**3 commits | LangChain + LangGraph**

**Architecture:** Dual-brain system with SQL Brain (Databricks Genie) + Docs Brain (RAG)

**Tech Stack:**
- LangChain 0.2+ with LangGraph orchestration
- Databricks Vector Search + databricks-bge-large-en embeddings
- LangSmith observability
- Streamlit UI on Databricks

---

### 📊 Marketing Analytics Assistant
**4 commits | FastAPI + Python**

- Natural language processing for marketing experiment queries
- Statistical testing: Z-tests, chi-square, binomial, power analysis
- Automated winner determination with confidence intervals
- GPT + Gemini for insight generation

---

### 🔗 LinkedIn Campaign Measurement (`LinkedIn-API`)
**3 commits | Python**

Automated daily campaign stats export via LinkedIn Marketing API with company name resolution and Excel reporting for cross-platform ad measurement.

---

### 📚 Philosophy Sage (GraphRAG)
**7 commits | Neo4j + LangChain**

AI-powered exploration of ancient philosophy texts (Mahabharata, Bhagavad Gita) using:
- Neo4j knowledge graph for entity relationships across 18 Parvas
- Vector search hybrid retrieval
- Sanskrit TTS integration

---

## Technical Philosophy

### CI/CD with Security-First Mindset
- **Unit testing** throughout the codebase
- **Walk-forward validation** for financial models
- **Statistical significance testing** before feature deployment
- **LangSmith observability** for agentic systems

### Cost Efficiency Through Agentic Development
1. **Research acceleration**: 3M+ calculations that would require dedicated data science teams
2. **Rapid prototyping**: Production-ready MVPs with comprehensive documentation
3. **Self-documenting code**: Comprehensive READMEs and architecture docs

---

## Summary Statistics

| Metric | 2025 Value |
|--------|------------|
| Total Commits | 231 |
| Unique Repositories | 10 |
| Primary Language | Python (83.5%) |
| Secondary Languages | JavaScript (12.6%), TypeScript (3.9%) |
| Peak Activity | Aug-Sep (122 commits) |

---

## 🛠 Tech Stack

- Vanilla JavaScript (no frameworks)
- CSS3 with custom properties
- GitHub Actions for automated daily data updates

## 📁 Structure

```
├── index.html          → General portfolio
├── style.css
├── app.js
├── data.json           → GitHub activity data
├── fetch/              → Fetch-tailored portfolio
└── scripts/
    └── fetch-github.js → Data fetcher (GitHub Actions)
```

## 🚀 Development

```bash
# Start local server (root)
python3 -m http.server 8080

# Start local server (fetch)
cd fetch && python3 -m http.server 5500

# Update GitHub stats (requires GITHUB_TOKEN)
node scripts/fetch-github.js
```

## 📝 License

MIT
