import React, { useState, useEffect } from 'react';
import './Reports.css';
import Sidebar from './Sidebar';
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

const ReportsPage: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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

  const reports = [
    { id: 1, name: 'Survey A — Sector 4 Report', date: '2024-01-15', type: 'Leveling', status: 'Completed', size: '2.4 MB' },
    { id: 2, name: 'Calibration Unit 7 Report', date: '2024-01-12', type: 'Calibration', status: 'Pending', size: '1.8 MB' },
    { id: 3, name: 'Two-Peg Test — Unit 3 Report', date: '2024-01-10', type: 'Calibration', status: 'Pending', size: '1.2 MB' },
  ];

  return (
    <div className="rep-page">
      <Sidebar activePath="/reports" onLogout={() => setShowLogoutModal(true)} />

      {/* Main */}
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

          {/* Quick Access */}
          <div className="rep-quick-card">
            <h2 className="rep-card-title">Quick Access</h2>
            <div className="rep-quick-grid">
              <div className="rep-quick-item">
                <div className="rep-quick-icon">➕</div>
                <span>Generate Report</span>
              </div>
              <div className="rep-quick-item">
                <div className="rep-quick-icon">📊</div>
                <span>View Analytics</span>
              </div>
              <div className="rep-quick-item">
                <div className="rep-quick-icon">📁</div>
                <span>Export All</span>
              </div>
              <div className="rep-quick-item">
                <div className="rep-quick-icon">🗂️</div>
                <span>Archive</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="rep-stats">
            <div className="rep-stat-card">
              <div className="rep-stat-icon">📋</div>
              <div>
                <p className="rep-stat-value">3</p>
                <p className="rep-stat-label">Total Reports</p>
              </div>
            </div>
            <div className="rep-stat-card">
              <div className="rep-stat-icon">✅</div>
              <div>
                <p className="rep-stat-value">1</p>
                <p className="rep-stat-label">Completed</p>
              </div>
            </div>
            <div className="rep-stat-card">
              <div className="rep-stat-icon">⏳</div>
              <div>
                <p className="rep-stat-value">2</p>
                <p className="rep-stat-label">Pending</p>
              </div>
            </div>
            <div className="rep-stat-card">
              <div className="rep-stat-icon">📊</div>
              <div>
                <p className="rep-stat-value">5.4 MB</p>
                <p className="rep-stat-label">Total Size</p>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="rep-table-card">
            <div className="rep-table-header">
              <h2>Recent Reports</h2>
              <div className="rep-filters">
                <button className="rep-filter-btn active">All</button>
                <button className="rep-filter-btn">Leveling</button>
                <button className="rep-filter-btn">Calibration</button>
                <button className="rep-filter-btn">Analysis</button>
              </div>
            </div>

            <div className="rep-table-wrapper">
              <table className="rep-table">
                <thead>
                  <tr>
                    <th>Report Name</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Size</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td className="rep-name">{report.name}</td>
                      <td>{report.date}</td>
                      <td>
                        <span className="rep-type-badge">{report.type}</span>
                      </td>
                      <td>
                        <span className={`rep-status ${report.status.toLowerCase()}`}>
                          {report.status}
                        </span>
                      </td>
                      <td>{report.size}</td>
                      <td>
                        <div className="rep-actions">
                          <button className="rep-action-btn">👁️</button>
                          <button className="rep-action-btn">⬇️</button>
                          <button className="rep-action-btn">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

export default ReportsPage;
