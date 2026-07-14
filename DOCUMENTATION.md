# Survey Leveling System — Technical Documentation
### Version 1.4 | Thesis Defense Reference
### Last Updated: 2026

---

## 1. Introduction

The **Survey Leveling System** is a web-based application designed to digitize and automate the workflow of differential leveling surveys. It addresses common sources of human error in traditional paper-based surveying by providing automated computation, instrument calibration validation, and closure error checking — all within a structured, step-by-step digital workflow.

### 1.1 Problem Statement

Traditional differential leveling relies on manual field notebooks, hand calculations, and paper-based calibration records. This approach is prone to:
- Arithmetic errors in Height of Instrument (HI) and Reduced Level (RL) calculations
- Missed or undetected closure errors
- Inconsistent instrument calibration records
- Difficulty in tracking project progress and generating reports

### 1.2 Objectives

1. Provide a digital platform for recording and computing differential leveling observations
2. Automate the Two-Peg calibration test with pass/fail validation
3. Detect and report closure errors against allowable tolerances
4. Maintain an auditable activity log of all survey actions
5. Support CSV import/export for field data integration

---

## 2. About the System

### 2.1 System Overview

The **Survey Leveling System (SLS)** is a full-stack web application developed as a thesis project to modernize the practice of differential leveling in civil engineering and geodetic surveying. It replaces manual field notebooks and hand computations with a structured digital workflow that guides surveyors from raw field observations through to a validated, exportable survey report.

The system is accessible through any modern web browser and requires no software installation on the user's device, making it practical for use in both office and field environments.

### 2.2 Purpose and Scope

The system is purpose-built for **differential leveling** — a surveying technique used to determine the elevation difference between two or more points. It covers the complete survey lifecycle:

- Recording field observations (Back Sight, Fore Sight, Intermediate Sight)
- Automated computation of Height of Instrument (HI) and Reduced Levels (RL)
- Instrument calibration via the Two-Peg Test
- Closure error detection and validation against standard tolerances
- Report generation and data export

It is not intended for other surveying methods such as traversing, triangulation, or GPS-based positioning.

### 2.3 Target Users

| User | Role in the System |
|---|---|
| Geodetic Engineer / Surveyor | Creates projects, inputs field data, confirms computations |
| Survey Technician | Performs calibration tests, imports CSV field data |
| Project Supervisor | Reviews reports, monitors project progress on the dashboard |

### 2.4 Key Features Summary

| Feature | Description |
|---|---|
| User Authentication | Secure login with bcrypt-hashed passwords and session management |
| Project Management | Create, edit, delete, and track multiple survey projects |
| Data Input | Manual entry or CSV import of leveling observations |
| Auto-Computation | Automatic HI, RL, Rise, and Fall calculation |
| Closure Error Check | Real-time misclose detection against 12mm√K tolerance |
| Two-Peg Calibration | Automated collimation error calculation with ±3mm pass/fail |
| Progress Tracking | Milestone-based progress (0% → 25% → 50% → 75% → 100%) |
| Recycle Bin | Soft-delete with restore and permanent delete |
| Reports | Unified view of leveling and calibration records |
| Data Export | CSV, TXT, PDF, and Excel export formats |
| Activity Logs | Full audit trail of all system actions with search and date filter |

### 2.5 System Context

This system was developed in response to the need for a low-cost, accessible digital tool for surveying education and small-scale engineering projects in the Philippines. Existing commercial surveying software (e.g., Leica Infinity, Trimble Business Center) is expensive and requires specialized hardware. The Survey Leveling System provides the core computational and record-keeping functionality needed for differential leveling at no cost, running entirely in a web browser.

### 2.6 Development Background

- **Project Type:** Undergraduate Thesis / Capstone Project
- **Version:** 1.4
- **Development Period:** 2025 – 2026
- **Platform:** Web (Browser-based, responsive for desktop and mobile)
- **Hosting:** Vercel (serverless deployment)
- **Database:** Turso (cloud-hosted libSQL, SQLite-compatible)

### 2.7 How the System Addresses the Problem

