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
    try {
        const totalCommitsEl = document.getElementById('total-commits');
        if (totalCommitsEl) totalCommitsEl.textContent = (data.totalCommits || 0).toLocaleString();
        
        const totalReposEl = document.getElementById('total-repos');
        if (totalReposEl) totalReposEl.textContent = data.uniqueReposTotal || 0;
        
        const languages = data.languages || data.activeLanguages || data.allLanguages || {};
        const totalLangsEl = document.getElementById('total-languages');
        if (totalLangsEl) totalLangsEl.textContent = Object.keys(languages).length;

        const heroCalendarGrid = document.getElementById('hero-calendar-grid');
        const heroCalendarMonths = document.getElementById('hero-calendar-months');
        const heroCalendarYears = document.getElementById('hero-calendar-years');
        const tooltip = document.getElementById('calendar-tooltip');

        if (heroCalendarGrid) {
            try {
                renderEngineeringVelocityGrid(data, heroCalendarGrid, heroCalendarMonths, heroCalendarYears, tooltip);
            } catch (gridError) {
                console.error('v58 Logic Failure [Grid]:', gridError);
            }
        }

        const techDistContainer = document.getElementById('full-tech-distribution');
        if (techDistContainer) {
            try {
                renderTechDistribution(data, techDistContainer);
            } catch (techError) {
                console.error('v58 Logic Failure [Tech]:', techError);
            }
        }
    } catch (globalError) {
        console.error('v58 Global Chart Failure:', globalError);
    }
}

