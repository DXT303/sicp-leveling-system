# Survey Leveling System

A software-based approach for error detection and correction in surveying instruments — featuring differential leveling computation, two-peg calibration, automated closure error checking, and CSV data import/export.

## Features

### 🔐 Authentication & Security
- Secure login with email/password authentication
- Session management with auto-logout on browser back
- Protected routes with authentication checks

### 📊 Dashboard
- Time-based greetings (Good morning ☀️, Good afternoon 🌤️, Good evening 🌙)
- Real-time project statistics and average progress
- Live dashboard stats: total calibrations, pending calibrations, last closure error (mm)
- Active projects list with progress tracking (up to 10 projects)
- Activity logs with inline search and "View All" button
- Quick access buttons: New Project, Import Data, Calibrate, Export Data, Export Template
- Skeletal loading states for better UX

### 📝 Project Management
- Create projects with instrument details, BM elevation, method, and distance
- Import projects from CSV template (auto-create project + observations)
- Export CSV template with project info fields
- View, edit, and delete projects
- Project detail modal with full information and step-by-step workflow
- Delete confirmation modal with project name
- Automatic progress calculation based on milestones:
  - 0% - New project
  - 25% - Data input completed
  - 50% - Calibration completed
  - 75% - Computation confirmed
  - 100% - Report marked as complete

### 📋 Data Input
- Manual leveling observations entry (Station, BS, IS, FS)
- Add/delete observation rows
- Save observations to project
- Automatic progress update to 25% on save

### 🎯 Calibration
- Two-peg calibration test
- Auto-calculating collimation error and correction factor
- Pass/Fail status based on ±3mm tolerance
- Load and update existing calibration records (dirty tracking)
- Link calibration to projects or run standalone
- Automatic progress update to 50% on save
- Activity log on save and update (includes project name and user)

### 🧮 Computation
- Differential leveling computation using Rise & Fall method
- Auto-calculate HI, Rise, Fall, and RL values
- Closure error checking and validation
- Misclose detection with tolerance limits
- Confirm button disabled if computation already confirmed (progress ≥ 75%)
- Automatic progress update to 75% on confirm
- Activity log on confirm (includes project name, user, misclose, closure status, ΣBS−ΣFS)

### 📄 Reports
- Unified reports view (Leveling + Calibration)
- Filter by type: All, Leveling, Calibration
- Report statistics: Total, Completed, Pending, Calibrations Passed
- Mark as Complete button only shown when computation has been confirmed (progress ≥ 75%)
- Actions: View project details, Mark as complete (with confirmation), Delete calibration
- Mark complete confirmation modal
- Activity log on mark as complete (includes project name and user)
- Skeletal loading states

### 📥 Import/Export
- **Import Data**: Upload CSV template to auto-create project and import observations
- **Export Template**: Download CSV template with project info fields and observation headers
- **Export Data**: Export project data to CSV, TXT, PDF (jsPDF), or Excel (.xls HTML table format)
- Automatic progress update to 100% after export

### 📋 Activity Logs
- Logs all key actions: project creation/deletion, calibration save/update, computation confirmation, mark as complete
- All log messages include project name and the user who performed the action
- Inline search on dashboard (by message or category)
- "View All" button opens full Activity Logs Modal with:
  - Search filter by message or category
  - Date range filter (From / To)
  - Clear filters button
  - Log count indicator
  - Click any log to view full details and changes made

### 🎨 UI/UX Enhancements
- Smooth scrolling (removed sticky headers)
- Proper cursor behavior (default for text, text cursor for inputs)
- User-select control (none for UI elements, text for inputs)
- Skeletal loading animations on Dashboard, Projects, and Reports pages
- Scrollable containers for Active Projects and Activity Logs (max-height: 500px)
- Confirmation modals for destructive actions (Delete, Logout, Mark Complete)
- Toast notifications for success messages

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Database**: Turso (libSQL)
- **Styling**: Custom CSS with Poppins font
- **State Management**: React Hooks (useState, useEffect, custom hooks)
- **Authentication**: Session-based with bcrypt password hashing
- **Rate Limiting**: Express rate limiter for login attempts
- **PDF Export**: jsPDF + jsPDF-AutoTable (loaded via CDN)

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Then edit .env and fill in your Turso database credentials

# 3. Run development server
npm run dev

# 4. Build for production
npm run build
```

## Environment Variables

Create a `.env` file from `.env.example` and fill in:

| Variable | Description |
|---|---|
| `TURSO_URL` | Your Turso database URL (e.g. `libsql://your-db.turso.io`) |
| `TURSO_AUTH_TOKEN` | Your Turso auth token from the Turso dashboard |

