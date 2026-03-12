# Walkthrough - Hershey Tailored Portfolio

I have created a new, tailored portfolio page for the **Senior Manager, Data Products** role at Hershey. This page emphasizes enterprise data architecture, governance-by-design, and agentic data foundations.

## Changes Made

### 1. Job Context & Planning (SHADOW Mode)
- Documented role requirements in [.pai/job_contexts/hershey.md](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/.pai/job_contexts/hershey.md).
- Enforced SHADOW runtime policy by migrating all tasks to [.pai/tasks/todo.md](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/.pai/tasks/todo.md) and plans to [.pai/plans/hershey_plan.md](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/.pai/plans/hershey_plan.md).
- Verified environment status via `pai_runtime_guard.sh` (PROFILE=SHADOW, LOCKED=1).

### 2. Hershey Tailored Page
- Created `/hershey/` directory with localized `index.html` and `app.js`.
- **Branding**: Updated Hero section with Hershey-specific messaging: *"Engineering Hershey's Data Assets at Scale."*
- **Role Identity**: Set badge and page title to *"Senior Manager, Data Products"*.
- **Data Integration**: Configured `app.js` to fetch global statistics and "Agentic Summaries" from the parent directory, ensuring the Hershey page stays in sync with the root repository updates.

## Verification Results

### Browser Verification
I verified the following elements at `http://localhost:8080/hershey/`:
- [x] **Title**: "Akash Agrawal | Senior Manager - Data Products (Hershey)"
- [x] **Badge**: "Senior Manager, Data Products"
- [x] **Charts**: Contribution calendar and tech distribution pie chart rendering correctly.
- [x] **AI Summaries**: Project cards correctly display enriched descriptions and tags.

![Hershey Page Verification](file:///Users/akashagrawal/.gemini/antigravity/brain/bd5a4027-8cc3-44d1-82e9-01ec2f4eec3f/hershey_verification_1773331927692.webp)
*Note: The browser recording above shows the full verification flow.*

## Next Steps
- [ ] User to review the page at `/hershey/index.html`.
- [ ] Finalize deployment via GitHub Actions (auto-sync).
