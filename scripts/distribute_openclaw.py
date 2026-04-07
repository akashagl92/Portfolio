
import os
import re
from pathlib import Path

# Base content for the Moltbot card
BASE_CARD = """
                <!-- Project: OpenClaw - AI AGENT -->
                <div class="project-card glass-card personal featured" data-repo="openclaw">
                    <div class="project-tags">
                        <span class="highlight-tag">{tag1}</span>
                        <span>{tag2}</span>
                        <span>{tag3}</span>
                    </div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                    <div class="project-highlights">
                        <ul>
                            <li><strong>{h1_bold}</strong>: {h1_text}</li>
                            <li><strong>{h2_bold}</strong>: {h2_text}</li>
                            <li><strong>{h3_bold}</strong>: {h3_text}</li>
                        </ul>
                    </div>
                    <div class="project-meta">
                        <span>{meta1}</span>
                        <span>{meta2}</span>
                    </div>
                </div>
"""

INFINITE_MEMORY_CARD = """
                <!-- Project: Infinite Memory Research - SSC/RGC ARCHITECTURE -->
                <div class="project-card glass-card personal featured" data-repo="openclaw">
                    <div class="project-tags">
                        <span class="highlight-tag">Research Paper</span>
                        <span>Hybrid RGC</span>
                        <span>Antigravity Native</span>
                    </div>
                    <h3>Infinite Memory: Scaling Agentic Memory to 10M Turns</h3>
                    <p>Discovery of the 'Discovery Cliff' in LLM memory scaling. Introduces Recursive Gated
                        Consolidation (RGC) to achieve 100% signal recall at extreme scale ($10^7$ turns),
                        maintaining O(1) memory scaling for production-grade AI agents.</p>
                    <div class="project-highlights">
                        <ul>
                            <li><strong>The Discovery Cliff</strong>: Identification of 17% recall collapse at scale.</li>
                            <li><strong>Recursive Gated Consolidation</strong>: Decoupling discovery from history depth.</li>
                            <li><strong>Hardware Grounding</strong>: TPU v4 OCS and SparseCore optimization analysis.</li>
                            <li><strong>Empirical Calibration</strong>: Cross-model validation (Gemini 2.5 - 3.1).</li>
                        </ul>
                    </div>
                    <div class="project-meta">
                        <span>APA Research Paper</span>
                        <span>O(1) Scaling Laws</span>
                    </div>
                </div>
"""

PAI_V2_CARD = """
                <!-- Project: Personal AI Infrastructure (PAI v2) -->
                <div class="project-card glass-card personal featured">
                    <div class="project-tags">
                        <span class="highlight-tag">Infrastructure</span>
                        <span>Shadow Profile</span>
                        <span>Cross-Project Learning</span>
                    </div>
                    <h3>Personal AI Infrastructure (PAI v2)</h3>
                    <p>A persistent, self-improving AI Operating System layer integrated across all local projects.
                        Implements standard orchestration cycles and long-term memory via the Kai System
                        for architecture-level persistence and session resilience.</p>
                    <div class="project-highlights">
                        <ul>
                            <li><strong>Orchestration</strong>: The Six Cycles of agentic workflow</li>
                            <li><strong>Shadow Profile</strong>: Secure execution via non-native rituals</li>
                            <li><strong>Kai System</strong>: Automated decision & learning persistence</li>
                            <li><strong>Session Resilience</strong>: 429/413 loop awareness & state preservation</li>
                        </ul>
                    </div>
                    <div class="project-meta">
                        <span>Antigravity Native</span>
                        <span>Architecture Layer</span>
                    </div>
                </div>
"""

UNIFIED_TITLE = "OpenClaw - Personal Productivity Agent"
CORE_DESC = "Personal family assistant for 10x productivity. Features a voice agent running models locally on Raspberry Pi for privacy and speed. Synthesizes infinite context across emails, calendars, news, and market updates into morning briefs."

