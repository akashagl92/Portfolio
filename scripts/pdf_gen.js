const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    const args = process.argv.slice(2);
    const htmlPathArg = args.find(a => a.startsWith('--html=')).split('=')[1];
    const outputPathArg = args.find(a => a.startsWith('--output=')).split('=')[1];

    const htmlPath = path.isAbsolute(htmlPathArg) ? htmlPathArg : path.join(process.cwd(), htmlPathArg);
    const outputPath = path.isAbsolute(outputPathArg) ? outputPathArg : path.join(process.cwd(), outputPathArg);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // LinkedIn Portrait recommended aspect ratio is 4:5 or 1:1
    // Using 1080x1350 (4:5) for a premium look
    await page.setViewport({
        width: 1080,
        height: 1350,
        deviceScaleFactor: 2, // High DPI
    });

    const fileUrl = `file://${htmlPath}`;
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    // Wait slightly for any animations to settle on their initial state if needed
    // or capture a specific frame if it's animated.
    // For PDFs, we usually want the static/final state or a specific snapshot.
    await new Promise(r => setTimeout(r, 2000));

    await page.pdf({
        path: outputPath,
        width: '1080px',
        height: '1350px',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();
    console.log(`PDF generated: ${outputPath}`);
})();
