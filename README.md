# Akash Agrawal - Portfolio

A modern, responsive portfolio website showcasing data foundations, measurement systems, and agentic AI projects.

## 🌐 Live Site

**[https://akashagl92.github.io/Portfolio/fetch/](https://akashagl92.github.io/Portfolio/fetch/)**

## ✨ Features

- **Dynamic GitHub Activity** - Real-time contribution calendar and commit statistics
- **Company-specific Portfolios** - Modular structure with `/fetch/`, `/adobe/`, etc.
- **Glass Morphism UI** - Modern dark theme with gradient accents
- **Fully Responsive** - Optimized for all screen sizes

## 🛠 Tech Stack

- Vanilla JavaScript (no frameworks)
- CSS3 with custom properties
- GitHub Actions for automated data updates

## 📁 Structure

```
├── index.html          → Root redirect
├── fetch/              → Fetch-tailored portfolio
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── data.json       → GitHub activity data
└── scripts/
    └── fetch-github.js → Data fetcher (GitHub Actions)
```

## 🚀 Development

```bash
# Start local server
cd fetch && python3 -m http.server 8080

# Update GitHub stats (requires GITHUB_TOKEN)
node scripts/fetch-github.js
```

## 📝 License

MIT
