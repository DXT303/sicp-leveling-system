import React, { useState, useEffect } from 'react';
import './Computation.css';
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

interface ComputedRow {
  station: string;
  bs: number;
  is: number;
  fs: number;
  hi: number;
  rise: number;
  fall: number;
  rl: number;
}

const CustomDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}> = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="comp-custom-dropdown">
      <div 
        className="comp-custom-dropdown-selected" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{options.find(opt => opt.value === value)?.label || 'Select method'}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      {isOpen && (
        <div className="comp-custom-dropdown-options">
          {options.map((option) => (
            <div
              key={option.value}
              className={`comp-custom-dropdown-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ComputationPage: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [method, setMethod] = useState('rise-fall');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  });

  useEffect(() => {
    document.body.style.zoom = '80%';

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
      document.body.style.zoom = '100%';
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
  
  // Sample data
  const sampleData: ComputedRow[] = [
    { station: 'BM1', bs: 1.525, is: 0, fs: 0, hi: 101.525, rise: 0, fall: 0, rl: 100.000 },
    { station: 'CP1', bs: 1.835, is: 0, fs: 1.245, hi: 102.115, rise: 0.280, fall: 0, rl: 100.280 },
    { station: 'TP1', bs: 2.105, is: 0, fs: 1.655, hi: 102.565, rise: 0.450, fall: 0, rl: 100.730 },
    { station: 'BM2', bs: 0, is: 0, fs: 1.890, hi: 0, rise: 0, fall: 0.235, rl: 100.675 },
  ];

  const totalBS = sampleData.reduce((sum, row) => sum + row.bs, 0);
  const totalFS = sampleData.reduce((sum, row) => sum + row.fs, 0);
  const totalRise = sampleData.reduce((sum, row) => sum + row.rise, 0);
  const totalFall = sampleData.reduce((sum, row) => sum + row.fall, 0);
  
  const misclose = (totalBS - totalFS) - (sampleData[sampleData.length - 1].rl - sampleData[0].rl);
  const distance = 1.5; // km
  const allowableError = 0.012 * Math.sqrt(distance);
  const status = Math.abs(misclose) <= allowableError ? 'PASS' : 'FAIL';

  return (
    <div className="comp-page">
      <Sidebar activePath="/computation" onLogout={() => setShowLogoutModal(true)} />

      {/* Main */}
      <main className="comp-main">
        <div className="comp-content">
          <div className="comp-header">
            <h1 className="comp-title">Differential Leveling Computation</h1>
            <div className="comp-header-actions">
              <CustomDropdown
                value={method}
                onChange={setMethod}
                options={[
                  { value: 'rise-fall', label: 'Rise & Fall Method' },
                  { value: 'hi', label: 'Height of Instrument Method' },
                ]}
              />
              <div className="comp-settings-wrapper">
                <div className="comp-settings-icon" onClick={() => setShowLogoutModal(true)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Computation Table */}
          <div className="comp-table-card">
            <div className="comp-table-wrapper">
              <table className="comp-table">
                <thead>
                  <tr>
                    <th>Station</th>
                    <th>BS (m)</th>
                    <th>IS (m)</th>
                    <th>FS (m)</th>
                    <th>HI (m)</th>
                    <th>Rise (m)</th>
                    <th>Fall (m)</th>
                    <th>RL (m)</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="comp-station">{row.station}</td>
                      <td>{row.bs > 0 ? row.bs.toFixed(3) : '-'}</td>
                      <td>{row.is > 0 ? row.is.toFixed(3) : '-'}</td>
                      <td>{row.fs > 0 ? row.fs.toFixed(3) : '-'}</td>
                      <td>{row.hi > 0 ? row.hi.toFixed(3) : '-'}</td>
                      <td>{row.rise > 0 ? row.rise.toFixed(3) : '-'}</td>
                      <td>{row.fall > 0 ? row.fall.toFixed(3) : '-'}</td>
                      <td className="comp-rl">{row.rl.toFixed(3)}</td>
                    </tr>
                  ))}
                  <tr className="comp-totals">
                    <td>TOTALS</td>
                    <td>{totalBS.toFixed(3)}</td>
                    <td>-</td>
                    <td>{totalFS.toFixed(3)}</td>
                    <td>-</td>
                    <td>{totalRise.toFixed(3)}</td>
                    <td>{totalFall.toFixed(3)}</td>
                    <td>-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Results Grid */}
          <div className="comp-results-grid">
            {/* Arithmetic Check */}
            <div className="comp-card">
              <h2 className="comp-card-title">Arithmetic Check</h2>
              <div className="comp-check-item">
                <span>ΣBS - ΣFS:</span>
                <span className="comp-value">{(totalBS - totalFS).toFixed(3)} m</span>
              </div>
              <div className="comp-check-item">
                <span>ΣRise - ΣFall:</span>
                <span className="comp-value">{(totalRise - totalFall).toFixed(3)} m</span>
              </div>
              <div className="comp-check-item">
                <span>Last RL - First RL:</span>
                <span className="comp-value">{(sampleData[sampleData.length - 1].rl - sampleData[0].rl).toFixed(3)} m</span>
              </div>
            </div>

            {/* Closure Error */}
            <div className="comp-card">
              <h2 className="comp-card-title">Closure Error Analysis</h2>
              <div className="comp-check-item">
                <span>Misclose:</span>
                <span className="comp-value">{(misclose * 1000).toFixed(1)} mm</span>
              </div>
              <div className="comp-check-item">
                <span>Distance:</span>
                <span className="comp-value">{distance.toFixed(1)} km</span>
              </div>
              <div className="comp-check-item">
                <span>Allowable Error:</span>
                <span className="comp-value">±{(allowableError * 1000).toFixed(1)} mm</span>
              </div>
              <div className="comp-status-item">
                <span>Status:</span>
                <span className={`comp-status ${status.toLowerCase()}`}>{status}</span>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="comp-note">
            {status === 'PASS' 
              ? '✓ Leveling meets accuracy standards. Error is within acceptable tolerance.'
              : '✗ Leveling exceeds allowable error. Re-observation recommended.'}
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

export default ComputationPage;
