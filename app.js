// GitHub Service
const GithubService = {
    username: 'akashagl92',
    async fetchAllData() {
        const cachedStr = sessionStorage.getItem('github_data_v20');
        if (cachedStr) {
            const cached = JSON.parse(cachedStr);
            if (cached && cached.totalCommits > 0) return cached;
            sessionStorage.removeItem('github_data_v20'); // Invalidate 0-stat artifact
        }

        try {
            // Environment-aware pathing for GitHub Pages vs Localhost
            const isProd = window.location.hostname.includes('github.io');
            const dataUrl = isProd ? '/Portfolio/data.json?v=20' : '/data.json?v=20';
            
            const response = await fetch(dataUrl);
            if (response.ok) {
                const data = await response.json();
                if (data.totalCommits > 0) {
                    sessionStorage.setItem('github_data_v20', JSON.stringify(data));
                    return data;
                }
            }
        } catch (e) {
            console.log('data.json not available');
        }

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
                    console.warn(`Failed for ${repo.name}`, err);
                }
            }
            if (allCommits.length < 10) allCommits = this.generateMockData();
            const processed = this.processData(allCommits);
            sessionStorage.setItem('github_data_v20', JSON.stringify(processed));
            return processed;
        } catch (e) {
            console.error('GitHub Fetch Error:', e);
            return this.processData(this.generateMockData());
        }
    },

    generateMockData() {
        const now = new Date();
        const startOfYear = new Date('2025-01-01');
        const days = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
        const commits = [];
        for (let i = 0; i < 205; i++) {
            const randomDay = Math.floor(Math.random() * days);
            const date = new Date(startOfYear.getTime() + randomDay * 24 * 60 * 60 * 1000);
            commits.push({ date: date, repo: 'private-work', language: 'Python' });
        }
        return commits;
    },

    processData(commits) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const allLanguages = {};
        commits.forEach(c => {
            allLanguages[c.language] = (allLanguages[c.language] || 0) + 1;
        });
        const topLanguages = Object.entries(allLanguages).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0]);
        const data = months.slice(0, currentMonth + 1).map((name, i) => {
            const monthCommits = commits.filter(c => c.date.getMonth() === i);
            const repos = new Set(monthCommits.map(c => c.repo));
            const languages = {};
            monthCommits.forEach(c => { languages[c.language] = (languages[c.language] || 0) + 1; });
            const topLangCounts = {};
            topLanguages.forEach(lang => { topLangCounts[lang] = monthCommits.filter(c => c.language === lang).length; });
            return { name, count: monthCommits.length, uniqueRepos: repos.size, languages, topLangCounts };
        });
        const allRepos = new Set(commits.map(c => c.repo));
        return {
            monthly: data,
            totalCommits: commits.length,
            uniqueReposTotal: allRepos.size,
            daily: commits.map(c => ({ date: c.date.toDateString(), repo: c.repo, language: c.language })),
            topLanguages,
            allLanguages,
            activeLanguages: allLanguages
        };
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    const githubData = await GithubService.fetchAllData();
    if (githubData) updateCharts(githubData);

    document.querySelectorAll('.glass-card[data-link]').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const link = card.getAttribute('data-link');
            if (link) window.open(link, '_blank');
        });
    });
});

