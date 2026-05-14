import React, { useState, useRef, useEffect } from 'react';
import './ExportDataModal.css';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportDataModal: React.FC<ExportDataModalProps> = ({ isOpen, onClose }) => {
  const [project, setProject] = useState('Survey A - Sector 4');
  const [exportContent, setExportContent] = useState<string[]>(['Elevation table', 'Closure error summary']);
  const [exportFormat, setExportFormat] = useState('PDF');
  const [fileName, setFileName] = useState('Survey_A_Sector4_Export');
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const toggleContent = (content: string) => {
    setExportContent(prev =>
      prev.includes(content)
        ? prev.filter(c => c !== content)
        : [...prev, content]
    );
  };

  const handleExport = () => {
    console.log('Exporting:', { project, exportContent, exportFormat, fileName });
    onClose();
  };

  const contentOptions = [
    'Elevation table (BS, FS, HI, Rise/Fall, RL/Inv',
    'Closure error summary',
    'Graphical elevation profile',
    'Collimation records',
    'Activity logs'
  ];

  return (
    <div className="export-data-overlay" onClick={onClose}>
      <div className="export-data-modal" onClick={(e) => e.stopPropagation()}>
        <div className="export-data-header">
          <h2>Export data</h2>
          <button className="export-data-close" onClick={onClose}>×</button>
        </div>

        <div className="export-data-content">
          <div className="export-data-field" ref={dropdownRef}>
            <label>Project</label>
            <div className="custom-dropdown">
              <div
                className="custom-dropdown-selected"
                onClick={() => setOpenDropdown(!openDropdown)}
              >
                {project}
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="#9197B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {openDropdown && (
                <div className="custom-dropdown-options">
                  {['Survey A - Sector 4', 'Calibration Unit 7', 'Two-Peg Test — Unit 3'].map(option => (
                    <div
                      key={option}
                      className={`custom-dropdown-option ${project === option ? 'selected' : ''}`}
                      onClick={() => {
                        setProject(option);
                        setOpenDropdown(false);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="export-data-section">
            <label>Export Content</label>
            <div className="export-data-checkboxes">
              {contentOptions.map(option => (
                <label key={option} className="export-data-checkbox-label">
                  <input
                    type="checkbox"
                    checked={exportContent.includes(option)}
                    onChange={() => toggleContent(option)}
                    className="export-data-checkbox"
                  />
                  <span className="export-data-checkbox-text">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="export-data-section">
            <label>Export Format</label>
            <div className="export-data-formats">
              {['PDF', 'EXCEL', 'CSV', 'TXT'].map(format => (
                <button
                  key={format}
                  type="button"
                  className={`export-data-format-btn ${exportFormat === format ? 'active' : ''}`}
                  onClick={() => setExportFormat(format)}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          <div className="export-data-field">
            <label>File Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>

          <div className="export-data-summary">
            <h3>Export Summary</h3>
            <div className="export-data-summary-row">
              <span>Selected content</span>
              <span>{exportContent.length} items</span>
            </div>
            <div className="export-data-summary-row">
              <span>Format</span>
              <span>{exportFormat}</span>
            </div>
            <div className="export-data-summary-row">
              <span>File size</span>
              <span>2 KB</span>
            </div>
          </div>

          <div className="export-data-actions">
            <button type="button" className="export-data-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="export-data-btn-export" onClick={handleExport}>
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDataModal;
