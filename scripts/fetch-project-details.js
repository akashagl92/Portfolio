/**
 * GitHub Project Details Fetcher
 * 
 * Fetches detailed information about all your repositories including:
 * - README content
 * - File structure
 * - Languages used
 * - Recent commits with messages
 * 
 * USAGE: node scripts/fetch-project-details.js
 * (Requires .env file with GITHUB_TOKEN)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');

const GITHUB_USERNAME = 'akashagl92';
const OUTPUT_PATH = path.join(__dirname, '..', 'project-details.json');

async function fetchWithAuth(url) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.error('ERROR: GITHUB_TOKEN environment variable is required');
        console.error('Usage: GITHUB_TOKEN=your_pat node scripts/fetch-project-details.js');
        process.exit(1);
    }

    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-Fetch-Script',
        'Authorization': `token ${token}`
    };

    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

async function fetchReadme(repoFullName) {
    try {
        const url = `https://api.github.com/repos/${repoFullName}/readme`;
        const data = await fetchWithAuth(url);
        // README content is base64 encoded
        return Buffer.from(data.content, 'base64').toString('utf-8');
    } catch (err) {
        return null;
    }
}

async function fetchRepoFiles(repoFullName) {
    try {
        const url = `https://api.github.com/repos/${repoFullName}/contents`;
        const files = await fetchWithAuth(url);
        return files.map(f => ({ name: f.name, type: f.type, path: f.path }));
    } catch (err) {
        return [];
    }
}

async function fetchRecentCommits(repoFullName, limit = 10) {
    try {
        const url = `https://api.github.com/repos/${repoFullName}/commits?per_page=${limit}`;
        const commits = await fetchWithAuth(url);
        return commits.map(c => ({
            date: c.commit.author.date,
            message: c.commit.message.split('\n')[0], // First line only
            author: c.commit.author.name
        }));
    } catch (err) {
        return [];
    }
}

async function fetchLanguages(repoFullName) {
    try {
        const url = `https://api.github.com/repos/${repoFullName}/languages`;
        return await fetchWithAuth(url);
    } catch (err) {
        return {};
    }
}

async function fetchAllProjects() {
    console.log('Fetching all repositories...');

    // Fetch all repos (including private)
    const repoUrl = `https://api.github.com/user/repos?sort=pushed&per_page=100&affiliation=owner`;
    let allRepos = [];
    let page = 1;

    while (true) {
        const repos = await fetchWithAuth(`${repoUrl}&page=${page}`);
        if (repos.length === 0) break;
        allRepos = allRepos.concat(repos);
        page++;
        if (page > 5) break; // Safety limit
    }

    console.log(`Found ${allRepos.length} repositories`);

    const projectDetails = [];

    for (const repo of allRepos) {
        console.log(`Processing: ${repo.name}...`);

        const [readme, files, commits, languages] = await Promise.all([
            fetchReadme(repo.full_name),
            fetchRepoFiles(repo.full_name),
            fetchRecentCommits(repo.full_name, 15),
            fetchLanguages(repo.full_name)
        ]);

        projectDetails.push({
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            url: repo.html_url,
            homepage: repo.homepage,
            isPrivate: repo.private,
            language: repo.language,
            languages: languages,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            createdAt: repo.created_at,
            updatedAt: repo.updated_at,
            pushedAt: repo.pushed_at,
            topics: repo.topics || [],
            readme: readme,
            files: files,
            recentCommits: commits
        });
    }

    return projectDetails;
}

async function main() {
    try {
        const projects = await fetchAllProjects();

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(projects, null, 2));
        console.log(`\n✅ Project details saved to ${OUTPUT_PATH}`);
        console.log(`\nFetched details for ${projects.length} projects:`);
        projects.forEach(p => {
            console.log(`  - ${p.name} (${p.isPrivate ? 'private' : 'public'}) - ${p.language || 'unknown'}`);
        });
    } catch (error) {
        console.error('Failed to fetch project details:', error);
        process.exit(1);
    }
}

main();
