# Project: 3AE Marcom Workspace / Marketing Hub Dashboard

## Architecture
- **Single Page Application (SPA)**: Rich Vanilla JS + Tailwind CSS responsive dashboard.
- **Triplicate Synchronization**:
  - `index.html` (root workspace, served by `server.ps1` at `http://localhost:8080/`)
  - `marcom_rust/static/index.html` (embedded within Rust desktop/web binary)
  - `C:\Users\My_PC\.gemini\antigravity\brain\4ef40a1a-a442-478f-b807-4227f65a4ad6\website_preview.html` (Gemini Antigravity preview sandbox)
  - Verified bit-for-bit SHA256 parity: `B6DBAB40288D17AD5424C653B94F4C4439CF56B527216762576B62A0B83BCF99`.
- **Data Layer**:
  - `database.json` & `lark_tables_data.js` synced from Google Sheets (ID: `1dI_z3TzLBmMgPmRICya6aVyqyw18qdgPitmsw2in5ac`).
  - Runtime REST API endpoints on `http://localhost:8080/`: `/api/data`, `/api/sync`.
  - Inlined DB fallback in frontend with dynamic fetch and localStorage persistence.

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | R1.1 KPI Summary Cards | 4 KPI cards: Tổng Task (92), Đã Hoàn Thành (42), Đang Xử Lý/Review (29: 20 làm, 9 duyệt), Ưu Tiên Khẩn P1 (34) | M1 | Survey | DONE |
| 2 | R1.2 Department Progress Bars | Department progress bars reflecting accurate completion rates across Master (21%), Content (33%), Designer (76%), Editor (65%) | M1 | Survey | DONE |
| 3 | R1.3 Pipeline Distribution | Accurate status pipeline bars across Todo (21), Doing (20), Review (9), Done (42) | M1 | Survey | DONE |
| 4 | R1.4 Urgent Tasks Widget | Top 5 urgent P1 tasks, strictly filtering out completed tasks (`status !== 'done'`) | M1 | Survey | DONE |
| 5 | R1.5 Status Mapping Logic | Fix `getTaskStatusKey`: classify `"3. Đang thiết kế"` as `'doing'`, not `'review'` | M1 | Survey | DONE |
| 6 | R2.1 Kanban 4 Columns | Cần làm, Đang làm, Chờ duyệt, Đã hoàn thành columns with correct task routing | M1 | Survey | DONE |
| 7 | R2.2 HTML5 Drag-and-Drop | Smooth drag and drop across columns with visual feedback | M1 | Survey | DONE |
| 8 | R2.3 Column Counter Headers | Column counters update immediately when cards move | M1 | Survey | DONE |
| 9 | R2.4 Kanban State Persistence | Kanban card status transitions persist in `localStorage` across reloads | M1 | Survey | DONE |
| 10 | R3.1 Multiple View Modes | Seamless switching between Kanban, Grid Cards, Table, and Popup List modes | M1 | Survey | DONE |
| 11 | R3.2 Task Viewing Modal | Opens from KPI cards, pipeline bars, department cards, Kanban cards, grid cards, table rows, personnel, channels | M1 | Survey | DONE |
| 12 | R3.3 Modal Search & Filter | Working search query, sub-department tabs, and visual class synchronization | M1 | Survey | DONE |
| 13 | R3.4 Accordions & Properties | Accordion expansion/collapse, brief display, supervisor feedback, properties table | M1 | Survey | DONE |
| 14 | R3.5 Safe Hyperlink Handling | Valid URLs render as clickable external links; plain text values render as text tags (no 404 navigations) | M1 | Survey | DONE |
| 15 | R4.1 Visual Styling & Contrast | High-contrast dark text `#0f172a`, clean bright background `#f1f3f7` | M1 | Survey | DONE |
| 16 | R4.2 Priority Badges | Untruncated badges: `'P1 • Khẩn cấp'`, `'P2 • Cao'`, `'P3 • Trung bình'` with `whitespace-nowrap` | M1 | Survey | DONE |
| 17 | R4.3 Multi-file Parity | All changes strictly mirrored across `index.html`, `marcom_rust/static/index.html`, and `website_preview.html` | M1 | Survey | DONE |
| 18 | R5.1 Local Server Active | Ensure `server.ps1` runs on `http://localhost:8080/` with HTTP 200 responses | M2 | Survey | DONE |
| 19 | R5.2 Data Sync API | `syncData()` connects to `/api/data` or `/api/sync` with graceful fallback | M1 | Survey | DONE |
| 20 | R5.3 Final Verification & Report | Comprehensive verification of all acceptance criteria with structured final report | M2 | Survey | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Dashboard Core Remediation & Multi-file Sync | Fix status mapping, badge truncation, urgent task filter, broken links, modal personnel/channels, modal subfilter desync, localStorage DnD persistence, dynamic data fetch, and mirror across all 3 files | None | DONE |
| M2 | Full E2E Verification & Server Validation | Verify all R1-R5 acceptance criteria on running server, run multi-tier tests, reviewer verification, challenger stress-tests, forensic audit | M1 | DONE |

## Code Layout
- `c:\Users\My_PC\Documents\Gia Dung Thông Minh 3AE\index.html` (Primary Dashboard UI)
- `c:\Users\My_PC\Documents\Gia Dung Thông Minh 3AE\marcom_rust\static\index.html` (Rust static bundle)
- `C:\Users\My_PC\.gemini\antigravity\brain\4ef40a1a-a442-478f-b807-4227f65a4ad6\website_preview.html` (Preview mirror)
- `c:\Users\My_PC\Documents\Gia Dung Thông Minh 3AE\server.ps1` (Local HTTP server)
- `c:\Users\My_PC\Documents\Gia Dung Thông Minh 3AE\database.json` (Database schema & records)
- `c:\Users\My_PC\Documents\Gia Dung Thông Minh 3AE\tests\` (E2E and adversarial test suites)

## Interface Contracts
### Dashboard Data Pipeline
- `DB`: Inlined JavaScript object fallback + dynamic reload from `/api/data` or `database.json`.
- `getTaskStatusKey(r)`:
  - If `r._overriddenStatusKey` exists -> returns `r._overriddenStatusKey`
  - If includes 'hoàn thành', 'đã', 'xong', '4.' -> `'done'`
  - If includes 'đang', '2.', 'tiến hành' -> `'doing'`
  - If includes 'duyệt', 'review', 'feedback', '3.' -> `'review'`
  - Otherwise -> `'todo'`
- `formatPriorityBadge(p)`:
  - 'p1' / 'khẩn' -> `'P1 • Khẩn cấp'` (badge styling `bg-red-50 text-red-700 border-red-200 whitespace-nowrap font-bold text-[10px]`)
  - 'p2' / 'cao' -> `'P2 • Cao'` (badge styling `bg-amber-50 text-amber-700 border-amber-200 whitespace-nowrap font-bold text-[10px]`)
  - 'p3' / 'trung bình' -> `'P3 • Trung bình'` (badge styling `bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap font-bold text-[10px]`)
- Safe hyperlink rendering:
  - If `val.startsWith('http://') || val.startsWith('https://')` -> clickable `<a>`
  - Otherwise -> styled document tag `<span>` (no broken relative navigations)
- `localStorage` key for Kanban:
  - `marcom_kanban_state_v1`: `{ [taskId]: statusKey }`
