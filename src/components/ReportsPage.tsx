import React, { useState, useEffect } from 'react';
import './Reports.css';
import './NewProjectModal.css';
import Sidebar from './Sidebar';
import LogoutModal from './LogoutModal';
import MarkCompleteModal from './MarkCompleteModal';
import ProjectDetailModal from './ProjectDetailModal';
import EditProjectModal from './EditProjectModal';
import { Project as FullProject } from './useProjects';
import { postLog } from './useActivityLogs';
import DatePicker from './DatePicker';

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
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'date' | 'type' | 'status'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
    await postLog('success', `"${projectToComplete.name}" marked as complete by ${sessionStorage.getItem('userName') || 'Unknown'}`, 'Success / Completed');
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

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setCurrentPage(1);
  };
  const SortIcon = ({ col }: { col: typeof sortKey }) => (
    <span style={{ marginLeft: 4, opacity: sortKey === col ? 1 : 0.3 }}>{sortKey === col && sortDir === 'desc' ? '▼' : '▲'}</span>
  );
  const handleFilterChange = (f: 'All' | 'Leveling' | 'Calibration') => { setFilter(f); setCurrentPage(1); };

  const filtered = allRows
    .filter(r => filter === 'All' || r.type === filter)
    .filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()))
    .filter(r => !dateFrom || r.date >= dateFrom)
    .filter(r => !dateTo || r.date <= dateTo)
    .sort((a, b) => {
      const av = a[sortKey] ?? ''; const bv = b[sortKey] ?? '';
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const startRow = filtered.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const endRow = Math.min(safePage * rowsPerPage, filtered.length);

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
                  <button key={f} className={`rep-filter-btn${filter === f ? ' active' : ''}`} onClick={() => handleFilterChange(f)}>{f}</button>
                ))}
              </div>
            </div>
            {/* Filter Bar */}
            <div className="rep-filter-bar">
              <div className="rep-search">
                <span>🔍</span>
                <input type="text" placeholder="Search reports..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
              </div>
              <div className="rep-filter-date"><label>From</label><DatePicker value={dateFrom} onChange={v => { setDateFrom(v); setCurrentPage(1); }} max={dateTo || undefined} placeholder="Start date" /></div>
              <div className="rep-filter-date"><label>To</label><DatePicker value={dateTo} onChange={v => { setDateTo(v); setCurrentPage(1); }} min={dateFrom || undefined} max={new Date().toISOString().slice(0,10)} placeholder="End date" /></div>
              {(search || dateFrom || dateTo) && (
                <button className="rep-filter-clear" onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setCurrentPage(1); }}>Clear</button>
              )}
            </div>

            <div className="rep-table-wrapper">
              {loading ? (
                <table className="rep-table">
                  <thead><tr>
                    <th>#</th><th>Report Name</th><th>Date</th><th>Type</th><th>Status</th><th>Actions</th>
                  </tr></thead>
                  <tbody>{Array.from({ length: 5 }).map((_, i) => (<tr key={i}>{Array.from({ length: 6 }).map((_, j) => (<td key={j}><div className="rep-skeleton" /></td>))}</tr>))}</tbody>
                </table>
              ) : filtered.length === 0 ? (
                <p style={{ padding: '24px', color: '#9197B3', textAlign: 'center' }}>{search || dateFrom || dateTo ? 'No reports match your filters.' : 'No reports yet. Complete a project workflow to generate reports.'}</p>
              ) : (
                <table className="rep-table">
                  <thead><tr>
                    <th>#</th>
                    <th className="rep-th-sort" onClick={() => handleSort('name')}>Report Name <SortIcon col="name" /></th>
                    <th className="rep-th-sort" onClick={() => handleSort('date')}>Date <SortIcon col="date" /></th>
                    <th className="rep-th-sort" onClick={() => handleSort('type')}>Type <SortIcon col="type" /></th>
                    <th className="rep-th-sort" onClick={() => handleSort('status')}>Status <SortIcon col="status" /></th>
                    <th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {paginated.map((row, idx) => {
                      const statusClass = row.status.toLowerCase().replace(/ /g, '-');
                      return (
                      <tr key={row.id}>
                        <td style={{ color: '#9197B3', fontSize: 13 }}>{(safePage - 1) * rowsPerPage + idx + 1}</td>
                        <td className="rep-name">{row.name}</td>
                        <td>{row.date || '—'}</td>
                        <td><span className="rep-type-badge">{row.type}</span></td>
                        <td>
                          <span className={`rep-status ${statusClass}`}>
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
                            {row.type === 'Leveling' && row.projectId && row.status !== 'Completed' && (projects.find(x => x.id === row.projectId)?.progress ?? 0) >= 75 && (
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
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            {!loading && filtered.length > 0 && (
              <div className="rep-pagination">
                <div className="rep-rows-select">
                  <span>Rows per page:</span>
                  <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                    {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="rep-pagination-info">Showing {startRow}–{endRow} of {filtered.length} reports</div>
                <div className="rep-pagination-controls">
                  <button className="rep-page-btn" onClick={() => setCurrentPage(1)} disabled={safePage === 1}>«</button>
                  <button className="rep-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                    .reduce<(number | string)[]>((acc, n, i, arr) => {
                      if (i > 0 && (n as number) - (arr[i - 1] as number) > 1) acc.push('…');
                      acc.push(n); return acc;
                    }, [])
                    .map((n, i) => typeof n === 'string'
                      ? <span key={`e${i}`} className="rep-page-btn" style={{ border: 'none', cursor: 'default' }}>{n}</span>
                      : <button key={n} className={`rep-page-btn${safePage === n ? ' active' : ''}`} onClick={() => setCurrentPage(n)}>{n}</button>
                    )}
                  <button className="rep-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>›</button>
                  <button className="rep-page-btn" onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages}>»</button>
                </div>
              </div>
            )}
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
