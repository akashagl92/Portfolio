#!/usr/bin/env python3
"""
Agentic Project Chronicler
--------------------------
Implements an "LLM Council" to automatically generate rich, fact-checked summaries 
for portfolio projects.

The Council:
1.  **The Engineer** (Analysis): Extracts tech stack, complexity, and key features.
2.  **The Recruiter** (Impact): Drafts a "STAR" (Situation-Task-Action-Result) summary.
3.  **The Chairman** (Synthesis): Reviews input, verifies against raw data, and produces the final output.

Usage:
    python scripts/agentic_chronicler.py [--dry-run] [--context <file>] [--output <file>]
"""

import json
import os
import hashlib
import requests
import time
import argparse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')

# Configuration
PROVIDERS = {
    "openrouter": {
        "url": "https://openrouter.ai/api/v1/chat/completions",
        "env_key": "OPENROUTER_API_KEY",
        "models": ["google/gemini-2.0-flash-exp:free", "meta-llama/llama-3.2-11b-vision-instruct:free"]
    },
    "gemini": {
        "url": "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        "env_key": "GEMINI_API_KEY",
        "models": ["gemini-2.5-flash"]
    },
    "groq": {
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "env_key": "GROQ_API_KEY",
        "models": ["llama-3.3-70b-versatile"]
    },
    "xai": {
        "url": "https://api.x.ai/v1/chat/completions",
        "env_key": "XAI_API_KEY",
        "models": ["grok-2-1212", "grok-beta"]
    }
}

DEFAULT_PROVIDER = "openrouter"

# Default Paths (relative to script location in scripts/)
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_PROJECT_DETAILS = os.path.join(ROOT_DIR, 'project-details.json')
DEFAULT_CACHE_PATH = os.path.join(os.path.dirname(__file__), 'summary_cache.json')

def get_file_hash(content):
    """Generate specific hash for content to detect changes."""
    return hashlib.md5(json.dumps(content, sort_keys=True).encode('utf-8')).hexdigest()

def call_llm(messages, temperature=0.7, provider="openrouter", json_mode=False):
    """Call LLM API based on selected provider."""
    config = PROVIDERS.get(provider)
    if not config:
        print(f"❌ Unknown provider: {provider}")
        return None

    api_key = os.getenv(config['env_key'])
    if not api_key:
        print(f"⚠️  {config['env_key']} not found. Skipping LLM call.")
        return None

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # OpenRouter specific headers
    if provider == "openrouter":
        headers["HTTP-Referer"] = "https://github.com/akashagl92/Portfolio-Fetch"
        headers["X-Title"] = "Portfolio Agentic Chronicler"

    # Try primary model then fallback
    models = config['models']
    
    for model in models:
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "top_p": 1,
            # "repetition_penalty": 1 # Not all providers support this
        }
        
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        
        # Gemini OpenAI compat ignores repetition_penalty usually, safest to omit unless needed
        if provider == "openrouter":
            payload["repetition_penalty"] = 1

        retries = 5
        base_delay = 10

        for attempt in range(retries):
            try:
                response = requests.post(config['url'], headers=headers, json=payload)
                
                if response.status_code == 429:
                    wait_time = base_delay * (2 ** attempt)
                    print(f"⏳ Rate limit hit. Waiting {wait_time}s...")
                    time.sleep(wait_time)
                    continue

                if response.status_code in [404, 400, 402]:
                     # Try next model if this one fails (except syntax errors)
                     # 402 = Payment Required (OpenRouter)
                     err_msg = response.text.lower()
                     print(f"⚠️  Model {model} failed ({response.status_code}): {err_msg[:100]}...")
                     break # Break inner loop to try next model
                    
                response.raise_for_status()
                data = response.json()
                
                if 'choices' in data and len(data['choices']) > 0:
                    return data['choices'][0]['message']['content']
                else:
                    print(f"❌ Unexpected API response: {data}")
                    return None
            
            except Exception as e:
                print(f"❌ Call Failed: {e}")
                time.sleep(1)
        
        print(f"⚠️  Falling back from {model}...")

    print("❌ All models failed.")
    return None

