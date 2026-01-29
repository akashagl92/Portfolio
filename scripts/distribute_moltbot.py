
import os
import re
from pathlib import Path

# Base content for the Moltbot card
BASE_CARD = """
                <!-- Project: Moltbot - AI AGENT -->
                <div class="project-card glass-card personal featured" data-repo="moltbot">
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

UNIFIED_TITLE = "Moltbot - Personal Productivity Agent"
CORE_DESC = "Personal family assistant for 10x productivity. Synthesizes infinite context across emails, calendars, news, and market updates into morning briefs. Acts as an independent agent for product brainstorming, cron jobs, and reminders across all accounts."

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
    # Robust cleanup: Same as before
    next_markers = [
        r'<!-- Project: Autonomous Stock',
        r'<!-- Project: AI Astrology',
        r'<!-- Project: Philosophy Sage',
        r'<!-- Project: Music',
        r'</div>\s*<div class="section-cta">',
        r'<!-- Project: Moltbot' # Safety: if duplicates exist
    ]
    lookahead = "|".join(next_markers)
    
    # Remove existing Moltbot card
    # Relaxed regex to match "<!-- Project: Moltbot - AI AGENT (Tailored...) -->"
    pattern_remove = r'(<!-- Project: Moltbot - AI AGENT.*?-->).*?(?=' + lookahead + r')'
    content = re.sub(pattern_remove, '', content, flags=re.DOTALL)
    
    # Inject new
    pattern_inject = r'(<div class="innovation-grid">)'
    if re.search(pattern_inject, content):
        return re.sub(pattern_inject, r'\1\n' + card_html, content, count=1)
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
