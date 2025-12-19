#!/usr/bin/env python3
"""
Fetch all GitHub contributions (commits, issues, PRs, reviews) for 2025.
Updates data.json with comprehensive contribution data.
"""
import os
import json
import requests
from datetime import datetime, timedelta
from collections import defaultdict
from dotenv import load_dotenv

# Load .env file
load_dotenv()

GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
USERNAME = 'akashagl92'
YEAR = 2025

headers = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json'
}

def fetch_repos():
    """Fetch all repos for the user."""
    repos = []
    page = 1
    while True:
        url = f'https://api.github.com/users/{USERNAME}/repos?sort=pushed&per_page=100&page={page}'
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print(f"Error fetching repos: {response.status_code}")
            break
        data = response.json()
        if not data:
            break
        repos.extend(data)
        page += 1
    return repos

def fetch_commits(repo_name):
    """Fetch all commits for a repo in 2025."""
    commits = []
    page = 1
    since = f'{YEAR}-01-01T00:00:00Z'
    
    while True:
        url = f'https://api.github.com/repos/{USERNAME}/{repo_name}/commits?since={since}&per_page=100&page={page}'
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            break
        data = response.json()
        if not data or not isinstance(data, list):
            break
        for commit in data:
            if commit.get('commit', {}).get('author', {}).get('date', '').startswith(str(YEAR)):
                commits.append({
                    'date': commit['commit']['author']['date'],
                    'repo': repo_name,
                    'type': 'commit',
                    'message': commit['commit']['message'][:50]
                })
        page += 1
        if len(data) < 100:
            break
    return commits

def fetch_issues_and_prs():
    """Fetch issues and PRs created by user in 2025."""
    items = []
    
    # Fetch issues
    page = 1
    while True:
        url = f'https://api.github.com/search/issues?q=author:{USERNAME}+created:>={YEAR}-01-01&per_page=100&page={page}'
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            break
        data = response.json()
        for item in data.get('items', []):
            created = item.get('created_at', '')
            if created.startswith(str(YEAR)):
                items.append({
                    'date': created,
                    'repo': item.get('repository_url', '').split('/')[-1],
                    'type': 'pr' if 'pull_request' in item else 'issue',
                    'title': item.get('title', '')[:50]
                })
        if len(data.get('items', [])) < 100:
            break
        page += 1
    
    return items

def fetch_events():
    """Fetch user events (includes more activity types)."""
    events = []
    page = 1
    
    while page <= 10:  # GitHub limits to 300 events
        url = f'https://api.github.com/users/{USERNAME}/events?per_page=100&page={page}'
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            break
        data = response.json()
        if not data:
            break
        
        for event in data:
            created = event.get('created_at', '')
            if not created.startswith(str(YEAR)):
                continue
            
            event_type = event.get('type', '')
            repo = event.get('repo', {}).get('name', '').split('/')[-1]
            
            # Map event types to contribution types
            if event_type in ['PushEvent', 'CreateEvent', 'DeleteEvent']:
                continue  # Already captured via commits
            elif event_type == 'IssueCommentEvent':
                events.append({
                    'date': created,
                    'repo': repo,
                    'type': 'comment'
                })
            elif event_type == 'PullRequestReviewEvent':
                events.append({
                    'date': created,
                    'repo': repo,
                    'type': 'review'
                })
            elif event_type == 'PullRequestReviewCommentEvent':
                events.append({
                    'date': created,
                    'repo': repo,
                    'type': 'review_comment'
                })
        
        page += 1
    
    return events

