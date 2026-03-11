const fs = require('fs');
const path = require('path');

const rootAppPath = path.join(__dirname, '..', 'app.js');
const rootAppContent = fs.readFileSync(rootAppPath, 'utf8');

const startMarker = "const heroCalendarGrid = document.getElementById('hero-calendar-grid');";
// The end of the updateCharts function is denoted by `    }\n\n}\n` in the root app.js
const endMarker = "    }\n\n}\n";

const startIndex = rootAppContent.indexOf(startMarker);
const endIndex = rootAppContent.indexOf(endMarker, startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find start or end block in root app.js");
    process.exit(1);
}

// Add the end marker length to get the full block
const newCalendarLogic = rootAppContent.substring(startIndex, endIndex);

const targetDirectories = [
    'abnormal', 'airbnb', 'airbnb/aircover', 'ambience', 'circle', 'consensys',
    'cresta', 'ey', 'fedex', 'fetch', 'happymoney', 'kraken', 'quince',
    'reku', 'scopely', 'stellantis', 'torq', 'viant'
];

targetDirectories.forEach(dir => {
    const targetAppPath = path.join(__dirname, '..', dir, 'app.js');
    if (!fs.existsSync(targetAppPath)) return;

    let targetAppContent = fs.readFileSync(targetAppPath, 'utf8');

    const targetStartIndex = targetAppContent.indexOf(startMarker);
    if (targetStartIndex === -1) {
        console.warn(`Could not find start marker in ${dir}/app.js`);
        return;
    }

    // In the old files, the block ends with somewhat similar syntax, typically the end of `updateCharts`.
    // Searching for the end is tricky because `heroCalendarYears` didn't exist in old ones.
    // The old ones ended with:
    //             heroCalendarMonths.style.width = `${heroCalendarGrid.offsetWidth}px`;
    //         }
    //     }
    // }

    // We can rely on the very last `}\n\n}\n` or `    }\n\n}\n`
    const targetEndIndex = targetAppContent.indexOf("    }\n\n}\n", targetStartIndex);

    if (targetEndIndex === -1) {
        console.warn(`Could not find end of updateCharts in ${dir}/app.js`);
        return;
    }

    const updatedContent = targetAppContent.substring(0, targetStartIndex) +
        newCalendarLogic +
        targetAppContent.substring(targetEndIndex);

    fs.writeFileSync(targetAppPath, updatedContent, 'utf8');
    console.log(`Updated calendar logic in ${dir}/app.js`);
});
