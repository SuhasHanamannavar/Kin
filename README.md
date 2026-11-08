<div align="center">

# Kin

### Know what changes on the web.

**Built on Bright Data infrastructure** 

[![Live Demo](https://img.shields.io/badge/Live-Demo-2D5F8A?style=for-the-badge&logo=vercel&logoColor=white)](https://kin-ten-theta.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-1A1A1E?style=for-the-badge&logo=github&logoColor=white)](https://github.com/SuhasHanamannavar/Kin)
[![Commit Style](https://img.shields.io/badge/Commits-Conventional-FE5196?style=for-the-badge&logo=git&logoColor=white)](CONTRIBUTING.md)

[![Built with](https://img.shields.io/badge/Bright--Data-Powered-0891B2?style=for-the-badge)](https://brightdata.com/)

</div>

---

## 🚀 Live Demo

Experience Kin live at **[kin-ten-theta.vercel.app](https://kin-ten-theta.vercel.app)**

The landing page features a cinematic, scroll-driven design with:
- 🕷️ Spider-Man themed hero with animated web strings
- 📊 Interactive dashboard preview
- 🎬 GSAP-powered scroll animations
- 🎥 Cinematic story video with subtitles
- 🐧 Kin the penguin character throughout

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Bright Data Integration](#bright-data-integration)
- [Screenshots](#screenshots)
- [Key Highlights](#key-highlights)
- [Technical Stack](#technical-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Security](#security-and-user-isolation)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Kin monitors websites and tells you when something meaningful happens. Instead of flooding users with raw HTML differences, it uses Bright Data to extract reliable data, then applies language models to translate changes into plain English.

Most website updates are noise — advertisements, timestamps, minor interface tweaks. Kin filters that out. Users describe what they want to watch in plain English, and Kin handles the rest: building collectors, scheduling runs, detecting changes, and summarizing what matters.

---

## Architecture

![Kin Architecture](docs/assets/architecture/kin-brightdata-architecture.jpg)

### Data Flow

1. User describes a monitoring task in plain English
2. Kin's language layer parses the intent — URL, frequency, and key elements
3. Kin calls the Bright Data Collector API to create a real collector
4. Bright Data's Web Unlocker fetches pages through its global proxy network
5. Bright Data's self-healing infrastructure maintains collector reliability
6. Structured data returns to Kin for analysis
7. Kin hashes content and runs change detection
8. Important changes become signals with plain-English summaries
9. Users can chat with Kin about their data through the AI interface
10. Weekly digests compile changes for email delivery

---

## Features

### Build with Kin — Natural Language to Collector

Users type what they want. Kin builds the scraper.

- Plain English input: "Check this university scholarship page daily and alert me if deadlines change"
- Language model parses intent into collector configuration
- Real collectors created in Bright Data, visible in both Kin and Bright Data dashboards
- Each user gets independent collectors, isolated from other accounts

### Website Monitoring

- Add URLs to a watchlist with custom categories and scan frequencies
- All scraping routes through Bright Data first for reliability
- Content hashing detects changes between scans
- Semantic analysis distinguishes meaningful updates from noise

### Signals

- Changes classified by importance: High, Medium, Low
- Plain English summaries instead of technical diffs
- Each signal includes context on why the change matters
- Search, filter, and mark signals as read

### Kin AI Chat

- Ask questions about monitored data in natural language
- Responses grounded in actual watchlist and signal history
- Built on Groq Cloud high-performance inference and Zen Mimo V2.5

### Weekly Digest

- Automated summary delivered every Sunday morning
- Changes grouped by importance level
- On-demand digest generation available

### AI Scraping Browser

- Full Chromium environment for JavaScript-heavy sites
- Handles single-page applications, lazy loading, and dynamic content
- Protected by Bright Data's anti-blocking infrastructure

---

## Bright Data Integration

Bright Data forms the foundation of Kin's data acquisition layer. Every scraping operation in Kin routes through Bright Data first.

### Integration Points

| Component | How Kin uses Bright Data | Code Location |
|---|---|---|
| Collector Management API | Creates, runs, queries, and deletes collectors programmatically | `lib/brightdata.ts` |
| Web Unlocker | Primary fetch mechanism for all watchlist URLs — proxies, CAPTCHA solving, anti-blocking | `lib/brightdata.ts` — `fetchViaBrightData()` |
| Scraper Studio | Language model translates natural language into collector configurations | `app/api/build-scraper/route.ts` |
| Self-Healing | Bright Data infrastructure automatically repairs selectors when sites change | Platform-level feature |
| Global Proxy Network | Residential and data center proxies across 195+ countries | Configured through Web Unlocker zone |
| Dual Visibility | Collectors appear in both Kin and Bright Data dashboards | Collector API integration |
| Graceful Fallback | Direct HTTP fetch used only in development without Bright Data credentials | `lib/scraper.ts` — `fetchPageContent()` |

### Code Examples

#### Creating a Collector
```typescript
// Creates a real collector in Bright Data, visible in both dashboards
export async function createBrightDataCollector(config) {
  const payload = {
    name: config.name,
    type: 'unblocker',
    configuration: {
      url: config.url,
      format: 'json',
      extract: {
        title: 'h1',
        content: 'body',
        custom_elements: selectors
      },
      schedule: {
        frequency: mapFrequencyToBrightData(config.frequency)
      }
    }
  };

  return fetch(`${BRIGHTDATA_API_BASE}/collectors`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${BRIGHTDATA_API_KEY}` },
    body: JSON.stringify(payload)
  });
}
```

#### Priority-Based Scraping
```typescript
// Bright Data first, direct fetch only as development fallback
export async function fetchPageContent(url) {
  if (isBrightDataEnabled()) {
    const result = await fetchViaBrightData(url);
    if (result.success && result.html) {
      return { ...result, source: 'brightdata' };
    }
  }
  return directFetch(url); // Development fallback only
}
```

### API Routes That Use Bright Data

- `POST /api/scrape` — Watchlist URL scraping
- `POST /api/build-scraper` — Natural language to collector creation
- `GET /api/collectors` — Collector status management
- `DELETE /api/collectors` — Collector removal
- `POST /api/scrape-browser` — Browser-based scraping
- `POST /api/signals` — Signal generation from scraped data

---

## Screenshots

### Dashboard
![Dashboard](docs/assets/screenshots/01-dashboard.jpg)

### Signals
![Signals](docs/assets/screenshots/06-signals.jpg)

### Build with Kin
![Build with Kin](docs/assets/screenshots/05-build-with-kin.jpg)

### AI Scraping Browser
![AI Scraping Browser](docs/assets/screenshots/04-ai-scraping-browser.jpg)

### Kin AI Chat
![Kin AI Chat](docs/assets/screenshots/03-kin-ai-chat.jpg)

### Weekly Digest
![Weekly Digest](docs/assets/screenshots/02-digest.jpg)

---

## Key Highlights

### Core Problem & Impact

Kin addresses a real problem: information overload from constant website changes. Researchers, analysts, students, and competitive intelligence teams currently waste hours manually checking pages. The multi-tenant architecture scales to thousands of users, and the natural language interface lowers the barrier for non-technical users.

### Natural Language to Collector Pipeline

The natural language to collector pipeline removes the technical barrier to web scraping. Users do not need to know CSS selectors or scheduling logic. The penguin character, Kin, provides a memorable interface guide, and the dual dashboard integration means collectors exist as real Bright Data objects, not just database records.

### Production-Grade Architecture

The project uses Next.js 14 with TypeScript throughout. Authentication runs through Clerk with proper session management. AWS DynamoDB with single-table design stores user data with hardware-level isolation. The library layer cleanly separates concerns, error handling covers all external API calls, and every API route validates authentication and scopes queries to the current user.

### Deep Bright Data Integration

Every "Build with Kin" request creates an actual Bright Data collector through the Collector Management API. The integration covers the full lifecycle: create, run, check status, and delete. The language model converts natural language into structured collector configurations with proper scheduling and extraction rules. Collectors appear in the Bright Data dashboard as well as in Kin.

### Reliability and Self-Healing

Bright Data's Web Unlocker provides the global proxy network, CAPTCHA solving, and anti-blocking capabilities that make Kin reliable. The platform's self-healing infrastructure automatically maintains collectors when websites change. The code implements graceful degradation — if Bright Data is unavailable during development, a direct fetch fallback keeps the interface functional.

### Thoughtful macOS-Inspired Design

The interface follows a clean, macOS-inspired design system with tactile feedback and stateful animations. Architecture diagrams, responsive controls, and unified iconography deliver a polished experience across all workflows.

---

## Technical Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript | Application interface |
| Styling | Tailwind CSS | Design system |
| Authentication | Clerk | User management and sessions |
| Data Acquisition | Bright Data | Collector API, Web Unlocker, proxies, self-healing |
| Database | AWS DynamoDB | User data, watchlists, signals |
| Language Models | Groq Cloud, Zen Mimo V2.5 | Intent parsing, change analysis, chat |
| Email | Resend | Weekly digests and notifications |
| Icons | Lucide React | Consistent iconography |
| Deployment | Vercel | Production hosting |

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- A Clerk account for authentication
- A Bright Data account for scraping infrastructure
- A Groq API key (or OpenCode Zen API key) for language model inference
- An AWS account for DynamoDB storage
- Resend account (optional) for email notifications

### Installation

```bash
git clone https://github.com/SuhasHanamannavar/Kin.git
cd Kin
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Bright Data Infrastructure
BRIGHTDATA_API_KEY=
BRIGHTDATA_ZONE=unblocker
BRIGHTDATA_API_BASE=https://api.brightdata.com

# AI Language Models (Groq Cloud & Zen Mimo V2.5)
GROQ_API_KEY=
ZEN_API_KEY=
ZEN_API_BASE_URL=https://opencode.ai/zen/v1
ZEN_MODEL=mimo-v2.5-free

# AWS DynamoDB
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DYNAMODB_TABLE_NAME=kin-data

# Resend Email Delivery (optional)
RESEND_API_KEY=

# Application URL
NEXT_PUBLIC_APP_URL=https://kin-ten-theta.vercel.app
```

### Database Setup

Kin uses Amazon DynamoDB single-table architecture (`kin-data`). The table is configured with On-Demand capacity (100% covered by the AWS Always-Free Tier with zero idle credit consumption).

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
Kin/
├── app/
│   ├── api/
│   │   ├── build-scraper/        # Natural language to collector
│   │   ├── chat/                 # AI chat interface
│   │   ├── collectors/           # Collector management
│   │   ├── digest/               # Weekly digest generation
│   │   ├── scrape-browser/       # Browser-based scraping
│   │   ├── scrape/               # Watchlist URL scraping
│   │   ├── settings/             # User settings
│   │   ├── signals/              # Signal operations
│   │   └── watchlist/            # Watchlist management
│   ├── app/                      # Protected application pages
│   │   ├── build/                # Build with Kin
│   │   ├── dashboard/            # Main dashboard
│   │   ├── digest/               # Weekly digest view
│   │   ├── kin/                  # AI chat interface
│   │   ├── scraping-browser/     # AI Scraping Browser
│   │   ├── settings/             # Settings
│   │   ├── signals/              # Signals list
│   │   └── watchlist/            # Watchlist management
│   ├── auth/                     # Clerk authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── layout.tsx
│   └── page.tsx                  # Landing page
├── components/
│   ├── layout/                   # AppShell, Sidebar, TopBar
│   └── ui/                       # Reusable UI components
├── lib/
│   ├── ai.ts                     # Language model integration
│   ├── auth-helper.ts            # Clerk auth utilities
│   ├── aws-dynamodb.ts           # AWS DynamoDB client initialization
│   ├── brightdata.ts             # Bright Data API wrapper
│   ├── db.ts                     # Database operations (DynamoDB)
│   ├── emails.ts                 # Email templates
│   ├── scraper.ts                # Scraping logic
│   └── utils.ts                  # Shared utilities
├── docs/
│   └── assets/
│       ├── architecture/         # System diagrams
│       └── screenshots/          # Product screenshots
├── styles/
│   └── globals.css
├── types/
│   └── index.ts
├── .env.example
├── CONTRIBUTING.md               # Git commit & contributing conventions
├── middleware.ts
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Security and User Isolation

Kin implements multiple layers of user isolation:

1. Every API route validates the Clerk session before processing
2. All database queries include internal user ID filtering
3. AWS DynamoDB partition key isolation (`PK = USER#<userId>`) strictly scopes all queries to the authenticated user's partition, preventing cross-tenant access
4. Each Bright Data collector belongs to exactly one user
5. No shared state exists between user accounts
6. Secrets live in environment variables, never in committed code

---

## Contributing

We welcome contributions! To maintain a clear, searchable, and professional Git history, all commits must follow the **Conventional Commits** specification:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

### Commit Types Quick Reference

| Type | When to Use | Example |
|---|---|---|
| `feat` | A new feature | `feat(api): add export signals as JSON` |
| `fix` | A bug fix | `fix(auth): prevent unauthorized redirect loop` |
| `refactor` | Code restructuring without altering behavior | `refactor(db): streamline DynamoDB query helpers` |
| `docs` | Documentation changes | `docs: update setup and commit conventions` |
| `perf` | Performance optimizations | `perf(scraper): reduce DOM diff computation time` |
| `test` | Adding or updating tests | `test(watchlist): add URL validator unit tests` |
| `build` | Build system or dependencies | `build: update Next.js dependencies` |
| `chore` | Maintenance tasks | `chore: clean up unused assets` |

Please read our full [Contributing Guidelines & Commit Rules](CONTRIBUTING.md) for the complete checklist and formatting standards.

---

## Design

The interface uses a warm off-white background with deep charcoal text and soft rounded corners. Kin the penguin appears throughout the interface as an SVG character with multiple states: idle, thinking, scanning, building, found, happy, and error. Subtle animations and smooth transitions guide the user experience.

---

## License

MIT © 2026 Suhas Hanamannavar

---

<div align="center">

**Kin** — Know what changes on the web.

</div>