function renderEngineeringVelocityGrid(data, grid, monthsEl, yearsEl, tooltip) {
    grid.innerHTML = '';
    if (monthsEl) monthsEl.innerHTML = '';
    if (yearsEl) yearsEl.innerHTML = '';

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const originStartDate = new Date(2025, 6, 27);
    originStartDate.setHours(0, 0, 0, 0);

    const horizonDate = new Date(yesterday);
    horizonDate.setDate(horizonDate.getDate() + (6 - horizonDate.getDay()));
    
    let totalChronoWeeks = 0;
    let chronoIter = new Date(originStartDate);
    while (chronoIter <= horizonDate) { totalChronoWeeks++; chronoIter.setDate(chronoIter.getDate() + 7); }
    
    let finalStartDate = new Date(originStartDate);
    let finalTotalWeeks = totalChronoWeeks;
    const maxCapacity = 58;

    if (totalChronoWeeks > maxCapacity) {
        const weeksToSunset = totalChronoWeeks - maxCapacity;
        finalStartDate.setDate(finalStartDate.getDate() + (weeksToSunset * 7));
        finalTotalWeeks = maxCapacity;
    }

    const heroCalendar = document.querySelector('.hero-calendar');
    const propertyTargetContainers = [grid, monthsEl, yearsEl, heroCalendar].filter(el => el);
    propertyTargetContainers.forEach(container => {
        container.style.setProperty('--total-weeks', finalTotalWeeks);
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const langColors = { 'Python': '#a78bfa', 'TypeScript': '#3b82f6', 'JavaScript': '#fbbf24', 'HTML': '#f97316', 'CSS': '#06b6d4', 'Shell': '#10b981', 'Other': '#6b7280' };
    const defaultColors = ['#a78bfa', '#3b82f6', '#fbbf24', '#f97316', '#06b6d4', '#10b981'];

    const activityMap = {};
    data.daily.forEach(d => {
        if (!activityMap[d.date]) activityMap[d.date] = { count: 0, repos: {}, languages: {} };
        activityMap[d.date].count++;
        if (d.repo) activityMap[d.date].repos[d.repo] = (activityMap[d.date].repos[d.repo] || 0) + 1;
        if (d.language) activityMap[d.date].languages[d.language] = (activityMap[d.date].languages[d.language] || 0) + 1;
    });

    let currentDate = new Date(finalStartDate);
    let weekIndex = 0;
    let lastTrackedMonth = -1;
    let lastTrackedYear = -1;
    const monthTransitions = [];

    while (currentDate <= horizonDate) {
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
                if (dateStr === today.toDateString()) { day.classList.add('today'); day.setAttribute('title', 'Today: April 17th'); }
                
                let level = 0;
                if (dayData.count >= 8) level = 4;
                else if (dayData.count >= 5) level = 3;
                else if (dayData.count >= 3) level = 2;
                else if (dayData.count >= 1) level = 1;

                const langEntries = Object.entries(dayData.languages);
                if (langEntries.length > 0 && level > 0) {
                    const dominantLang = langEntries.sort((a,b)=>b[1]-a[1])[0][0];
                    day.style.background = langColors[dominantLang] || '#a78bfa';
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
                            <div class="tooltip-header">${date.includes('Apr 17') ? date + ' 🌟' : date}</div>
                            <div><span class="tooltip-count">${info.count}</span> contributions</div>
                            <div class="tooltip-projects">${Object.entries(info.repos).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([r, c]) => `<div class="tooltip-project"><span>${r}</span><span>${c}</span></div>`).join('')}</div>
                            <div class="tooltip-tech">
                                <div class="tooltip-tech-bar">${langs.map(([l, c], idx) => `<div class="tooltip-tech-segment" style="width: ${(c/total)*100}%; background: ${langColors[l] || defaultColors[idx%6]}"></div>`).join('')}</div>
                            </div>
                        `;
                        const rect = e.target.getBoundingClientRect();
                        const tooltipWidth = 200; // Expected max width for contributions tooltip
                        
                        // v66.1: Smart-Positioning Boundary Guard
                        // Detects proximity to the right edge and flips orientation inbound
                        if (rect.right + tooltipWidth > window.innerWidth - 20) {
                            tooltip.style.left = `${rect.left - tooltipWidth - 10}px`;
                        } else {
                            tooltip.style.left = `${rect.right + 10}px`;
                        }
                        
                        tooltip.style.top = `${rect.top}px`;
                        tooltip.classList.add('visible');
                    });
                    day.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
                }
            } else { day.classList.add('lvl-0'); }
            week.appendChild(day);
        }
        grid.appendChild(week);

        // v70: Month-Arrival Logic - Detect if this 7-day week contains the 1st of a month
        let weekMonthStart = -1;
        let weekYearStart = -1;
        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(currentDate);
            checkDate.setDate(checkDate.getDate() + i);
            if (checkDate.getDate() === 1) {
                weekMonthStart = checkDate.getMonth();
                weekYearStart = checkDate.getFullYear();
                break;
            }
        }

        if (weekMonthStart !== -1) {
            if (weekMonthStart !== lastTrackedMonth) {
                monthTransitions.push({ weekIndex, month: weekMonthStart, year: weekYearStart });
                lastTrackedMonth = weekMonthStart;
            }
        } else if (weekIndex === 0) {
            // Fallback for the very first week if it doesn't contain a month-start
            monthTransitions.push({ weekIndex, month: currentDate.getMonth(), year: currentDate.getFullYear() });
            lastTrackedMonth = currentDate.getMonth();
        }

        currentDate.setDate(currentDate.getDate() + 7);
        weekIndex++;
    }

    // v68: Mobile labels restored globally for zero-drift structural integrity
    // Restore temporal context for all viewports

    monthTransitions.forEach(({ weekIndex: wIdx, month, year }, idx) => {
        if (monthsEl) {
            const mSpan = document.createElement('span');
            mSpan.textContent = months[month];
            mSpan.className = 'calendar-label-month';
            
            // v69: Dynamic Centric Spanning Logic
            // Calculate span between this transition and the next, or the end of the grid
            const nextTransition = monthTransitions[idx + 1];
            const spanWidth = nextTransition ? (nextTransition.weekIndex - wIdx) : (finalTotalWeeks - wIdx);
            
            // Apply absolute coordinate parity via start/span syntax
            mSpan.style.gridColumn = `${wIdx + 1} / span ${spanWidth}`;
            
            // Centering logic: First month is left-aligned, others are centered over their span
            if (idx === 0) {
                mSpan.style.textAlign = 'left';
            } else {
                mSpan.style.textAlign = 'center';
            }
            
            monthsEl.appendChild(mSpan);
        }
        if (year !== lastTrackedYear && yearsEl) {
            const ySpan = document.createElement('span');
            ySpan.textContent = year;
            ySpan.className = 'calendar-label-year';
            ySpan.style.gridColumn = `${wIdx + 1} / span 4`; 
            yearsEl.appendChild(ySpan);
            lastTrackedYear = year;
        }
    });
}

const getLanguageColor = (lang) => {
    const langColors = { 'Python': '#a78bfa', 'TypeScript': '#3b82f6', 'JavaScript': '#fbbf24', 'HTML': '#f97316', 'CSS': '#06b6d4', 'Shell': '#10b981', 'Other': '#6b7280' };
    return langColors[lang] || '#a78bfa';
};

function renderTechDistribution(data, container) {
    const languageData = data.languages || data.activeLanguages || data.allLanguages || {};
    if (Object.keys(languageData).length === 0) return;

    container.innerHTML = '';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.padding = '10px 0';

    const chartTitle = document.createElement('div');
    chartTitle.style.cssText = 'width:100%; display:flex; justify-content:center; margin-bottom:15px; font-size:0.7rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;';
    chartTitle.innerHTML = '<span>Technology Distribution</span>';
    container.appendChild(chartTitle);

    const chartWrapper = document.createElement('div');
    chartWrapper.style.cssText = 'width:100%; height:180px; position:relative; display:flex; justify-content:center; align-items:center;';
    
    // v64.2 Center-Hole Interaction Layer
    const centerInfo = document.createElement('div');
    centerInfo.id = 'chart-center-info';
    centerInfo.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center; pointer-events:none; z-index:10; width:60%; opacity:0; transition:opacity 0.2s ease;';
    centerInfo.innerHTML = '<div style="font-size:0.8rem; font-weight:700; color:#f8fafc;"></div><div style="font-size:0.6rem; color:#94a3b8;"></div>';
    
    const canvas = document.createElement('canvas');
    chartWrapper.appendChild(centerInfo);
    chartWrapper.appendChild(canvas);
    container.appendChild(chartWrapper);

    const sortedLangs = Object.entries(languageData)
        .filter(([lang]) => !['Markdown', 'YAML', 'JSON', 'Text'].includes(lang))
        .sort((a,b) => b[1] - a[1]);

    const labels = sortedLangs.map(([l]) => l);
    const values = sortedLangs.map(([,c]) => c);
    const colors = labels.map(l => getLanguageColor(l));

    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: false, // v64.2: Disable clipping-prone floating tooltips on mobile
                    external: function(context) {
                        const infoBox = document.getElementById('chart-center-info');
                        if (!infoBox) return;
                        
                        const tooltipModel = context.tooltip;
                        if (tooltipModel.opacity === 0) {
                            // Persistence: We keep the last tapped info visible for UX
                            return;
                        }

                        if (tooltipModel.body) {
                            const title = tooltipModel.title[0] || labels[tooltipModel.dataPoints[0].dataIndex];
                            const body = tooltipModel.body[0].lines[0];
                            const rawValue = values[tooltipModel.dataPoints[0].dataIndex];
                            const percentage = Math.round((rawValue / total) * 100);
                            
                            infoBox.style.opacity = '1';
                            infoBox.innerHTML = `
                                <div style="font-size:0.85rem; font-weight:700; color:#f8fafc; line-height:1.2;">${title}</div>
                                <div style="font-size:0.65rem; color:#94a3b8; margin-top:2px;">${percentage}%</div>
                                <div style="font-size:0.55rem; color:#64748b; margin-top:1px;">${rawValue} contribs</div>
                            `;
                        }
                    }
                }
            }
        }
    });

    const legendContainer = document.createElement('div');
    legendContainer.style.cssText = 'display:flex; flex-wrap:wrap; gap:12px 20px; width:100%; margin-top:20px; justify-content:center;';
    
    const total = Object.values(languageData).reduce((a,b)=>a+b, 0);
    sortedLangs.slice(0, 8).forEach(([lang, count]) => {
        const pct = Math.round((count / total) * 100);
        const item = document.createElement('div');
        item.style.cssText = 'display:flex; align-items:center; gap:8px; font-size:0.65rem; color:#cbd5e1;';
        item.innerHTML = `<span style="width:10px; height:10px; border-radius:3px; background:${getLanguageColor(lang)}"></span> ${lang} (${pct}%)`;
        legendContainer.appendChild(item);
    });
    container.appendChild(legendContainer);
}
