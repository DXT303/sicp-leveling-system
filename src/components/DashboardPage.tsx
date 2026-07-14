import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import Sidebar from './Sidebar';
import NewProjectModal from './NewProjectModal';
import ImportDataModal from './ImportDataModal';
import CalibrateModal from './CalibrateModal';
import ExportDataModal from './ExportDataModal';
import LogoutModal from './LogoutModal';
import DeleteProjectModal from './DeleteProjectModal';
import { useProjects } from './useProjects';
import { useActivityLogs, postLog, dotColor } from './useActivityLogs';
import ActivityLogDetailModal from './ActivityLogDetailModal';
import ActivityLogsModal from './ActivityLogsModal';
import { ActivityLog } from './useActivityLogs';



const DashboardPage: React.FC = () => {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showImportDataModal, setShowImportDataModal] = useState(false);
  const [showCalibrateModal, setShowCalibrateModal] = useState(false);
  const [showExportDataModal, setShowExportDataModal] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: number; name: string } | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logsSearchQuery, setLogsSearchQuery] = useState('');
  const { projects, loading, addProject, deleteProject, refetch } = useProjects();
  const { logs, fetchLogs } = useActivityLogs();
  const [dashStats, setDashStats] = useState<{ calibrationTotal: number; calibrationPending: number; lastClosureMm: number | null } | null>(null);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const userName = sessionStorage.getItem('userName') || 'User';
  const firstName = userName.split(' ')[0];
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  });

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };

  // Get icon based on time
  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return '☀️'; // Morning - Sun
    } else if (hour >= 12 && hour < 18) {
      return '🌤️'; // Afternoon - Sun behind cloud
    } else {
      return '🌙'; // Evening - Moon
    }
  };

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

  useEffect(() => {
    fetch('/api/stats/dashboard').then(r => r.json()).then(setDashStats).catch(console.error);
  }, [projects]);

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete.id);
      await postLog('warning', `Project "${projectToDelete.name}" deleted by ${userName}`, 'Warning / Deleted');
      fetchLogs();
      setShowDeleteSuccess(true);
      setTimeout(() => setShowDeleteSuccess(false), 2000);
    } catch {
      alert('Failed to delete project. Please try again.');
    }
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

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

      <Sidebar activePath="/dashboard" onLogout={() => setShowLogoutModal(true)} onProjectRestored={() => { refetch(); fetchLogs(); }} />

      {/* Main */}
      <main className="db-main">
        <div className="db-content">

          {/* Header */}
          <div className="db-header">
            <h1 className="db-greeting">{getGreeting()}, {firstName} {getGreetingIcon()}</h1>
            <div className="db-header-right">
              <div className="db-search">
                <span className="db-search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="db-search-input"
                />
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
              <p className="db-stat-label">Avg Progress</p>
              <p className="db-stat-value">{projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0}%</p>
              <p className="db-stat-sub green">Overall</p>
            </div>
          </div>
          <div className="db-divider" />
          <div className="db-stat">
            <div className="db-stat-icon">🎯</div>
            <div>
              <p className="db-stat-label">Calibration</p>
              <p className="db-stat-value">{dashStats?.calibrationTotal ?? '—'}</p>
              <p className="db-stat-sub red">{dashStats ? `${dashStats.calibrationPending} pending` : '—'}</p>
            </div>
          </div>
          <div className="db-divider" />
          <div className="db-stat">
            <div className="db-stat-icon">📏</div>
            <div>
              <p className="db-stat-label">Last Closure</p>
              <p className="db-stat-value">{dashStats?.lastClosureMm != null ? Math.abs(dashStats.lastClosureMm).toFixed(1) : '—'}</p>
              <p className="db-stat-sub red">{dashStats?.lastClosureMm != null ? 'mm error' : 'no data'}</p>
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
              { label: 'Export Template', icon: '📄', onClick: () => {
                const csv = 'LEVELING OBSERVATION TEMPLATE\n\nProject Name,\nInstrument,\nBM Elevation,\nMethod,\nDistance K,\n\nStation,BS,IS,FS,HI,Rise,Fall,RL\n';
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Leveling_Template.csv';
                a.click();
                URL.revokeObjectURL(url);
              }},
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexShrink: 0 }}>
              <h2 className="db-card-title" style={{ marginBottom: 0 }}>Active Projects</h2>
              <span
                onClick={() => window.location.href = '/projects'}
                style={{ fontSize: '13px', color: '#FF8D28', cursor: 'pointer', fontWeight: 500 }}
              >View all ›</span>
            </div>
            <div className="db-projects-container">
              {loading ? (
                <div className="db-projects-skeleton">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div className="db-project-item" key={i}>
                      <div className="db-skeleton-dot" />
                      <div className="db-project-info" style={{ flex: 1 }}>
                        <div className="db-project-header">
                          <div className="db-skeleton-text" style={{ width: '60%' }} />
                          <div className="db-skeleton-text" style={{ width: '30px' }} />
                        </div>
                        <div className="db-skeleton-bar" />
                        <div className="db-skeleton-text" style={{ width: '80%', height: '10px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <p style={{ color: '#9197B3', fontSize: '14px', padding: '16px 0' }}>No projects yet. Click "New Project" to get started.</p>
              ) : (
                projects.slice(0, 10).map((p) => (
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
                      onClick={() => {
                        setProjectToDelete({ id: p.id, name: p.name });
                        setShowDeleteModal(true);
                      }}
                      style={{ background: 'none', border: 'none', color: '#FF383C', fontSize: '18px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', flexShrink: 0 }}
                    >×</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Logs */}
          <div className="db-logs-card">
            <div className="db-logs-header">
              <h2 className="db-card-title" style={{ marginBottom: 0 }}>Activity logs</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setShowLogsModal(true)}
                  style={{ fontSize: 12, color: '#FF8D28', background: 'none', border: '1px solid #FF8D28', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 500 }}>
                  View All
                </button>
                <div className="db-logs-search">
                  <span>🔍</span>
                  <input
                    type="text"
                    placeholder="Search"
                    value={logsSearchQuery}
                    onChange={(e) => setLogsSearchQuery(e.target.value)}
                    className="db-logs-search-input"
                  />
                </div>
              </div>
            </div>
            <div className="db-logs-container">
              {logs.length === 0 ? (
                <p style={{ color: '#9197B3', fontSize: '14px', padding: '16px 0' }}>No activity yet.</p>
              ) : (
                logs
                  .filter(log =>
                    log.message.toLowerCase().includes(logsSearchQuery.toLowerCase()) ||
                    (log.sub && log.sub.toLowerCase().includes(logsSearchQuery.toLowerCase()))
                  )
                  .slice(0, 6)
                  .map((log) => (
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
            </div>

            {/* Legend */}
            <div className="db-legend">
              {[
                { color: '#34C759', label: 'Completed' },
                { color: '#FF383C', label: 'Error / Exceeded' },
                { color: '#FFCC00', label: 'Warning / Pending' },
                { color: '#8E8E93', label: 'Login event' },
                { color: '#0088FF', label: 'Data imported' },
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

      {showDeleteSuccess && (
        <div className="ep-notif-overlay">
          <div className="ep-notif-modal">
            <div className="ep-notif-checkmark">
              <svg viewBox="0 0 52 52">
                <circle className="ep-notif-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="ep-notif-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h2 className="ep-notif-title--success">Deleted!</h2>
            <p className="ep-notif-message">Project has been deleted successfully.</p>
          </div>
        </div>
      )}
      {selectedLog && (
        <ActivityLogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
      {showLogsModal && (
        <ActivityLogsModal logs={logs} onClose={() => setShowLogsModal(false)} />
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
      <DeleteProjectModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleDeleteProject}
        projectName={projectToDelete?.name || ''}
      />
    </div>
  );
};

export default DashboardPage;
