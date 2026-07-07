import React, { useState, useRef, useEffect } from 'react';
import './ExportDataModal.css';
import { useProjects } from './useProjects';
import { updateProjectProgress } from './useProjectProgress';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportDataModal: React.FC<ExportDataModalProps> = ({ isOpen, onClose }) => {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [exportContent, setExportContent] = useState<string[]>(['Elevation table', 'Closure error summary']);
  const [exportFormat, setExportFormat] = useState('PDF');
  const [fileName, setFileName] = useState('');
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Set first project as default when modal opens
  useEffect(() => {
    if (isOpen && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
      setFileName(`${projects[0].name.replace(/\s+/g, '_')}_Export`);
    }
  }, [isOpen, projects, selectedProjectId]);

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

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const toggleContent = (content: string) => {
    setExportContent(prev =>
      prev.includes(content)
        ? prev.filter(c => c !== content)
        : [...prev, content]
    );
  };

  const handleProjectChange = (projectId: number) => {
    setSelectedProjectId(projectId);
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setFileName(`${project.name.replace(/\s+/g, '_')}_Export`);
    }
    setOpenDropdown(false);
  };

  const handleExport = async () => {
    if (!selectedProjectId) return;
    
    try {
      // Get project data from already loaded projects
      const projectData = projects.find(p => p.id === selectedProjectId);
      if (!projectData) {
        alert('Project not found.');
        return;
      }
      
      // Fetch leveling rows
      const rowsRes = await fetch(`/api/projects/${selectedProjectId}/rows`);
      const rowsData = await rowsRes.json();
      
      // Generate export content based on format
      let content = '';
      let mimeType = '';
      let fileExtension = '';
      
      if (exportFormat === 'CSV') {
        // CSV format
        content = 'Station,BS,IS,FS,HI,Rise,Fall,RL\n';
        rowsData.forEach((row: any) => {
          content += `${row.station || ''},${row.bs || ''},${row.is_val || ''},${row.fs || ''},${row.hi || ''},${row.rise || ''},${row.fall || ''},${row.rl || ''}\n`;
        });
        mimeType = 'text/csv';
        fileExtension = 'csv';
      } else if (exportFormat === 'TXT') {
        // TXT format
        content = `Project: ${projectData.name}\n`;
        content += `Instrument: ${projectData.instrument}\n`;
        content += `Method: ${projectData.method}\n`;
        content += `BM Elevation: ${projectData.bm_elevation}\n`;
        content += `Distance (k): ${projectData.distance_k} km\n\n`;
        content += 'Station\tBS\tIS\tFS\tHI\tRise\tFall\tRL\n';
        content += '='.repeat(80) + '\n';
        rowsData.forEach((row: any) => {
          content += `${row.station || ''}\t${row.bs || ''}\t${row.is_val || ''}\t${row.fs || ''}\t${row.hi || ''}\t${row.rise || ''}\t${row.fall || ''}\t${row.rl || ''}\n`;
        });
        mimeType = 'text/plain';
        fileExtension = 'txt';
      } else if (exportFormat === 'PDF') {
        // PDF format - Generate HTML and use print to PDF
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>${projectData.name} - Export</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1 { color: #FF8D28; border-bottom: 3px solid #FF8D28; padding-bottom: 10px; }
              .info { margin: 20px 0; }
              .info-item { margin: 5px 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background: #FF8D28; color: white; padding: 10px; text-align: left; }
              td { border: 1px solid #ddd; padding: 8px; }
              tr:nth-child(even) { background: #f9f9f9; }
              .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <h1>${projectData.name}</h1>
            <div class="info">
              <div class="info-item"><strong>Instrument:</strong> ${projectData.instrument}</div>
              <div class="info-item"><strong>Method:</strong> ${projectData.method}</div>
              <div class="info-item"><strong>BM Elevation:</strong> ${projectData.bm_elevation} m</div>
              <div class="info-item"><strong>Distance:</strong> ${projectData.distance_k} km</div>
              <div class="info-item"><strong>Created:</strong> ${projectData.created_at}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Station</th><th>BS</th><th>IS</th><th>FS</th><th>HI</th><th>Rise</th><th>Fall</th><th>RL</th>
                </tr>
              </thead>
              <tbody>
                ${rowsData.map((row: any) => `
                  <tr>
                    <td>${row.station || '-'}</td>
                    <td>${row.bs || '-'}</td>
                    <td>${row.is_val || '-'}</td>
                    <td>${row.fs || '-'}</td>
                    <td>${row.hi || '-'}</td>
                    <td>${row.rise || '-'}</td>
                    <td>${row.fall || '-'}</td>
                    <td>${row.rl || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">
              <p>Generated on ${new Date().toLocaleString()}</p>
              <p>Survey Leveling System V1.1 © 2026</p>
            </div>
          </body>
          </html>
        `;
        
        // Open in new window and trigger print
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 500);
        }
        
        // Update progress after opening print dialog
        await fetch(`/api/projects/${selectedProjectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ progress: 100, status: 'completed' }),
        });
        
        onClose();
        window.location.reload();
        return;
      } else if (exportFormat === 'EXCEL') {
        const totalBS   = rowsData.reduce((s: number, r: any) => s + (Number(r.bs)     || 0), 0);
        const totalFS   = rowsData.reduce((s: number, r: any) => s + (Number(r.fs)     || 0), 0);
        const totalRise = rowsData.reduce((s: number, r: any) => s + (Number(r.rise)   || 0), 0);
        const totalFall = rowsData.reduce((s: number, r: any) => s + (Number(r.fall)   || 0), 0);

        const htmlTable = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>${projectData.name.substring(0, 31)}</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
  body { font-family: Arial, sans-serif; }
  h2 { color: #FF8D28; }
  table { border-collapse: collapse; width: 100%; margin-top: 16px; }
  th { background: #FF8D28; color: #fff; padding: 8px 12px; text-align: center; border: 1px solid #e0a060; }
  td { padding: 7px 12px; border: 1px solid #ddd; text-align: center; }
  tr:nth-child(even) td { background: #fff8f2; }
  .info-table td { border: none; text-align: left; padding: 3px 8px; }
  .info-table td:first-child { font-weight: bold; color: #555; width: 140px; }
  .totals td { font-weight: bold; background: #fff3e6; border-top: 2px solid #FF8D28; }
</style>
</head>
<body>
<h2>Survey Leveling Report — ${projectData.name}</h2>
<table class="info-table">
  <tr><td>Instrument:</td><td>${projectData.instrument}</td></tr>
  <tr><td>Method:</td><td>${projectData.method}</td></tr>
  <tr><td>BM Elevation:</td><td>${projectData.bm_elevation} m</td></tr>
  <tr><td>Distance K:</td><td>${projectData.distance_k} km</td></tr>
  <tr><td>Created:</td><td>${projectData.created_at}</td></tr>
  <tr><td>Exported:</td><td>${new Date().toLocaleString()}</td></tr>
</table>
<table>
  <thead>
    <tr><th>Station</th><th>BS (m)</th><th>IS (m)</th><th>FS (m)</th><th>HI (m)</th><th>Rise (m)</th><th>Fall (m)</th><th>RL (m)</th></tr>
  </thead>
  <tbody>
    ${rowsData.map((row: any) => `<tr>
      <td>${row.station || '-'}</td>
      <td>${row.bs     != null && row.bs     !== '' ? Number(row.bs).toFixed(3)     : '-'}</td>
      <td>${row.is_val != null && row.is_val !== '' ? Number(row.is_val).toFixed(3) : '-'}</td>
      <td>${row.fs     != null && row.fs     !== '' ? Number(row.fs).toFixed(3)     : '-'}</td>
      <td>${row.hi     != null && row.hi     !== '' ? Number(row.hi).toFixed(3)     : '-'}</td>
      <td>${row.rise   != null && row.rise   !== '' ? Number(row.rise).toFixed(3)   : '-'}</td>
      <td>${row.fall   != null && row.fall   !== '' ? Number(row.fall).toFixed(3)   : '-'}</td>
      <td>${row.rl     != null && row.rl     !== '' ? Number(row.rl).toFixed(3)     : '-'}</td>
    </tr>`).join('')}
    <tr class="totals">
      <td>TOTALS</td>
      <td>${totalBS.toFixed(3)}</td><td>-</td><td>${totalFS.toFixed(3)}</td><td>-</td>
      <td>${totalRise.toFixed(3)}</td><td>${totalFall.toFixed(3)}</td><td>-</td>
    </tr>
  </tbody>
</table>
<p style="margin-top:24px;color:#888;font-size:12px;">Survey Leveling System V1.1 © 2026</p>
</body></html>`;

        const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        await fetch(`/api/projects/${selectedProjectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ progress: 100, status: 'completed' }),
        });
        onClose();
        window.location.reload();
        return;
      }
      
      // Create and download file (for CSV and TXT)
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Update project progress to 100% after successful export
      await fetch(`/api/projects/${selectedProjectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: 100, status: 'completed' }),
      });
      
      onClose();
      // Refresh page to show updated progress
      window.location.reload();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
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
                {selectedProject ? selectedProject.name : 'Select a project'}
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="#9197B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {openDropdown && (
                <div className="custom-dropdown-options">
                  {projects.length === 0 ? (
                    <div className="custom-dropdown-option" style={{ color: '#9197B3', cursor: 'default' }}>
                      No projects available
                    </div>
                  ) : (
                    projects.map(proj => (
                      <div
                        key={proj.id}
                        className={`custom-dropdown-option ${selectedProjectId === proj.id ? 'selected' : ''}`}
                        onClick={() => handleProjectChange(proj.id)}
                      >
                        {proj.name} ({proj.progress}%)
                      </div>
                    ))
                  )}
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
            <button 
              type="button" 
              className="export-data-btn-export" 
              onClick={handleExport}
              disabled={!selectedProjectId || projects.length === 0}
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDataModal;
