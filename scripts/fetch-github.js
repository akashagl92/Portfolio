/**
 * GitHub Data Fetcher Script
 * 
 * This script fetches your GitHub activity (including private repos) 
 * and saves aggregated stats to data.json.
 * 
 * USAGE: Run this locally or in GitHub Actions with GITHUB_TOKEN set.
 * Example: GITHUB_TOKEN=your_pat node scripts/fetch-github.js
 */

const fs = require('fs');
const path = require('path');

const GITHUB_USERNAME = 'akashagl92';
const OUTPUT_PATH = path.join(__dirname, '..', 'data.json');

async function fetchWithAuth(url) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.warn('No GITHUB_TOKEN found. Private repos will not be visible.');
    }

    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-Fetch-Script'
    };

    if (token) {
        headers['Authorization'] = `token ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

async function fetchAllData() {
    console.log('Fetching repositories...');

    const token = process.env.GITHUB_TOKEN;

    // Use authenticated endpoint if token available, otherwise public endpoint
    const repoUrl = token
        ? `https://api.github.com/user/repos?sort=pushed&per_page=100&affiliation=owner`
        : `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=100`;

    let allRepos = [];
    let page = 1;
    while (true) {
        const repos = await fetchWithAuth(`${repoUrl}&page=${page}`);
        if (repos.length === 0) break;
        allRepos = allRepos.concat(repos);
        page++;
        if (page > 10) break; // Safety limit
    }

    console.log(`Found ${allRepos.length} repositories`);

    // Fetch commits for 2025
    const startDate = '2025-01-01T00:00:00Z';
    const allCommits = [];
    const languageStats = {};

    for (const repo of allRepos) {
        try {
            const commits = await fetchWithAuth(
                `https://api.github.com/repos/${repo.full_name}/commits?since=${startDate}&per_page=100`
            );

            if (Array.isArray(commits)) {
                for (const commit of commits) {
                    allCommits.push({
                        date: commit.commit.author.date,
                        repo: repo.name,
                        language: repo.language || 'Other'
                    });
                }
            }

            // Track language distribution
            if (repo.language) {
                languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
            }
        } catch (err) {
            console.warn(`Failed to fetch commits for ${repo.name}: ${err.message}`);
        }
    }

    console.log(`Found ${allCommits.length} commits in 2025`);

    // Process into monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    // Count commits by language across all commits
    const allLanguages = {};
    allCommits.forEach(c => {
        allLanguages[c.language] = (allLanguages[c.language] || 0) + 1;
    });

    const topLanguages = Object.entries(allLanguages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(e => e[0]);

    const monthly = months.slice(0, currentMonth + 1).map((name, i) => {
        const monthCommits = allCommits.filter(c => new Date(c.date).getMonth() === i);
        const repos = new Set(monthCommits.map(c => c.repo));

        const languages = {};
        monthCommits.forEach(c => {
            languages[c.language] = (languages[c.language] || 0) + 1;
        });

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

    // Build daily activity for heatmap (with repo and language info)
    const daily = allCommits.map(c => ({
        date: new Date(c.date).toDateString(),
        repo: c.repo,
        language: c.language
    }));

    const result = {
        monthly,
        totalCommits: allCommits.length,
        daily,
        topLanguages,
        allLanguages,
        lastUpdated: new Date().toISOString()
    };

    return result;
}

async function main() {
    try {
        const data = await fetchAllData();

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2));
        console.log(`Data saved to ${OUTPUT_PATH}`);
        console.log(`Total commits: ${data.totalCommits}`);
        console.log(`Top languages: ${data.topLanguages.join(', ')}`);
    } catch (error) {
        console.error('Failed to fetch data:', error);
        process.exit(1);
    }
}

main();
