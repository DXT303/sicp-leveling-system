import React, { useState, useEffect } from 'react';
import './DataInput.css';
import './NewProjectModal.css';
import Sidebar from './Sidebar';
import LogoutModal from './LogoutModal';
import { updateProjectProgress } from './useProjectProgress';

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
  bs: string;    // Back Sight — user input
  fs: string;    // Fore Sight — user input (at TP/BM only)
  ifs: string;   // Intermediate Fore Sight — user input (IS points)
  hi: string;    // Height of Instrument — auto-calculated
  elev: string;  // Elevation / RL — auto-calculated (except BM1)
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

// ── helpers ──
function apiRowToLevelingRow(r: Record<string, unknown>, idx: number): LevelingRow {
  return {
    id: idx + 1,
    station: String(r.station ?? ''),
    bs:   r.bs     != null ? String(r.bs)     : '',
    fs:   r.fs     != null ? String(r.fs)     : '',
    ifs:  r.is_val != null ? String(r.is_val) : '',
    hi:   r.hi     != null ? String(r.hi)     : '',
    elev: r.rl     != null ? String(r.rl)     : '',
  };
}

// Auto-calculate HI and ELEV for all rows given current state
function computeRows(rows: LevelingRow[]): LevelingRow[] {
  const result = [...rows];
  let currentHI = 0;

  for (let i = 0; i < result.length; i++) {
    const row = { ...result[i] };
    const bs = parseFloat(row.bs);
    const fs = parseFloat(row.fs);
    const ifs = parseFloat(row.ifs);
    const elev = parseFloat(row.elev);

    if (i === 0) {
      // BM1: user enters ELEV manually; HI = ELEV + BS
      if (!isNaN(elev) && !isNaN(bs)) {
        currentHI = elev + bs;
        row.hi = currentHI.toFixed(3);
      } else {
        row.hi = '';
        currentHI = 0;
      }
    } else {
      // For all other rows, ELEV is auto-calculated
      if (!isNaN(fs) && row.fs !== '') {
        // Turning Point or BM2: ELEV = HI - FS
        row.elev = currentHI > 0 ? (currentHI - fs).toFixed(3) : '';
        // If this row also has a BS, it's a TP — update HI
        if (!isNaN(bs) && row.bs !== '') {
          const newElev = parseFloat(row.elev);
          currentHI = newElev + bs;
          row.hi = currentHI.toFixed(3);
        } else {
          row.hi = '';
        }
      } else if (!isNaN(ifs) && row.ifs !== '') {
        // Intermediate sight: ELEV = HI - IFS
        row.elev = currentHI > 0 ? (currentHI - ifs).toFixed(3) : '';
        row.hi = '';
      } else {
        row.elev = '';
        row.hi = '';
      }
    }

    result[i] = row;
  }
  return result;
}

