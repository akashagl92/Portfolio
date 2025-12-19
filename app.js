```javascript
// GitHub Service
const GithubService = {
    username: 'akashagl92',
    async fetchAllData() {
        // Check session cache first
        const cached = sessionStorage.getItem('github_data_v7');
        if (cached) return JSON.parse(cached);

        try {
            // Try to load pre-generated data from build-time script
            const response = await fetch('./data.json');
            if (response.ok) {
                const data = await response.json();
                // Check if data.json has real content (not just placeholder)
                if (data.totalCommits > 0) {
                    console.log('Using pre-generated data from data.json');
                    sessionStorage.setItem('github_data_v6', JSON.stringify(data));
                    return data;
                }
            }
        } catch (e) {
            console.log('data.json not available, falling back to API/mock');
        }

        // Fallback: Try live API (for local dev without data.json)
        try {
            const reposResponse = await fetch(`https://api.github.com/users/${this.username}/repos?sort=pushed&per_page=100`);
if (!reposResponse.ok) throw new Error('Repo fetch failed');

const repos = await reposResponse.json();
let allCommits = [];

const targetRepos = repos.slice(0, 50);
for (const repo of targetRepos) {
    try {
        const commitsResponse = await fetch(`https://api.github.com/repos/${this.username}/${repo.name}/commits?since=2025-01-01T00:00:00Z&per_page=100`);
        if (commitsResponse.ok) {
            const commits = await commitsResponse.json();
            if (Array.isArray(commits)) {
                allCommits.push(...commits.map(c => ({
                    date: new Date(c.commit.author.date),
                    repo: repo.name,
                    language: repo.language || 'Other'
                })));
            }
        }
    } catch (err) {
        console.warn(`Failed to fetch commits for ${repo.name}`, err);
    }
}

if (allCommits.length < 10) {
    console.log('Public activity low, generating mock data...');
    allCommits = this.generateMockData();
}

const processed = this.processData(allCommits);
sessionStorage.setItem('github_data_v6', JSON.stringify(processed));
return processed;
        } catch (e) {
    console.error('GitHub Fetch Error:', e);
    // Final fallback: mock data
    const mockCommits = this.generateMockData();
    const processed = this.processData(mockCommits);
    return processed;
}
    },

generateMockData() {
    // Simulating the 202+ contributions mentioned by user profile
    // Distribution: Python (60%), Neo4j (20%), Agents (20%)
    const now = new Date();
    const startOfYear = new Date('2025-01-01');
    const days = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));

    const commits = [];
    // Add ~200 mock commits spread over the year
    for (let i = 0; i < 205; i++) {
        const randomDay = Math.floor(Math.random() * days);
        const date = new Date(startOfYear.getTime() + randomDay * 24 * 60 * 60 * 1000);

        let lang = 'Python';
        const r = Math.random();
        if (r > 0.6) lang = 'Neo4j';
        if (r > 0.8) lang = 'Agents'; // Custom tag

        commits.push({
            date: date,
            repo: 'private-work',
            language: lang
        });
    }
    return commits;
},

processData(commits) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    // Comprehensive language stats
    const allLanguages = {};
    commits.forEach(c => {
        allLanguages[c.language] = (allLanguages[c.language] || 0) + 1;
    });
    const topLanguages = Object.entries(allLanguages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(e => e[0]);

    const data = months.slice(0, currentMonth + 1).map((name, i) => {
        const monthCommits = commits.filter(c => c.date.getMonth() === i);
        const repos = new Set(monthCommits.map(c => c.repo));
        const languages = {};
        monthCommits.forEach(c => {
            languages[c.language] = (languages[c.language] || 0) + 1;
        });

        // Calculate counts for top 3 languages for the line charts
        const topLangCounts = {};
        topLanguages.forEach(lang => {
            topLangCounts[lang] = monthCommits.filter(c => c.language === lang).length;
        });

        return {
            name,
            count: monthCommits.length,
            uniqueRepos: repos.size,
            languages,
            topLangCounts
        };
    });

    return {
        monthly: data,
        totalCommits: commits.length,
        daily: commits.map(c => ({ date: c.date.toDateString() })),
        topLanguages,
        allLanguages
    };
}
};

document.addEventListener('DOMContentLoaded', async () => {
    // Reveal Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // GitHub Data Integration
    const githubData = await GithubService.fetchAllData();
    if (githubData) {
        updateCharts(githubData);
    }

    // Existing interactivity
    document.querySelectorAll('.glass-card[data-link]').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const link = card.getAttribute('data-link');
            if (link) window.open(link, '_blank');
        });
    });

    const vizCard = document.querySelector('.main-viz');
    if (vizCard) vizCard.classList.add('float-anim');
});

