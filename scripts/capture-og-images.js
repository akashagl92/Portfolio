#!/usr/bin/env node
/**
 * Capture OG images for all portfolio pages
 * Run: node scripts/capture-og-images.js
 * 
 * Prerequisites: npm install puppeteer (if not already installed)
 */

const puppeteer = require('puppeteer');
const path = require('path');

const pages = [
    { url: 'http://localhost:8080/', output: './og-image.png', name: 'Root' },
    { url: 'http://localhost:8080/fetch/', output: './fetch/og-image.png', name: 'Fetch' },
    { url: 'http://localhost:8080/ambience/', output: './ambience/og-image.png', name: 'Ambience' },
    { url: 'http://localhost:8080/viant/', output: './viant/og-image.png', name: 'Viant' },
    { url: 'http://localhost:8080/stellantis/', output: './stellantis/og-image.png', name: 'Stellantis' },
    { url: 'http://localhost:8080/circle/', output: './circle/og-image.png', name: 'Circle' }
];

async function captureScreenshots() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const page of pages) {
        try {
            console.log(`\nCapturing ${page.name} page...`);
            const tab = await browser.newPage();

            // Set viewport to wider size to capture full hero section, will be cropped to OG ratio
            await tab.setViewport({ width: 1600, height: 840 });

            // Navigate and wait for network to be idle
            await tab.goto(page.url, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            // Wait a bit for any animations to settle
            await new Promise(r => setTimeout(r, 2000));

            // Take screenshot
            await tab.screenshot({
                path: page.output,
                type: 'png'
            });

            console.log(`✓ Saved: ${page.output}`);
            await tab.close();
        } catch (err) {
            console.error(`✗ Failed to capture ${page.name}:`, err.message);
        }
    }

    await browser.close();
    console.log('\nDone!');
}

captureScreenshots().catch(console.error);