def process_contributions(all_contributions):
    """Process contributions into the required data.json format."""
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    current_month = datetime.now().month - 1  # 0-indexed
    
    # Language mapping (from repo languages)
    lang_counts = defaultdict(int)
    monthly_data = []
    daily_data = []
    
    # Group by date
    by_date = defaultdict(list)
    for c in all_contributions:
        date_str = c['date'][:10]  # YYYY-MM-DD
        by_date[date_str].append(c)
    
    # Process each contribution
    repo_languages = {}  # Cache repo languages
    
    for c in all_contributions:
        date_obj = datetime.fromisoformat(c['date'].replace('Z', '+00:00'))
        date_str = date_obj.strftime('%a %b %d %Y')
        repo = c.get('repo', 'unknown')
        
        # Get language for repo (cache it)
        if repo not in repo_languages:
            url = f'https://api.github.com/repos/{USERNAME}/{repo}'
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                repo_languages[repo] = response.json().get('language', 'Other') or 'Other'
            else:
                repo_languages[repo] = 'Other'
        
        lang = repo_languages[repo]
        lang_counts[lang] += 1
        
        daily_data.append({
            'date': date_str,
            'repo': repo,
            'language': lang,
            'type': c.get('type', 'commit')
        })
    
    # Build monthly data
    for month_idx in range(current_month + 1):
        month_contributions = [c for c in all_contributions 
                               if datetime.fromisoformat(c['date'].replace('Z', '+00:00')).month == month_idx + 1]
        
        month_repos = set()
        month_languages = defaultdict(int)
        
        for c in month_contributions:
            repo = c.get('repo', 'unknown')
            month_repos.add(repo)
            lang = repo_languages.get(repo, 'Other')
            month_languages[lang] += 1
        
        # Get top 3 languages
        top_langs = ['Python', 'TypeScript', 'JavaScript']
        top_lang_counts = {lang: month_languages.get(lang, 0) for lang in top_langs}
        
        monthly_data.append({
            'name': months[month_idx],
            'count': len(month_contributions),
            'uniqueRepos': len(month_repos),
            'languages': dict(month_languages),
            'topLangCounts': top_lang_counts
        })
    
    # Get top languages overall
    sorted_langs = sorted(lang_counts.items(), key=lambda x: x[1], reverse=True)
    top_languages = [lang for lang, _ in sorted_langs[:3]]
    
    return {
        'monthly': monthly_data,
        'totalCommits': len(all_contributions),  # Keep name for backward compat
        'daily': daily_data,
        'topLanguages': top_languages,
        'allLanguages': dict(lang_counts)
    }

def main():
    print(f"Fetching GitHub contributions for {USERNAME} in {YEAR}...")
    
    all_contributions = []
    
    # Fetch repos
    print("Fetching repositories...")
    repos = fetch_repos()
    print(f"Found {len(repos)} repositories")
    
    # Fetch commits from each repo
    print("Fetching commits...")
    for i, repo in enumerate(repos):
        repo_name = repo['name']
        commits = fetch_commits(repo_name)
        all_contributions.extend(commits)
        if commits:
            print(f"  {repo_name}: {len(commits)} commits")
    
    # Fetch issues and PRs
    print("Fetching issues and PRs...")
    issues_prs = fetch_issues_and_prs()
    all_contributions.extend(issues_prs)
    print(f"  Found {len(issues_prs)} issues/PRs")
    
    # Fetch other events
    print("Fetching events (comments, reviews)...")
    events = fetch_events()
    all_contributions.extend(events)
    print(f"  Found {len(events)} other events")
    
    # Deduplicate by date+repo+type
    seen = set()
    unique_contributions = []
    for c in all_contributions:
        key = (c['date'][:10], c.get('repo', ''), c.get('type', 'commit'))
        if key not in seen:
            seen.add(key)
            unique_contributions.append(c)
    
    print(f"\nTotal unique contributions: {len(unique_contributions)}")
    
    # Process and save
    print("Processing data...")
    data = process_contributions(unique_contributions)
    
    # Save to data.json
    output_path = os.path.join(os.path.dirname(__file__), 'data.json')
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\nSaved to {output_path}")
    print(f"Total contributions: {data['totalCommits']}")
    print(f"Languages: {data['allLanguages']}")

if __name__ == '__main__':
    main()
