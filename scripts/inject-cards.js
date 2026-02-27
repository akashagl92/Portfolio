const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CARD_HTML = `
                <!-- Project: Multi-Agent Coordination - SYSTEM 1/SYSTEM 2 -->
                <div class="project-card glass-card personal featured">
                    <div class="project-tags">
                        <span class="highlight-tag">Orchestration</span>
                        <span>Multi-Agent</span>
                        <span>Internal GTM</span>
                    </div>
                    <h3>Multi-Agent Coordination</h3>
                    <p>Persona-level sub-agent coordination for complex internal GTM delivery. This portfolio page
                        itself was a test-case for this architecture.</p>
                    <div class="project-highlights">
                        <ul>
                            <li><strong>System 1/System 2</strong>: Synchronized agentic reasoning layers.</li>
                            <li><strong>Sub-agent Coordination</strong>: Specialized personas for GTM delivery.</li>
                            <li><strong>Real-time Adaptation</strong>: Dynamic task boundaries across agents.</li>
                        </ul>
                    </div>
                    <div class="project-meta">
                        <span>Agentic Orchestration</span>
                        <span>GTM Efficiency</span>
                    </div>
                </div>`;

function injectCard(filePath) {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if already injected
    if (content.includes('Multi-Agent Coordination')) {
        console.log(`Skipping ${filePath} (already exists)`);
        return;
    }

    // Find <div class="innovation-grid">
    const gridMatch = content.match(/<div class="innovation-grid">/);
    if (!gridMatch) {
        console.warn(`Grid container not found in ${filePath}`);
        return;
    }

    const insertIndex = gridMatch.index + gridMatch[0].length;
    const newContent = content.slice(0, insertIndex) + CARD_HTML + content.slice(insertIndex);

    fs.writeFileSync(filePath, newContent);
    console.log(`Successfully injected card into ${filePath}`);
}

// Find all index.html files
function walkFiles(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            if (file.name !== 'node_modules' && !file.name.startsWith('.')) {
                walkFiles(fullPath);
            }
        } else if (file.name === 'index.html') {
            injectCard(fullPath);
        }
    }
}

console.log('Starting project card synchronization...');
walkFiles(ROOT_DIR);
console.log('Synchronization complete.');
