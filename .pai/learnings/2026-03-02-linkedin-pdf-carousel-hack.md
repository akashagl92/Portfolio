# LinkedIn High-Fidelity Capture: The PDF Carousel Hack

## Context
When attempting to share a complex architecture diagram via video (MP4) on LinkedIn, the platform's aggressive server-side video compression caused the text to become illegible through pixelation, even when the source video was captured at Full HD 1080p, 60fps, and an ultra-low CRF of 12.

## Root Cause
Video compression algorithms (like H.264) aggressively smooth over high-contrast, fine details (like small text) to save bandwidth during streaming. LinkedIn forces re-encoding of all video uploads to low bitrates, destroying the fidelity of screen recordings or code visualizations regardless of the original file quality.

## The Solution (The Hack)
Instead of fighting video compression, we bypass the video player entirely by exporting the animation as a **multi-page PDF Document**.

1. **Native Document Support**: LinkedIn natively supports PDF file uploads.
2. **Carousel Rendering**: LinkedIn renders multi-page PDFs as swipeable "Carousel" posts on the feed.
3. **Zero Compression**: Because PDFs are handled as documents and not streaming video, they do not undergo video transcoding. Vector data and text rasterizations remain perfectly crisp.
4. **Algorithmic Boost**: The LinkedIn algorithm favors document/carousel posts as they "trap" user attention (dwell time) via swiping interaction.

## Implementation Standard
When generating social media assets for technical architecture, code demonstrations, or any UI with fine text for LinkedIn:
- **Primary Method**: Capture static frames of key animation stages using Puppeteer and stitch them into a highly-padded, 16:9 or 1:1 PDF layout.
- **Fallback**: Only use MP4 if motion/smoothness is the primary storytelling element and text legibility is secondary. 

*This learning mandates updating the `social-media-capture` skill to natively support PDF carousel generation.*