| Traditional Problem | System Solution |
|---|---|
| Manual HI and RL arithmetic errors | Auto-calculated on every keystroke via `computeRows()` |
| Undetected closure errors | Real-time closure check in Data Input; full analysis in Computation |
| No calibration records | Structured Two-Peg Test form with stored pass/fail history |
| Paper-based progress tracking | Milestone progress bar (0–100%) per project |
| Difficult report generation | One-click export to CSV, TXT, PDF, or Excel |
| No audit trail | Automatic activity log for every key action |
| Accidental permanent deletion | Soft-delete with Recycle Bin — restore or permanently delete |

---

## 3. System Architecture

### 3.1 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | UI rendering and state management |
| Backend | Express.js + Node.js | REST API server |
| Database | Turso (libSQL / SQLite-compatible) | Cloud-hosted relational database |
| Styling | Custom CSS + Poppins font | UI design |
| Authentication | bcrypt + sessionStorage | Secure login and session control |
| Rate Limiting | express-rate-limit | Brute-force protection |
| PDF Export | jsPDF + jsPDF-AutoTable (CDN) | Report generation |
| Deployment | Vercel | Cloud hosting |

### 3.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
│  React 18 + TypeScript                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │Dashboard │ │DataInput │ │Computation│             │
│  └──────────┘ └──────────┘ └──────────┘             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │Calibration│ │ Reports │ │ Projects │             │
│  └──────────┘ └──────────┘ └──────────┘             │
└────────────────────┬────────────────────────────────┘
                     │ HTTP REST API
┌────────────────────▼────────────────────────────────┐
│                 SERVER (Express.js)                  │
│  /api/auth    /api/projects    /api/calibrations     │
│  /api/logs    /api/stats       /api/observations     │
└────────────────────┬────────────────────────────────┘
                     │ libSQL
┌────────────────────▼────────────────────────────────┐
│              DATABASE (Turso / libSQL)               │
│  users  projects  leveling_rows  calibrations        │
│  activity_logs                                       │
└─────────────────────────────────────────────────────┘
```

### 3.3 Project File Structure

```
sicp-leveling-system/
├── api/
│   ├── auth/
│   │   ├── login.js
│   │   └── register.js
│   ├── logs/
│   │   └── index.js
│   ├── projects/
│   │   ├── index.js             # GET (active only) + POST
│   │   ├── [id].js              # PATCH + DELETE (soft)
│   │   ├── trash.js             # GET + DELETE (permanent)
│   │   └── [id]/
│   │       └── restore.js       # POST — restore from recycle bin
│   └── _db.js                   # Turso client
├── src/
│   ├── components/          # All React UI components and CSS
│   │   ├── DashboardPage.tsx
│   │   ├── DataInputPage.tsx
│   │   ├── ComputationPage.tsx
│   │   ├── CalibrationPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── ProjectListPage.tsx
│   │   ├── Sidebar.tsx
│   │   ├── RecycleBinModal.tsx
│   │   ├── [Other modal components]
│   │   ├── useProjects.ts       # Custom hook for project data
│   │   └── useActivityLogs.ts   # Custom hook for logs
│   ├── db/
│   │   ├── client.js            # Turso DB connection
│   │   ├── migrate.js           # Migration runner
│   │   └── migrations/          # Versioned schema migrations (001–007)
│   └── index.tsx                # App entry point
├── scripts/
│   └── migrate.js               # Build-time migration runner
├── server.js                    # Express API server (local dev)
├── vite.config.ts
└── vercel.json                  # Deployment config
```

---

## 4. Database Schema

### 4.1 Entity-Relationship Overview

```
users ──< projects ──< leveling_rows
                  ──< calibrations
