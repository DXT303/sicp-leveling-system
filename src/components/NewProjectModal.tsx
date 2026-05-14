import React, { useState, useRef, useEffect } from 'react';
import './NewProjectModal.css';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    instrument: 'Auto Level',
    bmElevation: '',
    method: 'Hi Method (Height of Instrument)',
    distanceK: '',
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
    console.log('New project:', formData);
    onClose();
  };

  return (
    <div className="new-project-overlay" onClick={onClose}>
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

          <div className="new-project-field">
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
            <button type="submit" className="new-project-btn-create">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
