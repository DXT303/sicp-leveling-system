import React, { useState } from 'react';
import './Dashboard.css';

const navItems = [
  { label: 'Data Input', icon: '⊞' },
  { label: 'Computation', icon: '📋' },
  { label: 'Calibration', icon: '🎯' },
  { label: 'Reports', icon: '📄' },
];

const DashboardPage: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="db-page">

      {/* Sidebar */}
      <aside className={`db-sidebar${collapsed ? ' collapsed' : ''}`}>
        <div>
          <div className="db-sidebar-header">
            <span className="db-sidebar-title">Dashboard</span>
            <button className="db-toggle-btn" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? '›' : '‹'}
            </button>
          </div>
          <nav className="db-nav">
            <div className="db-nav-item db-nav-active">
              <span className="db-nav-icon">⊞</span>
              <span className="db-nav-label">Dashboard</span>
              <span className="db-nav-chevron">›</span>
            </div>
            {navItems.map((item) => (
              <div className="db-nav-item" key={item.label}>
                <span className="db-nav-icon">{item.icon}</span>
                <span className="db-nav-label">{item.label}</span>
                <span className="db-nav-chevron">›</span>
              </div>
            ))}
          </nav>
        </div>

        <div className="db-user">
          <div className="db-user-avatar">R</div>
          {!collapsed && (
            <>
              <div className="db-user-info">
                <span className="db-user-name">Ronald Talagtag</span>
                <span className="db-user-role">Engineer</span>
              </div>
              <span className="db-user-chevron">⌄</span>
            </>
          )}
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
              { label: 'New Project', icon: '➕' },
              { label: 'Import Data', icon: '⬇️' },
              { label: 'Calibrate', icon: '🎯' },
              { label: 'Export Data', icon: '📁' },
            ].map((q) => (
              <div className="db-quick-item" key={q.label}>
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
    </div>
  );
};

export default DashboardPage;
