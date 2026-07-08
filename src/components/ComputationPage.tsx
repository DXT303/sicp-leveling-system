import React, { useState, useEffect } from 'react';
import './Computation.css';
import Sidebar from './Sidebar';
import LogoutModal from './LogoutModal';
import { updateProjectProgress } from './useProjectProgress';

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

const ComputationPage: React.FC<{ projectId?: number | null }> = ({ projectId }) => {
  const [method, setMethod] = useState('rise-fall');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [computedRows, setComputedRows] = useState<ComputedRow[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(!!projectId);
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

  // Load project rows from API
  useEffect(() => {
    if (!projectId) return;
    fetch('/api/projects')
      .then(r => r.json())
      .then((list: Record<string, unknown>[]) => {
        const p = list.find(x => x.id === projectId);
        if (p) setProjectName(String(p.name));
      });
    fetch(`/api/projects/${projectId}/rows`)
      .then(r => r.json())
      .then((data: Record<string, unknown>[]) => {
        if (!data.length) { setLoading(false); return; }
        const mapped: ComputedRow[] = data.map(r => ({
          station: String(r.station ?? ''),
          bs:   Number(r.bs   ?? 0),
          is:   Number(r.is_val ?? 0),
          fs:   Number(r.fs   ?? 0),
          hi:   Number(r.hi   ?? 0),
          rise: 0,
          fall: 0,
          rl:   Number(r.rl   ?? 0),
        }));
        for (let i = 1; i < mapped.length; i++) {
          const diff = mapped[i].rl - mapped[i - 1].rl;
          if (diff > 0) mapped[i].rise = diff;
          else mapped[i].fall = Math.abs(diff);
        }
        setComputedRows(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  const handleConfirm = async () => {
    if (!projectId) return;
    // Auto-update progress based on milestones
    await updateProjectProgress(projectId);
    setConfirmed(true);
    setTimeout(() => window.location.href = `/calibration?projectId=${projectId}`, 1200);
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

  // Use API rows if available, else fall back to sample data
  const sampleData: ComputedRow[] = computedRows.length > 0 ? computedRows : [
    { station: 'BM1', bs: 1.525, is: 0, fs: 0,     hi: 101.525, rise: 0,     fall: 0,     rl: 100.000 },
    { station: 'CP1', bs: 1.835, is: 0, fs: 1.245,  hi: 102.115, rise: 0.280, fall: 0,     rl: 100.280 },
    { station: 'TP1', bs: 2.105, is: 0, fs: 1.655,  hi: 102.565, rise: 0.450, fall: 0,     rl: 100.730 },
    { station: 'BM2', bs: 0,     is: 0, fs: 1.890,  hi: 0,       rise: 0,     fall: 0.235, rl: 100.675 },
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
            <div>
              <h1 className="comp-title">Differential Leveling Computation</h1>
              {projectName && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#757575' }}>Project: <strong>{projectName}</strong></p>}
            </div>
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
              {loading ? (
                <table className="comp-table">
                  <thead>
                    <tr>
                      <th>Station</th><th>BS (m)</th><th>IS (m)</th><th>FS (m)</th>
                      <th>HI (m)</th><th>Rise (m)</th><th>Fall (m)</th><th>RL (m)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j}><div className="comp-skeleton" /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="comp-table">
                  <thead>
                    <tr>
                      <th>Station</th><th>BS (m)</th><th>IS (m)</th><th>FS (m)</th>
                      <th>HI (m)</th><th>Rise (m)</th><th>Fall (m)</th><th>RL (m)</th>
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
                      <td>{totalBS.toFixed(3)}</td><td>-</td>
                      <td>{totalFS.toFixed(3)}</td><td>-</td>
                      <td>{totalRise.toFixed(3)}</td>
                      <td>{totalFall.toFixed(3)}</td><td>-</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Results Grid */}
          <div className="comp-results-grid">
            <div className="comp-card">
              <h2 className="comp-card-title">Arithmetic Check</h2>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="comp-check-item">
                    <div className="comp-skeleton" style={{ width: '40%' }} />
                    <div className="comp-skeleton" style={{ width: '25%' }} />
                  </div>
                ))
              ) : (
                <React.Fragment>
                  <div className="comp-check-item"><span>ΣBS - ΣFS:</span><span className="comp-value">{(totalBS - totalFS).toFixed(3)} m</span></div>
                  <div className="comp-check-item"><span>ΣRise - ΣFall:</span><span className="comp-value">{(totalRise - totalFall).toFixed(3)} m</span></div>
                  <div className="comp-check-item"><span>Last RL - First RL:</span><span className="comp-value">{(sampleData[sampleData.length - 1].rl - sampleData[0].rl).toFixed(3)} m</span></div>
                </React.Fragment>
              )}
            </div>
            <div className="comp-card">
              <h2 className="comp-card-title">Closure Error Analysis</h2>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="comp-check-item">
                    <div className="comp-skeleton" style={{ width: '40%' }} />
                    <div className="comp-skeleton" style={{ width: '25%' }} />
                  </div>
                ))
              ) : (
                <React.Fragment>
                  <div className="comp-check-item"><span>Misclose:</span><span className="comp-value">{(misclose * 1000).toFixed(1)} mm</span></div>
                  <div className="comp-check-item"><span>Distance:</span><span className="comp-value">{distance.toFixed(1)} km</span></div>
                  <div className="comp-check-item"><span>Allowable Error:</span><span className="comp-value">±{(allowableError * 1000).toFixed(1)} mm</span></div>
                  <div className="comp-status-item"><span>Status:</span><span className={`comp-status ${status.toLowerCase()}`}>{status}</span></div>
                </React.Fragment>
              )}
            </div>
          </div>

          {/* Note */}
          {loading ? (
            <div className="comp-note"><div className="comp-skeleton" style={{ width: '70%', height: 16 }} /></div>
          ) : (
            <div className="comp-note">
              {status === 'PASS'
                ? '✓ Leveling meets accuracy standards. Error is within acceptable tolerance.'
                : '✗ Leveling exceeds allowable error. Re-observation recommended.'}
            </div>
          )}

          {/* Confirm step */}
          {projectId && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                onClick={handleConfirm}
                disabled={confirmed}
                style={{ padding: '12px 32px', background: confirmed ? '#34C759' : '#FF8D28', color: '#fff', border: 'none', borderRadius: 25, fontFamily: 'Poppins', fontSize: 14, fontWeight: 600, cursor: confirmed ? 'default' : 'pointer' }}
              >
                {confirmed ? '✓ Confirmed — going to Calibration…' : 'Confirm Computation →'}
              </button>
            </div>
          )}
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
