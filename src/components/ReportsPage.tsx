import React, { useState, useEffect } from 'react';
import './Reports.css';
import './NewProjectModal.css';
import Sidebar from './Sidebar';
import LogoutModal from './LogoutModal';
import MarkCompleteModal from './MarkCompleteModal';
import ProjectDetailModal from './ProjectDetailModal';
import EditProjectModal from './EditProjectModal';
import { Project as FullProject } from './useProjects';

interface CalibrationRecord {
  id: number;
  project_id: number | null;
  instrument: string | null;
  date: string;
  d1_near: number;
  d1_far: number;
  d2_near: number;
  d2_far: number;
  error: number;
  status: string;
  created_at: string;
}

type Project = FullProject;

const ReportsPage: React.FC = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMarkCompleteModal, setShowMarkCompleteModal] = useState(false);
  const [projectToComplete, setProjectToComplete] = useState<{ id: number; name: string } | null>(null);
  const [calibrations, setCalibrations] = useState<CalibrationRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Leveling' | 'Calibration'>('All');
  const [toast, setToast] = useState<string | null>(null);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    sessionStorage.getItem('isLoggedIn') === 'true'
  );

  useEffect(() => {
    const checkAuth = () => {
      if (!sessionStorage.getItem('isLoggedIn')) {
        setIsAuthenticated(false);
        window.location.replace('/');
      }
    };
    checkAuth();
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      if (!sessionStorage.getItem('isLoggedIn')) {
        setIsAuthenticated(false);
        window.location.replace('/');
      } else {
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/calibrations').then(r => r.json()),
      fetch('/api/projects').then(r => r.json())
    ])
      .then(([cals, projs]) => {
        setCalibrations(cals);
        setProjects(projs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
    const handleVisibility = () => { if (document.visibilityState === 'visible') fetchData(); };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', fetchData);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', fetchData);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    setShowLogoutModal(false);
    setIsAuthenticated(false);
    sessionStorage.clear();
    localStorage.clear();
    window.location.replace('/');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this calibration record?')) return;
    await fetch(`/api/calibrations/${id}`, { method: 'DELETE' });
    setCalibrations(prev => prev.filter(c => c.id !== id));
  };

  const handleMarkComplete = async () => {
    if (!projectToComplete) return;
    await fetch(`/api/projects/${projectToComplete.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress: 100, status: 'completed' }),
    });
    setShowMarkCompleteModal(false);
    setProjectToComplete(null);
    setToast('Project marked as completed!');
    setTimeout(() => setToast(null), 1500);
    fetchData();
  };

  if (!isAuthenticated) return null;

  // Build unified report rows from projects (Leveling) + calibrations
  type ReportRow = {
    id: string;
    name: string;
    date: string;
    type: 'Leveling' | 'Calibration';
    status: string;
    projectId?: number;
    calibrationId?: number;
  };

  // One row per project showing overall workflow status
  const levelingRows: ReportRow[] = projects.map(p => {
    return {
      id: `p-${p.id}`,
      name: `${p.name} — Leveling Report`,
      date: p.created_at,
      type: 'Leveling',
      status: p.progress === 100 ? 'Completed' : p.progress >= 25 ? 'In Progress' : 'Pending',
      projectId: p.id,
    };
  });

  // Only standalone calibrations (not linked to any project)
  const calibrationRows: ReportRow[] = calibrations
    .filter(c => c.project_id === null)
    .map(c => ({
      id: `c-${c.id}`,
      name: `Calibration — ${c.instrument ?? 'N/A'} (${c.date})`,
      date: c.date,
      type: 'Calibration',
      status: c.status === 'PASS' ? 'Completed' : 'Failed',
      calibrationId: c.id,
    }));

  const allRows: ReportRow[] = [...levelingRows, ...calibrationRows];
  const filtered = filter === 'All' ? allRows : allRows.filter(r => r.type === filter);

  const total = allRows.length;
  const completed = allRows.filter(r => r.status === 'Completed').length;
  const pending = allRows.filter(r => r.status !== 'Completed').length;

  return (
    <div className="rep-page">
      {toast && (
        <div className="ep-notif-overlay">
          <div className="ep-notif-modal">
            <div className="ep-notif-checkmark">
              <svg viewBox="0 0 52 52">
                <circle className="ep-notif-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="ep-notif-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h2 className="ep-notif-title--success">Completed!</h2>
            <p className="ep-notif-message">{toast}</p>
          </div>
        </div>
      )}
      <Sidebar activePath="/reports" onLogout={() => setShowLogoutModal(true)} />

      <main className="rep-main">
        <div className="rep-content">
          <div className="rep-header">
            <h1 className="rep-title">Reports</h1>
            <div className="rep-settings-wrapper">
              <div className="rep-settings-icon" onClick={() => setShowLogoutModal(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="rep-stats">
            <div className="rep-stat-card">
              <div className="rep-stat-icon">📋</div>
              <div>
                <p className="rep-stat-value">{total}</p>
                <p className="rep-stat-label">Total Reports</p>
              </div>
            </div>
            <div className="rep-stat-card">
              <div className="rep-stat-icon">✅</div>
              <div>
                <p className="rep-stat-value">{completed}</p>
                <p className="rep-stat-label">Completed</p>
              </div>
            </div>
            <div className="rep-stat-card">
              <div className="rep-stat-icon">⏳</div>
              <div>
                <p className="rep-stat-value">{pending}</p>
                <p className="rep-stat-label">Pending / In Progress</p>
              </div>
            </div>
            <div className="rep-stat-card">
              <div className="rep-stat-icon">🎯</div>
              <div>
                <p className="rep-stat-value">{projects.filter(p => {
                  const cal = calibrations.find(c => c.project_id === p.id);
                  return cal?.status === 'PASS';
                }).length + calibrations.filter(c => c.project_id === null && c.status === 'PASS').length}</p>
                <p className="rep-stat-label">Calibrations Passed</p>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="rep-table-card">
            <div className="rep-table-header">
              <h2>All Reports</h2>
              <div className="rep-filters">
                {(['All', 'Leveling', 'Calibration'] as const).map(f => (
                  <button
                    key={f}
                    className={`rep-filter-btn${filter === f ? ' active' : ''}`}
                    onClick={() => setFilter(f)}
                  >{f}</button>
                ))}
              </div>
            </div>

            <div className="rep-table-wrapper">
              {loading ? (
                <table className="rep-table">
                  <thead>
                    <tr>
                      <th>Report Name</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j}><div className="rep-skeleton" /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : filtered.length === 0 ? (
                <p style={{ padding: '24px', color: '#9197B3', textAlign: 'center' }}>No reports yet. Complete a project workflow to generate reports.</p>
              ) : (
                <table className="rep-table">
                  <thead>
                    <tr>
                      <th>Report Name</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id}>
                        <td className="rep-name">{row.name}</td>
                        <td>{row.date || '—'}</td>
                        <td><span className="rep-type-badge">{row.type}</span></td>
                        <td>
                          <span className={`rep-status ${row.status.toLowerCase().replace(' ', '-')}`}>
                            {row.status}
                          </span>
                        </td>
                        <td>
                          <div className="rep-actions">
                            {row.type === 'Leveling' && row.projectId && (
                              <button
                                className="rep-action-btn"
                                title="Open project"
                                onClick={() => {
                                  const p = projects.find(x => x.id === row.projectId);
                                  if (p) setDetailProject(p);
                                }}
                              >👁️</button>
                            )}
                            {row.type === 'Leveling' && row.projectId && row.status !== 'Completed' && (
                              <button
                                className="rep-action-btn"
                                title="Mark as complete"
                                onClick={() => {
                                  setProjectToComplete({ id: row.projectId!, name: row.name });
                                  setShowMarkCompleteModal(true);
                                }}
                              >✅</button>
                            )}
                            {row.type === 'Calibration' && row.calibrationId && (
                              <button
                                className="rep-action-btn"
                                title="Delete calibration record"
                                onClick={() => handleDelete(row.calibrationId!)}
                              >🗑️</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {detailProject && (
        <ProjectDetailModal
          project={detailProject}
          onClose={() => setDetailProject(null)}
          onEdit={() => setEditProject(detailProject)}
        />
      )}
      {editProject && (
        <EditProjectModal
          project={editProject}
          onClose={() => setEditProject(null)}
          onSave={async (data) => {
            await fetch(`/api/projects/${editProject.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            fetchData();
            setEditProject(null);
          }}
        />
      )}
      <MarkCompleteModal
        isOpen={showMarkCompleteModal}
        projectName={projectToComplete?.name || ''}
        onClose={() => {
          setShowMarkCompleteModal(false);
          setProjectToComplete(null);
        }}
        onConfirm={handleMarkComplete}
      />
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default ReportsPage;
