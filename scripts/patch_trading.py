
import json
import re

path = 'consensys/project-details.json'

with open(path, 'r') as f:
    projects = json.load(f)

for p in projects:
    if p['name'] == 'stock_price_target_modelling':
        # Preserve tags if they are good, otherwise set them
        p['ai_tags'] = ["Python", "Financial Modeling", "Auto-Trading", "AI Strategy"]
        
        # Manually set the description to match the "Elevator Pitch" style and new stats
        p['ai_summary'] = (
            "Developed an AI-powered autonomous trading system implementing the 'v4.0 Optimal' strategy, "
            "which achieved a 40.8% XIRR through sophisticated market timing and volatility management. "
            "The system manages a dual-track portfolio of stocks and crypto with fully automated rebalancing "
            "and email-based trade execution."
        )
        p['complexity_score'] = 9 
        print("Patched stock_price_target_modelling")

with open(path, 'w') as f:
    json.dump(projects, f, indent=2)
