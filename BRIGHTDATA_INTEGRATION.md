# Bright Data Integration

This document details how Kin uses the Bright Data platform.

## Overview

Bright Data serves as Kin's primary data acquisition layer. Every scraping operation in Kin routes through Bright Data first. Direct HTTP fetch exists only as a development fallback for when Bright Data credentials are not available.

---

## Integration Points

### 1. Collector Management API (`lib/brightdata.ts`)

Kin uses Bright Data's Collector Management API to manage the full lifecycle of collectors:

| Operation | API Endpoint | Purpose |
|---|---|---|
| Create | `POST /collectors` | Creates a new collector from natural language input |
| Run | `POST /collectors/{id}/run` | Triggers immediate collector execution |
| Get Status | `GET /collectors/{id}` | Queries collector status, last run, run count |
| Delete | `DELETE /collectors/{id}` | Removes collector when user deletes from watchlist |

#### Collector Configuration Payload
```typescript
{
  name: "University Scholarship Deadline Monitor",
  type: "unblocker",
  configuration: {
    url: "https://example.com/scholarships",
    format: "json",
    extract: {
      title: "h1",
      content: "body",
      custom_elements: {
        element_0: ".deadline-date",
        element_1: ".scholarship-title"
      }
    },
    schedule: {
      frequency: "daily"
    }
  }
}
```

### 2. Web Unlocker (`lib/brightdata.ts` — `fetchViaBrightData()`)

Every watchlist URL fetches through Bright Data's Web Unlocker, which provides:

- Global proxy network across 195+ countries
- Automatic CAPTCHA detection and resolution
- Anti-block bypass for rate limiting, IP bans, and fingerprinting
- JavaScript rendering for single-page applications and dynamic content
- Automatic retries with different proxy strategies

### 3. Scraper Studio Integration (`app/api/build-scraper/route.ts`)

The "Build with Kin" feature connects natural language input to Bright Data's collector system:

1. User types a monitoring request in plain English
2. Kin's language layer parses the URL, frequency, and key elements
3. Kin calls the Bright Data Collector API to create a real collector
4. The collector appears in both the Kin dashboard and the Bright Data dashboard

### 4. Self-Healing Mechanism

Kin benefits from Bright Data's built-in self-healing capabilities:

- Automatic selector repair when website structures change
- Schema evolution that adapts to minor site changes without manual intervention
- Continuous operation even when sites undergo redesigns

### 5. Priority-Based Scraping Strategy (`lib/scraper.ts`)

```
                    ┌─────────────────────────┐
                    │   User requests URL     │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │  Bright Data Enabled?   │
                    └───────────┬─────────────┘
                           Yes │     No
                ┌──────────────┘     └──────────────┐
    ┌───────────▼─────────────┐         ┌───────────▼─────────────┐
    │  fetchViaBrightData()   │         │    Direct HTTP Fetch    │
    │  (Web Unlocker + Zone)  │         │    (Dev fallback only)  │
    └───────────┬─────────────┘         └───────────┬─────────────┘
            Success │     Fail                       │
    ┌──────────────┘     └──────────────┐           │
    │                                   │           │
┌───▼────┐                     ┌────────▼──────┐    │
│ Return │                     │  Direct Fetch  │    │
│ Data   │                     │  (Fallback)   │    │
└────────┘                     └───────────────┘    │
                                                     │
                                          ┌──────────▼─────────┐
                                          │  Hash + Analyze    │
                                          └────────────────────┘
```

---

## Code Architecture

### `lib/brightdata.ts` — Core Integration Module

```
┌─────────────────────────────────────────────────────────┐
│                brightdata.ts                            │
├─────────────────────────────────────────────────────────┤
│  isBrightDataEnabled()          → boolean               │
│  createBrightDataCollector()    → collector_id          │
│  runBrightDataCollector()       → { html, text }        │
│  getBrightDataCollectorStatus() → { status, last_run }  │
│  deleteBrightDataCollector()    → success               │
│  fetchViaBrightData()           → { success, html }     │
└─────────────────────────────────────────────────────────┘
```

### API Routes That Use Bright Data

| Route | Bright Data Usage |
|---|---|
| `POST /api/scrape` | `fetchViaBrightData()` — primary data source |
| `POST /api/build-scraper` | `createBrightDataCollector()` — creates real collector |
| `GET /api/collectors` | `getBrightDataCollectorStatus()` — syncs status |
| `DELETE /api/collectors` | `deleteBrightDataCollector()` — cleans up |
| `POST /api/scrape-browser` | `fetchViaBrightData()` — browser automation |
| `POST /api/signals` | Uses scraped data from Bright Data indirectly |

---

## SaaS Model

### Platform Owner Configures Bright Data Once

```env
BRIGHTDATA_API_KEY=bd_api_xxxxxxxxxxxx
BRIGHTDATA_ZONE=web_unlocker_zone
```

### End Users Never Need Credentials

- Users type monitoring requests in plain English
- Kin handles all Bright Data interactions behind the scenes
- Each user gets isolated collectors
- Usage tracks per user for billing and analytics

---

## Depth of Integration

| Metric | Kin's Implementation |
|---|---|
| API Endpoints Used | 5+ (create, run, status, delete, fetch) |
| Platform Features | Collector API, Web Unlocker, Self-Healing, Scraper Studio concepts |
| Visibility | Dual dashboard — collectors appear in both Kin and Bright Data |
| Reliability | Graceful fallback combined with platform self-healing |
| User Experience | Natural language abstraction over technical configuration |

### Integration Notes

- Natural language to collector pipeline converts user intent into Bright Data configuration
- Dual dashboard visibility means collectors exist as first-class objects in both systems
- Language models configure Bright Data collectors, and Bright Data feeds clean data back to those models
- Full multi-tenant SaaS architecture with proper user isolation

---

## Development Without Bright Data

For local development without a Bright Data key, Kin falls back gracefully:

- Collectors receive `local_` prefix IDs
- Scraping uses direct HTTP fetch
- All interface features remain functional
- Logging clearly indicates when Bright Data is active versus when fallback mode is in use

This approach keeps the project demonstrable in all environments while prioritizing Bright Data whenever credentials are available.

---

## Configuration Reference

### Required Environment Variables

```env
BRIGHTDATA_API_KEY=    # From Bright Data dashboard → API tokens
BRIGHTDATA_ZONE=       # Your Web Unlocker zone name
```

### Optional

```env
BRIGHTDATA_API_BASE=https://api.brightdata.com  # Custom endpoint
```

### Zone Setup in Bright Data

1. Go to the Bright Data Dashboard
2. Create a new Web Unlocker zone
3. Copy the zone name to `BRIGHTDATA_ZONE`
4. Create an API token with collector permissions
5. Copy the token to `BRIGHTDATA_API_KEY`

---

## Monitoring and Observability

Kin logs Bright Data operations for debugging purposes:

```
[BrightData] Create collector: University Scholarship Deadline Monitor
[BrightData] Collector created: c_abc123def456
[BrightData] Run collector: c_abc123def456
[BrightData] Fetch via Web Unlocker: https://news.ycombinator.com
[BrightData] Success — 24.5KB received
```

All failures are caught, logged, and handled gracefully with fallbacks where appropriate.