def run_council(project_name, readme, recent_commits, file_structure, job_context=None, provider="openrouter"):
    """Execute the Council workflow for a single project, optionally tailored to a job context."""
    
    print(f"  🤖 Convening Council for: {project_name}")
    
    context = f"""
    PROJECT: {project_name}
    
    FILES/STRUCTURE:
    {json.dumps(file_structure[:50], indent=2)}
    
    RECENT COMMITS:
    {json.dumps(recent_commits, indent=2)}
    
    README (Truncated):
    {readme[:4000] if readme else "No README available."}
    """
    
    job_context_str = f"\n\nJOB CONTEXT / TARGET AUDIENCE:\n{job_context}" if job_context else ""

    # --- Phase 1: The Engineer (Technical Analysis) ---
    print("    👨‍💻 Engineer analyzing...")
    engineer_prompt = [
        {"role": "system", "content": "You are a Senior Staff Engineer. Analyze the provided codebase context. Identify the core technology stack, validity of the code structure, and technical complexity. Be critical. Output a bulleted technical analysis."},
        {"role": "user", "content": context}
    ]
    technical_analysis = call_llm(engineer_prompt, temperature=0.3, provider=provider)
    if not technical_analysis and provider != 'groq':
        print("⚠️  Primary provider failed. Invoking Fallback (Groq 70B)...")
        technical_analysis = call_llm(engineer_prompt, temperature=0.3, provider='groq')
    if not technical_analysis: return None
    time.sleep(15)

    # --- Phase 2: The Recruiter (Impact Pitch) ---
    print("    💼 Recruiter drafting...")
    
    recruiter_system_content = """You are a Tech Recruiter at a FAANG company. Write a punchy, 2-3 sentence 'Elevator Pitch' for this project.
    
    Guidelines:
    1. **Focus on Uniqueness**: What makes this project impressive? (e.g., "Combines Music Theory with Physics engines").
    2. **Avoid "Status Updates"**: Do NOT list granular engineering tasks like "fixed bugs", "added features", "refactored code". Focus on the *capability* of the final product.
    3. **Start Strong**: "An interactive visualizer..." or "A production-grade pipeline...".
    4. **No Meta-Commentary**: Never say "This project...", "The repo...", or "Recent commits...".
    5. **Specific Constraints**:
       - 'stock_price_target_modelling': Strategy 'v4.0 Optimal'. Performance: **40.8% XIRR**. (Use this latest figure).
       - 'Music-and-Math': Focus on the intersection of audio physics and theory.
       - 'Google-Analytics': Focus on bypassing sampling limits for granular data without mentioning specific row counts.
    6. **No Absolute Currency Values**: Do NOT mention specific portfolio dollar amounts (e.g., "$135k").
    """
    if job_context:
        recruiter_system_content += "\n\nCRITICAL: You must tailor this summary to specifically appeal to the following JOB CONTEXT. Highlight skills, words, and themes from the job description that match this project."
    
    recruiter_prompt = [
        {"role": "system", "content": recruiter_system_content},
        {"role": "user", "content": context + job_context_str}
    ]
    impact_pitch = call_llm(recruiter_prompt, temperature=0.7, provider=provider)
    if not impact_pitch and provider != 'groq':
        print("⚠️  Primary provider failed. Invoking Fallback (Groq 70B)...")
        impact_pitch = call_llm(recruiter_prompt, temperature=0.7, provider='groq')
    if not impact_pitch: return None
    time.sleep(15)

    # --- Phase 3: The Chairman (Synthesis) ---
    print("    ⚖️  Chairman synthesizing...")
    chairman_prompt = [
        {"role": "system", "content": """You are the Chairman of the LLM Council. 
        Synthesize the Technical Analysis and Recruiter Pitch into a JSON object for a portfolio.
        
        CRITICAL RULES (STRICT ENFORCEMENT):
        1. **NO META-COMMENTARY**: DELETE phrases like "The project...", "This repo...", "Recent commits show...", "Codebase lacks...", "Complexity is uncertain...", "Akash Agrawal...".
        2. **NO ABSOLUTE CURRENCY VALUES**: Do NOT mention specific portfolio dollar amounts (e.g., "$135k", "$100,000"). Percentages (XIRR) are allowed.
        3. **Focus on Capability**: Describe what the software DOES, not what the code LOOKS like.
        4. 'summary': A polished, professional paragraph (max 80 words) combining technical depth and business impact.
        5. 'tags': A list of strictly 3-4 relevant technical tags.
        6. 'complexity': A score 1-10.
        
        Output ONLY raw JSON (no markdown formatting).
        {
            "ai_summary": "string",
            "ai_tags": ["tag1", "tag2", "tag3"],
            "complexity_score": 5
        }
        """},
        {"role": "user", "content": f"""
        RAW CONTEXT:
        {context}
        
        TECHNICAL ANALYSIS (The Engineer):
        {technical_analysis}
        
        IMPACT PITCH (The Recruiter):
        {impact_pitch}
        
        JOB CONTEXT (Tailor the output to this if present):
        {job_context_str}
        """}
    ]
    
    final_json_str = call_llm(chairman_prompt, temperature=0.1, provider=provider, json_mode=True)
    if not final_json_str and provider != 'groq':
        print("⚠️  Primary provider failed. Invoking Fallback (Groq 70B)...")
        final_json_str = call_llm(chairman_prompt, temperature=0.1, provider='groq', json_mode=True)
    
    if final_json_str:
        final_json_str = final_json_str.replace('```json', '').replace('```', '').strip()
        try:
            data = json.loads(final_json_str)
            
            # Post-Processing Regex Cleaning
            summary = data.get('ai_summary', '')
            import re
            patterns = [
                r"Recent commits.*", 
                r"The codebase contains.*",
                r"The codebase lacks.*",
                r"Akash Agrawal.*",
                r"Agrawal.*",
                r"structure is organized.*",
                r"complexity is uncertain.*",
                r"mentions of file-names.*",
                r"\(recent commits\).*",
                r"ongoing development.*",
                r"improvements in documentation.*",
                r"This project consists of.*",
                r"The project consists of.*",
                r"This project integrates.*" # Maybe too aggressive? No, we want "Integrates X, Y, Z..." not "This project integrates..."
            ]
            # Replace start-of-sentence filler
            summary = re.sub(r"^(The project|This project|The codebase) ", "", summary, flags=re.IGNORECASE)
            
            for p in patterns:
                summary = re.sub(p, "", summary, flags=re.IGNORECASE)
            
            # Capitalize first letter if needed
            summary = summary.strip()
            if summary and summary[0].islower():
                summary = summary[0].upper() + summary[1:]

            data['ai_summary'] = summary
            return data
            
        except json.JSONDecodeError:
            print(f"❌ Failed to parse Chairman output: {final_json_str[:100]}...")
            return None
    return None