TAILORING = {
    # Alivo Tailoring (Product Enthusiast / Future Founder)
    "alivo": {
        "tag1": "Product Brainstorming",
        "tag2": "Cron Jobs",
        "tag3": "Agentic Workflows",
        "description": "Personal family assistant with infinite memory for product ideation. Synthesizes product updates, news, and team comms into actionable briefs. Runs as an independent agent handling reminders, market research, and 'idea-to-ship' brainstorming sessions.",
        "h1_bold": "Brainstorming", "h1_text": "Infinite memory ideation",
        "h2_bold": "Synthesis", "h2_text": "Morning briefs across all channels",
        "h3_bold": "Automation", "h3_text": "Cron jobs & API reminders",
    },
    # Airbnb Tailoring (Research & Discovery)
    "airbnb": {
        "tag1": "Research Assistant",
        "description": "Personal family assistant for deep research. Synthesizes sparse information across news, emails, and market signals into transparent discovery workflows. Automates morning briefs and cron jobs for high-velocity decision making.",
        "h1_bold": "Research", "h1_text": "Deep synthesis of sparse info",
        "h2_bold": "Briefs", "h2_text": "Cross-channel morning updates",
        "h3_bold": "Agency", "h3_text": "Independent cron job execution",
    },
    # Consensys Tailoring (Market Research)
    "consensys": {
        "tag1": "Market Research",
        "description": "Personal family assistant for market intelligence. Synthesizes protocol updates, news, and market signals into clear daily briefs. Acts as an independent agent tracking diverse data sources across channels.",
        "h1_bold": "Synthesis", "h1_text": "Cross-channel market mesh",
        "h2_bold": "Briefs", "h2_text": "Automated market updates",
        "h3_bold": "Cron Jobs", "h3_text": "Protocol signal monitoring",
    },
     "kraken": {
        "tag1": "Market Intelligence",
        "description": "Personal family assistant for high-frequency market tracking. Synthesizes news, alerts, and market microstructure into real-time briefs. Acts as a central brain for productivity and automated research.",
         "h1_bold": "Intelligence", "h1_text": "Real-time news synthesis",
        "h2_bold": "Cron Jobs", "h2_text": "Automated market scans",
        "h3_bold": "Briefs", "h3_text": "Daily cross-channel digest",
    },
     "fedex": {
        "tag1": "Operational Briefs",
        "description": "Personal family assistant for logistics and operations. Synthesizes emails, calendars, and operational updates into streamlined morning briefs. Automates reminders and cron jobs for daily planning.",
        "h1_bold": "Operations", "h1_text": "Morning operational briefs",
        "h2_bold": "Reminders", "h2_text": "Cross-platform alerts",
        "h3_bold": "Automation", "h3_text": "Independent agent workflows",
    },
     "quince": {
        "tag1": "Product Enablement",
        "description": "Personal family assistant for product trends and inventory insights. Synthesizes market research and news into actionable product enablement briefs. Acts as an independent brainstorming partner.",
        "h1_bold": "Enablement", "h1_text": "New product idea exploration",
        "h2_bold": "Synthesis", "h2_text": "Market trend aggregation",
        "h3_bold": "Memory", "h3_text": "Infinite context ideation",
    },
    # Sprinklr Tailoring (AI Agent Adoption & Voice PM)
    "sprinklr": {
        "tag1": "Voice AI Agent",
        "tag2": "Local RPi Model",
        "tag3": "Product Adoption",
        "description": "Personal family assistant with local voice agent execution on Raspberry Pi. Accelerates system adoption through hands-on implementation and prompting. Synthesizes infinite context into morning briefs and serves as a technical benchmark for agentic solution design.",
        "h1_bold": "Voice Agent", "h1_text": "Local RPi LLM execution",
        "h2_bold": "Adoption", "h2_text": "Hands-on implementation & configuration",
        "h3_bold": "Synthesis", "h3_text": "Cross-channel context merging",
    }
}

GENERIC_DATA = {
    "tag1": "Personal Assistant",
    "tag2": "Cron Jobs",
    "tag3": "Agentic Workflows",
    "title": UNIFIED_TITLE,
    "description": CORE_DESC,
    "h1_bold": "Synthesis", "h1_text": "Morning briefs (Email/Cal/News)",
    "h2_bold": "Automation", "h2_text": "Independent cron jobs",
    "h3_bold": "Memory", "h3_text": "Infinite context assistant",
    "meta1": "WhatsApp Bot",
    "meta2": "Active Agent",
}

def get_page_content(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def save_page_content(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def generate_card(directory):
    data = GENERIC_DATA.copy()
    if directory in TAILORING:
        data.update(TAILORING[directory])
    data["title"] = UNIFIED_TITLE
    # Ensure meta1 override is consistent if not explicitly handled in TAILORING (it isn't, so GENERIC applies or we force it)
    data["meta1"] = "WhatsApp Bot" 
    return BASE_CARD.format(**data)

def inject_card(content, card_html):
    # Core Markers for cleanup
    # We want to remove any existing OpenClaw/Moltbot AND the legacy Infinite/PAI cards if they exist in a corrupt state
    core_projects = [
        r'<!-- Project: OpenClaw',
        r'<!-- Project: Moltbot',
        r'<!-- Project: Infinite Memory',
        r'<!-- Project: Personal AI Infrastructure'
    ]
    
    lookahead_markers = [
        r'<!-- Project: Multi-Agent Coordination',
        r'<!-- Project: Autonomous Stock',
        r'<!-- Project: AI Astrology',
        r'<!-- Project: Philosophy Sage',
        r'<!-- Project: Music',
        r'</div>\s*<div class="section-cta">',
    ]
    
    # 1. CLEANUP: Remove ANY existing core projects from the start of the grid
    # We match from the start of any core project until we hit a lookahead marker
    for project in core_projects:
        pattern = r'(' + project + r'.*?-->).*?(?=' + "|".join(lookahead_markers) + r'|' + "|".join(core_projects) + r')'
        content = re.sub(pattern, '', content, flags=re.DOTALL)

    # 2. INJECTION: Add all 3 core cards back at the top
    full_injection = card_html + "\n" + INFINITE_MEMORY_CARD + "\n" + PAI_V2_CARD
    pattern_grid = r'(<div class="innovation-grid">)'
    if re.search(pattern_grid, content):
        # Double check we don't have duplicates if the regex above missed something
        return re.sub(pattern_grid, r'\1\n' + full_injection, content, count=1)
    return content

def main():
    root_dir = "."
    print(f"Scanning {os.getcwd()}...")
    
    for root, dirs, files in os.walk(root_dir):
        if "node_modules" in root: continue
        if "index.html" in files:
            file_path = os.path.join(root, "index.html")
            directory = os.path.basename(root)
            if directory == ".": directory = "root"
                
            print(f"Processing {directory} ({file_path})...")
            content = get_page_content(file_path)
            card_html = generate_card(directory)
            new_content = inject_card(content, card_html)
            
            if new_content != content:
                save_page_content(file_path, new_content)
                print(f"  - Updated: {directory}")
            else:
                print(f"  - No change needed.")

if __name__ == "__main__":
    main()
