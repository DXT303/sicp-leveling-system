import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import Sidebar from './Sidebar';
import NewProjectModal from './NewProjectModal';
import ImportDataModal from './ImportDataModal';
import CalibrateModal from './CalibrateModal';
import ExportDataModal from './ExportDataModal';
import LogoutModal from './LogoutModal';
import { useProjects } from './useProjects';
import { useActivityLogs, postLog, dotColor } from './useActivityLogs';
import ActivityLogDetailModal from './ActivityLogDetailModal';
import { ActivityLog } from './useActivityLogs';

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

const IconProjects = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 7h18M3 12h18M3 17h18"/>
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { projects, addProject, deleteProject } = useProjects();
  const { logs, fetchLogs } = useActivityLogs();
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const userName = sessionStorage.getItem('userName') || 'User';
  const firstName = userName.split(' ')[0];
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  });

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        setIsAuthenticated(false);
        window.location.replace('/');
        return;
      }
    };

    checkAuth();
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      const isLoggedIn = sessionStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        setIsAuthenticated(false);
        window.location.replace('/');
      } else {
        window.history.pushState(null, '', window.location.href);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(false);
    setIsAuthenticated(false);
    sessionStorage.clear();
    localStorage.clear();
    window.location.replace('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="db-page">

      <Sidebar activePath="/dashboard" onLogout={() => setShowLogoutModal(true)} />

      {/* Main */}
      <main className="db-main">
        <div className="db-content">

          {/* Header */}
          <div className="db-header">
            <h1 className="db-greeting">Hello, {firstName} 👋🏼</h1>
            <div className="db-header-right">
              <div className="db-search">
                <span className="db-search-icon">🔍</span>
                <span className="db-search-placeholder">Search</span>
              </div>
              <div className="db-settings-wrapper">
                <div className="db-settings-icon" onClick={() => setShowLogoutModal(true)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

        {/* Stats */}
        <div className="db-stats-card">
          <div className="db-stat">
            <div className="db-stat-icon">📋</div>
            <div>
              <p className="db-stat-label">Projects</p>
              <p className="db-stat-value">{projects.length}</p>
              <p className="db-stat-sub green">{projects.filter(p => p.status === 'active').length} active</p>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <h2 className="db-card-title" style={{ marginBottom: 0 }}>Active Projects</h2>
              <span
                onClick={() => window.location.href = '/projects'}
                style={{ fontSize: '13px', color: '#FF8D28', cursor: 'pointer', fontWeight: 500 }}
              >View all ›</span>
            </div>
            {projects.length === 0 ? (
              <p style={{ color: '#9197B3', fontSize: '14px', padding: '16px 0' }}>No projects yet. Click "New Project" to get started.</p>
            ) : (
              projects.slice(0, 3).map((p) => (
                <div className="db-project-item" key={p.id}>
                  <div className="db-project-dot" style={{ background: p.status === 'completed' ? '#34C759' : p.status === 'pending' ? '#FFCC00' : '#FF8D28' }} />
                  <div className="db-project-info">
                    <div className="db-project-header">
                      <span className="db-project-name">{p.name}</span>
                      <span className="db-project-pct">{p.progress}%</span>
                    </div>
                    <div className="db-progress-bar">
                      <div className="db-progress-fill" style={{ width: `${p.progress}%`, background: '#FF8D28' }} />
                    </div>
                    <p className="db-project-meta">Created: {p.created_at} · {p.instrument} · k={p.distance_k}km</p>
                  </div>
                  <button
                    onClick={async () => {
                      await deleteProject(p.id);
                      await postLog('warning', `Project "${p.name}" deleted by ${userName}`, 'Warning / Deleted');
                      fetchLogs();
                    }}
                    style={{ background: 'none', border: 'none', color: '#FF383C', fontSize: '18px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', flexShrink: 0 }}
                  >×</button>
                </div>
              ))
            )}
          </div>

          {/* Activity Logs */}
          <div className="db-logs-card">
            <div className="db-logs-header">
              <h2 className="db-card-title" style={{ marginBottom: 0 }}>Activity logs</h2>
              <div className="db-logs-search">🔍 Search</div>
            </div>
            {logs.length === 0 ? (
              <p style={{ color: '#9197B3', fontSize: '14px', padding: '16px 0' }}>No activity yet.</p>
            ) : (
              logs.slice(0, 6).map((log) => (
                <div className="db-log-item" key={log.id} onClick={() => setSelectedLog(log)} style={{ cursor: 'pointer' }}>
                  <div className="db-log-dot" style={{ background: dotColor(log.type) }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="db-log-title">{log.message}</p>
                    <p className="db-log-sub">{log.sub ?? log.type}</p>
                  </div>
                  {log.details && (
                    <span style={{ fontSize: 11, color: '#0088FF', flexShrink: 0, alignSelf: 'center' }}>View ›</span>
                  )}
                </div>
              ))
            )}

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

      {selectedLog && (
        <ActivityLogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onSave={async (data) => {
          await addProject({ name: data.projectName, instrument: data.instrument, bmElevation: data.bmElevation, method: data.method, distanceK: data.distanceK });
          await postLog('success', `Project "${data.projectName}" created by ${userName}`, 'Success / Completed');
          fetchLogs();
        }}
        existingNames={projects.map((p) => p.name)}
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
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default DashboardPage;
