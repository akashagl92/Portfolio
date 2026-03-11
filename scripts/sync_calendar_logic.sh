#!/bin/bash

# Target files
TARGETS=(abnormal/app.js airbnb/app.js airbnb/aircover/app.js ambience/app.js consensys/app.js cresta/app.js circle/app.js ey/app.js fetch/app.js fedex/app.js happymoney/app.js kraken/app.js quince/app.js root/app.js reku/app.js scopely/app.js stellantis/app.js torq/app.js viant/app.js)

for file in "${TARGETS[@]}"; do
    if [ -f "$file" ]; then
        echo "Syncing calendar logic in $file..."
        
        # 1. Update the tooltip variable extraction block
        sed -i '' 's/const tooltip = document.getElementById('\''calendar-tooltip'\'');/const heroCalendarYears = document.getElementById('\''hero-calendar-years'\'');\
    const tooltip = document.getElementById('\''calendar-tooltip'\'');/' "$file"
        
        # 2. Update the initial grid clearing
        sed -i '' 's/if (heroCalendarGrid) {/if (heroCalendarGrid) {\
        heroCalendarGrid.innerHTML = '\'''\'';\
        if (heroCalendarMonths) heroCalendarMonths.innerHTML = '\'''\'';\
        if (heroCalendarYears) heroCalendarYears.innerHTML = '\'''\'';/' "$file"
        
        # 3. Replace the entire calendar rendering block (from startDate to end of if (heroCalendarGrid))
        # Note: Doing this via sed is error-prone, so we'll slice and dice using standard unix tools or awk/perl if needed.
        # Given the complexity of the replace, we will write a small node script to perform AST-based or regex-based precise replacement.
    fi
done
