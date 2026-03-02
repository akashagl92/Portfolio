#!/usr/bin/env node

/**
 * Social Media Capture Script
 * 
 * Captures HTML animations as platform-optimized MP4/GIF files.
 * Uses headless Chrome (Puppeteer) for real-time frame capture
 * and ffmpeg for encoding.
 * 
 * Part of the PAI social-media-capture skill.
 * 
 * Usage:
 *   node capture.js --html /path/to/file.html --platform linkedin --output ./out.mp4
 */

const path = require('path');
const fs = require('fs');

// ---------------------------------------------------------------------------
// Platform Presets
// ---------------------------------------------------------------------------
const PRESETS = {
    linkedin: {
        width: 1280, height: 720, fps: 15, format: 'mp4',
        crf: 22, maxDuration: 600, description: 'LinkedIn (16:9, 1280×720)'
    },
    instagram: {
        width: 1080, height: 1080, fps: 30, format: 'mp4',
        crf: 20, maxDuration: 60, description: 'Instagram Feed (1:1, 1080×1080)'
    },
    instagram_story: {
        width: 1080, height: 1920, fps: 30, format: 'mp4',
        crf: 20, maxDuration: 15, description: 'Instagram Story (9:16, 1080×1920)'
    },
    x: {
        width: 1280, height: 720, fps: 30, format: 'mp4',
        crf: 23, maxDuration: 140, description: 'X / Twitter (16:9, 1280×720)'
    },
    substack: {
        width: 1280, height: 720, fps: 15, format: 'mp4',
        crf: 22, maxDuration: 300, description: 'Substack (16:9, 1280×720)'
    },
    gif: {
        width: 800, height: 450, fps: 10, format: 'gif',
        crf: null, maxDuration: 15, description: 'Animated GIF (16:9, 800×450)'
    }
};

// ---------------------------------------------------------------------------
// CLI Argument Parsing
// ---------------------------------------------------------------------------
function parseArgs() {
    const args = process.argv.slice(2);
    const parsed = {
        html: null,
        platform: 'linkedin',
        output: null,
        duration: null,
        width: null,
        height: null,
        fps: null,
        crf: null,
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--html': parsed.html = args[++i]; break;
            case '--platform': parsed.platform = args[++i]; break;
            case '--output': parsed.output = args[++i]; break;
            case '--duration': parsed.duration = parseInt(args[++i]); break;
            case '--width': parsed.width = parseInt(args[++i]); break;
            case '--height': parsed.height = parseInt(args[++i]); break;
            case '--fps': parsed.fps = parseInt(args[++i]); break;
            case '--crf': parsed.crf = parseInt(args[++i]); break;
            case '--help': printHelp(); process.exit(0);
            default:
                console.error(`Unknown argument: ${args[i]}`);
                printHelp();
                process.exit(1);
        }
    }

    if (!parsed.html) {
        console.error('ERROR: --html argument is required');
        printHelp();
        process.exit(1);
    }

    return parsed;
}

function printHelp() {
    console.log(`
Social Media Capture — HTML Animation to Video/GIF

Usage:
  node capture.js --html <path> [options]

Options:
  --html <path>       HTML file to capture (required)
  --platform <name>   Platform preset: linkedin, instagram, instagram_story, x, substack, gif
  --output <path>     Output file path (default: ./output.mp4 or ./output.gif)
  --duration <sec>    Capture duration in seconds (default: 20)
  --width <px>        Override viewport width
  --height <px>       Override viewport height
  --fps <n>           Override frame rate
  --crf <n>           Video quality (18-28, lower=better)

Platform Presets:
${Object.entries(PRESETS).map(([k, v]) => `  ${k.padEnd(18)} ${v.description}`).join('\n')}
`);
}

