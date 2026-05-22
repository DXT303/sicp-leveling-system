import React, { useState, useEffect } from 'react';
import './Computation.css';
import './NewProjectModal.css';

interface ComputedRow { station: string; bs: number; is: number; fs: number; hi: number; rise: number; fall: number; rl: number; }

interface Props {
  projectId: number;
  onClose: () => void;
  onConfirmed: (newProgress: number) => void;
}

const ComputationModal: React.FC<Props> = ({ projectId, onClose, onConfirmed }) => {
  const [method, setMethod] = useState('rise-fall');
  const [computedRows, setComputedRows] = useState<ComputedRow[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [methodOpen, setMethodOpen] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/rows`)
      .then(r => r.json())
      .then((data: Record<string, unknown>[]) => {
        if (!data.length) return;
        const mapped: ComputedRow[] = data.map(r => ({
          station: String(r.station ?? ''),
          bs: Number(r.bs ?? 0), is: Number(r.is_val ?? 0), fs: Number(r.fs ?? 0),
          hi: Number(r.hi ?? 0), rise: 0, fall: 0, rl: Number(r.rl ?? 0),
        }));
        for (let i = 1; i < mapped.length; i++) {
          const diff = mapped[i].rl - mapped[i - 1].rl;
          if (diff > 0) mapped[i].rise = diff; else mapped[i].fall = Math.abs(diff);
        }
        setComputedRows(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  const sampleData: ComputedRow[] = computedRows.length > 0 ? computedRows : [
    { station: 'BM1', bs: 1.525, is: 0, fs: 0,     hi: 101.525, rise: 0,     fall: 0,     rl: 100.000 },
    { station: 'CP1', bs: 1.835, is: 0, fs: 1.245,  hi: 102.115, rise: 0.280, fall: 0,     rl: 100.280 },
    { station: 'TP1', bs: 2.105, is: 0, fs: 1.655,  hi: 102.565, rise: 0.450, fall: 0,     rl: 100.730 },
    { station: 'BM2', bs: 0,     is: 0, fs: 1.890,  hi: 0,       rise: 0,     fall: 0.235, rl: 100.675 },
  ];

  const totalBS   = sampleData.reduce((s, r) => s + r.bs, 0);
  const totalFS   = sampleData.reduce((s, r) => s + r.fs, 0);
  const totalRise = sampleData.reduce((s, r) => s + r.rise, 0);
  const totalFall = sampleData.reduce((s, r) => s + r.fall, 0);
  const misclose  = (totalBS - totalFS) - (sampleData[sampleData.length - 1].rl - sampleData[0].rl);
  const distance  = 1.5;
  const allowableError = 0.012 * Math.sqrt(distance);
  const status = Math.abs(misclose) <= allowableError ? 'PASS' : 'FAIL';

  const handleConfirm = async () => {
    await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress: 50 }),
    });
    sessionStorage.setItem('activeProjectProgress', '50');
    setConfirmed(true);
    setToast(true);
    setTimeout(() => { setToast(false); onConfirmed(50); }, 1500);
  };

  const methodOptions = [
    { value: 'rise-fall', label: 'Rise & Fall Method' },
    { value: 'hi', label: 'Height of Instrument Method' },
  ];

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
            <h2 className="ep-notif-title--success">Confirmed!</h2>
            <p className="ep-notif-message">Computation confirmed successfully.</p>
          </div>
        </div>
      )}
      <div className="wf-modal wf-modal--wide" onClick={e => e.stopPropagation()}>
        <div className="wf-modal-header">
          <h2>Differential Leveling Computation</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="comp-custom-dropdown" style={{ minWidth: 200 }}>
              <div className="comp-custom-dropdown-selected" onClick={() => setMethodOpen(o => !o)}>
                <span>{methodOptions.find(o => o.value === method)?.label}</span>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              {methodOpen && (
                <div className="comp-custom-dropdown-options">
                  {methodOptions.map(o => (
                    <div key={o.value} className={`comp-custom-dropdown-option ${method === o.value ? 'selected' : ''}`}
                      onClick={() => { setMethod(o.value); setMethodOpen(false); }}>{o.label}</div>
                  ))}
                </div>
              )}
            </div>
            <button className="new-project-close" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="wf-modal-body">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 16 }}>
              <div style={{ width: 40, height: 40, border: '4px solid #F0F0F0', borderTop: '4px solid #FF8D28', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 14, color: '#9197B3', fontFamily: 'Poppins' }}>Loading data...</span>
            </div>
          ) : (
          <>
          <div className="comp-table-card">
            <div className="comp-table-wrapper">
              <table className="comp-table">
                <thead>
                  <tr><th>Station</th><th>BS (m)</th><th>IS (m)</th><th>FS (m)</th><th>HI (m)</th><th>Rise (m)</th><th>Fall (m)</th><th>RL (m)</th></tr>
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
                    <td>TOTALS</td><td>{totalBS.toFixed(3)}</td><td>-</td><td>{totalFS.toFixed(3)}</td>
                    <td>-</td><td>{totalRise.toFixed(3)}</td><td>{totalFall.toFixed(3)}</td><td>-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="comp-results-grid">
            <div className="comp-card">
              <h2 className="comp-card-title">Arithmetic Check</h2>
              <div className="comp-check-item"><span>ΣBS - ΣFS:</span><span className="comp-value">{(totalBS - totalFS).toFixed(3)} m</span></div>
              <div className="comp-check-item"><span>ΣRise - ΣFall:</span><span className="comp-value">{(totalRise - totalFall).toFixed(3)} m</span></div>
              <div className="comp-check-item"><span>Last RL - First RL:</span><span className="comp-value">{(sampleData[sampleData.length - 1].rl - sampleData[0].rl).toFixed(3)} m</span></div>
            </div>
            <div className="comp-card">
              <h2 className="comp-card-title">Closure Error Analysis</h2>
              <div className="comp-check-item"><span>Misclose:</span><span className="comp-value">{(misclose * 1000).toFixed(1)} mm</span></div>
              <div className="comp-check-item"><span>Distance:</span><span className="comp-value">{distance.toFixed(1)} km</span></div>
              <div className="comp-check-item"><span>Allowable Error:</span><span className="comp-value">±{(allowableError * 1000).toFixed(1)} mm</span></div>
              <div className="comp-status-item"><span>Status:</span><span className={`comp-status ${status.toLowerCase()}`}>{status}</span></div>
            </div>
          </div>

          <div className="comp-note">
            {status === 'PASS' ? '✓ Leveling meets accuracy standards.' : '✗ Leveling exceeds allowable error. Re-observation recommended.'}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={handleConfirm} disabled={confirmed}
              style={{ padding: '12px 32px', background: confirmed ? '#34C759' : '#FF8D28', color: '#fff', border: 'none', borderRadius: 25, fontFamily: 'Poppins', fontSize: 14, fontWeight: 600, cursor: confirmed ? 'default' : 'pointer' }}>
              {confirmed ? '✓ Confirmed!' : 'Confirm Computation →'}
            </button>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComputationModal;