activity_logs (standalone, references project by name in message)
```

### 4.2 Table Definitions

#### `users`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment primary key |
| name | TEXT | Full name of the user |
| email | TEXT UNIQUE | Login email address |
| password | TEXT | bcrypt-hashed password |
| created_at | DATETIME | Account creation timestamp |

#### `projects`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment primary key |
| name | TEXT | Project name |
| instrument | TEXT | Surveying instrument used |
| bm_elevation | REAL | Benchmark elevation (m) |
| method | TEXT | Computation method (Rise & Fall) |
| distance_k | REAL | Distance constant K (km) |
| status | TEXT | Project status (active/complete) |
| progress | INTEGER | Progress percentage (0/25/50/75/100) |
| created_at | DATETIME | Creation timestamp |
| deleted_at | TEXT | Soft-delete timestamp (NULL = active, non-NULL = in recycle bin) |

#### `leveling_rows`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment primary key |
| project_id | INTEGER FK | References projects.id |
| station | TEXT | Station name (BM1, TP1, etc.) |
| bs | REAL | Back Sight reading (m) |
| is_val | REAL | Intermediate Sight reading (m) |
| fs | REAL | Fore Sight reading (m) |
| hi | REAL | Height of Instrument (m) — computed |
| rise | REAL | Rise value (m) — computed |
| fall | REAL | Fall value (m) — computed |
| rl | REAL | Reduced Level / Elevation (m) |
| remarks | TEXT | Optional field notes |
| row_order | INTEGER | Sequence order of observation |

#### `calibrations`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment primary key |
| project_id | INTEGER FK | References projects.id (nullable) |
| instrument | TEXT | Instrument name/ID |
| date | TEXT | Calibration date |
| d1_near | REAL | Staff reading A1 — near peg from instrument |
| d1_far | REAL | Staff reading A2 — far peg from instrument |
| d2_near | REAL | Staff reading B1 — near peg from other end |
| d2_far | REAL | Staff reading B2 — far peg from other end |
| error | REAL | Computed collimation error (m) |
| status | TEXT | PASS or FAIL |
| method | TEXT | Test method used |
| distance | REAL | Distance between pegs (m) |
| created_at | DATETIME | Record creation timestamp |

#### `activity_logs`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Auto-increment primary key |
| type | TEXT | Log category (project, calibration, computation, etc.) |
| message | TEXT | Human-readable log message |
| sub | TEXT | Sub-message or secondary info |
| details | TEXT | JSON string of detailed changes |
| created_at | DATETIME | Log timestamp |

---

## 5. Core Functionality

### 5.1 Authentication Module

**Registration** (`POST /api/auth/register`)
- Validates name, email, and password fields
- Checks for duplicate email addresses
- Hashes password using bcrypt (salt rounds: 10)
- Stores user record in the `users` table

**Login** (`POST /api/auth/login`)
- Rate-limited to 20 attempts per 15-minute window (brute-force protection)
- Verifies email existence and bcrypt password comparison
- On success, stores `isLoggedIn = 'true'` and `userName` in `sessionStorage`

**Session Management**
- All protected pages check `sessionStorage.getItem('isLoggedIn')` on mount
- Browser back-button navigation is intercepted via `window.history.pushState`
- Tab visibility changes re-trigger authentication checks
- Logout clears both `sessionStorage` and `localStorage`

---

### 5.2 Project Management

**Create Project** (`POST /api/projects`)

Fields: name, instrument, BM elevation, computation method, distance K

Duplicate submission is prevented by disabling the submit button and showing "Creating…" while the request is in flight (`saving` state in `NewProjectModal.tsx`).

**Progress Milestone System**

Progress is automatically calculated based on completed workflow steps:

| Progress | Milestone Condition |
|---|---|
| 0% | Project created, no data |
| 25% | Leveling observations saved |
| 50% | Calibration record saved |
| 75% | Computation confirmed |
| 100% | Report exported or marked complete |

The `updateProjectProgress()` utility function queries the database state and sets the appropriate milestone automatically — no manual progress input required.

**CSV Import Workflow**

Users can import a pre-formatted CSV template that auto-creates a project and bulk-inserts observations in a single operation:

```
LEVELING OBSERVATION TEMPLATE

Project Name,Highway Survey 2024
Instrument,Leica NA2
BM Elevation,100.000
Method,Rise & Fall
Distance K,2.5

