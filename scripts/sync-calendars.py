import glob
import re

with open('index.html', 'r') as f:
    root_html = f.read()

# Safe extraction of hero-calendar from index.html
start_idx = root_html.find('<div class="hero-calendar">')
if start_idx == -1:
    print("Cannot find hero-calendar in index.html")
    exit(1)

# Extract precisely the hero-calendar block from index.html up to the Inline Tech Distribution marker
end_marker = '<!-- Inline Tech Distribution -->'
end_idx = root_html.find(end_marker, start_idx)
if end_idx == -1:
    print("Cannot find end marker in index.html")
    exit(1)

new_cal = root_html[start_idx : end_idx]

# Also extract the old structure from e.g. alivo/index.html to see what to replace
files = glob.glob('*/index.html')
for file in files:
    with open(file, 'r') as f:
        html = f.read()

    # Create a regex to replace the old hero-calendar
    # It might be the new structure already (since we ran it and corrupted it) or the old structure.
    # So we'll find <div class="hero-calendar"> and just replace until we hit <!-- Inline Tech Distribution -->
    # which is strictly adjacent in all files.
    
    # Safe regex targeted replacement: from <div class="hero-calendar"> up to the spacing before <!-- Inline Tech Distribution -->
    html_new = re.sub(r'<div class="hero-calendar">.*?(\s*<!-- Inline Tech Distribution -->)', new_cal + r'\1', html, flags=re.DOTALL)
    
    if html_new != html:
        with open(file, 'w') as f:
            f.write(html_new)
        print(f"Updated {file}")
    else:
        print(f"No changes made to {file} despite finding header")
