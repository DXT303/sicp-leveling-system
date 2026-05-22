import React, { useState, useEffect } from 'react';
import './DataInput.css';
import './NewProjectModal.css';

interface LevelingRow {
  id: number;
  station: string;
  bs: string;
  fs: string;
  ifs: string;
  hi: string;
  elev: string;
}

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

function computeRows(rows: LevelingRow[]): LevelingRow[] {
  const result = [...rows];
  let currentHI = 0;
  for (let i = 0; i < result.length; i++) {
    const row = { ...result[i] };
    const bs = parseFloat(row.bs), fs = parseFloat(row.fs);
    const ifs = parseFloat(row.ifs), elev = parseFloat(row.elev);
    if (i === 0) {
      if (!isNaN(elev) && !isNaN(bs)) { currentHI = elev + bs; row.hi = currentHI.toFixed(3); }
      else { row.hi = ''; currentHI = 0; }
    } else {
      if (!isNaN(fs) && row.fs !== '') {
        row.elev = currentHI > 0 ? (currentHI - fs).toFixed(3) : '';
        if (!isNaN(bs) && row.bs !== '') { currentHI = parseFloat(row.elev) + bs; row.hi = currentHI.toFixed(3); }
        else row.hi = '';
      } else if (!isNaN(ifs) && row.ifs !== '') {
        row.elev = currentHI > 0 ? (currentHI - ifs).toFixed(3) : '';
        row.hi = '';
      } else { row.elev = ''; row.hi = ''; }
    }
    result[i] = row;
  }
  return result;
}

interface Props {
  projectId: number;
  onClose: () => void;
  onSaved: (newProgress: number) => void;
}

const DataInputModal: React.FC<Props> = ({ projectId, onClose, onSaved }) => {
  const [rows, setRows] = useState<LevelingRow[]>([{ id: Date.now(), station: 'BM1', bs: '', fs: '', ifs: '', hi: '', elev: '' }]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/rows`)
      .then(r => r.json())
      .then((data: Record<string, unknown>[]) => {
        if (data.length > 0) setRows(computeRows(data.map((r, i) => apiRowToLevelingRow(r, i))));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  const addRow = () => setRows(prev => computeRows([...prev, { id: Date.now(), station: '', bs: '', fs: '', ifs: '', hi: '', elev: '' }]));
  const updateRow = (id: number, field: keyof LevelingRow, value: string) =>
    setRows(prev => computeRows(prev.map(row => row.id === id ? { ...row, [field]: value } : row)));
  const deleteRow = (id: number) => {
    if (rows.length > 1) setRows(prev => computeRows(prev.filter(row => row.id !== id)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}/rows`, { method: 'DELETE' });
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        await fetch(`/api/projects/${projectId}/rows`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            station: r.station,
            bs:      r.bs   !== '' ? parseFloat(r.bs)   : null,
            is_val:  r.ifs  !== '' ? parseFloat(r.ifs)  : null,
            fs:      r.fs   !== '' ? parseFloat(r.fs)   : null,
            hi:      r.hi   !== '' ? parseFloat(r.hi)   : null,
            rl:      r.elev !== '' ? parseFloat(r.elev) : null,
            row_order: i,
          }),
        });
      }
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: 25 }),
      });
      sessionStorage.setItem('activeProjectProgress', '25');
      setToast({ type: 'success', msg: 'Data saved successfully!' });
      setTimeout(() => { setToast(null); onSaved(25); }, 1500);
    } catch {
      setToast({ type: 'error', msg: 'Save failed. Please try again.' });
      setTimeout(() => setToast(null), 3000);
    } finally { setSaving(false); }
  };

  const totalBS = rows.reduce((s, r) => s + (parseFloat(r.bs) || 0), 0);
  const totalFS = rows.reduce((s, r) => s + (parseFloat(r.fs) || 0), 0);
  const firstElev = parseFloat(rows[0]?.elev) || 0;
  const lastElev  = parseFloat(rows[rows.length - 1]?.elev) || 0;
  const closureOk = rows.length > 1 && Math.abs((totalBS - totalFS) - (lastElev - firstElev)) < 0.001;

  return (
    <div className="wf-modal-overlay" onClick={onClose}>
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
            ) : <div className="ep-notif-error-icon">❌</div>}
            <h2 className={`ep-notif-title--${toast.type}`}>{toast.type === 'success' ? 'Saved!' : 'Failed!'}</h2>
            <p className="ep-notif-message">{toast.msg}</p>
          </div>
        </div>
      )}
      <div className="wf-modal wf-modal--wide" onClick={e => e.stopPropagation()}>
        <div className="wf-modal-header">
          <h2>Data Input</h2>
          <button className="new-project-close" onClick={onClose}>×</button>
        </div>
        <div className="wf-modal-body">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 16 }}>
              <div style={{ width: 40, height: 40, border: '4px solid #F0F0F0', borderTop: '4px solid #FF8D28', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 14, color: '#9197B3', fontFamily: 'Poppins' }}>Loading data...</span>
            </div>
          ) : (
            <div className="di-table-card" style={{ boxShadow: 'none', padding: 0 }}>
            <div className="di-table-header">
              <h2>Leveling Observations</h2>
              <button className="di-btn-add" onClick={addRow}>+ Add Row</button>
            </div>
            <div className="di-table-wrapper">
              <table className="di-table">
                <thead>
                  <tr>
                    <th>STA</th><th>BS (m)</th><th>HI (m)</th>
                    <th>FS (m)</th><th>IFS (m)</th><th>ELEV (m)</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.id}>
                      <td><input type="text" value={row.station} onChange={e => updateRow(row.id, 'station', e.target.value)} placeholder="e.g. BM1" /></td>
                      <td><input type="text" value={row.bs} onChange={e => updateRow(row.id, 'bs', e.target.value)} placeholder="0.000" /></td>
                      <td><input type="text" value={row.hi} placeholder="auto" disabled className="di-auto-field" /></td>
                      <td><input type="text" value={row.fs} onChange={e => updateRow(row.id, 'fs', e.target.value)} placeholder="0.000" /></td>
                      <td><input type="text" value={row.ifs} onChange={e => updateRow(row.id, 'ifs', e.target.value)} placeholder="0.000" /></td>
                      <td>
                        {idx === 0
                          ? <input type="text" value={row.elev} onChange={e => updateRow(row.id, 'elev', e.target.value)} placeholder="0.000" />
                          : <input type="text" value={row.elev} placeholder="auto" disabled className="di-auto-field" />}
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
            </div>
            <div className="di-table-footer">
              <button className="di-btn-clear" onClick={() => setRows([{ id: Date.now(), station: 'BM1', bs: '', fs: '', ifs: '', hi: '', elev: '' }])}>Clear All</button>
              <button className="di-btn-save" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Data'}</button>
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataInputModal;