Station,BS,IS,FS,HI,Rise,Fall,RL
BM1,1.234,,,,,
TP1,,1.456,1.789,,,
BM2,,,2.345,,,
```

The import parser:
1. Reads project metadata from the header rows
2. Creates the project via `POST /api/projects`
3. Bulk-inserts all observation rows via `POST /api/observations/bulk`
4. Updates project progress to 25%

---

### 5.3 Data Input Module

**Component:** `DataInputPage.tsx`

The data input table accepts the following fields per observation row:

| Field | Input Type | Description |
|---|---|---|
| STA | Manual | Station name (BM1, TP1, CP1, BM2) |
| BS | Manual | Back Sight staff reading (m) |
| FS | Manual | Fore Sight staff reading (m) |
| IFS | Manual | Intermediate Fore Sight (m) |
| HI | Auto-calculated | Height of Instrument = previous RL + BS |
| ELEV | Auto-calculated | Reduced Level = HI − FS (or HI − IFS) |

**Auto-Calculation Logic (`computeRows` function):**

```
Row 0 (BM1):
  HI = ELEV + BS  (user enters ELEV manually)

Row i > 0:
  If FS present:
    ELEV = current_HI − FS
    If BS also present (Turning Point):
      new_HI = ELEV + BS
  If IFS present:
    ELEV = current_HI − IFS  (no HI update)
```

**Closure Check (footer row):**
- Displays ΣBS and ΣFS totals
- Shows "✓ Closed" if `|(ΣBS − ΣFS) − (Last ELEV − First ELEV)| < 0.001`
- Shows "✗ Open" if the loop does not close

**Save Operation:**
1. Deletes all existing rows for the project (`DELETE /api/projects/:id/rows`)
2. Re-inserts all current rows sequentially
3. Calls `updateProjectProgress()` → sets progress to 25%
4. Displays animated success toast notification

---

### 5.4 Computation Module

**Component:** `ComputationPage.tsx`

Implements the **Rise & Fall Method** of differential leveling computation.

**Computed Values per Row:**

| Value | Formula |
|---|---|
| Rise | `RL[i] − RL[i−1]` if positive |
| Fall | `|RL[i] − RL[i−1]|` if negative |

**Arithmetic Check (3-way verification):**

The system verifies three values must be equal:
1. `ΣBS − ΣFS`
2. `ΣRise − ΣFall`
3. `Last RL − First RL`

If all three match, the arithmetic is confirmed correct.

**Closure Error Analysis:**

```
Misclose = (ΣBS − ΣFS) − (Last RL − First RL)

Allowable Error = 0.012 × √(distance in km)   [12mm√K standard]

Status:
  PASS  →  |Misclose| ≤ Allowable Error
  FAIL  →  |Misclose| > Allowable Error
```

**Confirm Computation:**
- Calls `updateProjectProgress()` → sets progress to 75%
- Logs the action to `activity_logs` with misclose value, closure status, and ΣBS−ΣFS
- Redirects to Calibration page

---

### 5.5 Calibration Module

**Component:** `CalibrationPage.tsx`

Implements the **Two-Peg Test** for detecting collimation error in automatic levels.

**Test Setup:**

Two pegs (A and B) are placed at a known distance apart. Staff readings are taken from two instrument positions:

| Reading | Description |
|---|---|
| A1 | Staff at Peg A, instrument near Peg A |
| A2 | Staff at Peg B, instrument near Peg A |
| B1 | Staff at Peg A, instrument near Peg B |
| B2 | Staff at Peg B, instrument near Peg B |

**Collimation Error Formula:**

```
Collimation Error = [(A2 − B2) − (A1 − B1)] / 2

Correction Factor = Collimation Error / Distance (m/m)

Tolerance: ±3mm (0.003 m)

Status:
  PASS  →  |Collimation Error| ≤ 0.003 m
  FAIL  →  |Collimation Error| > 0.003 m
