const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ROOT_HTML = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

const startMarker = '<div class="innovation-grid">';
const endMarker = '            <div class="section-cta">';

// Find the start and end of innovation grid in root
const rootStartIndex = ROOT_HTML.indexOf(startMarker);
const rootEndIndex = ROOT_HTML.indexOf(endMarker, rootStartIndex);

if (rootStartIndex === -1 || rootEndIndex === -1) {
    console.error("Could not find grid markers in root index.html");
    process.exit(1);
}

const gridBlock = ROOT_HTML.substring(rootStartIndex, rootEndIndex);

// Walk all subdirectories
function walkFiles(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory() &&
            file.name !== 'node_modules' &&
            !file.name.startsWith('.') &&
            file.name !== 'scripts' &&
            file.name !== 'fetch' &&
            file.name !== 'core' &&
            file.name !== 'portable-pai-core') {

            const indexFile = path.join(fullPath, 'index.html');
            if (fs.existsSync(indexFile)) {
                let content = fs.readFileSync(indexFile, 'utf8');
                const startIdx = content.indexOf(startMarker);
                const endIdx = content.indexOf(endMarker, startIdx);

                if (startIdx !== -1 && endIdx !== -1) {
                    content = content.substring(0, startIdx) + gridBlock + content.substring(endIdx);
                    fs.writeFileSync(indexFile, content);
                    console.log(`Synced ${file.name}/index.html`);
                } else {
                    console.warn(`Markers not found in ${file.name}/index.html`);
                }
            }
        }
    }
}

console.log('Starting grid synchronization...');
walkFiles(ROOT_DIR);
console.log('Synchronization complete.');
