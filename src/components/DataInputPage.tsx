import React, { useState, useEffect } from 'react';
import './DataInput.css';
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

interface LevelingRow {
  id: number;
  station: string;
  bs: string;
  fs: string;
  tbm: string;
  elev: string;
  hi: string;
}

const CustomDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: string[];
}> = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="di-custom-dropdown">
      <div 
        className="di-custom-dropdown-selected" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      {isOpen && (
        <div className="di-custom-dropdown-options">
          {options.map((option) => (
            <div
              key={option}
              className={`di-custom-dropdown-option ${value === option ? 'selected' : ''}`}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DataInputPage: React.FC = () => {
  const [rows, setRows] = useState<LevelingRow[]>([
    { id: 1, station: 'BM1', bs: '', fs: '', tbm: '', elev: '', hi: '' }
  ]);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [selectedProject, setSelectedProject] = useState('Survey A — Sector 4');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  });

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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

  const addRow = () => {
    const newRow: LevelingRow = {
      id: rows.length + 1,
      station: '',
      bs: '',
      fs: '',
      tbm: '',
      elev: '',
      hi: ''
    };
    setRows([...rows, newRow]);
  };

  const updateRow = (id: number, field: keyof LevelingRow, value: string) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const deleteRow = (id: number) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
    }
  };

  return (
    <div className="di-page">
      {/* Sidebar */}
      <aside className={`di-sidebar ${sidebarExpanded ? 'expanded' : ''}`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div>
          <div className="di-sidebar-header">
            <span className="di-sidebar-title">LOGO</span>
          </div>
          <nav className="di-nav">
            <div className="di-nav-item" onClick={() => window.location.href = '/dashboard'}>
              <span className="di-nav-icon"><IconDashboard /></span>
              <span className="di-nav-label">Dashboard</span>
              <span className="di-nav-chevron">›</span>
            </div>
            <div className="di-nav-item di-nav-active">
              <span className="di-nav-icon"><IconDataInput /></span>
              <span className="di-nav-label">Data Input</span>
              <span className="di-nav-chevron">›</span>
            </div>
            <div className="di-nav-item" onClick={() => window.location.href = '/computation'}>
              <span className="di-nav-icon"><IconComputation /></span>
              <span className="di-nav-label">Computation</span>
              <span className="di-nav-chevron">›</span>
            </div>
            <div className="di-nav-item" onClick={() => window.location.href = '/calibration'}>
              <span className="di-nav-icon"><IconCalibration /></span>
              <span className="di-nav-label">Calibration</span>
              <span className="di-nav-chevron">›</span>
            </div>
            <div className="di-nav-item" onClick={() => window.location.href = '/reports'}>
              <span className="di-nav-icon"><IconReports /></span>
              <span className="di-nav-label">Reports</span>
              <span className="di-nav-chevron">›</span>
            </div>
          </nav>
        </div>

        <div className="di-user">
          <div className="di-user-avatar">R</div>
          <div className="di-user-info">
            <span className="di-user-name">Ronald Talagtag</span>
            <span className="di-user-role">Engineer</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="di-main">
        <div className="di-content">
          {/* Header */}
          <div className="di-header">
            <h1 className="di-title">Data Input</h1>
            <div className="di-header-actions">
              <CustomDropdown
                value={selectedProject}
                onChange={setSelectedProject}
                options={[
                  'Survey A — Sector 4',
                  'Calibration Unit 7',
                  'Two-Peg Test — Unit 3',
                ]}
              />
              <div className="di-settings-wrapper">
                <div className="di-settings-icon" onClick={() => setShowLogoutModal(true)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="di-table-card">
            <div className="di-table-header">
              <h2>Leveling Observations</h2>
              <button className="di-btn-add" onClick={addRow}>+ Add Row</button>
            </div>

            <div className="di-table-wrapper">
              {isMobile ? (
                <div className="di-card-list">
                  {rows.map((row, idx) => (
                    <div className="di-row-card" key={row.id}>
                      <div className="di-row-card-header">
                        <span className="di-row-card-num">Row {idx + 1}</span>
                        <button
                          className="di-btn-delete"
                          onClick={() => deleteRow(row.id)}
                          disabled={rows.length === 1}
                        >×</button>
                      </div>
                      {([
                        { label: 'Station', field: 'station', placeholder: 'e.g. BM1' },
                        { label: 'BS', field: 'bs', placeholder: '0.000' },
                        { label: 'FS', field: 'fs', placeholder: '0.000' },
                        { label: 'TBM', field: 'tbm', placeholder: '0.000' },
                        { label: 'Elevation', field: 'elev', placeholder: '0.000' },
                        { label: 'HI', field: 'hi', placeholder: '0.000' },
                      ] as const).map(({ label, field, placeholder }) => (
                        <div className="di-row-card-field" key={field}>
                          <span className="di-row-card-label">{label}</span>
                          <input
                            type="text"
                            value={row[field]}
                            onChange={(e) => updateRow(row.id, field, e.target.value)}
                            placeholder={placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <table className="di-table">
                  <thead>
                    <tr>
                      <th>Station</th>
                      <th>BS</th>
                      <th>FS</th>
                      <th>TBM</th>
                      <th>Elevation</th>
                      <th>HI</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => (
                      <tr key={row.id}>
                        <td><input type="text" value={row.station} onChange={(e) => updateRow(row.id, 'station', e.target.value)} placeholder="e.g. BM1" /></td>
                        <td><input type="text" value={row.bs} onChange={(e) => updateRow(row.id, 'bs', e.target.value)} placeholder="0.000" /></td>
                        <td><input type="text" value={row.fs} onChange={(e) => updateRow(row.id, 'fs', e.target.value)} placeholder="0.000" /></td>
                        <td><input type="text" value={row.tbm} onChange={(e) => updateRow(row.id, 'tbm', e.target.value)} placeholder="0.000" /></td>
                        <td><input type="text" value={row.elev} onChange={(e) => updateRow(row.id, 'elev', e.target.value)} placeholder="0.000" /></td>
                        <td><input type="text" value={row.hi} onChange={(e) => updateRow(row.id, 'hi', e.target.value)} placeholder="0.000" /></td>
                        <td><button className="di-btn-delete" onClick={() => deleteRow(row.id)} disabled={rows.length === 1}>×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="di-table-footer">
              <button className="di-btn-clear">Clear All</button>
              <button className="di-btn-save">Save Data</button>
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

export default DataInputPage;
