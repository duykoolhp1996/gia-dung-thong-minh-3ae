# Project: 3AE Operational Business Reporting Web Application (`business_report_app`)

## Architecture
The application employs a **Universal Dual-Runtime Architecture** tailored for high-speed local execution and zero-friction cloud deployment:
1. **Frontend Presentation (Browser SPA)**: Modern HTML5, ES6 Modules, Tailwind CSS styling, and Chart.js visualizations. Operates reactively without requiring a Node build/bundling step.
2. **Metric Engine (`public/js/engine.js`)**: Pure JavaScript calculation engine providing client-server calculation parity. Computes all departmental metrics (Ecom, Digital, MarCom, CSKH) and the Executive Division Overview (MER, Enterprise Health Score 0-100).
3. **Dual REST Server Layer**:
   - `server.js`: Zero-dependency Node.js standard-library HTTP server (`node:http`, `node:fs`) running in containerized environments (Docker/Cloud) and local Node environments.
   - `server.ps1`: Zero-dependency Windows PowerShell 5.1 HTTP server (`System.Net.HttpListener`) running immediately on any Windows host without prerequisites.
   - Both servers share identical REST API routes (`/api/health`, `/api/reports/overview`, `/api/reports/:dept`, `/api/records`, `/api/records/reset`) and serve static files from `public/`.
4. **Data Persistence**: Atomic file I/O against `data/database.json`, with a clean immutable baseline in `data/seed.json` for factory resets.
5. **Deployment & Infrastructure**: Multi-stage `Dockerfile` (`node:20-alpine`, non-root execution), `docker-compose.yml`, `.dockerignore`, and cloud descriptor (`render.yaml`).
6. **Automated Testing Suite**: 4-tier test runner (Tiers 1-4) covering unit calculations, boundary conditions, cross-feature reactivity, and headless Chromium E2E automation (`tests/run_tests.ps1`, `tests/cdp_helper.psm1`, `tests/run_all_tests.js`).

---

