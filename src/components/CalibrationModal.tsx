import React, { useState, useEffect } from 'react';
import './Calibration.css';
import './NewProjectModal.css';
import { postLog } from './useActivityLogs';

interface Props {
  projectId: number;
  projectName: string;
  onClose: () => void;
  onSaved: (newProgress: number) => void;
}

const instrOptions = ['Sokkia B40', 'Leica NA2', 'Topcon AT-B4'];
const methodOptions = ['Two-Peg Test', 'Collimation Test'];

const CalibrationModal: React.FC<Props> = ({ projectId, projectName, onClose, onSaved }) => {
  const [instrument, setInstrument] = useState('');
  const [instrumentId, setInstrumentId] = useState('');
  const [testMethod, setTestMethod] = useState('');
  const [a1, setA1] = useState(''); const [a2, setA2] = useState('');
  const [b1, setB1] = useState(''); const [b2, setB2] = useState('');
  const [distance, setDistance] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; update: boolean } | null>(null);
  const [instrOpen, setInstrOpen] = useState(false);
  const [methodOpen, setMethodOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingId, setExistingId] = useState<number | null>(null);

  const markDirty = () => { if (existingId) setIsDirty(true); };

  useEffect(() => {
    fetch(`/api/projects/${projectId}/calibration`)
      .then(r => r.json())
      .then((data: Record<string, unknown> | null) => {
        if (data) {
          setExistingId(Number(data.id));
          const instr = String(data.instrument ?? '');
          if (instrOptions.includes(instr)) setInstrument(instr);
          else setInstrumentId(instr);
          setTestMethod(String(data.method ?? ''));
          setA1(data.d1_near != null ? String(data.d1_near) : '');
          setA2(data.d1_far  != null ? String(data.d1_far)  : '');
          setB1(data.d2_near != null ? String(data.d2_near) : '');
          setB2(data.d2_far  != null ? String(data.d2_far)  : '');
          setDistance(data.distance != null ? String(data.distance) : '');
          setIsDirty(false);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  const calculateResults = () => {
    if (!a1 || !a2 || !b1 || !b2 || !distance) return null;
    const A1 = parseFloat(a1), A2 = parseFloat(a2);
    const B1 = parseFloat(b1), B2 = parseFloat(b2);
    const D  = parseFloat(distance);
    const collimationError = ((A2 - B2) - (A1 - B1)) / 2;
    const correctionFactor = collimationError / D;
    const status = Math.abs(collimationError) <= 0.003 ? 'PASS' : 'FAIL';
    return { collimationError, correctionFactor, status };
  };

  const results = calculateResults();

  const handleSave = async () => {
    if (!results) return;
    setSaving(true);
    const payload = {
      project_id: projectId,
      instrument: instrument || instrumentId || null,
      date: new Date().toISOString().slice(0, 10),
      method: testMethod || null,
      d1_near: parseFloat(a1), d1_far: parseFloat(a2),
      d2_near: parseFloat(b1), d2_far: parseFloat(b2),
      distance: parseFloat(distance),
      error: results.collimationError, status: results.status,
    };
    try {
      if (existingId) {
        await fetch(`/api/calibrations/${existingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        await postLog('info', `Calibration updated for "${projectName}" by ${sessionStorage.getItem('userName') || 'Unknown'}`, 'Info / Calibration updated', {
          Instrument:  { from: '', to: payload.instrument ?? '' },
          Method:      { from: '', to: payload.method ?? '' },
          Error:       { from: '', to: payload.error.toFixed(4) + ' m' },
          Status:      { from: '', to: payload.status },
        });
      } else {
        const res = await fetch('/api/calibrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        if (created?.id) setExistingId(Number(created.id));
        await postLog('success', `Calibration saved for "${projectName}" by ${sessionStorage.getItem('userName') || 'Unknown'}`, 'Success / Calibration saved', {
          Instrument: { from: '', to: payload.instrument ?? '' },
          Method:     { from: '', to: payload.method ?? '' },
          Error:      { from: '', to: payload.error.toFixed(4) + ' m' },
          Status:     { from: '', to: payload.status },
        });
      }
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: 50 }),
      });
      sessionStorage.setItem('activeProjectProgress', '50');
      setIsDirty(false);
      setToast({ type: 'success', update: !!existingId });
      setTimeout(() => { setToast(null); onSaved(50); }, 1500);
    } catch { setToast({ type: 'error', update: false }); setTimeout(() => setToast(null), 3000); }
    finally { setSaving(false); }
  };

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
            <h2 className={`ep-notif-title--${toast.type}`}>{toast.type === 'success' ? (toast.update ? 'Updated!' : 'Saved!') : 'Failed!'}</h2>
            <p className="ep-notif-message">{toast.type === 'success' ? (toast.update ? 'Calibration updated successfully.' : 'Calibration saved successfully.') : 'Save failed. Please try again.'}</p>
          </div>
        </div>
      )}
      <div className="wf-modal wf-modal--wide" onClick={e => e.stopPropagation()}>
        <div className="wf-modal-header">
          <h2>Two-Peg Calibration Test</h2>
          <button className="new-project-close" onClick={onClose}>×</button>
        </div>
        <div className="wf-modal-body">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 16 }}>
              <div style={{ width: 40, height: 40, border: '4px solid #F0F0F0', borderTop: '4px solid #FF8D28', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 14, color: '#9197B3', fontFamily: 'Poppins' }}>Loading data...</span>
            </div>
          ) : (
            <>
              <div className="cal-grid">
                {/* Instrument Setup */}
                <div className="cal-card">
                  <h2 className="cal-card-title">Instrument Setup</h2>
                  <div className="cal-form">
                    <div className="cal-field">
                      <label>Instrument</label>
                      <div className="cal-custom-dropdown">
                        <div className="cal-custom-dropdown-selected" onClick={() => { setInstrOpen(o => !o); markDirty(); }}>
                          <span>{instrument || 'Select instrument'}</span>
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        </div>
                        {instrOpen && (
                          <div className="cal-custom-dropdown-options">
                            {instrOptions.map(o => <div key={o} className={`cal-custom-dropdown-option ${instrument === o ? 'selected' : ''}`} onClick={() => { setInstrument(o); setInstrOpen(false); markDirty(); }}>{o}</div>)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="cal-field">
                      <label>Instrument ID</label>
                      <input type="text" placeholder="e.g. LVL-001" value={instrumentId} onChange={e => { setInstrumentId(e.target.value); markDirty(); }} />
                    </div>
                    <div className="cal-field">
                      <label>Test Method</label>
                      <div className="cal-custom-dropdown">
                        <div className="cal-custom-dropdown-selected" onClick={() => { setMethodOpen(o => !o); markDirty(); }}>
                          <span>{testMethod || 'Select method'}</span>
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        </div>
                        {methodOpen && (
                          <div className="cal-custom-dropdown-options">
                            {methodOptions.map(o => <div key={o} className={`cal-custom-dropdown-option ${testMethod === o ? 'selected' : ''}`} onClick={() => { setTestMethod(o); setMethodOpen(false); markDirty(); }}>{o}</div>)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Two-Peg Test Data */}
                <div className="cal-card">
                  <h2 className="cal-card-title">Two-Peg Test Data</h2>
                  <div className="cal-form">
                    <div className="cal-field-group">
                      <div className="cal-field"><label>Staff Reading A1 (m)</label><input type="number" step="0.001" placeholder="0.000" value={a1} onChange={e => { setA1(e.target.value); markDirty(); }} /></div>
                      <div className="cal-field"><label>Staff Reading A2 (m)</label><input type="number" step="0.001" placeholder="0.000" value={a2} onChange={e => { setA2(e.target.value); markDirty(); }} /></div>
                    </div>
                    <div className="cal-field-group">
                      <div className="cal-field"><label>Staff Reading B1 (m)</label><input type="number" step="0.001" placeholder="0.000" value={b1} onChange={e => { setB1(e.target.value); markDirty(); }} /></div>
                      <div className="cal-field"><label>Staff Reading B2 (m)</label><input type="number" step="0.001" placeholder="0.000" value={b2} onChange={e => { setB2(e.target.value); markDirty(); }} /></div>
                    </div>
                    <div className="cal-field"><label>Distance Peg A-B (m)</label><input type="number" step="0.1" placeholder="0.0" value={distance} onChange={e => { setDistance(e.target.value); markDirty(); }} /></div>
                  </div>
                </div>

                {/* Results */}
                <div className="cal-card cal-results">
                  <h2 className="cal-card-title">Calibration Results</h2>
                  {results ? (
                    <div className="cal-results-content">
                      <div className="cal-result-item"><span className="cal-result-label">Collimation Error:</span><span className="cal-result-value">{results.collimationError.toFixed(4)} m</span></div>
                      <div className="cal-result-item"><span className="cal-result-label">Correction Factor:</span><span className="cal-result-value">{results.correctionFactor.toFixed(6)} m/m</span></div>
                      <div className="cal-result-item">
                        <span className="cal-result-label">Status:</span>
                        <span className={`cal-result-status ${results.status.toLowerCase()}`}>{results.status}</span>
                      </div>
                      <div className="cal-result-note">{results.status === 'PASS' ? '✓ Instrument is within acceptable tolerance (±3mm)' : '✗ Instrument requires adjustment or repair'}</div>
                    </div>
                  ) : <div className="cal-results-empty"><p>Enter all test data to see results</p></div>}
                </div>
              </div>

              <div className="cal-actions">
                <button className="cal-btn-clear" onClick={() => { setInstrument(''); setInstrumentId(''); setTestMethod(''); setA1(''); setA2(''); setB1(''); setB2(''); setDistance(''); setIsDirty(false); }}>Clear All</button>
                <button className="cal-btn-save" disabled={saving || !results || (existingId !== null && !isDirty)} onClick={handleSave}>
                  {saving ? (existingId && isDirty ? 'Updating…' : 'Saving…') : (existingId && isDirty ? 'Update Calibration' : existingId ? '✓ Saved!' : 'Save Calibration')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalibrationModal;