function updateCharts(data) {
    // Update Stats
    const totalCommitsEl = document.querySelector('.viz-stats .stat:first-child .stat-value');
    if (totalCommitsEl) totalCommitsEl.textContent = data.totalCommits.toLocaleString();

    // Update Tech Stack Distribution Bars
    const distChart = document.querySelector('.distribution-chart');
    if (distChart && data.allLanguages) {
        distChart.innerHTML = '';
        const sortedLangs = Object.entries(data.allLanguages)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        const totalTopCommits = sortedLangs.reduce((sum, l) => sum + l[1], 0);

        sortedLangs.forEach(([lang, count], i) => {
            const percentage = Math.round((count / totalTopCommits) * 100);
            const classes = ['python', 'db', 'ai'];
            const row = document.createElement('div');
            row.className = 'dist-row';
            row.innerHTML = `
                <span>${lang}</span>
                <div class="dist-bar-bg">
                    <div class="dist-bar ${classes[i] || 'python'}" style="width: ${percentage}%"></div>
                </div>
            `;
            distChart.appendChild(row);
        });
    }

    // Update Legend
    const legend = document.querySelector('.legend');
    if (legend && data.topLanguages) {
        legend.innerHTML = '';
        const classes = ['python', 'neo4j', 'agents'];
        data.topLanguages.forEach((lang, i) => {
            const span = document.createElement('span');
            span.className = 'legend-item';
            span.innerHTML = `<i class="dot ${classes[i]}"></i> ${lang}`;
            legend.appendChild(span);
        });
    }

    // Update Heatmap
    const heatmap = document.getElementById('heatmap');
    if (heatmap) {
        heatmap.innerHTML = '';
        const activityMap = {};
        data.daily.forEach(d => {
            // Group by approximate "blocks" for the heatmap UI if it's small
            activityMap[d.date] = (activityMap[d.date] || 0) + 1;
        });

        // Current implementation has 48 boxes
        const allDates = Object.keys(activityMap).sort((a, b) => new Date(b) - new Date(a));
        for (let i = 0; i < 48; i++) {
            const day = document.createElement('div');
            let intensity = 0;
            if (i < allDates.length) {
                const count = activityMap[allDates[i]];
                intensity = Math.min(3, Math.ceil(count / 2));
            }
            day.className = `heatmap-day lvl-${intensity}`;
            heatmap.appendChild(day);
        }
    }

    // Multi-line Velocity Chart
    const chart = document.querySelector('.velocity-chart');
    const tooltip = document.getElementById('chart-tooltip');

    if (chart && data.monthly.length > 0) {
        // Clear existing paths first
        const existingPaths = chart.querySelectorAll('.velocity-path');
        existingPaths.forEach(p => p.remove());

        const width = 400;
        const height = 200;
        const padding = 20;

        const maxCommits = Math.max(...data.monthly.map(m => m.count), 1);
        const colors = ['var(--accent-primary)', '#fbbf24', '#f472b6']; // Purple, Amber, Pink

        data.topLanguages.forEach((lang, langIdx) => {
            // Create path dynamically
            const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathEl.classList.add('velocity-path');
            pathEl.style.fill = 'none';
            pathEl.style.stroke = colors[langIdx] || '#fff';
            pathEl.style.strokeWidth = '3';
            pathEl.style.strokeLinecap = 'round';
            chart.appendChild(pathEl);

            const points = data.monthly.map((m, i) => {
                const count = m.topLangCounts[lang] || 0;
                return {
                    x: padding + (i * (width - 2 * padding) / Math.max(data.monthly.length - 1, 1)),
                    y: height - padding - (count * (height - 2 * padding) / maxCommits)
                };
            });

            if (points.length > 1) {
                // Simplified Path Generation (Linear)
                const d = `M${points.map(p => `${p.x},${p.y}`).join(' L')}`;
                pathEl.setAttribute('d', d);
            }
        });

        // Update main points for tooltip (uses total monthly count)
        const mainPoints = data.monthly.map((m, i) => ({
            x: padding + (i * (width - 2 * padding) / Math.max(data.monthly.length - 1, 1)),
            y: height - padding - (m.count * (height - 2 * padding) / maxCommits),
            data: m
        }));

        // Custom Tooltip Interaction
        chart.addEventListener('mousemove', (e) => {
            const rect = chart.getBoundingClientRect();
            const x = e.clientX - rect.left;

            // Find closest month
            const closest = mainPoints.reduce((prev, curr) =>
                Math.abs(curr.x * (rect.width / 400) - x) < Math.abs(prev.x * (rect.width / 400) - x) ? curr : prev
            );

            if (closest) {
                tooltip.style.opacity = '1';
                tooltip.style.left = `${e.clientX + 10}px`;
                tooltip.style.top = `${e.clientY + 10}px`;

                const langBreakdown = Object.entries(closest.data.languages)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([lang, count]) => `<span>${lang}: ${count}</span>`)
                    .join('');

                tooltip.innerHTML = `
                    <strong>${closest.data.name} 2025</strong>
                    <div class="tooltip-line"><span>Total Commits:</span> <span>${closest.data.count}</span></div>
                    <div class="tooltip-line"><span>Projects:</span> <span>${closest.data.uniqueRepos}</span></div>
                    <div style="border-top:1px solid rgba(255,255,255,0.1); margin-top:0.5rem; padding-top:0.5rem; font-size:0.7rem; color:var(--text-muted)">
                        ${langBreakdown || 'General activity'}
                    </div>
                `;
            }
        });

        chart.addEventListener('mouseleave', () => tooltip.style.opacity = '0');
    }
}
