const fs = require('fs');
const path = require('path');

const rootAppPath = path.join(__dirname, '..', 'app.js');
const rootAppContent = fs.readFileSync(rootAppPath, 'utf8');

// Extract the entire updateCharts function
const startMarker = "function updateCharts(data) {";
// We need to find the matching closing brace for this function.
// Since it's a large function, let's find the last occurrence of a closing brace before EOF
// or better, just use a known end marker.
// In root/app.js, updateCharts is the last function.
const endIndexRoot = rootAppContent.lastIndexOf("}");

if (rootAppContent.indexOf(startMarker) === -1) {
    console.error("Could not find start of updateCharts in root app.js");
    process.exit(1);
}

const updateChartsContent = rootAppContent.substring(rootAppContent.indexOf(startMarker), endIndexRoot + 1);

const targetDirectories = [
    'abnormal', 'airbnb', 'airbnb/aircover', 'ambience', 'circle', 'consensys',
    'cresta', 'ey', 'fedex', 'fetch', 'happymoney', 'kraken', 'quince',
    'reku', 'scopely', 'stellantis', 'torq', 'viant'
];

targetDirectories.forEach(dir => {
    const targetAppPath = path.join(__dirname, '..', dir, 'app.js');
    if (!fs.existsSync(targetAppPath)) return;

    let targetAppContent = fs.readFileSync(targetAppPath, 'utf8');

    const targetStartIndex = targetAppContent.indexOf("function updateCharts(data) {");
    if (targetStartIndex === -1) {
        console.warn(`Could not find updateCharts in ${dir}/app.js`);
        return;
    }

    // Find the end of updateCharts in target. 
    // It's usually the end of the file or there's some closing braces.
    const targetEndIndex = targetAppContent.lastIndexOf("}");

    if (targetEndIndex === -1) {
        console.warn(`Could not find closing brace in ${dir}/app.js`);
        return;
    }

    const updatedContent = targetAppContent.substring(0, targetStartIndex) +
        updateChartsContent +
        targetAppContent.substring(targetEndIndex + 1);

    fs.writeFileSync(targetAppPath, updatedContent, 'utf8');
    console.log(`Successfully synced entire updateCharts function to ${dir}/app.js`);
});