## Feature Inventory
Every feature from the Survey phase is enumerated below with an assigned milestone.

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Division Overview Dashboard | Executive dashboard displaying consolidated KPIs across all 4 departments (Revenue, Ad Spend, ROAS, CSAT, Ticket Volume). | M2 | Survey (spec_miner F01) |
| F02 | Enterprise Health Score | Weighted 0-100 composite index assessing overall business division operational health. | M2 | Survey (spec_miner F02) |
| F03 | Department Comparison Cards | Comparative scorecard strip with progress bars, targets, and trend indicators across 4 departments. | M2 | Survey (spec_miner F03) |
| F04 | Ecom Revenue Tracking | E-Commerce gross/net revenue tracking with daily/weekly rollups and channel breakdown. | M2 | Survey (spec_miner F04) |
| F05 | Ecom Order Volume Monitoring | Total count of completed, pending, and cancelled orders. | M2 | Survey (spec_miner F05) |
| F06 | Ecom Conversion Rate (CVR) | Weighted visitor-to-order conversion percentage with zero-traffic protection. | M2 | Survey (spec_miner F06) |
| F07 | Ecom AOV & Channel Breakdown | Average Order Value and marketplace channel performance (Shopee, TikTok, Lazada, Web). | M2 | Survey (spec_miner F07, F08) |
| F08 | Digital Ad Spend Monitoring | Digital marketing expenditure tracking across paid advertising channels. | M2 | Survey (spec_miner F09) |
| F09 | Digital ROAS Calculation | Weighted Return on Ad Spend ($Attributed Revenue / Ad Spend$) with zero-spend protection. | M2 | Survey (spec_miner F10) |
| F10 | Digital Traffic & CTR Analytics | Total ad impressions, clicks, Click-Through Rate (CTR %), and Cost Per Click (CPC). | M2 | Survey (spec_miner F11) |
| F11 | Digital Cost Per Lead (CPL) | Ad spend efficiency per generated digital inquiry/lead. | M2 | Survey (spec_miner F12) |
| F12 | MarCom Campaign Reach | Unique and cumulative audience reach across brand, PR, and social activations. | M2 | Survey (spec_miner F13) |
| F13 | MarCom Lead Generation | Volume of qualified marketing leads generated via activations. | M2 | Survey (spec_miner F14) |
| F14 | MarCom Campaign Performance | Active campaigns health, milestone completion percentage, on-time status, and brand sentiment. | M2 | Survey (spec_miner F15) |
| F15 | CSKH Support Ticket Volume | Total customer support tickets across Hotline, Zalo OA, and Ecom chat. | M2 | Survey (spec_miner F16) |
| F16 | CSKH Customer Satisfaction (CSAT) | Volume-weighted CSAT score (%) and 5-star rating distribution. | M2 | Survey (spec_miner F17) |
| F17 | CSKH Average Resolution Time | Average handling and resolution time in minutes/hours for closed tickets. | M2 | Survey (spec_miner F18) |
| F18 | Pre-Populated Realistic Sample Data | Domain-accurate seed dataset for 3AE Smart Home appliances covering all 4 departments. | M1 | Survey (spec_miner F19) |
| F19 | Data Ledger View & Filter | Tabular interface displaying operational records with department filters and sorting. | M3 | Survey (spec_miner F20) |
| F20 | Interactive Record Creation | Modal/form interface allowing users to input new operational metric records. | M3 | Survey (spec_miner F21) |
| F21 | Interactive Record Update & Inline Edit | Interface to modify existing records with immediate KPI recalculation. | M3 | Survey (spec_miner F22) |
| F22 | Data Reset to Baseline | One-click restore button returning database to original seed state. | M3 | Survey (spec_miner F23) |
| F23 | Dual-Runtime REST Servers & Health API | Node.js and PowerShell servers with `/api/health`, `/api/reports`, and `/api/records`. | M1 | Survey (env_explorer, arch) |
| F24 | Cloud Deployment Artifacts | Dockerfile (multi-stage, non-root), docker-compose.yml, .dockerignore, and cloud configs. | M4 | Survey (spec_miner F24) |
| F25 | Comprehensive Automated Test Suite | Automated test harness covering Tiers 1-4 (calculations, boundaries, reactivity, E2E). | M5 | Survey (spec_miner F25, arch) |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Backend & Data Persistence | Project setup, `data/seed.json`, `data/database.json`, dual servers (`server.js`, `server.ps1`), `/api/health`, CRUD endpoints | none | IN_PROGRESS |
| M2 | Metric Engine & Department Dashboards | `public/index.html`, `public/js/engine.js`, `public/js/store.js`, department views (Ecom, Digital, MarCom, CSKH), Division Overview | M1 | PLANNED |
| M3 | Interactive Data Management & Reactivity | Data ledger view, create/update modal, delete, reset-to-baseline, instant UI & division recalculation | M1, M2 | PLANNED |
| M4 | Cloud Deployment Readiness | Multi-stage Dockerfile, docker-compose.yml, .dockerignore, render.yaml, README documentation | M1 | PLANNED |
| M5 | Final Milestone: E2E Test Suite Pass & Adversarial Hardening | Phase 1: 100% pass on Tiers 1-4 E2E tests from Test Track. Phase 2: Tier 5 adversarial coverage hardening | M1, M2, M3, M4, TEST_READY | PLANNED |

---

## Interface Contracts

### 1. Metric Engine API (`public/js/engine.js`)
- `calculateEcom(records: EcomRecord[]): EcomSummary`
  - Input: Array of Ecom daily records.
  - Output: `{ total_revenue: number, total_orders: number, cvr: number, aov: number, cancellation_rate: number, channel_breakdown: Record<string, number> }`
- `calculateDigital(records: DigitalRecord[]): DigitalSummary`
  - Input: Array of Digital campaign records.
  - Output: `{ total_spend: number, total_attributed_revenue: number, roas: number, total_impressions: number, total_clicks: number, ctr: number, cpl: number, total_leads: number }`