```

**Save Operation:**
- Posts calibration record to `POST /api/calibrations`
- Links to project via `project_id` if accessed from a project workflow
- Calls `updateProjectProgress()` → sets progress to 50%
- Logs action to `activity_logs`

---

### 5.6 Recycle Bin Module

**Component:** `RecycleBinModal.tsx`  
**Accessible via:** Settings (user avatar) → Data → Recycle Bin

Projects are never permanently deleted by the standard delete action. Instead, `deleted_at` is set to the current timestamp (soft-delete). The Recycle Bin shows all projects where `deleted_at IS NOT NULL`.

**Restore:**
- Calls `POST /api/projects/:id/restore` — sets `deleted_at = NULL`
- Logs action to `activity_logs` ("Project [name] restored by [user]")
- Triggers `onRestored` callback → `refetch()` + `fetchLogs()` in the parent page so the project list and dashboard update instantly without a page reload
- Shows a success modal on completion

**Permanent Delete:**
- Calls `DELETE /api/projects/trash` with `{ id }` in the request body
- Requires confirmation modal before executing
- Removes the project and all related `leveling_rows` from the database

**Z-index Layering:**

| Layer | Value |
|---|---|
| `rb-overlay` (Recycle Bin modal) | 9000 |
| `settings-overlay` (Settings modal) | 9999 |
| `ep-notif-overlay` (Success modal) | 99999 |

---

### 5.7 Reports Module

**Component:** `ReportsPage.tsx`

Displays a unified view of all leveling projects and calibration records.

**Report Statistics:**
- Total reports (projects + calibrations)
- Completed projects (progress = 100%)
- Pending projects (progress < 100%)
- Calibrations passed (status = PASS)

**Filter Options:** All | Leveling | Calibration

**Mark as Complete:**
- Only visible when project progress ≥ 75% (computation confirmed)
- Requires confirmation via modal
- Sets project progress to 100%
- Logs action to `activity_logs`

---

### 5.8 Export Module

**Component:** `ExportDataModal.tsx`

Supported export formats:

| Format | Method | Contents |
|---|---|---|
| CSV | Blob download | All observation rows + totals |
| TXT | Blob download | Plain text formatted report |
| PDF | jsPDF + AutoTable | Formatted table with project info |
| Excel (.xls) | HTML table as .xls | Spreadsheet-compatible format |

After any export, project progress is automatically updated to 100%.

---

### 5.9 Activity Logs Module

**Component:** `ActivityLogsModal.tsx`, `useActivityLogs.ts`

All key system actions are automatically logged:

| Action | Log Type | Log Message Format |
|---|---|---|
| Project created | `project` | "Project [name] created by [user]" |
| Project deleted | `project` | "Project [name] deleted by [user]" |
| Project restored | `project` | "Project [name] restored by [user]" |
| Calibration saved | `calibration` | "Calibration saved for [project] by [user]" |
| Calibration updated | `calibration` | "Calibration updated for [project] by [user]" |
| Computation confirmed | `computation` | "Computation confirmed for [project] — Misclose: Xmm, Status: PASS/FAIL" |
| Report marked complete | `report` | "Report marked complete for [project] by [user]" |

**Log Filtering (Full Modal):**
- Search by message text or category
- Date range filter (From / To)
- Click any log entry to view full details and change history

---

## 6. API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (rate-limited: 20/15min) |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | Get all active projects (excludes soft-deleted) |
| POST | `/api/projects` | Create new project |
| PATCH | `/api/projects/:id` | Update project fields |
| DELETE | `/api/projects/:id` | Soft-delete project (sets `deleted_at`) |

### Recycle Bin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects/trash` | Get all soft-deleted projects |
| DELETE | `/api/projects/trash` | Permanently delete a project (body: `{ id }`) |
| POST | `/api/projects/:id/restore` | Restore a project (sets `deleted_at = NULL`) |

### Observations
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects/:id/rows` | Get all rows for a project |
| POST | `/api/projects/:id/rows` | Add single observation row |
| POST | `/api/observations/bulk` | Bulk import observations |
| DELETE | `/api/projects/:id/rows` | Delete all rows for a project |

### Calibrations
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/calibrations` | Get all calibration records |
| GET | `/api/projects/:id/calibration` | Get calibration linked to a project |
| POST | `/api/calibrations` | Create calibration record |
| PATCH | `/api/calibrations/:id` | Update calibration record |
| DELETE | `/api/calibrations/:id` | Delete calibration record |

### Auth (additional)
| Method | Endpoint | Description |
|---|---|---|
| PATCH | `/api/auth/update` | Update user name or password |

### Stats & Logs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stats/dashboard` | Dashboard stats (totals, last closure mm) |
| GET | `/api/logs` | Get recent activity logs (limit 50) |
| POST | `/api/logs` | Create activity log entry |

---

## 7. Survey Workflow

The system enforces a structured 4-step workflow per project:

