import React, { useState } from 'react';
import './Dashboard.css';
import NewProjectModal from './NewProjectModal';
import ImportDataModal from './ImportDataModal';
import CalibrateModal from './CalibrateModal';
import ExportDataModal from './ExportDataModal';

const IconDashboard = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);

const IconDataInput = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 5v14M5 12h14"/>
    <rect x="3" y="3" width="18" height="18" rx="3"/>
  </svg>
);

const IconComputation = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 7h6M9 12h6M9 17h4"/>
    <rect x="3" y="3" width="18" height="18" rx="3"/>
  </svg>
);

const IconCalibration = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9"/>
    <circle cx="12" cy="12" r="3"/>
    <line x1="12" y1="3" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="21"/>
    <line x1="3" y1="12" x2="6" y2="12"/>
    <line x1="18" y1="12" x2="21" y2="12"/>
  </svg>
);

const IconReports = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="13" y2="17"/>
  </svg>
);

const navItems = [
  { label: 'Data Input', icon: <IconDataInput /> },
  { label: 'Computation', icon: <IconComputation /> },
  { label: 'Calibration', icon: <IconCalibration /> },
  { label: 'Reports', icon: <IconReports /> },
];

const DashboardPage: React.FC = () => {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showImportDataModal, setShowImportDataModal] = useState(false);
  const [showCalibrateModal, setShowCalibrateModal] = useState(false);
  const [showExportDataModal, setShowExportDataModal] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div className="db-page">

      {/* Sidebar */}
      <aside className={`db-sidebar ${sidebarExpanded ? 'expanded' : ''}`} 
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div>
          <div className="db-sidebar-header">
            <span className="db-sidebar-title">Dashboard</span>
          </div>
          <nav className="db-nav">
            <div className="db-nav-item db-nav-active">
              <span className="db-nav-icon"><IconDashboard /></span>
              <span className="db-nav-label">Dashboard</span>
              <span className="db-nav-chevron">›</span>
            </div>
            {[
              { label: 'Data Input', icon: <IconDataInput />, path: '/data-input' },
              { label: 'Computation', icon: <IconComputation />, path: '/computation' },
              { label: 'Calibration', icon: <IconCalibration />, path: '/calibration' },
              { label: 'Reports', icon: <IconReports />, path: '/reports' },
            ].map((item) => (
              <div className="db-nav-item" key={item.label} onClick={() => window.location.href = item.path}>
                <span className="db-nav-icon">{item.icon}</span>
                <span className="db-nav-label">{item.label}</span>
                <span className="db-nav-chevron">›</span>
              </div>
            ))}
          </nav>
        </div>

        <div className="db-user">
          <div className="db-user-avatar">R</div>
          <div className="db-user-info">
            <span className="db-user-name">Ronald Talagtag</span>
            <span className="db-user-role">Engineer</span>
          </div>
          <span className="db-user-chevron">⌄</span>
        </div>
      </aside>

      {/* Main */}
      <main className="db-main">
        <div className="db-content">

          {/* Header */}
          <div className="db-header">
            <h1 className="db-greeting">Hello, Ronald 👋🏼</h1>
            <div className="db-search">
              <span className="db-search-icon">🔍</span>
              <span className="db-search-placeholder">Search</span>
            </div>
          </div>

        {/* Stats */}
        <div className="db-stats-card">
          <div className="db-stat">
            <div className="db-stat-icon">📋</div>
            <div>
              <p className="db-stat-label">Projects</p>
              <p className="db-stat-value">10</p>
              <p className="db-stat-sub green">2 active</p>
            </div>
          </div>
          <div className="db-divider" />
          <div className="db-stat">
            <div className="db-stat-icon">⚙️</div>
            <div>
              <p className="db-stat-label">Status</p>
              <p className="db-stat-value">80%</p>
              <p className="db-stat-sub green">Completed</p>
            </div>
          </div>
          <div className="db-divider" />
          <div className="db-stat">
            <div className="db-stat-icon">🎯</div>
            <div>
              <p className="db-stat-label">Calibration</p>
              <p className="db-stat-value">8</p>
              <p className="db-stat-sub red">1 pending</p>
            </div>
          </div>
          <div className="db-divider" />
          <div className="db-stat">
            <div className="db-stat-icon">📏</div>
            <div>
              <p className="db-stat-label">Last Closure</p>
              <p className="db-stat-value">10</p>
              <p className="db-stat-sub red">mm error</p>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="db-quick-card">
          <h2 className="db-card-title">Quick Access</h2>
          <div className="db-quick-grid">
            {[
              { label: 'New Project', icon: '➕', onClick: () => setShowNewProjectModal(true) },
              { label: 'Import Data', icon: '⬇️', onClick: () => setShowImportDataModal(true) },
              { label: 'Calibrate', icon: '🎯', onClick: () => setShowCalibrateModal(true) },
              { label: 'Export Data', icon: '📁', onClick: () => setShowExportDataModal(true) },
            ].map((q) => (
              <div 
                className="db-quick-item" 
                key={q.label}
                onClick={q.onClick}
              >
                <div className="db-quick-icon">{q.icon}</div>
                <span>{q.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="db-bottom-row">

          {/* Active Projects */}
          <div className="db-projects-card">
            <h2 className="db-card-title">Active Projects</h2>
            {[
              { color: '#FFCC00', name: 'Survey A — Sector 4', progress: 75, edited: 'today', closure: '±2.4mm', status: '⚠️ Calibration: Pending' },
              { color: '#FF383C', name: 'Calibration Unit 7', progress: 40, edited: '3 days ago', closure: '±3.1mm', status: '❌ Calibration: Failed' },
              { color: '#FFCC00', name: 'Two-Peg Test — Unit 3', progress: 30, edited: '1 week ago', closure: '±1.9mm', status: '⚠️ Calibration: Pending' },
            ].map((p) => (
              <div className="db-project-item" key={p.name}>
                <div className="db-project-dot" style={{ background: p.color }} />
                <div className="db-project-info">
                  <div className="db-project-header">
                    <span className="db-project-name">{p.name}</span>
                    <span className="db-project-pct">{p.progress}%</span>
                  </div>
                  <div className="db-progress-bar">
                    <div className="db-progress-fill" style={{ width: `${p.progress}%`, background: p.color }} />
                  </div>
                  <p className="db-project-meta">Last edited: {p.edited} · Closure: {p.closure} · {p.status}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Logs */}
          <div className="db-logs-card">
            <div className="db-logs-header">
              <h2 className="db-card-title" style={{ marginBottom: 0 }}>Activity logs</h2>
              <div className="db-logs-search">🔍 Search</div>
            </div>
            {[
              { dot: '#14AE5C', title: 'FR-6.1 — project saved, computation done', sub: 'Success / Completed' },
              { dot: '#FF383C', title: 'FR-6.2 — closure error exceeded limit', sub: 'Error / Exceeded tolerance' },
              { dot: '#FFCC00', title: 'FR-6.2 — calibration pending, flagged reading', sub: 'Warning / Pending' },
            ].map((log) => (
              <div className="db-log-item" key={log.title}>
                <div className="db-log-dot" style={{ background: log.dot }} />
                <div>
                  <p className="db-log-title">{log.title}</p>
                  <p className="db-log-sub">{log.sub}</p>
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="db-legend">
              {[
                { color: '#34C759', label: 'Success / Completed' },
                { color: '#FF383C', label: 'Error / Exceeded' },
                { color: '#FFCC00', label: 'Warning / Pending' },
                { color: '#8E8E93', label: 'System / Login event' },
                { color: '#0088FF', label: 'Info / Data imported' },
              ].map((l) => (
                <div className="db-legend-item" key={l.label}>
                  <div className="db-legend-dot" style={{ background: l.color }} />
                  <span>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
        </div>
      </main>

      <NewProjectModal 
        isOpen={showNewProjectModal} 
        onClose={() => setShowNewProjectModal(false)} 
      />
      <ImportDataModal 
        isOpen={showImportDataModal} 
        onClose={() => setShowImportDataModal(false)} 
      />
      <CalibrateModal 
        isOpen={showCalibrateModal} 
        onClose={() => setShowCalibrateModal(false)} 
      />
      <ExportDataModal 
        isOpen={showExportDataModal} 
        onClose={() => setShowExportDataModal(false)} 
      />
    </div>
  );
};

export default DashboardPage;
