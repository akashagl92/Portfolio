# Portfolio Architecture & Contribution Guide

## Modular Framework Overview
This repository uses a **Modular Slug Architecture** to support multiple, employer-specific portfolio versions sharing a single automated data source.

### 📂 Directory Structure
- **/data.json** (Root): The Single Source of Truth for GitHub statistics. Updated daily by automation.
- **/fetch/**: The primary "template" slug. Contains the frontend code (`index.html`, `style.css`, `app.js`).
- **/scripts/**: Node.js automation scripts.
- **/.github/workflows/**: CI/CD configurations.

## 🚀 How to Create a New Employer Slug
To create a custom portfolio version for a new job application (e.g., "Google"):

1.  **Copy the Template**:
    Duplicate the `/fetch` folder and rename it to the employer name (e.g., `/google`).
    ```bash
    cp -r fetch google
    ```

2.  **Customize Content**:
    Edit `google/index.html`:
    -   Update `<title>` and Meta Tags.
    -   Update the **Hero Section** title (e.g., "Principal Product Manager - Search").
    -   Customize **Project Cards**:
        -   Change Project "Pills" (Keywords) to match the Job Description.
        -   Reorder projects to highlight relevant skills.

3.  **Data Integration**:
    No action needed! The copied `app.js` is already configured to load stats from `../data.json` (the shared root file).

## 🤖 Data Automation
- **Source**: `scripts/fetch-github.js` fetches data from GitHub API using `GITHUB_TOKEN`.
- **Target**: Writes to the root `data.json`.
- **Schedule**: Runs daily at midnight CST (06:00 UTC) via `.github/workflows/update-stats.yml`.
- **Manual Update**: Run `node scripts/fetch-github.js` locally (requires `.env` with token).

## 🛠 Local Development
1.  Install dependencies: `npm install`
2.  Run automation (optional): `node scripts/fetch-github.js`
3.  Serve site: `npx http-server .`
4.  Visit `http://localhost:8080/fetch/`