```
Step 1: Data Input (Progress → 25%)
  └─ Enter or import leveling observations
  └─ System auto-calculates HI and ELEV
  └─ Closure check displayed in real-time
Step 2: Calibration (Progress → 50%)
  └─ Two-Peg Test data entry
  └─ Collimation error auto-calculated
  └─ Pass/Fail against ±3mm tolerance
  └─ Record saved and linked to project
Step 3: Computation (Progress → 75%)
  └─ Rise & Fall method applied to all rows
  └─ Arithmetic check (3-way verification)
  └─ Closure error vs. allowable tolerance (12mm√K)
  └─ Confirm button locks computation
Step 4: Report / Export (Progress → 100%)
  └─ View unified report
  └─ Export to CSV / TXT / PDF / Excel
  └─ Mark as Complete
```

> Note: Steps 2 and 3 can be performed in either order. Progress milestones are set independently.

---

## 8. Security Implementation

| Concern | Implementation |
|---|---|
| Password storage | bcrypt hashing (10 salt rounds) |
| Brute-force protection | express-rate-limit (20 attempts / 15 min) |
| Session persistence | sessionStorage (cleared on tab close) |
| Route protection | Auth check on every page mount |
| Back-button bypass | `window.history.pushState` interception |
| Tab-switch bypass | `visibilitychange` event re-checks auth |
| Logout | Clears sessionStorage + localStorage, redirects to login |
| Current Password field | Permanently `type="password"` — eye toggle removed to prevent accidental exposure |

---

## 9. Mathematical Formulas Reference

### Height of Instrument Method
```
HI = RL_BM + BS
RL_TP = HI − FS
RL_IS = HI − IS
```

### Rise & Fall Method
```
Rise[i] = RL[i] − RL[i−1]  (if positive)
Fall[i] = RL[i−1] − RL[i]  (if positive)
```

### Arithmetic Check (3-way)
```
ΣBS − ΣFS = ΣRise − ΣFall = Last RL − First RL
```

### Closure Error
```
Misclose (m) = (ΣBS − ΣFS) − (Last RL − First RL)
Misclose (mm) = Misclose × 1000

Allowable Error = 12mm × √K   where K = distance in km
```

### Two-Peg Collimation Error
```
Collimation Error = [(A2 − B2) − (A1 − B1)] / 2
Correction Factor = Collimation Error / Distance (m/m)
Tolerance: ±3mm
```

---

## 10. Installation & Deployment

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in TURSO_URL and TURSO_AUTH_TOKEN

# 3. Run development server
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `TURSO_URL` | Turso database URL (e.g. `libsql://your-db.turso.io`) |
| `TURSO_DATABASE_URL` | Same as `TURSO_URL` (alias used by some modules) |
| `TURSO_AUTH_TOKEN` | Auth token from Turso dashboard |

For Vercel deployment, add these under **Settings → Environment Variables** in the Vercel dashboard, then redeploy.

### Production Deployment (Vercel)

The project uses file-based API routing under `api/`. Each file in `api/` is a Vercel serverless function. The `vercel.json` rewrite uses a negative lookahead to avoid intercepting API routes:

```json
{
  "buildCommand": "vite build && node scripts/migrate.js",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
}
```

Migrations run at build time via `scripts/migrate.js` — not at runtime — to avoid cold start delays.

---

## 11. Limitations & Future Work

### Current Limitations
- Single-user session (no multi-user concurrent access control)
- No offline mode (requires internet connection to Turso)
- Excel export uses HTML table format (.xls), not native XLSX
- Computation uses fixed 12mm√K tolerance (not configurable per project)
- Turso free-tier databases suspend after inactivity (requires manual wake at app.turso.tech)

### Recommended Future Enhancements
- Role-based access control (Admin / Field Engineer / Viewer)
- Bowditch / Transit rule adjustment for distributed closure error
- GPS coordinate integration per station
- Digital signature on exported reports
- Mobile-native app (React Native)

---

## 12. Glossary

| Term | Definition |
|---|---|
| BM | Benchmark — a point of known elevation |
| BS | Back Sight — first staff reading at a new instrument position |
| FS | Fore Sight — last staff reading before moving the instrument |
| IS | Intermediate Sight — staff reading between BS and FS |
| HI | Height of Instrument — elevation of the line of sight |
| RL | Reduced Level — computed elevation of a point |
| TP | Turning Point — a temporary benchmark used to extend a level run |
| Misclose | Difference between computed and known elevation at the closing BM |
| Collimation Error | Angular error in the instrument's line of sight |
| Two-Peg Test | Field test to detect and measure collimation error |
| K | Distance constant in km used in allowable error formula |

