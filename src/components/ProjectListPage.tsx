import React, { useState, useEffect } from "react";
import "./ProjectList.css";
import Sidebar from "./Sidebar";
import { useProjects, Project } from "./useProjects";
import LogoutModal from "./LogoutModal";
import NewProjectModal from "./NewProjectModal";
import ProjectDetailModal from "./ProjectDetailModal";
import EditProjectModal from "./EditProjectModal";
import { postLog } from "./useActivityLogs";
import DatePicker from "./DatePicker";

const statusColor: Record<string, string> = {
  active: "#FF8D28",
  completed: "#34C759",
  pending: "#FFCC00",
};

const ProjectListPage: React.FC = () => {
  const { projects, loading, addProject, deleteProject, updateProject } = useProjects();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'pending'>('all');
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<'name' | 'instrument' | 'status' | 'created_at'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("isLoggedIn") === "true",
  );

  useEffect(() => {
    const checkAuth = () => {
      if (!sessionStorage.getItem("isLoggedIn")) {
        setIsAuthenticated(false);
        window.location.replace("/");
      }
    };
    checkAuth();
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      if (!sessionStorage.getItem("isLoggedIn")) {
        setIsAuthenticated(false);
        window.location.replace("/");
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(false);
    setIsAuthenticated(false);
    sessionStorage.clear();
    localStorage.clear();
    window.location.replace("/");
  };

  const handleNewProjectSave = async (data: { projectName: string; instrument: string; bmElevation: string; method: string; distanceK: string }) => {
    await addProject({ name: data.projectName, instrument: data.instrument, bmElevation: data.bmElevation, method: data.method, distanceK: data.distanceK });
  };

  const handleEditSave = async (data: Partial<Omit<Project, "id" | "created_at">>) => {
    if (!selectedProject) return;
    const userName = sessionStorage.getItem('userName') || 'User';
    const LABELS: Record<string, string> = {
      name: 'Project Name', instrument: 'Instrument', bm_elevation: 'BM Elevation',
      method: 'Method', distance_k: 'Distance K', status: 'Status', progress: 'Progress',
    };
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    const before = selectedProject as unknown as Record<string, unknown>;
    (Object.keys(data) as (keyof typeof data)[]).forEach((key) => {
      if (data[key] !== before[key]) {
        changes[LABELS[key] ?? key] = { from: before[key], to: data[key] };
      }
    });
    await updateProject(selectedProject.id, data);
    await postLog('info', `Project "${selectedProject.name}" updated by ${userName}`, 'Info / Project updated', Object.keys(changes).length ? changes : undefined);
    setSelectedProject(prev => prev ? { ...prev, ...data } : prev);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId === null) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    try {
      await deleteProject(id);
      setShowDeleteSuccess(true);
      setTimeout(() => setShowDeleteSuccess(false), 2000);
    } catch {
      alert('Failed to delete project. Please try again.');
    }
  };

  if (!isAuthenticated) return null;

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setCurrentPage(1);
  };
  const SortIcon = ({ col }: { col: typeof sortKey }) => (
    <span style={{ marginLeft: 4, opacity: sortKey === col ? 1 : 0.3 }}>{sortKey === col && sortDir === 'desc' ? '▼' : '▲'}</span>
  );

  const filtered = projects
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => statusFilter === 'all' || p.status === statusFilter)
    .filter(p => !dateFrom || p.created_at >= dateFrom)
    .filter(p => !dateTo || p.created_at <= dateTo)
    .sort((a, b) => {
      const av = a[sortKey] ?? ''; const bv = b[sortKey] ?? '';
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const startRow = filtered.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const endRow = Math.min(safePage * rowsPerPage, filtered.length);

  const handleSearch = (val: string) => { setSearch(val); setCurrentPage(1); };

  return (
    <div className="pl-page">
      {showNewProjectModal && <NewProjectModal isOpen={showNewProjectModal} onClose={() => setShowNewProjectModal(false)} onSave={handleNewProjectSave} existingNames={projects.map((p) => p.name)} />}
      {deleteTargetId !== null && (
        <div className="ep-notif-overlay">
          <div className="ep-notif-modal">
            <div className="ep-notif-error-icon">🗑️</div>
            <h2 className="ep-notif-title--error">Delete Project?</h2>
            <p className="ep-notif-message">This action cannot be undone. Are you sure you want to delete this project?</p>
            <div className="new-project-actions" style={{ justifyContent: "center", marginTop: 24 }}>
              <button className="new-project-btn-cancel" onClick={() => setDeleteTargetId(null)}>Cancel</button>
              <button className="new-project-btn-create" style={{ background: "#FF3B30", borderColor: "#FF3B30" }} onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
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
      {selectedProject && !showEditModal && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onEdit={() => setShowEditModal(true)}
          onProgressUpdate={(progress, status) => {
            updateProject(selectedProject.id, { progress, status });
            setSelectedProject(prev => prev ? { ...prev, progress, status } : prev);
          }}
        />
      )}
      {selectedProject && showEditModal && (
        <EditProjectModal
          project={selectedProject}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}
      <Sidebar
        activePath="/projects"
        onLogout={() => setShowLogoutModal(true)}
      />

      {/* Main */}
      <main className="pl-main">
        <div className="pl-content">
          {/* Header */}
          <div className="pl-header">
            <h1 className="pl-title">Project Lists</h1>
            <div className="pl-header-right">
              <div className="pl-search">
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <div className="pl-settings-wrapper">
                <div
                  className="pl-settings-icon"
                  onClick={() => setShowLogoutModal(true)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="pl-stats">
            <div className="pl-stat-card">
              <span className="pl-stat-icon">📋</span>
              <div>
                <p className="pl-stat-value">{projects.length}</p>
                <p className="pl-stat-label">Total Projects</p>
              </div>
            </div>
            <div className="pl-stat-card">
              <span className="pl-stat-icon">🟢</span>
              <div>
                <p className="pl-stat-value">
                  {projects.filter((p) => p.status === "active").length}
                </p>
                <p className="pl-stat-label">Active</p>
              </div>
            </div>
            <div className="pl-stat-card">
              <span className="pl-stat-icon">✅</span>
              <div>
                <p className="pl-stat-value">
                  {projects.filter((p) => p.status === "completed").length}
                </p>
                <p className="pl-stat-label">Completed</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="pl-table-card">
            <div className="pl-table-header">
              <h2>All Projects</h2>
              <button className="pl-btn-new" onClick={() => setShowNewProjectModal(true)}>+ New Project</button>
            </div>
            {/* Filter Bar */}
            <div className="pl-filter-bar">
              <select className="pl-filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value as typeof statusFilter); setCurrentPage(1); }}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
              <div className="pl-filter-date">
                <label>From</label>
                <DatePicker value={dateFrom} onChange={v => { setDateFrom(v); setCurrentPage(1); }} max={dateTo || undefined} placeholder="Start date" />
              </div>
              <div className="pl-filter-date">
                <label>To</label>
                <DatePicker value={dateTo} onChange={v => { setDateTo(v); setCurrentPage(1); }} min={dateFrom || undefined} max={new Date().toISOString().slice(0,10)} placeholder="End date" />
              </div>
              {(statusFilter !== 'all' || dateFrom || dateTo) && (
                <button className="pl-filter-clear" onClick={() => { setStatusFilter('all'); setDateFrom(''); setDateTo(''); setCurrentPage(1); }}>Clear</button>
              )}
            </div>

            {loading ? (
              <div className="pl-table-wrapper">
                <table className="pl-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th className="pl-th-sort" onClick={() => handleSort('name')}>Project Name <SortIcon col="name" /></th>
                      <th className="pl-th-sort" onClick={() => handleSort('instrument')}>Instrument <SortIcon col="instrument" /></th>
                      <th>Method</th>
                      <th>BM Elev.</th>
                      <th>Distance (km)</th>
                      <th className="pl-th-sort" onClick={() => handleSort('status')}>Status <SortIcon col="status" /></th>
                      <th className="pl-th-sort" onClick={() => handleSort('created_at')}>Created <SortIcon col="created_at" /></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 9 }).map((_, j) => (
                          <td key={j}><div className="pl-skeleton" /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : filtered.length === 0 ? (
              <div className="pl-empty">
                {search || statusFilter !== 'all' || dateFrom || dateTo
                  ? "No projects match your filters."
                  : "No projects yet. Create one from the Dashboard."}
              </div>
            ) : (
              <div className="pl-table-wrapper">
                <table className="pl-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th className="pl-th-sort" onClick={() => handleSort('name')}>Project Name <SortIcon col="name" /></th>
                      <th className="pl-th-sort" onClick={() => handleSort('instrument')}>Instrument <SortIcon col="instrument" /></th>
                      <th>Method</th>
                      <th>BM Elev.</th>
                      <th>Distance (km)</th>
                      <th className="pl-th-sort" onClick={() => handleSort('status')}>Status <SortIcon col="status" /></th>
                      <th className="pl-th-sort" onClick={() => handleSort('created_at')}>Created <SortIcon col="created_at" /></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((p, idx) => (
                      <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => { setSelectedProject(p); setShowEditModal(false); }}>
                        <td className="pl-num">{(safePage - 1) * rowsPerPage + idx + 1}</td>
                        <td className="pl-name">{p.name}</td>
                        <td>{p.instrument}</td>
                        <td>{p.method}</td>
                        <td>{p.bm_elevation} m</td>
                        <td>{p.distance_k} km</td>
                        <td>
                          <span
                            className="pl-status"
                            style={{
                              background: statusColor[p.status] + "22",
                              color: statusColor[p.status],
                            }}
                          >
                            {p.status.charAt(0).toUpperCase() +
                              p.status.slice(1)}
                          </span>
                        </td>
                        <td>{p.created_at}</td>
                        <td>
                          <button
                            className="pl-btn-delete"
                            onClick={(e) => { e.stopPropagation(); setDeleteTargetId(p.id); }}
                            title="Delete"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Pagination */}
            {!loading && filtered.length > 0 && (
              <div className="pl-pagination">
                <div className="pl-rows-select">
                  <span>Rows per page:</span>
                  <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                    {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="pl-pagination-info">
                  Showing {startRow}–{endRow} of {filtered.length} projects
                </div>
                <div className="pl-pagination-controls">
                  <button className="pl-page-btn" onClick={() => setCurrentPage(1)} disabled={safePage === 1}>«</button>
                  <button className="pl-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                    .reduce<(number | string)[]>((acc, n, i, arr) => {
                      if (i > 0 && (n as number) - (arr[i - 1] as number) > 1) acc.push('…');
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((n, i) => typeof n === 'string'
                      ? <span key={`e${i}`} className="pl-page-btn" style={{ border: 'none', cursor: 'default' }}>{n}</span>
                      : <button key={n} className={`pl-page-btn${safePage === n ? ' active' : ''}`} onClick={() => setCurrentPage(n)}>{n}</button>
                    )}
                  <button className="pl-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>›</button>
                  <button className="pl-page-btn" onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages}>»</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default ProjectListPage;
