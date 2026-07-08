import React, { useState, useRef, useEffect } from 'react';
import './CalibrateModal.css';

interface CalibrateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Chevron = () => (
  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
    <path d="M1 1L6 6L11 1" stroke="#9197B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CalibrateModal: React.FC<CalibrateModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    instrument: 'Auto Level',
    instrumentId: '',
    testMethod: 'Two-Peg Test',
    staffReadingA1: '',
    staffReadingA2: '',
    staffReadingB1: '',
    staffReadingB2: '',
    distancePegAB: '',
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Calibration data:', formData);
    onClose();
  };

  return (
    <div className="calibrate-overlay" onClick={onClose}>
      <div className="calibrate-modal" onClick={(e) => e.stopPropagation()}>
        <div className="calibrate-header">
          <h2>Calibrate Instrument</h2>
          <button className="calibrate-close" onClick={onClose}>×</button>
        </div>

        <div className="calibrate-content">
          <form onSubmit={handleSubmit}>
          <div className="calibrate-section">
            <h3>SECTION 1 — Instrument Setup</h3>

            <div className="calibrate-field" ref={dropdownRef}>
              <label>Instrument</label>
              <div className="custom-dropdown">
                <div
                  className="custom-dropdown-selected"
                  onClick={() => setOpenDropdown(openDropdown === 'instrument' ? null : 'instrument')}
                >
                  {formData.instrument}
                  <Chevron />
                </div>
                {openDropdown === 'instrument' && (
                  <div className="custom-dropdown-options">
                    {['Auto Level', 'Digital Level', 'Laser Level'].map(option => (
                      <div
                        key={option}
                        className={`custom-dropdown-option ${formData.instrument === option ? 'selected' : ''}`}
                        onClick={() => {
                          setFormData({ ...formData, instrument: option });
                          setOpenDropdown(null);
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="calibrate-field">
              <label>Instrument ID</label>
              <input
                type="text"
                placeholder="Instrument ID"
                value={formData.instrumentId}
                onChange={(e) => setFormData({ ...formData, instrumentId: e.target.value })}
                required
              />
            </div>

            <div className="calibrate-field">
              <label>Test Method</label>
              <div className="custom-dropdown">
                <div
                  className="custom-dropdown-selected"
                  onClick={() => setOpenDropdown(openDropdown === 'testMethod' ? null : 'testMethod')}
                >
                  {formData.testMethod}
                  <Chevron />
                </div>
                {openDropdown === 'testMethod' && (
                  <div className="custom-dropdown-options">
                    {['Two-Peg Test', 'Collimation Test', 'Peg Test'].map(option => (
                      <div
                        key={option}
                        className={`custom-dropdown-option ${formData.testMethod === option ? 'selected' : ''}`}
                        onClick={() => {
                          setFormData({ ...formData, testMethod: option });
                          setOpenDropdown(null);
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="calibrate-section">
            <h3>SECTION 2 — Two-Peg Test Data</h3>

            <div className="calibrate-field">
              <label>Staff Reading A1</label>
              <input
                type="text"
                placeholder="Staff Reading A1"
                value={formData.staffReadingA1}
                onChange={(e) => setFormData({ ...formData, staffReadingA1: e.target.value })}
                required
              />
            </div>

            <div className="calibrate-field">
              <label>Staff Reading A2</label>
              <input
                type="text"
                placeholder="Staff Reading A2"
                value={formData.staffReadingA2}
                onChange={(e) => setFormData({ ...formData, staffReadingA2: e.target.value })}
                required
              />
            </div>

            <div className="calibrate-field">
              <label>Staff Reading B1</label>
              <input
                type="text"
                placeholder="Staff Reading B1"
                value={formData.staffReadingB1}
                onChange={(e) => setFormData({ ...formData, staffReadingB1: e.target.value })}
                required
              />
            </div>

            <div className="calibrate-field">
              <label>Staff Reading B2</label>
              <input
                type="text"
                placeholder="Staff Reading B2"
                value={formData.staffReadingB2}
                onChange={(e) => setFormData({ ...formData, staffReadingB2: e.target.value })}
                required
              />
            </div>

            <div className="calibrate-field">
              <label>Distance Peg A-B</label>
              <input
                type="text"
                placeholder="Distance Peg A-B"
                value={formData.distancePegAB}
                onChange={(e) => setFormData({ ...formData, distancePegAB: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="calibrate-actions">
            <button type="button" className="calibrate-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="calibrate-btn-calculate">
              Upload
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CalibrateModal;
