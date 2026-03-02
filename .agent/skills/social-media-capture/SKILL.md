---
name: Social Media Capture
description: Capture HTML animations/visualizations as platform-optimized videos (MP4) or GIFs for LinkedIn, Instagram, X/Twitter, Substack. Use when user requests video, gif, recording, or animation capture for social media posts.
---

# SKILL: Social Media Capture

## Description
This skill enables any agent or sub-agent to capture HTML animations/visualizations as platform-optimized videos (MP4) or GIFs for social media posting. It uses headless Chrome (Puppeteer) for real-time frame capture and ffmpeg for encoding.

## Prerequisites
- **Node.js** with `puppeteer` installed in the target project (`npm install puppeteer`)
- **ffmpeg** installed and available on `$PATH`
- An HTML file with the animation to capture

## Instructions

### 1. Identify the Target
The HTML file must be a self-contained animation (CSS transitions, JS timers, etc.) that runs automatically on page load. Note:
- The animation duration (used for capture length)
- The desired output platform(s)

### 2. Run the Capture Script
```bash
node ~/.gemini/antigravity/skills/social-media-capture/scripts/capture.js \
  --html "/path/to/animation.html" \
  --platform linkedin \
  --output "/path/to/output.mp4" \
  --duration 24
```

### 3. Available Platform Presets

| Platform     | Format | Aspect | Resolution  | Max Duration | Max Size |
|:-------------|:-------|:-------|:------------|:-------------|:---------|
| `linkedin`   | MP4    | 16:9   | 1280×720    | 10 min       | 5 GB     |
| `instagram`  | MP4    | 1:1    | 1080×1080   | 60s (feed)   | 250 MB   |
| `x`          | MP4    | 16:9   | 1280×720    | 2:20         | 512 MB   |
| `substack`   | MP4    | 16:9   | 1280×720    | No limit     | 256 MB   |
| `gif`        | GIF    | 16:9   | 800×450     | 15s          | 15 MB    |

### 4. Script Arguments

| Argument       | Required | Default     | Description |
|:---------------|:---------|:------------|:------------|
| `--html`       | Yes      | —           | Absolute path to the HTML file |
| `--platform`   | No       | `linkedin`  | Target platform preset |
| `--output`     | No       | `./output.mp4` | Output file path |
| `--duration`   | No       | `20`        | Capture duration in seconds |
| `--width`      | No       | (from preset) | Override viewport width |
| `--height`     | No       | (from preset) | Override viewport height |
| `--fps`        | No       | (from preset) | Override frame rate |
| `--crf`        | No       | `22`        | Video quality (lower = better, 18-28 range) |

### 5. How It Works
1. Launches headless Chrome with the specified viewport size
2. Navigates to the HTML file and waits for network idle
3. Captures screenshots in real-time for the specified duration
4. Encodes the captured frame sequence using ffmpeg at the actual capture rate
5. This preserves CSS transitions and JS animations at their natural speed
6. For GIF output, ffmpeg generates a palette-optimized GIF

### 6. Limitations
- CSS animations run in real wall-clock time, so capture takes as long as the animation
- Rosetta-translated Chrome on Apple Silicon may capture at ~4-6 fps instead of the target rate; the script compensates by encoding at the actual effective capture rate
- Fonts must be available (Google Fonts require network access in headless mode)

## Examples

### LinkedIn Video from Architecture Visualization
```bash
node ~/.gemini/antigravity/skills/social-media-capture/scripts/capture.js \
  --html "/Users/akashagrawal/PycharmProjects/Portfolio-Fetch/showcase/architecture_viz.html" \
  --platform linkedin \
  --output "./showcase/linkedin_post.mp4" \
  --duration 24
```

### Instagram Square Post
```bash
node ~/.gemini/antigravity/skills/social-media-capture/scripts/capture.js \
  --html "./my-animation.html" \
  --platform instagram \
  --output "./social/instagram_post.mp4" \
  --duration 30
```

### Quick GIF for X/Twitter
```bash
node ~/.gemini/antigravity/skills/social-media-capture/scripts/capture.js \
  --html "./demo.html" \
  --platform gif \
  --output "./social/demo.gif" \
  --duration 10
```
