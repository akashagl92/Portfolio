# Promotion Posts — Agentic Portfolio Engine

## Platform: LinkedIn

> **Algorithm notes**: Hook in first 2 lines. Native video upload. 3-5 hashtags. End with a grounded question.

---

I’ve always found it ironic that we spend hundreds of hours shipping complex systems, yet our portfolios are usually the most outdated, manually-maintained **"legacy code"** in our careers.

The moment I deployed a new product or a breakthrough update, my portfolio report began to decay. Most portfolios are just accidental lies of omission because, frankly, *the friction of manual updates is too high.* 

I spent the last few sessions building an **Agentic Portfolio Engine** to solve my own maintenance bottleneck. It’s a 4-stage pipeline that treats my GitHub activity as a live dataset rather than a static archive.

Instead of trying to summarize my own impact, I delegated it to three specialized AI agents:
🔹 An **Engineer** for architectural accuracy
🔹 A **Recruiter** for career alignment
🔹 A **Chairman** to fact-check them against the actual code

It’s not a "miracle" tool—it’s just a pragmatic way to ensure the story I tell recruiters matches the code I actually ship. 

I wrote a deeper dive on the architecture and the **"Meta-Irony"** of automating the parts of the job we like the least in my latest Substack piece, *Reducing the Friction of the Career Narrative*.

📖 **Read the full breakdown here:** https://open.substack.com/pub/akashagl/p/reducing-the-friction-of-the-career?r=kf2uu&utm_source=linkedin&utm_medium=social&utm_campaign=portfolio_engine_launch&showWelcomeOnShare=true

🔗 **Live Portfolio:** https://akashagl92.github.io/Portfolio/
💻 **Source Code:** https://github.com/akashagl92/Portfolio/

*Huge shoutout to @Daniel Miessler for the foundational PAI system concept that made this possible!*

What’s the most annoying "manual hygiene" task in your workflow that you’d love to delegate to a council of agents? Let me know below! 👇

#AgenticAI #AIOps #ProductEngineering #TechFriction #BuildLog

---

## Platform: Substack

> **Algorithm notes**: Subject line drives "lesson learned" hook. Long-form technical depth. Embedded video.

---

**Subject Line:** Reducing the Friction of the Career Narrative

**Subtitle:** Why I built a multi-agent system to automate the part of the job I like the least.

---

Most professional portfolios feel like a snapshot from a previous life. 

You’re shipping architectures and learning new stacks daily, yet your "Public Face" is often frozen. This isn't just a maintenance problem; it’s a synthesis problem. As engineers and product leaders, we love the *build*, but we often ignore the *documentation* of that build because the friction is just too high.

I decided to stop fighting the bottleneck and started treating my career narrative as a data engineering problem. 

### The Endeavor: Agentic Portfolio Engine

I built a system that treats my GitHub activity as a live dataset for a multi-agent council. 

**[Embed video: showcase/agentic_portfolio_engine.mp4 (Thumbnail: showcase/agentic_thumbnail_premium.png)]**

Here is the "under the hood" of how this pipeline actually removes the manual labor:

#### 1. The Raw Intake
It starts with a simple `GITHUB_TOKEN`. Two scripts authenticate against the GitHub API and pull the "vibe" of the project—READMEs, commit messages, and file structures. It’s about capturing the context before it fades.

#### 2. The Agentic Council
Instead of me trying to sound clever about my own code (which always feels slightly icky), I delegated the synthesis to a council of specialized agents:
- **The Engineer**: Scans for architectural complexity and stack accuracy.
- **The Recruiter**: Translates technical commits into STAR-format achievements.
- **The Chairman**: The skeptic. It fact-checks the other two against the actual code to ensure the narrative stays honest.

#### 3. Living Documentation
The final README isn't a static file; it’s a generated artifact. It synthesizes the council’s insights into structured deep-dives, ensuring the most complex and relevant projects are highlighted first based on actual data, not a hunch.

#### 4. Recursive Memory
Governing it all is my **PAI v2.2** framework. Using **Recursive Gated Consolidation (RGC)**, the system maintains context across sessions. It learns from my stylistic baseline and carries that alignment forward.

### The Meta-Irony of Automation
There’s a certain irony in building a sophisticated multi-agent system just to talk about building other systems. But as a product builder, I’ve found that the *process* of automation is often more revealing than the result.

The **Agentic Portfolio Engine** ensures my portfolio is a living testament to my current baseline, not just a historical archive. It turns "I used to do this" into "I am currently doing this."

**Explore the Project:**
- **Live Demo:** [https://akashagl92.github.io/Portfolio/](https://akashagl92.github.io/Portfolio/)
- **GitHub Repo:** [https://github.com/akashagl92/Portfolio/](https://github.com/akashagl92/Portfolio/)

*Huge shoutout to Daniel Miessler for the foundational PAI system concept that inspired much of this architecture.*

*If you’re interested in how we’re reducing technical friction through agentic workflows, consider subscribing. I’m deep in the trenches of PAI v2.2 and will be sharing more on the "Six Cycles" of orchestration soon.*
