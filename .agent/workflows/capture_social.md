---
description: Capture HTML animations as social media videos/GIFs (LinkedIn, Instagram, X, Substack)
---

# /capture_social — Social Media Capture Workflow

End-to-end: create an HTML animation, capture it as a platform-optimized video, and generate post copy.

## Steps

1. **Understand the subject and target platform(s).**
   Ask the user:
   - What concept/architecture/feature to visualize?
   - Which platform(s)? (linkedin, instagram, instagram_story, x, substack, gif)
   - Desired duration? (default: 20s)
   - Any branding or color preferences?

2. **Create the HTML animation file.**
   Design a self-contained HTML file with:
   - Rich CSS animations/transitions (glassmorphism, gradients, micro-animations)
   - JavaScript-driven stage sequencing (timed reveals via `setTimeout`)
   - A progress/timeline bar for visual pacing
   - Platform-appropriate aspect ratio (16:9 for LinkedIn/X/Substack, 1:1 for Instagram)
   - Google Fonts for premium typography (e.g., Outfit, Inter)
   - No external dependencies beyond fonts — everything inline
   
   Save to `<project>/showcase/` or a location the user specifies.

3. **User reviews the HTML animation in the browser.**
   Open the HTML file locally and iterate on feedback (colors, text, layout, timing).

4. **Ensure capture prerequisites are met.**
   // turbo
   ```bash
   which ffmpeg && node -e "require('puppeteer')" && echo "✅ Ready"
   ```
   If puppeteer is not found, run `npm install puppeteer` in the target project.

5. **Run the capture script with the appropriate platform preset.**
   ```bash
   node ~/.gemini/antigravity/skills/social-media-capture/scripts/capture.js \
     --html "<ABSOLUTE_PATH_TO_HTML>" \
     --platform <PLATFORM> \
     --output "<OUTPUT_PATH>" \
     --duration <SECONDS>
   ```
   Replace placeholders with values from Step 1.

   Platform options: `linkedin`, `instagram`, `instagram_story`, `x`, `substack`, `gif`

6. **Verify the output.**
   // turbo
   ```bash
   ls -lh <OUTPUT_PATH>
   ```
   Confirm the file size is within the platform's limit.

7. **Generate platform-optimized post copy using the specific User Persona.**
   // turbo
   Read the persona guidelines from [.pai/personas/user_voice.md](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/.pai/personas/user_voice.md).
   
   Write text that sounds like a pragmatic intellectual who is "in the trenches." Avoid literal repetition of historical catchphrases unless they fit naturally. Follow the **Dos and Don'ts** in the persona file to ensure the copy is organic and human.

   ### Outreach Criteria & Algorithmic Tips
   - **LinkedIn**: Hook in first 2 lines (State the problem/friction). Native video upload. End with a grounded question about workflow.
   - **Substack**: Use subject lines that promise a "lesson learned" or a technical "deep dive." First paragraph must hook via a personal realization.
   - **X/Twitter**: Punchy, ironic observations. Thread-ready structure focused on "the process."

8. **Research Trending Hashtags.**
   // turbo
   Analyze current trending topics in the Agentic/AI space to suggest 3-5 high-impact hashtags. 
   Example stack: `#AgenticAI #AIOps #ProductEngineering #TechFriction #BuildLog`

9. **Report to the user.**
   Share the output file path, size, duration, generated post copy, and recommended hashtag stack.