def main():
    parser = argparse.ArgumentParser(description="Agentic Project Chronicler")
    parser.add_argument('--input', help="Path to input JSON file (defaults to project-details.json)")
    parser.add_argument('--context', help="Path to Job Description context file (markdown)")
    parser.add_argument('--output', help="Path to output JSON file (defaults to updating project-details.json)")
    parser.add_argument('--provider', choices=['openrouter', 'gemini', 'groq', 'xai'], default='openrouter', help="LLM Provider")
    parser.add_argument('--force', action='store_true', help="Force regenerate summaries (ignore cache and existing)")
    parser.add_argument('--project', help="Run only for a specific project name")
    parser.add_argument('--dry-run', action='store_true', help="Don't save changes")
    args = parser.parse_args()

    print(f"📜 Starting Agentic Project Chronicler (Provider: {args.provider}) {'[FORCE NODE]' if args.force else ''}...")
    
    # Paths
    project_details_path = args.input if args.input else DEFAULT_PROJECT_DETAILS
    cache_path = DEFAULT_CACHE_PATH
    output_path = args.output if args.output else DEFAULT_PROJECT_DETAILS
    job_context = None

    # Load Context
    if args.context:
        print(f"🎯 Loading Job Context from: {args.context}")
        try:
            with open(args.context, 'r') as f:
                job_context = f.read()
        except FileNotFoundError:
            print(f"❌ Context file not found: {args.context}")
            return

    # Load Data
    try:
        with open(project_details_path, 'r') as f:
            projects = json.load(f)
    except FileNotFoundError:
        print(f"❌ {project_details_path} not found. Run fetch-project-details.js first.")
        return

    # Load Cache
    cache = {}
    if os.path.exists(cache_path):
        with open(cache_path, 'r') as f:
            cache = json.load(f)
    
    projects_modified = False
    updated_count = 0
    
    for project in projects:
        name = project.get('name')
        
        # Filter by specific project if requested
        if args.project and name != args.project:
            continue

        readme = project.get('readme', '') or ''
        commits = project.get('recentCommits', [])
        files = project.get('files', [])
        
        content_signature = get_file_hash({
            'readme': readme,
            'commits': commits,
            'files': [f['name'] for f in files]
        })

        # Skip if already has AI summary (Preserve expensive Llama generations) - UNLESS FORCED
        if project.get('ai_summary') and not args.force:
             print(f"  ✨ Skipping {name} (AI Summary exists)")
             continue
        
        # Check Cache (ONLY if no context is provided and NOT forced)
        if not args.force and not job_context and name in cache and cache[name].get('hash') == content_signature:
            print(f"  ⏭️  Skipping {name} (Unchanged)")
            cached_data = cache[name]['data']
            
            ai_summary = cached_data.get('ai_summary') or cached_data.get('summary')
            ai_tags = cached_data.get('ai_tags') or cached_data.get('tags')
            complexity = cached_data.get('complexity_score') or cached_data.get('complexity')
            
            if ai_summary:
                project['ai_summary'] = ai_summary
                project['ai_tags'] = ai_tags
                project['complexity_score'] = complexity
                projects_modified = True
            continue
            
        # Run Council
        result = run_council(name, readme, commits, files, job_context, provider=args.provider)
        
        if result:
            project['ai_summary'] = result.get('ai_summary') or result.get('summary')
            project['ai_tags'] = result.get('ai_tags') or result.get('tags')
            project['complexity_score'] = result.get('complexity_score') or result.get('complexity')
            
            if not job_context:
                cache[name] = {
                    'hash': content_signature,
                    'data': {
                        'ai_summary': project['ai_summary'],
                        'ai_tags': project['ai_tags'],
                        'complexity_score': project['complexity_score']
                    },
                    'last_updated': time.time()
                }
                updated_count += 1
            
            projects_modified = True
            projects_modified = True
            print("  ⏳ Cooling down for 30s (Rate Limit Safety)...")
            time.sleep(30)
    
    # Save Updates
    if not args.dry_run and projects_modified:
        print(f"\n💾 Saving updates to {output_path}...")
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump(projects, f, indent=2)
            
    if not args.dry_run and updated_count > 0:
        print(f"💾 Saving {updated_count} new entries to cache...")
        with open(cache_path, 'w') as f:
            json.dump(cache, f, indent=2)

if __name__ == '__main__':
    main()