Get your credentials at [https://turso.tech](https://turso.tech) → your database → **Generate Token**.

## Project Structure

```
cms-login/
├── src/
│   ├── components/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── DataInputPage.tsx
│   │   ├── ComputationPage.tsx
│   │   ├── CalibrationPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── ProjectListPage.tsx
│   │   ├── Sidebar.tsx
│   │   ├── LogoutModal.tsx
│   │   ├── MarkCompleteModal.tsx
│   │   ├── DeleteProjectModal.tsx
│   │   ├── NewProjectModal.tsx
│   │   ├── ImportDataModal.tsx
│   │   ├── ExportDataModal.tsx
│   │   ├── CalibrateModal.tsx
│   │   ├── ProjectDetailModal.tsx
│   │   ├── EditProjectModal.tsx
│   │   ├── ReportModal.tsx
│   │   ├── DataInputModal.tsx
│   │   ├── ComputationModal.tsx
│   │   ├── CalibrationModal.tsx
│   │   ├── ActivityLogDetailModal.tsx
│   │   ├── ActivityLogsModal.tsx
│   │   ├── useProjects.ts
│   │   ├── useActivityLogs.ts
│   │   └── [CSS files]
│   ├── db/
│   │   ├── client.js
│   │   ├── schema.js
│   │   ├── migrate.js
│   │   └── migrations/
│   │       ├── 001_initial_schema.js
│   │       ├── 002_projects_add_fields.js
│   │       ├── 003_activity_logs_add_details.js
│   │       ├── 004_leveling_rows_index.js
│   │       ├── 005_calibrations_add_method.js
│   │       └── 006_calibrations_add_distance.js
│   ├── index.tsx
│   └── index.css
├── public/
├── server.js
├── package.json
└── .env
```

## Usage

### 1. Authentication
- Register with name, email, and password
- Login with email and password
- Session persists until logout

### 2. Create Project (Two Methods)

**Method A: Manual Creation**
- Click "New Project" on Dashboard
- Fill in project details (name, instrument, BM elevation, method, distance)
- Manually add observations in Data Input page

**Method B: CSV Import (Recommended)**
- Click "Export Template" on Dashboard to download CSV template
- Fill in the template:
  ```csv
  LEVELING OBSERVATION TEMPLATE

  Project Name,Highway Survey 2024
  Instrument,Leica DNA03
  BM Elevation,100.000
  Method,Rise & Fall
  Distance K,2.5

  Station,BS,IS,FS,HI,Rise,Fall,RL
  BM1,1.234,,,,,
  TP1,,1.456,1.789,,,
  BM2,,,2.345,,,
  ```
- Click "Import Data" and upload the filled CSV
- Project and observations are automatically created

### 3. Workflow
1. **Data Input** (Progress: 25%) — Add/import leveling observations
2. **Calibration** (Progress: 50%) — Perform two-peg test and validate instrument
3. **Computation** (Progress: 75%) — Calculate HI, Rise, Fall, RL, and confirm closure error
4. **Report / Complete** (Progress: 100%) — Review survey report and mark as complete

### 4. Reports
- View all project reports and calibration records
- Filter by type (All, Leveling, Calibration)
- Mark as Complete button only visible when computation is confirmed (progress ≥ 75%)
- View project details and edit information

### 5. Export Data
- Select project and format (CSV, TXT, PDF, Excel)
- Data is exported with all observations and totals row
- Project progress automatically updates to 100%

### 6. Activity Logs
- All key actions are automatically logged with project name and user
- Use the inline search on the dashboard to filter recent logs
- Click "View All" to open the full logs modal with date range filtering

## Database Schema

### Tables
- **users** - User accounts (id, name, email, password, created_at)
- **projects** - Survey projects (id, name, instrument, bm_elevation, method, distance_k, status, progress, created_at)
- **leveling_rows** - Observation data (id, project_id, station, bs, is_val, fs, hi, rise, fall, rl, remarks, row_order)
- **calibrations** - Calibration records (id, project_id, instrument, date, d1_near, d1_far, d2_near, d2_far, error, status, method, distance, created_at)
- **activity_logs** - System activity logs (id, type, message, sub, details, created_at)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (rate limited: 20 attempts per 15 minutes)

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Observations
- `GET /api/projects/:id/rows` - Get project observations
- `POST /api/projects/:id/rows` - Add observation
- `POST /api/observations/bulk` - Bulk import observations
- `DELETE /api/projects/:id/rows` - Delete all project observations

### Calibrations
- `GET /api/calibrations` - Get all calibrations
- `GET /api/projects/:id/calibration` - Get calibration linked to a project
- `POST /api/calibrations` - Create calibration record
- `PATCH /api/calibrations/:id` - Update calibration record
- `DELETE /api/calibrations/:id` - Delete calibration

### Stats
- `GET /api/stats/dashboard` - Get dashboard stats (calibration total, pending, last closure mm)

### Activity Logs
- `GET /api/logs` - Get recent activity logs (limit 50)
- `POST /api/logs` - Create activity log

## License

© 2026 Survey Leveling System V1.3