---

---

## 13. Bug Fixes & Patch Notes

### v1.3 — Patch 1

| # | Component | Issue | Fix |
|---|---|---|---|
| 1 | `NewProjectModal.tsx` | Modal stuck on success overlay after project creation — `setTimeout(onClose, 1500)` set `isOpen = false` but left `toast` state set, keeping the component alive due to `if (!isOpen && !toast) return null` guard | Changed to `setTimeout(() => { setToast(null); onClose(); }, 1500)` so both are cleared together |
| 2 | `ProjectListPage.tsx` | `handleNewProjectSave` was synchronous — `await onSave()` in modal resolved instantly without waiting for the API call | Made `handleNewProjectSave` async and added `await addProject(...)` |
| 3 | `useProjects.ts` | `addProject` did not check `res.ok` — API errors were silently ignored and the modal treated failures as success | Added `if (!res.ok) throw new Error(await res.text())` to propagate errors to the modal's `catch` block |
| 4 | `SettingsModal.tsx` | Current Password field had a show/hide eye toggle — toggling to `type="text"` could expose the typed password on screen | Removed eye toggle from Current Password field; field is now permanently `type="password"` with `autoComplete="current-password"` |

---

### v1.4 — Feature Update & Bug Fixes

**New Features**

| # | Feature | Description |
|---|---|---|
| 1 | Recycle Bin | Soft-delete via `deleted_at` column (migration 007). Deleted projects move to Recycle Bin instead of being permanently removed. Accessible from Settings → Data → Recycle Bin. |
| 2 | Restore Project | `POST /api/projects/:id/restore` sets `deleted_at = NULL`. Project list and dashboard update instantly via `refetch()` + `fetchLogs()` callbacks without page reload. |
| 3 | Permanent Delete | `DELETE /api/projects/trash` with `{ id }` body permanently removes project and all related rows after confirmation. |
| 4 | Duplicate Submission Prevention | `NewProjectModal.tsx` uses `saving` state — submit button is disabled and shows "Creating…" while the API request is in flight. |
| 5 | Delete Activity Logging | `ProjectListPage.tsx` captures `deleteTargetName` before clearing state, then calls `postLog` after successful delete so the activity log always includes the correct project name. |
| 6 | Restore Activity Logging | `RecycleBinModal.tsx` calls `postLog` after restore and fires `onRestored` callback to refresh dashboard logs. |

**Bug Fixes**

| # | Component | Issue | Fix |
|---|---|---|---|
| 1 | `vercel.json` | PATCH/DELETE on `/api/projects/:id` returned 405 — the catch-all rewrite `/:path*` was intercepting API routes before they reached the serverless functions | Changed rewrite source to `/((?!api/).*)` (negative lookahead) so API routes are never matched by the rewrite |
| 2 | `api/_db.js` | Migrations ran at runtime on every cold start, causing delays and potential race conditions | Moved migrations to build time via `vercel.json` `buildCommand: "vite build && node scripts/migrate.js"` |
| 3 | `api/projects/[id]/restore.js` | Restore via `PATCH` with `restore: true` flag returned 405 on Vercel for dynamic routes | Created dedicated `POST /api/projects/:id/restore` endpoint — POST on dedicated files is reliable on Vercel |
| 4 | `RecycleBinModal.tsx` / `DashboardPage.tsx` | Project list and activity logs did not update after restore without a page reload — `useProjects` instances are not shared between components | Added `refetch` to `useProjects`; wired `onProjectRestored` callback through `Sidebar` → `SettingsModal` → `RecycleBinModal`; `onRestored` fires `refetch()` + `fetchLogs()` in the owning page |
| 5 | `RecycleBinModal.css` / `NewProjectModal.css` | Success modal (z-index 2000) rendered behind the Recycle Bin overlay (z-index 10000) | Set `ep-notif-overlay` to z-index 99999 and `rb-overlay` to z-index 9000 |

---

*Survey Leveling System V1.4 — © 2026*
