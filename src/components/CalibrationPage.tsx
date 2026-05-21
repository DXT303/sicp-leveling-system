import React, { useState, useEffect } from 'react';
import './Calibration.css';
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

const CustomDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}> = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="cal-custom-dropdown">
      <div 
        className="cal-custom-dropdown-selected" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || placeholder}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      {isOpen && (
        <div className="cal-custom-dropdown-options">
          {options.map((option) => (
            <div
              key={option.value}
              className={`cal-custom-dropdown-option ${value === option.label ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.label);
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

const CalibrationPage: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [instrument, setInstrument] = useState('');
  const [instrumentId, setInstrumentId] = useState('');
  const [testMethod, setTestMethod] = useState('');
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [b1, setB1] = useState('');
  const [b2, setB2] = useState('');
  const [distance, setDistance] = useState('');
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

  const calculateResults = () => {
    if (!a1 || !a2 || !b1 || !b2 || !distance) return null;

    const A1 = parseFloat(a1);
    const A2 = parseFloat(a2);
    const B1 = parseFloat(b1);
    const B2 = parseFloat(b2);
    const D = parseFloat(distance);

    const collimationError = ((A2 - B2) - (A1 - B1)) / 2;
    const correctionFactor = collimationError / D;
    const status = Math.abs(collimationError) <= 0.003 ? 'PASS' : 'FAIL';

    return { collimationError, correctionFactor, status };
  };

  const results = calculateResults();

  return (
    <div className="cal-page">
      <Sidebar activePath="/calibration" onLogout={() => setShowLogoutModal(true)} />

      {/* Main */}
      <main className="cal-main">
        <div className="cal-content">
          <div className="cal-header">
            <h1 className="cal-title">Two-Peg Calibration Test</h1>
              <div className="cal-settings-wrapper">
                <div className="cal-settings-icon" onClick={() => setShowLogoutModal(true)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </div>
              </div>
          </div>

          <div className="cal-grid">
            {/* Instrument Setup */}
            <div className="cal-card">
              <h2 className="cal-card-title">Instrument Setup</h2>
              <div className="cal-form">
                <div className="cal-field">
                  <label>Instrument</label>
                  <CustomDropdown
                    value={instrument}
                    onChange={setInstrument}
                    placeholder="Select instrument"
                    options={[
                      { value: 'sokkia', label: 'Sokkia B40' },
                      { value: 'leica', label: 'Leica NA2' },
                      { value: 'topcon', label: 'Topcon AT-B4' },
                    ]}
                  />
                </div>
                <div className="cal-field">
                  <label>Instrument ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. LVL-001"
                    value={instrumentId}
                    onChange={(e) => setInstrumentId(e.target.value)}
                  />
                </div>
                <div className="cal-field">
                  <label>Test Method</label>
                  <CustomDropdown
                    value={testMethod}
                    onChange={setTestMethod}
                    placeholder="Select method"
                    options={[
                      { value: 'two-peg', label: 'Two-Peg Test' },
                      { value: 'collimation', label: 'Collimation Test' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Two-Peg Test Data */}
            <div className="cal-card">
              <h2 className="cal-card-title">Two-Peg Test Data</h2>
              <div className="cal-form">
                <div className="cal-field-group">
                  <div className="cal-field">
                    <label>Staff Reading A1 (m)</label>
                    <input 
                      type="number" 
                      step="0.001"
                      placeholder="0.000"
                      value={a1}
                      onChange={(e) => setA1(e.target.value)}
                    />
                  </div>
                  <div className="cal-field">
                    <label>Staff Reading A2 (m)</label>
                    <input 
                      type="number" 
                      step="0.001"
                      placeholder="0.000"
                      value={a2}
                      onChange={(e) => setA2(e.target.value)}
                    />
                  </div>
                </div>
                <div className="cal-field-group">
                  <div className="cal-field">
                    <label>Staff Reading B1 (m)</label>
                    <input 
                      type="number" 
                      step="0.001"
                      placeholder="0.000"
                      value={b1}
                      onChange={(e) => setB1(e.target.value)}
                    />
                  </div>
                  <div className="cal-field">
                    <label>Staff Reading B2 (m)</label>
                    <input 
                      type="number" 
                      step="0.001"
                      placeholder="0.000"
                      value={b2}
                      onChange={(e) => setB2(e.target.value)}
                    />
                  </div>
                </div>
                <div className="cal-field">
                  <label>Distance Peg A-B (m)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="0.0"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="cal-card cal-results">
              <h2 className="cal-card-title">Calibration Results</h2>
              {results ? (
                <div className="cal-results-content">
                  <div className="cal-result-item">
                    <span className="cal-result-label">Collimation Error:</span>
                    <span className="cal-result-value">{results.collimationError.toFixed(4)} m</span>
                  </div>
                  <div className="cal-result-item">
                    <span className="cal-result-label">Correction Factor:</span>
                    <span className="cal-result-value">{results.correctionFactor.toFixed(6)} m/m</span>
                  </div>
                  <div className="cal-result-item">
                    <span className="cal-result-label">Status:</span>
                    <span className={`cal-result-status ${results.status.toLowerCase()}`}>
                      {results.status}
                    </span>
                  </div>
                  <div className="cal-result-note">
                    {results.status === 'PASS' 
                      ? '✓ Instrument is within acceptable tolerance (±3mm)'
                      : '✗ Instrument requires adjustment or repair'}
                  </div>
                </div>
              ) : (
                <div className="cal-results-empty">
                  <p>Enter all test data to see results</p>
                </div>
              )}
            </div>
          </div>

          <div className="cal-actions">
            <button className="cal-btn-clear">Clear All</button>
            <button className="cal-btn-save">Save Calibration</button>
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

export default CalibrationPage;