const DataInputPage: React.FC<{ projectId?: number | null }> = ({ projectId }) => {
  const [rows, setRows] = useState<LevelingRow[]>([{ id: Date.now(), station: 'BM1', bs: '', fs: '', ifs: '', hi: '', elev: '' }]);
  const [projectName, setProjectName] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
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

  // Load project name + rows from API when projectId is present
  useEffect(() => {
    if (!projectId) {
      const saved = localStorage.getItem('levelingRows');
      if (saved) setRows(JSON.parse(saved));
      return;
    }
    fetch('/api/projects')
      .then(r => r.json())
      .then((list: Record<string, unknown>[]) => {
        const p = list.find(x => x.id === projectId);
        if (p) setProjectName(String(p.name));
      })
      .catch(console.error);
    fetch(`/api/projects/${projectId}/rows`)
      .then(r => r.json())
      .then((data: Record<string, unknown>[]) => {
        if (data.length > 0)
          setRows(computeRows(data.map((r, i) => apiRowToLevelingRow(r, i))));
      })
      .catch(console.error);
  }, [projectId]);

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
    const newRow: LevelingRow = { id: Date.now(), station: '', bs: '', fs: '', ifs: '', hi: '', elev: '' };
    setRows(prev => computeRows([...prev, newRow]));
  };

  const updateRow = (id: number, field: keyof LevelingRow, value: string) => {
    setRows(prev => computeRows(prev.map(row => row.id === id ? { ...row, [field]: value } : row)));
  };

  const deleteRow = (id: number) => {
    if (rows.length > 1) {
      setRows(prev => computeRows(prev.filter(row => row.id !== id)));
    }
  };

  const handleSave = async () => {
    localStorage.setItem('levelingRows', JSON.stringify(rows));
    if (!projectId) {
      setToast({ type: 'success', msg: 'Data saved locally!' });
      setTimeout(() => setToast(null), 1500);
      return;
    }
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}/rows`, { method: 'DELETE' });
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        await fetch(`/api/projects/${projectId}/rows`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            station:   r.station,
            bs:        r.bs   !== '' ? parseFloat(r.bs)   : null,
            is_val:    r.ifs  !== '' ? parseFloat(r.ifs)  : null,
            fs:        r.fs   !== '' ? parseFloat(r.fs)   : null,
            hi:        r.hi   !== '' ? parseFloat(r.hi)   : null,
            rl:        r.elev !== '' ? parseFloat(r.elev) : null,
            row_order: i,
          }),
        });
      }
      // Auto-update progress based on milestones
      await updateProjectProgress(projectId);
      setToast({ type: 'success', msg: 'Data saved successfully!' });
      setTimeout(() => setToast(null), 1500);
    } catch {
      setToast({ type: 'error', msg: 'Save failed. Data kept locally.' });
      setTimeout(() => setToast(null), 3000);
    }
    finally { setSaving(false); }
  };

  const handleClear = () => {
    const blank = [{ id: Date.now(), station: 'BM1', bs: '', fs: '', ifs: '', hi: '', elev: '' }];
    setRows(blank);
    localStorage.removeItem('levelingRows');
  };

  // Totals for footer
  const totalBS = rows.reduce((s, r) => s + (parseFloat(r.bs) || 0), 0);
  const totalFS = rows.reduce((s, r) => s + (parseFloat(r.fs) || 0), 0);
  const firstElev = parseFloat(rows[0]?.elev) || 0;
  const lastElev = parseFloat(rows[rows.length - 1]?.elev) || 0;
  const closureOk = rows.length > 1 && Math.abs((totalBS - totalFS) - (lastElev - firstElev)) < 0.001;

  return (
    <div className="di-page">
      {toast && (
        <div className="ep-notif-overlay">
          <div className="ep-notif-modal">
            {toast.type === 'success' ? (
              <div className="ep-notif-checkmark">
                <svg viewBox="0 0 52 52">
                  <circle className="ep-notif-circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="ep-notif-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
            ) : (
              <div className="ep-notif-error-icon">❌</div>
            )}
            <h2 className={`ep-notif-title--${toast.type}`}>
              {toast.type === 'success' ? 'Saved!' : 'Failed!'}
            </h2>
            <p className="ep-notif-message">{toast.msg}</p>
          </div>
        </div>
      )}
      <Sidebar activePath="/data-input" onLogout={() => setShowLogoutModal(true)} />

      {/* Main */}
      <main className="di-main">
        <div className="di-content">
          {/* Header */}
          <div className="di-header">
            <div>
              <h1 className="di-title">Data Input</h1>
              {projectName && <p className="di-project-label">Project: <strong>{projectName}</strong></p>}
            </div>
            <div className="di-header-actions">
              <button className="di-btn-back" onClick={() => window.location.href = '/projects'}>← Projects</button>
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
                        <button className="di-btn-delete" onClick={() => deleteRow(row.id)} disabled={rows.length === 1}>×</button>
                      </div>
                      {([
                        { label: 'STA', field: 'station' as const, placeholder: 'e.g. BM1', auto: false },
                        { label: 'BS', field: 'bs' as const, placeholder: '0.000', auto: false },
                        { label: 'FS', field: 'fs' as const, placeholder: '0.000', auto: false },
                        { label: 'IFS', field: 'ifs' as const, placeholder: '0.000', auto: false },
                        { label: 'HI', field: 'hi' as const, placeholder: 'auto', auto: true },
                        { label: 'ELEV', field: 'elev' as const, placeholder: idx === 0 ? '0.000' : 'auto', auto: idx !== 0 },
                      ]).map(({ label, field, placeholder, auto }) => (
                        <div className="di-row-card-field" key={field}>
                          <span className="di-row-card-label">{label}</span>
                          <input
                            type="text"
                            value={row[field]}
                            onChange={(e) => !auto && updateRow(row.id, field, e.target.value)}
                            placeholder={placeholder}
                            disabled={auto}
                            className={auto ? 'di-auto-field' : ''}
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
                      <th>STA</th>
                      <th>BS (m)</th>
                      <th>HI (m)</th>
                      <th>FS (m)</th>
                      <th>IFS (m)</th>
                      <th>ELEV (m)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={row.id}>
                        <td><input type="text" value={row.station} onChange={(e) => updateRow(row.id, 'station', e.target.value)} placeholder="e.g. BM1" /></td>
                        <td><input type="text" value={row.bs} onChange={(e) => updateRow(row.id, 'bs', e.target.value)} placeholder="0.000" /></td>
                        <td><input type="text" value={row.hi} placeholder="auto" disabled className="di-auto-field" /></td>
                        <td><input type="text" value={row.fs} onChange={(e) => updateRow(row.id, 'fs', e.target.value)} placeholder="0.000" /></td>
                        <td><input type="text" value={row.ifs} onChange={(e) => updateRow(row.id, 'ifs', e.target.value)} placeholder="0.000" /></td>
                        <td>
                          {idx === 0
                            ? <input type="text" value={row.elev} onChange={(e) => updateRow(row.id, 'elev', e.target.value)} placeholder="0.000" />
                            : <input type="text" value={row.elev} placeholder="auto" disabled className="di-auto-field" />
                          }
                        </td>
                        <td><button className="di-btn-delete" onClick={() => deleteRow(row.id)} disabled={rows.length === 1}>×</button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="di-totals-row">
                      <td><strong>TOTALS</strong></td>
                      <td><strong>{totalBS.toFixed(3)}</strong></td>
                      <td>—</td>
                      <td><strong>{totalFS.toFixed(3)}</strong></td>
                      <td>—</td>
                      <td className={closureOk ? 'di-closure-ok' : 'di-closure-fail'}>
                        <strong>{closureOk ? '✓ Closed' : rows.length > 1 ? '✗ Open' : '—'}</strong>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            <div className="di-table-footer">
              <button className="di-btn-clear" onClick={handleClear}>Clear All</button>
              <button className="di-btn-save" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Data'}</button>
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
