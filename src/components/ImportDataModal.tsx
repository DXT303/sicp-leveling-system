import React, { useState, useRef } from 'react';
import './ImportDataModal.css';
import { useProjects } from './useProjects';
import { postLog } from './useActivityLogs';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportDataModal: React.FC<ImportDataModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addProject, projects } = useProjects();
  const userName = sessionStorage.getItem('userName') || 'User';

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
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please select a CSV file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    // Find project info section
    let projectInfo: any = {};
    let dataStartIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      if (line.includes('project name')) {
        projectInfo.name = lines[i].split(',')[1]?.trim() || '';
      } else if (line.includes('instrument')) {
        projectInfo.instrument = lines[i].split(',')[1]?.trim() || '';
      } else if (line.includes('bm elevation')) {
        projectInfo.bmElevation = lines[i].split(',')[1]?.trim() || '';
      } else if (line.includes('method')) {
        projectInfo.method = lines[i].split(',')[1]?.trim() || '';
      } else if (line.includes('distance k')) {
        projectInfo.distanceK = lines[i].split(',')[1]?.trim() || '';
      } else if (line.includes('station')) {
        // Found observation headers
        dataStartIndex = i;
        break;
      }
    }
    
    // Validate project info
    if (!projectInfo.name || !projectInfo.instrument || !projectInfo.bmElevation) {
      throw new Error('Missing required project information (Project Name, Instrument, BM Elevation)');
    }
    
    // Parse observation data
    const headers = lines[dataStartIndex].split(',').map(h => h.trim().toLowerCase());
    const observations = [];
    
    for (let i = dataStartIndex + 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= headers.length && values[0].trim()) {
        const row: any = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx]?.trim() || '';
        });
        observations.push(row);
      }
    }
    
    return { projectInfo, observations };
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const text = await selectedFile.text();
      const { projectInfo, observations } = parseCSV(text);
      
      // Check if project name already exists
      if (projects.some(p => p.name.toLowerCase() === projectInfo.name.toLowerCase())) {
        setError(`Project "${projectInfo.name}" already exists. Please use a different name.`);
        setUploading(false);
        return;
      }
      
      // Create project
      const newProject = await addProject({
        name: projectInfo.name,
        instrument: projectInfo.instrument,
        bmElevation: projectInfo.bmElevation,
        method: projectInfo.method || 'Rise & Fall',
        distanceK: projectInfo.distanceK || '0',
      });

      // Import observations if any
      if (observations.length > 0) {
        const obs = observations.map(row => ({
          project_id: newProject.id,
          station: row.station || '',
          bs: row.bs || null,
          is: row.is || null,
          fs: row.fs || null,
          hi: row.hi || null,
          rise: row.rise || null,
          fall: row.fall || null,
          rl: row.rl || null,
        }));

        await fetch('/api/observations/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: newProject.id, observations: obs }),
        });
      }

      await postLog('success', `Project "${projectInfo.name}" created and data imported by ${userName}`, 'Data imported');
      
      setUploading(false);
      setSelectedFile(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import data. Please check file format.');
      setUploading(false);
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
          <p className="import-data-text">Click or Drag to Upload CSV file</p>
          <p className="import-data-subtext">
            Upload filled template with project info and observations<br />
            The system will automatically create the project and import data
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
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

        {error && (
          <div style={{ color: '#FF383C', fontSize: '13px', marginTop: '8px', padding: '12px', background: '#FFF5F5', borderRadius: '8px', border: '1px solid #FFE5E5' }}>
            {error}
          </div>
        )}

        <div className="import-data-actions">
          <button 
            className="import-data-btn-upload" 
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Importing...' : 'Import'}
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