// ---------------------------------------------------------------------------
// Main Capture Logic
// ---------------------------------------------------------------------------
async function capture(config) {
    // Resolve Puppeteer from the calling project's node_modules
    let puppeteer;
    try {
        puppeteer = require('puppeteer');
    } catch {
        // Try resolving from common project paths
        const candidatePaths = [
            path.resolve(process.cwd(), 'node_modules', 'puppeteer'),
            path.resolve(path.dirname(config.html), '..', 'node_modules', 'puppeteer'),
        ];
        for (const p of candidatePaths) {
            try { puppeteer = require(p); break; } catch { }
        }
        if (!puppeteer) {
            console.error('ERROR: puppeteer not found. Install it: npm install puppeteer');
            process.exit(1);
        }
    }

    const FRAME_DIR = path.join(require('os').tmpdir(), `smc_frames_${Date.now()}`);
    fs.mkdirSync(FRAME_DIR, { recursive: true });

    const preset = PRESETS[config.platform];
    const width = config.width || preset.width;
    const height = config.height || preset.height;
    const duration = config.duration || 20;
    const format = preset.format;
    const crf = config.crf || preset.crf;

    if (duration > preset.maxDuration) {
        console.warn(`⚠ Duration ${duration}s exceeds ${config.platform} max of ${preset.maxDuration}s`);
    }

    const outputPath = config.output || `./output.${format}`;

    console.log(`\n🎬 Social Media Capture`);
    console.log(`   Platform: ${preset.description}`);
    console.log(`   Viewport: ${width}×${height}`);
    console.log(`   Duration: ${duration}s`);
    console.log(`   Format:   ${format.toUpperCase()}`);
    console.log(`   Output:   ${outputPath}\n`);

    // --- Launch Browser ---
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });

    // Resolve HTML path to file:// URL
    const htmlPath = path.isAbsolute(config.html)
        ? `file://${config.html}`
        : `file://${path.resolve(process.cwd(), config.html)}`;

    console.log('📂 Loading:', htmlPath);
    await page.goto(htmlPath, { waitUntil: 'networkidle0' });

    // --- Real-Time Frame Capture ---
    console.log(`📸 Capturing frames for ${duration}s...`);
    const startTime = Date.now();
    let frameIndex = 0;

    while (true) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration * 1000) break;

        const frameNum = String(frameIndex).padStart(5, '0');
        await page.screenshot({
            path: path.join(FRAME_DIR, `frame_${frameNum}.png`),
            type: 'png',
        });
        frameIndex++;

        if (frameIndex % 20 === 0) {
            const pct = Math.round((elapsed / (duration * 1000)) * 100);
            process.stdout.write(`\r   Progress: ${pct}% (${frameIndex} frames)`);
        }
    }

    await browser.close();

    const totalRealTime = (Date.now() - startTime) / 1000;
    const effectiveFPS = frameIndex / totalRealTime;
    console.log(`\n\n✅ Captured ${frameIndex} frames in ${totalRealTime.toFixed(1)}s (${effectiveFPS.toFixed(1)} effective fps)`);

    // --- Encode ---
    console.log(`\n🔧 Encoding ${format.toUpperCase()}...`);
    const { execSync } = require('child_process');

    if (format === 'gif') {
        // Two-pass GIF: generate palette, then encode
        const palettePath = path.join(FRAME_DIR, 'palette.png');
        execSync(
            `ffmpeg -y -framerate ${effectiveFPS.toFixed(2)} -i ${FRAME_DIR}/frame_%05d.png ` +
            `-vf "fps=${preset.fps},scale=${width}:-1:flags=lanczos,palettegen=max_colors=128" ` +
            `"${palettePath}"`,
            { stdio: 'pipe' }
        );
        execSync(
            `ffmpeg -y -framerate ${effectiveFPS.toFixed(2)} -i ${FRAME_DIR}/frame_%05d.png ` +
            `-i "${palettePath}" ` +
            `-lavfi "fps=${preset.fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3" ` +
            `"${outputPath}"`,
            { stdio: 'inherit' }
        );
    } else {
        // MP4: encode at effective capture rate, output at standard rate
        const targetFPS = config.fps || preset.fps;
        execSync(
            `ffmpeg -y -framerate ${effectiveFPS.toFixed(2)} -i ${FRAME_DIR}/frame_%05d.png ` +
            `-c:v libx264 -pix_fmt yuv420p -crf ${crf} -preset medium ` +
            `-r ${targetFPS} -movflags +faststart "${outputPath}"`,
            { stdio: 'inherit' }
        );
    }

    // --- Report ---
    const stats = fs.statSync(outputPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    const sizeKB = (stats.size / 1024).toFixed(0);

    console.log(`\n🎉 Output ready!`);
    console.log(`   File:     ${outputPath}`);
    console.log(`   Size:     ${sizeMB > 1 ? sizeMB + ' MB' : sizeKB + ' KB'}`);
    console.log(`   Duration: ~${totalRealTime.toFixed(0)}s`);
    console.log(`   Platform: ${preset.description}`);

    // --- Cleanup ---
    fs.rmSync(FRAME_DIR, { recursive: true });
    console.log('🧹 Temp frames cleaned up.\n');
}

// ---------------------------------------------------------------------------
// Entry Point
// ---------------------------------------------------------------------------
const args = parseArgs();
capture(args).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
