import React, { useState, useEffect } from 'react';
import './ProjectList.css';
import Sidebar from './Sidebar';
import { useProjects } from './useProjects';
import LogoutModal from './LogoutModal';

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

const statusColor: Record<string, string> = {
  active: '#FF8D28',
  completed: '#34C759',
  pending: '#FFCC00',
};

const ProjectListPage: React.FC = () => {
  const { projects, deleteProject } = useProjects();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [search, setSearch] = useState('');
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

  const handleLogout = () => {
    setShowLogoutModal(false);
    setIsAuthenticated(false);
    sessionStorage.clear();
    localStorage.clear();
    window.location.replace('/');
  };

  if (!isAuthenticated) return null;

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pl-page">
      <Sidebar activePath="/projects" onLogout={() => setShowLogoutModal(true)} />

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
                <div className="pl-settings-icon" onClick={() => setShowLogoutModal(true)}>
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
                <p className="pl-stat-value">{projects.filter(p => p.status === 'active').length}</p>
                <p className="pl-stat-label">Active</p>
              </div>
            </div>
            <div className="pl-stat-card">
              <span className="pl-stat-icon">✅</span>
              <div>
                <p className="pl-stat-value">{projects.filter(p => p.status === 'completed').length}</p>
                <p className="pl-stat-label">Completed</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="pl-table-card">
            <div className="pl-table-header">
              <h2>All Projects</h2>
              <button className="pl-btn-new" onClick={() => window.location.href = '/dashboard'}>
                + New Project
              </button>
            </div>

            {filtered.length === 0 ? (
              <div className="pl-empty">
                {search ? 'No projects match your search.' : 'No projects yet. Create one from the Dashboard.'}
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
                      <tr key={p.id}>
                        <td className="pl-num">{idx + 1}</td>
                        <td className="pl-name">{p.name}</td>
                        <td>{p.instrument}</td>
                        <td>{p.method}</td>
                        <td>{p.bmElevation} m</td>
                        <td>{p.distanceK} km</td>
                        <td>
                          <span className="pl-status" style={{ background: statusColor[p.status] + '22', color: statusColor[p.status] }}>
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>
                        <td>{p.createdAt}</td>
                        <td>
                          <button className="pl-btn-delete" onClick={() => deleteProject(p.id)} title="Delete">×</button>
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
