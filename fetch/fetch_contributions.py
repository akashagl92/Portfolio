#!/usr/bin/env python3
"""
Fetch ALL GitHub contributions (including private repos) using REST API.
Uses the Languages API to get full language breakdown per repository.
Assigns each commit a language proportionally based on repo composition.
"""
import os
import json
import random
import requests
from datetime import datetime, timedelta
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv('GITHUB_TOKEN')
USERNAME = 'akashagl92'

def get_repo_languages(repo_name, headers):
    """Get the language breakdown for a repository (bytes per language)."""
    response = requests.get(
        f'https://api.github.com/repos/{USERNAME}/{repo_name}/languages',
        headers=headers
    )
    if response.status_code == 200:
        return response.json()  # {'Python': 50000, 'HTML': 5000, ...}
    return {}

def weighted_language_choice(languages_bytes):
    """Choose a language based on weighted probability from byte counts."""
    if not languages_bytes:
        return 'Other'
    
    total_bytes = sum(languages_bytes.values())
    if total_bytes == 0:
        return 'Other'
    
    # Create weighted choices
    rand = random.random() * total_bytes
    cumulative = 0
    for lang, bytes_count in languages_bytes.items():
        cumulative += bytes_count
        if rand <= cumulative:
            return lang
    
    return list(languages_bytes.keys())[0]

def get_all_commits(repo_full_name, headers):
    """Get all commits from a repo in 2025, handling pagination."""
    all_commits = []
    page = 1
    
    while True:
        response = requests.get(
            f'https://api.github.com/repos/{repo_full_name}/commits',
            headers=headers,
            params={
                'since': '2025-01-01T00:00:00Z',
                'author': USERNAME,
                'per_page': 100,
                'page': page
            }
        )
        
        if response.status_code != 200:
            break
            
        commits = response.json()
        if not commits:
            break
            
        all_commits.extend(commits)
        
        # Check if there are more pages
        if len(commits) < 100:
            break
        page += 1
    
    return all_commits

def get_user_activity(repo_full_name, headers):
    """Get PRs and Issues created by user in 2025."""
    activity = []
    
    # 1. Get Issues (which includes PRs in the API, but we filter)
    page = 1
    while True:
        response = requests.get(
            f'https://api.github.com/repos/{repo_full_name}/issues',
            headers=headers,
            params={
                'creator': USERNAME,
                'state': 'all',
                'since': '2025-01-01T00:00:00Z',
                'per_page': 100,
                'page': page
            }
        )
        if response.status_code != 200: break
        
        items = response.json()
        if not items: break
        
        for item in items:
            # Check if strictly 2025+ (API 'since' includes updates, we want creation)
            if item['created_at'] < '2025-01-01T00:00:00Z':
                continue
                
            activity.append({
                'type': 'pr' if 'pull_request' in item else 'issue',
                'date': item['created_at'][:10],
                'repo': repo_full_name
            })
            
        if len(items) < 100: break
        page += 1
        
    return activity

def get_all_repos(headers):
    """Get all repositories, handling pagination."""
    all_repos = []
    page = 1
    
    while True:
        response = requests.get(
            'https://api.github.com/user/repos',
            headers=headers,
            params={
                'per_page': 100, 
                'page': page,
                'affiliation': 'owner,collaborator,organization_member'
            }
        )
        
        if response.status_code != 200:
            print(f"Error fetching repos: {response.status_code}")
            break
            
        repos = response.json()
        if not repos:
            break
            
        all_repos.extend(repos)
        
        if len(repos) < 100:
            break
        page += 1
    
    return all_repos