function updateCharts(data) {
    const totalCommitsEl = document.getElementById('total-commits');
    if (totalCommitsEl) totalCommitsEl.textContent = data.totalCommits.toLocaleString();
    const totalReposEl = document.getElementById('total-repos');
    if (totalReposEl) totalReposEl.textContent = data.uniqueReposTotal;
    
    // Triple-Redundant Language Fallback (Staff Engineer Standard)
    const languages = data.activeLanguages || data.allLanguages || data.languages || {};
    const totalLangsEl = document.getElementById('total-languages');
    if (totalLangsEl) totalLangsEl.textContent = Object.keys(languages).length;

    const activityMap = {};
    const langColors = { 'Python': '#a78bfa', 'TypeScript': '#3b82f6', 'JavaScript': '#fbbf24', 'HTML': '#f97316', 'CSS': '#06b6d4', 'Shell': '#10b981', 'Other': '#6b7280' };
    const defaultColors = ['#a78bfa', '#3b82f6', '#fbbf24', '#f97316', '#06b6d4', '#10b981'];

    data.daily.forEach(d => {
        if (!activityMap[d.date]) activityMap[d.date] = { count: 0, repos: {}, languages: {} };
        activityMap[d.date].count++;
        if (d.repo) activityMap[d.date].repos[d.repo] = (activityMap[d.date].repos[d.repo] || 0) + 1;
        if (d.language) activityMap[d.date].languages[d.language] = (activityMap[d.date].languages[d.language] || 0) + 1;
    });

    const heroCalendarGrid = document.getElementById('hero-calendar-grid');
    const heroCalendarMonths = document.getElementById('hero-calendar-months');
    const heroCalendarYears = document.getElementById('hero-calendar-years');
    const tooltip = document.getElementById('calendar-tooltip');

    if (heroCalendarGrid) {
        heroCalendarGrid.innerHTML = '';
        if (heroCalendarMonths) heroCalendarMonths.innerHTML = '';
        if (heroCalendarYears) heroCalendarYears.innerHTML = '';

        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()) + 7);
        const anchorDate = new Date(2025, 6, 27);
        const maxWeeks = 58;
        let preferredStart = new Date(endDate);
        preferredStart.setDate(preferredStart.getDate() - (maxWeeks * 7) + 1);
        preferredStart.setDate(preferredStart.getDate() - preferredStart.getDay());
        const startDate = preferredStart > anchorDate ? preferredStart : anchorDate;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let totalWeeks = 0;
        let countIter = new Date(startDate);
        while (countIter <= endDate) { totalWeeks++; countIter.setDate(countIter.getDate() + 7); }

        const heroCalendar = document.querySelector('.hero-calendar');
        if (heroCalendar) heroCalendar.style.setProperty('--total-weeks', totalWeeks);

        let currentDate = new Date(startDate);
        let weekIndex = 0;
        let lastTrackedMonth = -1;
        let lastTrackedYear = -1;
        const monthTransitions = [];

        while (currentDate <= endDate) {
            const week = document.createElement('div');
            week.className = 'calendar-week';
            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(currentDate);
                dayDate.setDate(dayDate.getDate() + i);
                const day = document.createElement('div');
                day.className = 'calendar-day';

                if (dayDate <= today) {
                    const dateStr = dayDate.toDateString();
                    const dayData = activityMap[dateStr] || { count: 0, repos: {}, languages: {} };
                    if (dateStr === today.toDateString()) { day.classList.add('today'); day.setAttribute('title', 'Today: April 16th'); }
                    
                    let level = 0;
                    if (dayData.count >= 8) level = 4;
                    else if (dayData.count >= 5) level = 3;
                    else if (dayData.count >= 3) level = 2;
                    else if (dayData.count >= 1) level = 1;

                    const langEntries = Object.entries(dayData.languages);
                    if (langEntries.length > 0 && level > 0) {
                        const dominantLang = langEntries.sort((a,b)=>b[1]-a[1])[0][0];
                        day.style.background = langColors[dominantLang] || '#a78bfa';
                        day.style.opacity = '1'; // Fixed: Restored 100% brilliance
                    } else { 
                        day.classList.add(`lvl-${level}`);
                    }

                    day.dataset.date = dateStr;
                    day.dataset.info = JSON.stringify(dayData);
                    
                    if (tooltip) {
                        day.addEventListener('mouseenter', (e) => {
                            const info = JSON.parse(e.target.dataset.info);
                            const date = e.target.dataset.date;
                            const langs = Object.entries(info.languages).sort((a,b)=>b[1]-a[1]);
                            const total = Object.values(info.languages).reduce((a,b)=>a+b, 0);

                            tooltip.innerHTML = `
                                <div class="tooltip-header">${date.includes('Apr 16') ? date + ' 🌟' : date}</div>
                                <div><span class="tooltip-count">${info.count}</span> contributions</div>
                                <div class="tooltip-projects">${Object.entries(info.repos).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([r, c]) => `<div class="tooltip-project"><span>${r}</span><span>${c}</span></div>`).join('')}</div>
                                <div class="tooltip-tech">
                                    <div class="tooltip-tech-bar">${langs.map(([l, c], idx) => `<div class="tooltip-tech-segment" style="width: ${(c/total)*100}%; background: ${langColors[l] || defaultColors[idx%6]}"></div>`).join('')}</div>
                                </div>
                            `;
                            const rect = e.target.getBoundingClientRect();
                            tooltip.style.left = `${rect.right + 10}px`;
                            tooltip.style.top = `${rect.top}px`;
                            tooltip.classList.add('visible');
                            const tRect = tooltip.getBoundingClientRect();
                            if (tRect.right > window.innerWidth) tooltip.style.left = `${Math.max(10, rect.left - tRect.width - 10)}px`;
                        });
                        day.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
                    }
                } else { day.classList.add('lvl-0'); day.style.opacity = '0.05'; }
                week.appendChild(day);
            }
            heroCalendarGrid.appendChild(week);

            // Mid-week Boundary Sensor (Detects transitions mid-week)
            const weekEndDate = new Date(currentDate);
            weekEndDate.setDate(weekEndDate.getDate() + 6);
            const weekMonth = weekEndDate.getMonth();
            const weekYear = weekEndDate.getFullYear();

            if (weekMonth !== lastTrackedMonth) {
                monthTransitions.push({ weekIndex, month: weekMonth, year: weekYear });
                lastTrackedMonth = weekMonth;
            }
            currentDate.setDate(currentDate.getDate() + 7);
            weekIndex++;
        }

        monthTransitions.forEach(({ weekIndex: wIdx, month, year }, idx) => {
            if (heroCalendarMonths) {
                const mSpan = document.createElement('span');
                mSpan.textContent = months[month];
                mSpan.className = 'calendar-label-month';
                mSpan.style.gridColumn = wIdx + 1;
                // Zenith Fix: Force start-alignment for the first label to prevent mobile truncation
                if (idx === 0) mSpan.style.justifySelf = 'start';
                heroCalendarMonths.appendChild(mSpan);
            }
            if (year !== lastTrackedYear && heroCalendarYears) {
                const ySpan = document.createElement('span');
                ySpan.textContent = year;
                ySpan.className = 'calendar-label-year';
                ySpan.style.gridColumn = wIdx + 1;
                heroCalendarYears.appendChild(ySpan);
                lastTrackedYear = year;
            }
        });
    }
}
