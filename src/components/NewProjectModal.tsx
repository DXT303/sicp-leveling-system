import React, { useState, useRef, useEffect } from 'react';
import './NewProjectModal.css';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { projectName: string; instrument: string; bmElevation: string; method: string; distanceK: string }) => Promise<void> | void;
  existingNames: string[];
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onSave, existingNames }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    instrument: 'Auto Level',
    bmElevation: '',
    method: 'Hi Method (Height of Instrument)',
    distanceK: '',
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const methodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(prev => prev === 'instrument' ? null : prev);
      }
      if (methodRef.current && !methodRef.current.contains(event.target as Node)) {
        setOpenDropdown(prev => prev === 'method' ? null : prev);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const isDuplicate = existingNames.some(
      (n) => n.toLowerCase() === formData.projectName.trim().toLowerCase()
    );
    if (isDuplicate) {
      setToast({ type: 'error', msg: 'A project with this name already exists.' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setSaving(true);
    try {
      await onSave(formData);
      setFormData({ projectName: '', instrument: 'Auto Level', bmElevation: '', method: 'Hi Method (Height of Instrument)', distanceK: '' });
      setToast({ type: 'success', msg: 'Project created successfully!' });
      setTimeout(() => { setToast(null); onClose(); }, 1500);
    } catch {
      setToast({ type: 'error', msg: 'Failed to create project. Please try again.' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen && !toast) return null;

  return (
    <>
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
              {toast.type === 'success' ? 'Success!' : 'Failed!'}
            </h2>
            <p className="ep-notif-message">{toast.msg}</p>
          </div>
        </div>
      )}
      <div className="new-project-overlay" onClick={toast ? undefined : onClose}>
      <div className="new-project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="new-project-header">
          <h2>Create New Project</h2>
          <button className="new-project-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="new-project-field">
            <label>Project Name</label>
            <input
              type="text"
              placeholder="Project Name"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              required
            />
          </div>

          <div className="new-project-field" ref={dropdownRef}>
            <label>Instrument</label>
            <div className="custom-dropdown">
              <div 
                className="custom-dropdown-selected"
                onClick={() => setOpenDropdown(openDropdown === 'instrument' ? null : 'instrument')}
              >
                {formData.instrument}
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="#9197B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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

          <div className="new-project-field">
            <label>BM Elevation</label>
            <input
              type="text"
              placeholder="BM Elevation"
              value={formData.bmElevation}
              onChange={(e) => setFormData({ ...formData, bmElevation: e.target.value })}
              required
            />
          </div>

          <div className="new-project-field" ref={methodRef}>
            <label>Method</label>
            <div className="custom-dropdown">
              <div 
                className="custom-dropdown-selected"
                onClick={() => setOpenDropdown(openDropdown === 'method' ? null : 'method')}
              >
                {formData.method}
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="#9197B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {openDropdown === 'method' && (
                <div className="custom-dropdown-options">
                  {['Hi Method (Height of Instrument)', 'Rise and Fall Method'].map(option => (
                    <div
                      key={option}
                      className={`custom-dropdown-option ${formData.method === option ? 'selected' : ''}`}
                      onClick={() => {
                        setFormData({ ...formData, method: option });
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

          <div className="new-project-field">
            <label>Distance K</label>
            <input
              type="text"
              placeholder="Distance K"
              value={formData.distanceK}
              onChange={(e) => setFormData({ ...formData, distanceK: e.target.value })}
              required
            />
          </div>

          <div className="new-project-actions">
            <button type="button" className="new-project-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="new-project-btn-create" disabled={saving}>
              {saving ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </>
  );
};

export default NewProjectModal;
