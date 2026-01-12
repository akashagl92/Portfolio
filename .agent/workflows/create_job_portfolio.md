---
description: Create a new tailored portfolio page for a specific job opportunity
---

# Workflow: Create Tailored Portfolio Page
This workflow creates a new sub-directory (e.g., `/scopely/`, `/fetch/`) for a specific job application, documents the Job Description (JD) context, and tailors the content accordingly.

## 1. Context Gathering
**User Input Required:**
- **Company Name**: (e.g., "Google")
- **Role Title**: (e.g., "Staff Engineer")
- **Job Description / Prompt**: The raw text or prompts provided by the user about the role.

## 2. Document Context
- Create/Verify directory `.pai/job_contexts/`.
- Create a file `.pai/job_contexts/<company_lowercase>.md`.
- **Content Format**:
  ```markdown
  # <Company> - <Role>
  **Date**: <YYYY-MM-DD>
  
  ## Job Description / User Prompt
  <Paste raw input here>
  
  ## Key Themes to Emphasize
  - [ ] <Theme 1>
  - [ ] <Theme 2>
  ```

## 3. Create Page Structure
- Create directory `<company_lowercase>/` in the repository root.
- Copy `index.html` (from root) to `<company_lowercase>/index.html`.
- Copy `app.js` (from root) to `<company_lowercase>/app.js`.
- **Note**: `style.css` should be referenced from root (`../style.css`).

## 4. Tailor Content (Agentic)
- **Edit `app.js`**: Add the `loadAgenticSummaries` logic (similar to `fetch/app.js`) to pull from `../project-details.json`.
- **Edit `index.html`**: 
  - Update `<title>` and `<meta>` tags.
  - Update "Hero" section (Subtitle/Badge) based on `.pai/job_contexts/<company>.md`.
  - Add `data-repo` attributes to project cards to enable AI summaries.

## 5. Verify
- Run `python3 -m http.server 8080` (if not running).
- Visit `http://localhost:8080/<company_lowercase>/`.
- Confirm:
  - Title/Badge matches the role?
  - Agentic Summaries are loading?
