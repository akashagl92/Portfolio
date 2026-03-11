// GitHub Service
const GithubService = {
    username: 'akashagl92',
    async fetchAllData() {
        // Check session cache first
        const cached = sessionStorage.getItem('github_data_v16');
        if (cached) return JSON.parse(cached);

        try {
            // Try to load pre-generated data from build-time script
            const response = await fetch('./data.json?v=15');
            if (response.ok) {
                const data = await response.json();
                // Check if data.json has real content (not just placeholder)
                if (data.totalCommits > 0) {
                    console.log('Using pre-generated data from data.json');
                    sessionStorage.setItem('github_data_v16', JSON.stringify(data));
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
            sessionStorage.setItem('github_data_v16', JSON.stringify(processed));
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
    const heroCalendarYears = document.getElementById('hero-calendar-years');
    const tooltip = document.getElementById('calendar-tooltip');

    if (heroCalendarGrid) {
        heroCalendarGrid.innerHTML = '';
        if (heroCalendarMonths) heroCalendarMonths.innerHTML = '';
        if (heroCalendarYears) heroCalendarYears.innerHTML = '';

        // Date window calculation first
        const today = new Date();
        const endDate = new Date(today);
        // End at the current Saturday to ensure a full week column
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

        // Implementation of 'Grow-then-Slide':
        // Anchor to July 27, 2025 (Sunday). Use (year, month, day) to avoid UTC timezone shift.
        const anchorDate = new Date(2025, 6, 27); // month is 0-indexed: 6 = July

        // Geometry standard: 10px cell + 2px gap = 12px per week column
        const maxWeeks = 58; // 58 weeks is roughly 13.5 to 14 months. Fits perfectly in 800px card.
        let preferredStart = new Date(endDate);
        preferredStart.setDate(preferredStart.getDate() - (maxWeeks * 7) + 1);
        preferredStart.setDate(preferredStart.getDate() - preferredStart.getDay());

        // Use the later of the anchor or the sliding window start
        const startDate = preferredStart > anchorDate ? preferredStart : anchorDate;

        // Dynamic header update logic based on the calculated sliding window
        const headerSpan = document.querySelector('.viz-header span');
        if (headerSpan) {
            const startYear = startDate.getFullYear();
            const endYear = endDate.getFullYear();
            if (startYear === endYear) {
                headerSpan.textContent = `${startYear} ENGINEERING VELOCITY`;
            } else {
                headerSpan.textContent = `${startYear}-${endYear} ENGINEERING VELOCITY`;
            }
        }



        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let currentDate = new Date(startDate);
        let weekIndex = 0;
        let lastTrackedMonth = -1;
        let lastTrackedYear = -1;
        const monthTransitions = []; // Track transitions for second-pass labeling

        const totalWeeks = Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000)) + 1;
        heroCalendarGrid.style.setProperty('--total-weeks', totalWeeks);

        while (currentDate <= endDate) {
            const week = document.createElement('div');
            week.className = 'calendar-week';

            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(currentDate);
                dayDate.setDate(dayDate.getDate() + i);

                const day = document.createElement('div');
                day.className = 'calendar-day';

                if (dayDate >= startDate && dayDate <= today) {
                    const dateStr = dayDate.toDateString();
                    const dayData = activityMap[dateStr] || { count: 0, repos: {}, languages: {} };

                    let level = 0;
                    if (dayData.count >= 1) level = 1;
                    if (dayData.count >= 3) level = 2;
                    if (dayData.count >= 5) level = 3;
                    if (dayData.count >= 8) level = 4;

                    const langEntries = Object.entries(dayData.languages);
                    if (langEntries.length > 0 && level > 0) {
                        const dominantLang = langEntries.sort((a, b) => b[1] - a[1])[0][0];
                        const baseColor = langColors[dominantLang] || '#a78bfa';
                        day.style.background = baseColor;
                        day.style.opacity = [0.1, 0.5, 0.7, 0.85, 1][level];
                    } else {
                        day.classList.add(`lvl-${level}`);
                    }
                    day.dataset.date = dateStr;
                    day.dataset.info = JSON.stringify(dayData);

                    if (tooltip) {
                        day.addEventListener('mouseenter', (e) => {
                            const info = JSON.parse(e.target.dataset.info);
                            const date = e.target.dataset.date;
                            const langs = Object.entries(info.languages).sort((a, b) => b[1] - a[1]);
                            const total = Object.values(info.languages).reduce((a, b) => a + b, 0);

                            tooltip.innerHTML = `
                                <div class="tooltip-header">${date}</div>
                                <div><span class="tooltip-count">${info.count}</span> contribution${info.count !== 1 ? 's' : ''}</div>
                                <div class="tooltip-projects">${Object.entries(info.repos).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([r, c]) => `<div class="tooltip-project"><span>${r}</span><span>${c}</span></div>`).join('')}</div>
                                <div class="tooltip-tech">
                                    <div class="tooltip-tech-bar">${langs.map(([l, c], idx) => {
                                const pct = (c / total) * 100;
                                return `<div class="tooltip-tech-segment" style="width: ${pct}%; background: ${langColors[l] || defaultColors[idx % defaultColors.length]}"></div>`;
                            }).join('')}</div>
                                    <div class="tooltip-tech-legend">${langs.slice(0, 3).map(([l, c]) => `<span><i style="background: ${langColors[l] || '#fff'}"></i>${l}</span>`).join('')}</div>
                                </div>
                            `;
                            const rect = e.target.getBoundingClientRect();
                            tooltip.style.left = `${rect.right + 10}px`;
                            tooltip.style.top = `${rect.top}px`;
                            tooltip.classList.add('visible');

                            // Re-calculate to prevent right-edge clipping
                            const tRect = tooltip.getBoundingClientRect();
                            if (tRect.right > window.innerWidth) {
                                tooltip.style.left = `${Math.max(10, rect.left - tRect.width - 10)}px`;
                            }
                            if (tRect.bottom > window.innerHeight) {
                                tooltip.style.top = `${Math.max(10, window.innerHeight - tRect.height - 10)}px`;
                            }
                        });
                        day.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
                    }
                } else {
                    day.style.visibility = 'hidden';
                }
                week.appendChild(day);
            }
            heroCalendarGrid.appendChild(week);

            // Track month transitions (first pass — no labeling yet)
            const weekMonth = currentDate.getMonth();
            const weekYear = currentDate.getFullYear();
            const nextWeek = new Date(currentDate);
            nextWeek.setDate(nextWeek.getDate() + 7);
            const nextWeekMonth = nextWeek.getMonth();
            const nextWeekYear = nextWeek.getFullYear();

            // Determine effective label for this position
            let labelMonth = weekMonth;
            let labelYear = weekYear;
            // Stub month: first column, month changes next week → use next month name
            if (lastTrackedMonth === -1 && weekMonth !== nextWeekMonth) {
                labelMonth = nextWeekMonth;
                labelYear = nextWeekYear;
            }

            if (labelMonth !== lastTrackedMonth) {
                monthTransitions.push({ weekIndex, month: labelMonth, year: labelYear });
                lastTrackedMonth = labelMonth;
                lastTrackedYear = labelYear;
            }

            currentDate.setDate(currentDate.getDate() + 7);
            weekIndex++;
        }

        // Second pass: position labels using offsetLeft for bulletproof alignment natively
        // Defer to requestAnimationFrame so the browser lays out columns first
        requestAnimationFrame(() => {
            let lastPlacedYear = -1;
            const weekEls = heroCalendarGrid.querySelectorAll('.calendar-week');

            // Ensure the months container precisely matches grid width & position for 1:1 offsets
            heroCalendarMonths.style.width = `${heroCalendarGrid.offsetWidth}px`;
            heroCalendarMonths.style.marginLeft = 'auto';
            heroCalendarMonths.style.marginRight = 'auto';

            if (heroCalendarYears) {
                heroCalendarYears.style.width = `${heroCalendarGrid.offsetWidth}px`;
                heroCalendarYears.style.marginLeft = 'auto';
                heroCalendarYears.style.marginRight = 'auto';
            }

            monthTransitions.forEach(({ weekIndex: wIdx, month, year }) => {
                const col = weekEls[wIdx];
                if (!col) return;

                // Stable layout coordinate relative to the .calendar-grid container
                const offsetFromGridLeft = col.offsetLeft;

                const span = document.createElement('span');
                span.textContent = months[month];
                span.style.position = 'absolute';
                span.style.left = `${offsetFromGridLeft}px`;
                heroCalendarMonths.appendChild(span);

                // Year label
                if (year !== lastPlacedYear && heroCalendarYears) {
                    const yearSpan = document.createElement('span');
                    yearSpan.textContent = year;
                    yearSpan.style.position = 'absolute';
                    yearSpan.style.left = `${offsetFromGridLeft}px`;
                    heroCalendarYears.appendChild(yearSpan);
                    lastPlacedYear = year;
                }
            });
        });
    }

}