- `calculateMarCom(records: MarComRecord[]): MarComSummary`
  - Input: Array of MarCom campaign records.
  - Output: `{ total_reach: number, total_leads: number, avg_milestone: number, avg_sentiment: number, total_budget: number, total_spend: number }`
- `calculateCSKH(records: CSKHRecord[]): CSKHSummary`
  - Input: Array of CSKH records.
  - Output: `{ total_tickets: number, resolved_tickets: number, csat_percentage: number, avg_resolution_time: number, fcr_rate: number, channel_breakdown: Record<string, number> }`
- `calculateDivisionOverview(ecomSum, digSum, marcomSum, cskhSum): DivisionSummary`
  - Output: `{ enterprise_health_score: number, total_revenue: number, total_marketing_spend: number, blended_mer: number, total_leads: number, division_csat: number, total_tickets: number }`

### 2. REST API Endpoints (`server.js` & `server.ps1`)
- `GET /api/health` -> `200 OK` `{ status: "ok", timestamp: ISOString, version: "1.0.0" }`
- `GET /api/reports/overview` -> `200 OK` `{ overview: DivisionSummary, departments: { ecom, digital, marcom, cskh } }`
- `GET /api/reports/:department` -> `200 OK` `{ summary: DeptSummary, records: DeptRecord[] }`
- `GET /api/records` -> `200 OK` `{ ecom: [], digital: [], marcom: [], cskh: [] }`
- `POST /api/records/:department` -> `201 Created` `{ success: true, record: DeptRecord }`
- `PUT /api/records/:department/:id` -> `200 OK` `{ success: true, record: DeptRecord }`
- `DELETE /api/records/:department/:id` -> `200 OK` `{ success: true, id: string }`
- `POST /api/records/reset` -> `200 OK` `{ success: true, message: "Reset to seed data" }`

---

## Code Layout
```
c:\Users\My_PC\Documents\Gia Dung Thông Minh 3AE\business_report_app\
├── package.json                   # NPM manifest and runner commands
├── server.js                      # Production Node.js standard-library REST server
├── server.ps1                     # Native PowerShell 5.1 HTTP server for Windows
├── Dockerfile                     # Multi-stage production container build (node:20-alpine)
├── docker-compose.yml             # Container orchestration
├── .dockerignore                  # Container build ignore rules
├── render.yaml                    # Cloud hosting configuration
├── README.md                      # Comprehensive user & developer documentation
├── data/
│   ├── seed.json                  # Immutable baseline realistic sample data
│   └── database.json              # Active operational data store
├── public/
│   ├── index.html                 # SPA entry point (Tailwind CDN, responsive layout)
│   ├── css/
│   │   └── style.css              # Custom 3AE theme styles and animations
│   ├── js/
│   │   ├── app.js                 # Frontend application router and view controller
│   │   ├── store.js               # Reactive state manager and observer pattern
│   │   ├── engine.js              # Pure JavaScript metric calculation engine
│   │   ├── api.js                 # REST API client with local fallback
│   │   ├── charts.js              # Chart.js visualization wrappers
│   │   └── mockData.js            # Standalone fallback seed data
│   └── assets/
│       ├── logo-full.svg          # 3AE brand logo
│       └── app-icon.ico           # Application icon
└── tests/
    ├── run_tests.ps1              # Master test runner (Tiers 1-4)
    ├── cdp_helper.psm1            # Headless Chromium CDP automation module
    ├── tier1_calculations.test.js # Tier 1: Metric formula tests
    ├── tier2_boundaries.test.js   # Tier 2: Boundary, zero & edge case tests
    ├── tier3_reactivity.test.js   # Tier 3: Interactive CRUD & reactivity tests
    ├── tier4_e2e_scenarios.test.js# Tier 4: E2E workflows & cloud readiness tests
    └── run_all_tests.js           # Node.js automated test runner
```