def main():
    if not TOKEN:
        print("Error: GITHUB_TOKEN not found in .env file")
        return
    
    headers = {'Authorization': f'token {TOKEN}'}
    
    # Get all repos owned by user
    repos = get_all_repos(headers)
    
    print(f'Fetching commits from {len(repos)} repos for 2025+...')
    print()
    
    language_commits = defaultdict(int)
    monthly_commits = defaultdict(lambda: defaultdict(int))
    daily_commits = []
    repo_data = []
    
    # Configuration for filtering/renaming in visual grid
    EXCLUDED_REPOS = {'marketing-analytics-assistant', 'linkedin-api', 'marketing-analytics-assistant1'} 
    EXCLUDED_KEYWORDS = ['databricks']
    REPO_RENAMES = {'aistro.ai': 'AI Astrology'}

    for repo in repos:
        name = repo['name']
        is_private = repo['private']
        
        # Determine if this repo should be HIDDEN from the daily grid
        # Case-insensitive keyword check
        name_lower = name.lower()
        is_excluded = (name_lower in EXCLUDED_REPOS) or any(k in name_lower for k in EXCLUDED_KEYWORDS)
        
        # Determine display name
        display_name = REPO_RENAMES.get(name, name)
        
        # Get full language breakdown for this repo
        repo_languages = get_repo_languages(name, headers)
        primary_lang = repo.get('language') or 'Other'
        
        commits = get_all_commits(repo['full_name'], headers)
        other_activity = get_user_activity(repo['full_name'], headers)
        
        # Total count = Commits + PRs + Issues
        count = len(commits) + len(other_activity)
        
        if count > 0:
            visibility = 'PRIVATE' if is_private else 'PUBLIC'
            
            # Show language breakdown for this repo
            if repo_languages:
                total_bytes = sum(repo_languages.values())
                lang_pcts = {k: f"{(v/total_bytes)*100:.1f}%" for k, v in repo_languages.items()}
                print(f'  [{visibility:7}] {display_name:35} {count:3} commits')
                print(f'            Languages: {lang_pcts}')
            else:
                print(f'  [{visibility:7}] {display_name:35} {count:3} commits ({primary_lang})')
            
            # Still count towards total stats, even if excluded from grid
            repo_data.append((name, count, primary_lang, visibility))
            
            # Process Commits
            for commit in commits:
                if repo_languages:
                    lang = weighted_language_choice(repo_languages)
                else:
                    lang = primary_lang
                
                language_commits[lang] += 1
                
                commit_date_str = commit['commit']['author']['date']
                # GitHub gives UTC: 2025-03-02T01:53:47Z
                # Convert to datetime and then shift to Central (UTC-6 or UTC-5)
                # For simplicity and no dependencies, we'll manually shift UTC-6 
                # (Central Standard Time is UTC-6, Central Dayight is UTC-5)
                # Since this is for a visual grid, a 6-hour shift is usually sufficient 
                # to keep late-night commits on the correct local day.
                
                dt_utc = datetime.strptime(commit_date_str, '%Y-%m-%dT%H:%M:%SZ')
                # Shift by -6 hours for Central Time approx
                dt_central = dt_utc - timedelta(hours=6)
                
                month_idx = dt_central.month - 1
                
                monthly_commits[month_idx][lang] += 1
                
                # Only add to visual grid if NOT excluded
                if not is_excluded:
                    formatted_date = dt_central.strftime('%a %b %d %Y')
                    daily_commits.append({
                        'date': formatted_date,
                        'repo': display_name,
                        'language': lang,
                        'type': 'commit'
                    })

            # Process PRs and Issues
            for act in other_activity:
                # Assign language of the repo to the activity
                if repo_languages:
                    lang = weighted_language_choice(repo_languages)
                else:
                    lang = primary_lang
                
                # We count language usage for activity too? 
                # GitHub generally attributes PRs to languages. Let's do it.
                language_commits[lang] += 1
                
                # assume act['date'] is already just YYYY-MM-DD from line 111
                # but for consistency with commits, let's treat it as a point in time if possible
                # or just use it as is if it's already localized by the API query (since: ...)
                # Actually line 111 does item['created_at'][:10]. Let's make that better too.
                
                date_obj = datetime.strptime(act['date'], '%Y-%m-%d')
                month_idx = date_obj.month - 1
                monthly_commits[month_idx][lang] += 1
                
                # Only add to visual grid if NOT excluded
                if not is_excluded:
                    formatted_date = date_obj.strftime('%a %b %d %Y')
                    daily_commits.append({
                        'date': formatted_date,
                        'repo': display_name,
                        'language': lang,
                        'type': act['type']
                    })
    
    total_commits = sum(c for _, c, _, _ in repo_data)
    print()
    print(f'Total commits in 2025+: {total_commits}')
    print()
    print('Language breakdown (distributed by repo composition):')
    for lang, count in sorted(language_commits.items(), key=lambda x: -x[1]):
        pct = (count / total_commits) * 100 if total_commits > 0 else 0
        print(f'  {lang}: {count} ({pct:.1f}%)')
    
    # Build monthly array
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    monthly = []
    
    for i, name in enumerate(month_names):
        month_data = monthly_commits.get(i, {})
        count = sum(month_data.values())
        
        monthly.append({
            'name': name,
            'count': count,
            'uniqueRepos': len(set(d['repo'] for d in daily_commits if datetime.strptime(d['date'], '%a %b %d %Y').month == i + 1)),
            'languages': dict(language_commits),
            'topLangCounts': dict(month_data)
        })
    
    # Build final data structure
    result = {
        'monthly': monthly,
        'totalCommits': total_commits,
        'uniqueReposTotal': len(repo_data),
        'daily': daily_commits,
        'languages': dict(language_commits)
    }
    
    # Save to data.json
    output_path = os.path.join(os.path.dirname(__file__), 'data.json')
    with open(output_path, 'w') as f:
        json.dump(result, f, indent=2)
    
    print()
    print(f'Saved to {output_path}')
    print(f'Total commits: {total_commits}')
    print(f'Languages: {dict(language_commits)}')

if __name__ == '__main__':
    main()

