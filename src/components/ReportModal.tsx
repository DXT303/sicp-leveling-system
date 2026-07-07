import React, { useEffect, useState } from 'react';
import './Computation.css';
import './NewProjectModal.css';
import { Project } from './useProjects';
import { postLog } from './useActivityLogs';

interface LevelingRow { station: string; bs: number; is: number; fs: number; hi: number; rise: number; fall: number; rl: number; }
interface CalibrationRecord { instrument: string | null; date: string; error: number; status: string; }

interface Props {
  project: Project;
  onClose: () => void;
  onMarkedComplete: (newProgress: number) => void;
}

const ReportModal: React.FC<Props> = ({ project, onClose, onMarkedComplete }) => {
  const [rows, setRows] = useState<LevelingRow[]>([]);
  const [cal, setCal] = useState<CalibrationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(project.progress >= 100);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${project.id}/rows`).then(r => r.json()),
      fetch(`/api/projects/${project.id}/calibration`).then(r => r.json()),
    ]).then(([rowData, calData]: [Record<string, unknown>[], Record<string, unknown> | null]) => {
      const mapped: LevelingRow[] = rowData.map(r => ({
        station: String(r.station ?? ''),
        bs: Number(r.bs ?? 0), is: Number(r.is_val ?? 0), fs: Number(r.fs ?? 0),
        hi: Number(r.hi ?? 0), rise: 0, fall: 0, rl: Number(r.rl ?? 0),
      }));
      for (let i = 1; i < mapped.length; i++) {
        const diff = mapped[i].rl - mapped[i - 1].rl;
        if (diff > 0) mapped[i].rise = diff; else mapped[i].fall = Math.abs(diff);
      }
      setRows(mapped);
      if (calData) setCal({ instrument: String(calData.instrument ?? ''), date: String(calData.date ?? ''), error: Number(calData.error ?? 0), status: String(calData.status ?? '') });
    }).catch(console.error).finally(() => setLoading(false));
  }, [project.id]);

  const totalBS   = rows.reduce((s, r) => s + r.bs, 0);
  const totalFS   = rows.reduce((s, r) => s + r.fs, 0);
  const totalRise = rows.reduce((s, r) => s + r.rise, 0);
  const totalFall = rows.reduce((s, r) => s + r.fall, 0);
  const misclose  = rows.length > 1 ? (totalBS - totalFS) - (rows[rows.length - 1].rl - rows[0].rl) : 0;
  const allowable = 0.012 * Math.sqrt(project.distance_k || 1);
  const closureStatus = Math.abs(misclose) <= allowable ? 'PASS' : 'FAIL';

  return (
    <div className="wf-modal-overlay" onClick={onClose}>
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
            <p className="ep-notif-message">Project marked as completed.</p>
          </div>
        </div>
      )}
      <div className="wf-modal wf-modal--wide" onClick={e => e.stopPropagation()}>
        <div className="wf-modal-header">
          <h2>Survey Report — {project.name}</h2>
          <button className="new-project-close" onClick={onClose}>×</button>
        </div>
        <div className="wf-modal-body">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 16 }}>
              <div style={{ width: 40, height: 40, border: '4px solid #F0F0F0', borderTop: '4px solid #FF8D28', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 14, color: '#9197B3', fontFamily: 'Poppins' }}>Loading report...</span>
            </div>
          ) : (
            <>
              {/* Project Info */}
              <div className="comp-results-grid" style={{ marginBottom: 16 }}>
                <div className="comp-card">
                  <h2 className="comp-card-title">Project Info</h2>
                  <div className="comp-check-item"><span>Instrument:</span><span className="comp-value">{project.instrument}</span></div>
                  <div className="comp-check-item"><span>BM Elevation:</span><span className="comp-value">{project.bm_elevation} m</span></div>
                  <div className="comp-check-item"><span>Method:</span><span className="comp-value">{project.method}</span></div>
                  <div className="comp-check-item"><span>Distance K:</span><span className="comp-value">{project.distance_k} km</span></div>
                </div>
                {cal && (
                  <div className="comp-card">
                    <h2 className="comp-card-title">Calibration Summary</h2>
                    <div className="comp-check-item"><span>Instrument:</span><span className="comp-value">{cal.instrument || '—'}</span></div>
                    <div className="comp-check-item"><span>Date:</span><span className="comp-value">{cal.date}</span></div>
                    <div className="comp-check-item"><span>Collimation Error:</span><span className="comp-value">{cal.error.toFixed(4)} m</span></div>
                    <div className="comp-status-item"><span>Status:</span><span className={`comp-status ${cal.status.toLowerCase()}`}>{cal.status}</span></div>
                  </div>
                )}
              </div>

              {/* Leveling Table */}
              {rows.length > 0 && (
                <div className="comp-table-card">
                  <div className="comp-table-wrapper">
                    <table className="comp-table">
                      <thead>
                        <tr><th>Station</th><th>BS (m)</th><th>IS (m)</th><th>FS (m)</th><th>HI (m)</th><th>Rise (m)</th><th>Fall (m)</th><th>RL (m)</th></tr>
                      </thead>
                      <tbody>
                        {rows.map((row, idx) => (
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
                          <td>TOTALS</td><td>{totalBS.toFixed(3)}</td><td>-</td><td>{totalFS.toFixed(3)}</td>
                          <td>-</td><td>{totalRise.toFixed(3)}</td><td>{totalFall.toFixed(3)}</td><td>-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Closure */}
              {rows.length > 1 && (
                <>
                  <div className="comp-results-grid" style={{ marginTop: 16 }}>
                    <div className="comp-card">
                      <h2 className="comp-card-title">Arithmetic Check</h2>
                      <div className="comp-check-item"><span>ΣBS - ΣFS:</span><span className="comp-value">{(totalBS - totalFS).toFixed(3)} m</span></div>
                      <div className="comp-check-item"><span>ΣRise - ΣFall:</span><span className="comp-value">{(totalRise - totalFall).toFixed(3)} m</span></div>
                      <div className="comp-check-item"><span>Last RL - First RL:</span><span className="comp-value">{(rows[rows.length - 1].rl - rows[0].rl).toFixed(3)} m</span></div>
                    </div>
                    <div className="comp-card">
                      <h2 className="comp-card-title">Closure Error Analysis</h2>
                      <div className="comp-check-item"><span>Misclose:</span><span className="comp-value">{(misclose * 1000).toFixed(1)} mm</span></div>
                      <div className="comp-check-item"><span>Distance:</span><span className="comp-value">{project.distance_k} km</span></div>
                      <div className="comp-check-item"><span>Allowable Error:</span><span className="comp-value">±{(allowable * 1000).toFixed(1)} mm</span></div>
                      <div className="comp-status-item"><span>Status:</span><span className={`comp-status ${closureStatus.toLowerCase()}`}>{closureStatus}</span></div>
                    </div>
                  </div>
                  <div className="comp-note">
                    {closureStatus === 'PASS' ? '✓ Leveling meets accuracy standards.' : '✗ Leveling exceeds allowable error. Re-observation recommended.'}
                  </div>
                </>
              )}

              {rows.length === 0 && <p style={{ color: '#9197B3', textAlign: 'center', padding: '24px 0' }}>No leveling data available for this project.</p>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button
                  disabled={completing || completed}
                  onClick={async () => {
                    setCompleting(true);
                    await fetch(`/api/projects/${project.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ progress: 100, status: 'completed' }),
                    });
                    await postLog('success', `"${project.name}" marked as complete by ${sessionStorage.getItem('userName') || 'Unknown'}`, 'Success / Completed');
                    sessionStorage.setItem('activeProjectProgress', '100');
                    setCompleted(true);
                    setCompleting(false);
                    setToast(true);
                    setTimeout(() => { setToast(false); onMarkedComplete(100); }, 1500);
                  }}
                  style={{ padding: '12px 32px', background: completed ? '#34C759' : '#FF8D28', color: '#fff', border: 'none', borderRadius: 25, fontFamily: 'Poppins', fontSize: 14, fontWeight: 600, cursor: completed ? 'default' : 'pointer' }}
                >
                  {completed ? '✓ Completed!' : completing ? 'Saving…' : 'Mark as Complete →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
