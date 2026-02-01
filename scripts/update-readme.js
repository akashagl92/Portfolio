/**
 * Agentic Project Chronicler: README Generator
 * 
 * Architecture & Data Flow:
 * flowchart TD
 *     A[GitHub Repos] -- "fetch-project-details.js" --> B[project-details.json]
 *     B -- "agentic_chronicler.py" --> C[summary_cache.json]
 *     C -- "update-readme.js" --> D[README.md]
 *     E[README.template.md] --> D
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data.json');
const PROJECT_DETAILS_PATH = path.join(__dirname, '..', 'project-details-ai.json');
const CACHE_PATH = path.join(__dirname, 'summary_cache.json');
const TEMPLATE_PATH = path.join(__dirname, '..', 'README.template.md');
const OUTPUT_PATH = path.join(__dirname, '..', 'README.md');

function generateExecutiveSummary(data) {
    const commits = data.totalCommits || 0;
    const repos = data.uniqueReposTotal || 0;
    return `This portfolio represents a **Data & AI Product Leader** who combines strategic product thinking with deep technical execution. With **${commits} commits across ${repos} repositories** in 2025-2026, the work demonstrates a unique ability to architect and build production-grade systems that bridge **data science research**, **marketing technology**, and **agentic AI**—all while maintaining rigorous engineering practices.`;
}

function generateLiveSites() {
    const rootDir = path.join(__dirname, '..');
    const sites = [];

    // Add General
    sites.push(`- **General**: [Live Site](https://akashagl92.github.io/Portfolio/)`);

    // Scan for subdirectories with index.html
    const dirs = fs.readdirSync(rootDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.') && dirent.name !== 'node_modules' && dirent.name !== 'scripts' && dirent.name !== 'fetch');

    dirs.forEach(dir => {
        if (fs.existsSync(path.join(rootDir, dir.name, 'index.html'))) {
            const capitalized = dir.name.charAt(0).toUpperCase() + dir.name.slice(1);
            sites.push(`- **${capitalized}-tailored**: [Explore](https://akashagl92.github.io/Portfolio/${dir.name}/)`);
        }
    });

    return sites.join('\n');
}

function generateProjectDeepDives() {
    if (!fs.existsSync(PROJECT_DETAILS_PATH)) {
        console.warn('project-details-ai.json not found, skipping deep dives.');
        return '_AI-generated project deep-dives incoming..._';
    }

    const projects = JSON.parse(fs.readFileSync(PROJECT_DETAILS_PATH, 'utf8'));

    // Load cache for fallback
    let cache = {};
    if (fs.existsSync(CACHE_PATH)) {
        cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    }

    // Filter for projects with AI summaries and specific priority
    const priorityProjects = ['aistro.ai', 'moltbot', 'stock_price_target_modelling', 'Music-and-Math', 'Portfolio'];

    const dives = projects
        .map(p => {
            // Fallback to cache if summary is missing in project details
            if ((!p.ai_summary || p.ai_summary === null) && cache[p.name]) {
                const cachedData = cache[p.name].data || {};
                p.ai_summary = cachedData.ai_summary || cachedData.summary;
                p.ai_tags = cachedData.ai_tags || cachedData.tags;
                p.complexity_score = cachedData.complexity_score || cachedData.complexity;
            }
            return p;
        })
        .filter(p => priorityProjects.includes(p.name) || (p.ai_summary && p.complexity_score > 6))
        .sort((a, b) => {
            const aIdx = priorityProjects.indexOf(a.name);
            const bIdx = priorityProjects.indexOf(b.name);
            if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
            if (aIdx !== -1) return -1;
            if (bIdx !== -1) return 1;
            return (b.complexity_score || 0) - (a.complexity_score || 0);
        })
        .slice(0, 7) // Limit to top 7 projects
        .map(p => {
            const title = p.name === 'aistro.ai' ? '🔮 AI Astrology Platform' :
                p.name === 'moltbot' ? '📲 Moltbot - AI WhatsApp Agent' :
                    p.name === 'stock_price_target_modelling' ? '📈 Autonomous Trading System' :
                        p.name === 'Music-and-Math' ? '🎹 Sonic Geometry Visualizer' :
                            p.name.charAt(0).toUpperCase() + p.name.slice(1);

            const lang = p.language ? `**${p.language}**` : '';
            const link = p.homepage ? ` | [Live Demo](${p.homepage})` : p.url ? ` | [Repo](${p.url})` : '';
            const tags = p.ai_tags ? `\n\n_Tags: ${p.ai_tags.join(', ')}_` : '';

            return `### ${title} (\`${p.name}\`)\n${lang}${link}\n\n${p.ai_summary || p.description || 'No summary available.'}${tags}\n`;
        });

    return dives.join('\n---\n\n');
}

function generateStatsTable(data) {
    const primaryLang = data.topLanguages && data.topLanguages[0] ? data.topLanguages[0] : 'Python';
    const totalCommits = data.totalCommits || 0;
    const uniqueRepos = data.uniqueReposTotal || 0;

    let langStatsStr = 'N/A';
    if (data.allLanguages) {
        const sorted = Object.entries(data.allLanguages).sort((a, b) => b[1] - a[1]);
        langStatsStr = sorted.slice(0, 3).map(([lang, count]) => {
            const pct = ((count / totalCommits) * 100).toFixed(1);
            return `${lang} (${pct}%)`;
        }).join(', ');
    }

    return `| Metric | Current Value |
|--------|------------|
| Total Commits | ${totalCommits} |
| Unique Repositories | ${uniqueRepos} |
| Primary Language | ${primaryLang} |
| Top Languages | ${langStatsStr} |
| Last Synced | ${new Date().toLocaleDateString()} |`;
}

function main() {
    console.log('Generating dynamic README...');

    if (!fs.existsSync(DATA_PATH)) {
        console.error('data.json not found!');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    let template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

    const execSummary = generateExecutiveSummary(data);
    const liveSites = generateLiveSites();
    const deepDives = generateProjectDeepDives();
    const statsTable = generateStatsTable(data);

    const finalContent = template
        .replace('{{EXECUTIVE_SUMMARY}}', execSummary)
        .replace('{{LIVE_SITES}}', liveSites)
        .replace('{{PROJECT_DEEP_DIVES}}', deepDives)
        .replace('{{STATS_TABLE}}', statsTable);

    fs.writeFileSync(OUTPUT_PATH, finalContent);
    console.log(`README.md updated successfully at ${OUTPUT_PATH}`);
}

main();
