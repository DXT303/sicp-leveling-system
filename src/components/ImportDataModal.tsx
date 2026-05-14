import React, { useState, useRef, useEffect } from 'react';
import './ImportDataModal.css';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportDataModal: React.FC<ImportDataModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState('Select Type File');
  const [isDragging, setIsDragging] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile && fileType !== 'Select Type File') {
      console.log('Uploading:', selectedFile, 'Type:', fileType);
      onClose();
    }
  };

  return (
    <div className="import-data-overlay" onClick={onClose}>
      <div className="import-data-modal" onClick={(e) => e.stopPropagation()}>
        <div className="import-data-header">
          <h2>Import Data</h2>
        </div>

        <div
          className={`import-data-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="import-data-icon">📁</div>
          <p className="import-data-text">Click or Drag to Upload file</p>
          <p className="import-data-subtext">
            Supported formats: PDF, JPY, PNG, DOCX<br />
            Maximum file size: 10MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.docx"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {selectedFile && (
          <div className="import-data-filename">
            <span>Selected: {selectedFile.name}</span>
            <button 
              className="import-data-clear-file"
              onClick={() => setSelectedFile(null)}
            >
              ×
            </button>
          </div>
        )}

        <div className="import-data-field" ref={dropdownRef}>
          <label>File type</label>
          <div className="custom-dropdown">
            <div
              className="custom-dropdown-selected"
              onClick={() => setOpenDropdown(!openDropdown)}
            >
              {fileType}
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1L6 6L11 1" stroke="#9197B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {openDropdown && (
              <div className="custom-dropdown-options">
                {['Field Notes', 'Survey Data', 'Calibration Report', 'Project Document'].map(option => (
                  <div
                    key={option}
                    className={`custom-dropdown-option ${fileType === option ? 'selected' : ''}`}
                    onClick={() => {
                      setFileType(option);
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

        <div className="import-data-actions">
          <button className="import-data-btn-upload" onClick={handleUpload}>
            Upload
          </button>
          <button className="import-data-btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportDataModal;
