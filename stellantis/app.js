// GitHub Service
const GithubService = {
    username: 'akashagl92',
    async fetchAllData() {
        // Check session cache first
        const cached = sessionStorage.getItem('github_data_v14');
        if (cached) return JSON.parse(cached);

        try {
            // Try to load pre-generated data from build-time script
            const response = await fetch('./data.json?v=14');
            if (response.ok) {
                const data = await response.json();
                // Check if data.json has real content (not just placeholder)
                if (data.totalCommits > 0) {
                    console.log('Using pre-generated data from data.json');
                    sessionStorage.setItem('github_data_v14', JSON.stringify(data));
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
            sessionStorage.setItem('github_data_v14', JSON.stringify(processed));
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

        const allRepos = new Set(commits.map(c => c.repo));
        return {
            monthly: data,
            totalCommits: commits.length,
            uniqueReposTotal: allRepos.size,
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
    // Update Stats in Hero
    const totalCommitsEl = document.getElementById('total-commits');
    if (totalCommitsEl) totalCommitsEl.textContent = data.totalCommits.toLocaleString();

    const totalLangsEl = document.getElementById('total-languages');
    const langData = data.allLanguages || data.languages || {};
    if (totalLangsEl && Object.keys(langData).length > 0) {
        totalLangsEl.textContent = Object.keys(langData).length;
    }

    const totalReposEl = document.getElementById('total-repos');
    if (totalReposEl && data.uniqueReposTotal !== undefined) {
        totalReposEl.textContent = data.uniqueReposTotal;
    }

    // Dynamic color generator for any language (hash-based for consistency)
    const generateColor = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash) % 360;
        return `hsl(${h}, 70%, 60%)`;
    };

    // Known language colors (for commonly used languages), fallback to generated
    const langColors = {
        'Python': '#a78bfa',
        'TypeScript': '#3b82f6',
        'JavaScript': '#fbbf24',
        'HTML': '#f97316',
        'CSS': '#06b6d4',
        'Shell': '#10b981',
        'Ruby': '#ef4444',
        'Go': '#22d3ee',
        'Rust': '#f59e0b',
        'Java': '#dc2626',
        'C++': '#3b82f6',
        'C': '#6b7280',
        'Other': '#6b7280'
    };

    // Get color for any language (known or dynamically generated)
    const getLanguageColor = (lang) => langColors[lang] || generateColor(lang);
    const defaultColors = ['#a78bfa', '#3b82f6', '#fbbf24', '#f97316', '#06b6d4', '#10b981', '#ec4899', '#8b5cf6'];

    // Full Tech Distribution (Inline in Hero) - support both 'languages' and 'allLanguages' keys
    const languageData = data.allLanguages || data.languages || {};
    const fullDistChart = document.getElementById('full-tech-distribution');
    if (fullDistChart && Object.keys(languageData).length > 0) {
        fullDistChart.innerHTML = '';
        const sortedLangs = Object.entries(languageData)
            .sort((a, b) => b[1] - a[1]);

        // Calculate total contributions for percentage
        const totalContributions = sortedLangs.reduce((sum, [, count]) => sum + count, 0);

        sortedLangs.forEach(([lang, count], i) => {
            const item = document.createElement('div');
            item.className = 'dist-item';
            const color = getLanguageColor(lang);
            const percentage = ((count / totalContributions) * 100).toFixed(1);
            item.innerHTML = `
                <span class="lang-dot" style="background: ${color}"></span>
                <span class="lang-name">${lang}</span>
                <span class="lang-count">${percentage}%</span>
            `;
            fullDistChart.appendChild(item);
        });
    }

    // Build activity map with repo and language info for rich tooltips
    const activityMap = {};
    data.daily.forEach(d => {
        if (!activityMap[d.date]) {
            activityMap[d.date] = { count: 0, repos: {}, languages: {} };
        }
        activityMap[d.date].count++;
        activityMap[d.date].repos[d.repo] = (activityMap[d.date].repos[d.repo] || 0) + 1;
        activityMap[d.date].languages[d.language] = (activityMap[d.date].languages[d.language] || 0) + 1;
    });

    // Hero Calendar
    const heroCalendarGrid = document.getElementById('hero-calendar-grid');
    const heroCalendarMonths = document.getElementById('hero-calendar-months');
    const tooltip = document.getElementById('calendar-tooltip');

    if (heroCalendarGrid) {
        heroCalendarGrid.innerHTML = '';

        // Dynamic header update logic
        const headerSpan = document.querySelector('.viz-header span');
        if (headerSpan) {
            const currentYear = new Date().getFullYear();
            if (currentYear > 2025) {
                headerSpan.textContent = `2025-${currentYear} ENGINEERING VELOCITY`;
            }
        }

        const startDate = new Date('2025-01-01');
        const today = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Start from the first day of 2025 (no padding for Dec 2024)
        let currentDate = new Date(startDate);

        // Find the first Sunday on or before Jan 1
        const firstDayOfWeek = currentDate.getDay(); // Wed = 3
        let weekIndex = 0;

        let currentMonth = 0; // Start with January (0)
        const monthPositions = [{ month: 'Jan', position: 0 }]; // Jan starts at position 0

        while (currentDate <= today) {
            const week = document.createElement('div');
            week.className = 'calendar-week';

            for (let i = 0; i < 7; i++) {
                const day = document.createElement('div');
                day.className = 'calendar-day';

                // For the first week, hide days before Jan 1
                const effectiveDate = new Date(startDate);
                effectiveDate.setDate(effectiveDate.getDate() + (weekIndex * 7) + i - firstDayOfWeek);

                if (effectiveDate >= startDate && effectiveDate <= today) {
                    const dateStr = effectiveDate.toDateString();
                    const dayData = activityMap[dateStr] || { count: 0, repos: {}, languages: {} };

                    let level = 0;
                    if (dayData.count >= 1) level = 1;
                    if (dayData.count >= 3) level = 2;
                    if (dayData.count >= 5) level = 3;
                    if (dayData.count >= 8) level = 4;

                    // Determine dominant language and apply its color
                    const langEntries = Object.entries(dayData.languages);
                    if (langEntries.length > 0 && level > 0) {
                        const dominantLang = langEntries.sort((a, b) => b[1] - a[1])[0][0];
                        const baseColor = langColors[dominantLang] || '#a78bfa';
                        const opacity = [0.1, 0.5, 0.7, 0.85, 1][level];
                        day.style.background = baseColor;
                        day.style.opacity = opacity;
                    } else {
                        day.classList.add(`lvl-${level}`);
                    }
                    day.dataset.date = dateStr;
                    day.dataset.info = JSON.stringify(dayData);

                    // Track month positions just in case logic is needed here
                    const month = effectiveDate.getMonth();
                    if (month > currentMonth) {
                        currentMonth = month;
                        monthPositions.push({ month: months[month], position: weekIndex });
                    }

                    // Rich tooltip on hover (only if tooltip element exists)
                    if (tooltip) {
                        day.addEventListener('mouseenter', (e) => {
                            const info = JSON.parse(e.target.dataset.info);
                            const date = e.target.dataset.date;

                            if (info.count === 0) {
                                tooltip.innerHTML = `
                                    <div class="tooltip-header">${date}</div>
                                    <div style="color: var(--text-muted)">No contributions</div>
                                `;
                            } else {
                                const repoList = Object.entries(info.repos)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 3)
                                    .map(([repo, ct]) => `<div class="tooltip-project"><span>${repo}</span><span>${ct}</span></div>`)
                                    .join('');

                                const langEntries = Object.entries(info.languages).sort((a, b) => b[1] - a[1]);
                                const totalLangCommits = langEntries.reduce((s, l) => s + l[1], 0);
                                const techBar = langEntries.map(([lang, ct], idx) => {
                                    const pct = (ct / totalLangCommits) * 100;
                                    const color = langColors[lang] || defaultColors[idx % defaultColors.length];
                                    return `<div class="tooltip-tech-segment" style="width: ${pct}%; background: ${color}"></div>`;
                                }).join('');

                                const techLegend = langEntries.slice(0, 3).map(([lang, ct], idx) => {
                                    const color = langColors[lang] || defaultColors[idx % defaultColors.length];
                                    return `<span style="color: ${color}">● ${lang}</span>`;
                                }).join(' ');

                                tooltip.innerHTML = `
                                    <div class="tooltip-header">${date}</div>
                                    <div><span class="tooltip-count">${info.count}</span> contribution${info.count !== 1 ? 's' : ''}</div>
                                    <div class="tooltip-projects">${repoList}</div>
                                    <div class="tooltip-tech">
                                        <div class="tooltip-tech-bar">${techBar}</div>
                                        <div class="tooltip-tech-legend">${techLegend}</div>
                                    </div>
                                `;
                            }

                            // Smart Positioning Logic
                            const rect = e.target.getBoundingClientRect(); // Capture rect immediately

                            // Use setTimeout to ensure measurement happens after rendering
                            requestAnimationFrame(() => {
                                const ttRect = tooltip.getBoundingClientRect();
                                const vw = document.documentElement.clientWidth;
                                const vh = document.documentElement.clientHeight;
                                const padding = 10; // Safety margin

                                // Default: Right side, aligned top
                                let left = rect.right + padding;
                                let top = rect.top;

                                // 1. Horizontal Check
                                // If overflowing right, flip to left
                                if (left + ttRect.width > vw - padding) {
                                    left = rect.left - ttRect.width - padding;
                                }

                                // 2. Mobile / Narrow Screen Check (if flipping left also fails)
                                if (left < padding) {
                                    // Center horizontally
                                    left = (vw - ttRect.width) / 2;
                                    // Position above or below
                                    top = rect.top - ttRect.height - padding;
                                    if (top < padding) {
                                        top = rect.bottom + padding;
                                    }
                                }

                                // 3. Vertical Check (Prevent bottom overflow)
                                if (top + ttRect.height > vh - padding) {
                                    // Shift up
                                    top = vh - ttRect.height - padding;
                                }
                                // Prevent top overflow
                                if (top < padding) top = padding;

                                // Apply final positions
                                tooltip.style.left = `${left}px`;
                                tooltip.style.top = `${top}px`;
                            });

                            tooltip.classList.add('visible');
                        });

                        day.addEventListener('mousemove', (e) => {
                            tooltip.style.left = `${e.clientX + 15}px`;
                            tooltip.style.top = `${e.clientY + 15}px`;
                        });

                        day.addEventListener('mouseleave', () => {
                            tooltip.classList.remove('visible');
                        });
                    }
                } else {
                    day.style.visibility = 'hidden';
                }

                week.appendChild(day);
            }

            heroCalendarGrid.appendChild(week);
            weekIndex++;

            // Advance currentDate by 7 days for the while loop condition
            currentDate.setDate(currentDate.getDate() + 7);
        }

        // Add month labels - use absolute positioning for precise alignment
        if (heroCalendarMonths) {
            heroCalendarMonths.innerHTML = '';
            heroCalendarMonths.style.position = 'relative';

            // Pre-calculate month positions based on actual calendar structure
            const startDate = new Date('2025-01-01');
            const firstDayOfWeek = startDate.getDay(); // Wed = 3 for Jan 1, 2025

            // Iterate from startDate to current date to generate all month labels and year markers
            let labelDate = new Date(startDate);
            const currentDateIterator = new Date(); // Use today as end date

            // To avoid potential infinite loops, set a safe limit (e.g., 5 years)
            const maxDate = new Date(startDate);
            maxDate.setFullYear(maxDate.getFullYear() + 5);

            while (labelDate <= currentDateIterator && labelDate < maxDate) {
                const year = labelDate.getFullYear();
                const monthIndex = labelDate.getMonth();
                const monthStart = new Date(labelDate);
                monthStart.setDate(1); // Ensure we are at start of month

                const daysSinceStart = Math.floor((monthStart - startDate) / (1000 * 60 * 60 * 24));
                // Only if positive (future safeguard)
                if (daysSinceStart >= 0) {
                    const weekIndex = Math.floor((daysSinceStart + firstDayOfWeek) / 7);

                    // Add Year Marker for 2026 onwards (bifurcation)
                    if (monthIndex === 0 && year > 2025) {
                        const marker = document.createElement('div');
                        marker.className = 'calendar-year-marker';
                        marker.dataset.year = year;
                        marker.style.left = `calc(var(--week-width) * ${weekIndex} - 2px)`; // Adjust for border width
                        heroCalendarMonths.appendChild(marker);
                    }

                    // Add Year Marker for 2025 (Start of graph) if month is Jan
                    if (monthIndex === 0 && year === 2025) {
                        const marker = document.createElement('div');
                        marker.className = 'calendar-year-marker';
                        marker.dataset.year = year;
                        marker.style.left = `0px`; // Start of grid
                        heroCalendarMonths.appendChild(marker);
                    }

                    const span = document.createElement('span');
                    span.textContent = months[monthIndex];
                    span.style.position = 'absolute';
                    span.style.left = `calc(var(--week-width) * ${weekIndex})`;
                    heroCalendarMonths.appendChild(span);
                }

                // Increment to next month safely handling year crossovers
                // Using UTC date methods can sometimes be safer, but basic setMonth usually handles overflow correctly
                // e.g. Jan 31 -> setMonth(1) -> March 2/3. 
                // To be safe: Set date to 1 first, then add month.
                labelDate.setDate(1);
                labelDate.setMonth(labelDate.getMonth() + 1);
            }

            // Match months container width to grid width so they center together
            heroCalendarMonths.style.width = `${heroCalendarGrid.offsetWidth}px`;
        }
    }

}
