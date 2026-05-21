import React, { useState, useEffect } from "react";
import "./ProjectList.css";
import Sidebar from "./Sidebar";
import { useProjects, Project } from "./useProjects";
import LogoutModal from "./LogoutModal";
import NewProjectModal from "./NewProjectModal";
import ProjectDetailModal from "./ProjectDetailModal";
import EditProjectModal from "./EditProjectModal";
import { postLog } from "./useActivityLogs";

const IconDashboard = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const IconDataInput = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M12 5v14M5 12h14" />
    <rect x="3" y="3" width="18" height="18" rx="3" />
  </svg>
);

const IconComputation = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M9 7h6M9 12h6M9 17h4" />
    <rect x="3" y="3" width="18" height="18" rx="3" />
  </svg>
);

const IconCalibration = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="3" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="21" />
    <line x1="3" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="21" y2="12" />
  </svg>
);

const IconReports = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
);

const IconProjects = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M3 7h18M3 12h18M3 17h18" />
  </svg>
);

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

  const handleNewProjectSave = (data: { projectName: string; instrument: string; bmElevation: string; method: string; distanceK: string }) => {
    addProject({ name: data.projectName, instrument: data.instrument, bmElevation: data.bmElevation, method: data.method, distanceK: data.distanceK });
  };

  const handleEditSave = async (data: Partial<Omit<Project, "id" | "created_at">>) => {
    if (!selectedProject) return;
    const userName = sessionStorage.getItem('userName') || 'User';
    const LABELS: Record<string, string> = {
      name: 'Project Name', instrument: 'Instrument', bm_elevation: 'BM Elevation',
      method: 'Method', distance_k: 'Distance K', status: 'Status', progress: 'Progress',
    };
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    (Object.keys(data) as (keyof typeof data)[]).forEach((key) => {
      if (data[key] !== (selectedProject as Record<string, unknown>)[key]) {
        changes[LABELS[key] ?? key] = { from: (selectedProject as Record<string, unknown>)[key], to: data[key] };
      }
    });
    await updateProject(selectedProject.id, data);
    await postLog('info', `Project "${selectedProject.name}" updated by ${userName}`, 'Info / Project updated', Object.keys(changes).length ? changes : undefined);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId !== null) deleteProject(deleteTargetId);
    setDeleteTargetId(null);
    setTimeout(() => {
      setShowDeleteSuccess(true);
      setTimeout(() => setShowDeleteSuccess(false), 1500);
    }, 0);
  };

  if (!isAuthenticated) return null;

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

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
        />
      )}
      {selectedProject && showEditModal && (
        <EditProjectModal
          project={selectedProject}
          onClose={() => { setShowEditModal(false); setSelectedProject(null); }}
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
                  onChange={(e) => setSearch(e.target.value)}
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
              <button className="pl-btn-new" onClick={() => setShowNewProjectModal(true)}>
                + New Project
              </button>
            </div>

            {loading ? (
              <div className="pl-table-wrapper">
                <table className="pl-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Project Name</th>
                      <th>Instrument</th>
                      <th>Method</th>
                      <th>BM Elev.</th>
                      <th>Distance (km)</th>
                      <th>Status</th>
                      <th>Created</th>
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
                {search
                  ? "No projects match your search."
                  : "No projects yet. Create one from the Dashboard."}
              </div>
            ) : (
              <div className="pl-table-wrapper">
                <table className="pl-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Project Name</th>
                      <th>Instrument</th>
                      <th>Method</th>
                      <th>BM Elev.</th>
                      <th>Distance (km)</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, idx) => (
                      <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => { setSelectedProject(p); setShowEditModal(false); }}>
                        <td className="pl-num">{idx + 1}</td>
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
