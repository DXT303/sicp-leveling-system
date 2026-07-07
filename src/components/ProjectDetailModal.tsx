import React, { useState, useEffect } from 'react';
import { Project } from './useProjects';
import DataInputModal from './DataInputModal';
import ComputationModal from './ComputationModal';
import CalibrationModal from './CalibrationModal';
import ReportModal from './ReportModal';

interface Props {
  project: Project;
  onClose: () => void;
  onEdit: () => void;
  onProgressUpdate?: (progress: number, status: Project['status']) => void;
}

const statusColor: Record<string, string> = {
  active: '#FF8D28',
  completed: '#34C759',
  pending: '#FFCC00',
};

const STEPS = [
  { label: 'Data Input',  pct: 25,  desc: 'Enter leveling observations (BS, FS, IFS)' },
  { label: 'Calibration', pct: 50,  desc: 'Two-peg calibration test' },
  { label: 'Computation', pct: 75,  desc: 'Run differential leveling & closure check' },
  { label: 'Report',      pct: 100, desc: 'Generate and export the final report' },
];

const ProjectDetailModal: React.FC<Props> = ({ project, onClose, onEdit, onProgressUpdate }) => {
  const [progress, setProgress] = useState(project.progress ?? 0);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDisplayProgress(progress), 80);
    return () => clearTimeout(t);
  }, [progress]);

  const currentStep = STEPS.findIndex(s => s.pct > progress);
  const activeIdx   = currentStep === -1 ? STEPS.length - 1 : currentStep;

  const handleStepSaved = (newProgress: number) => {
    setProgress(newProgress);
    sessionStorage.setItem('activeProjectProgress', String(newProgress));
    setActiveStep(null);
    const newStatus = newProgress >= 100 ? 'completed' : newProgress > 0 ? 'active' : 'pending';
    onProgressUpdate?.(newProgress, newStatus as Project['status']);
  };

  const openStep = (idx: number) => {
    sessionStorage.setItem('activeProjectId', String(project.id));
    sessionStorage.setItem('activeProjectProgress', String(progress));
    setActiveStep(idx);
  };

  return (
    <>
      <div className="new-project-overlay" onClick={onClose}>
        <div className="new-project-modal pdm-modal" onClick={e => e.stopPropagation()}>
          <div className="new-project-header">
            <h2>Project Details</h2>
            <button className="new-project-close" onClick={onClose}>×</button>
          </div>

          {/* Info */}
          <div className="pdm-info-row">
            <div className="pdm-info-item"><span className="pdm-info-label">Name</span><span className="pdm-info-value">{project.name}</span></div>
            <div className="pdm-info-item"><span className="pdm-info-label">Instrument</span><span className="pdm-info-value">{project.instrument}</span></div>
            <div className="pdm-info-item"><span className="pdm-info-label">BM Elev.</span><span className="pdm-info-value">{project.bm_elevation} m</span></div>
            <div className="pdm-info-item"><span className="pdm-info-label">Method</span><span className="pdm-info-value">{project.method}</span></div>
            <div className="pdm-info-item"><span className="pdm-info-label">Distance K</span><span className="pdm-info-value">{project.distance_k} km</span></div>
            <div className="pdm-info-item">
              <span className="pdm-info-label">Status</span>
              <span className="pl-status" style={{ background: statusColor[project.status] + '22', color: statusColor[project.status] }}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="pdm-progress-section">
            <div className="pdm-progress-header">
              <span className="pdm-progress-label">Overall Progress</span>
              <span className="pdm-progress-pct">{progress}%</span>
            </div>
            <div className="pdm-progress-track">
              <div className="pdm-progress-fill pdm-progress-fill--animated" style={{ width: `${displayProgress}%` }} />
            </div>
          </div>

          {/* Steps */}
          <div className="pdm-steps">
            {STEPS.map((step, idx) => {
              const done   = progress >= step.pct;
              const active = idx === activeIdx;
              return (
                <div key={step.label} className={`pdm-step ${done ? 'pdm-step-done' : active ? 'pdm-step-active' : ''}`}>
                  <div className="pdm-step-circle">{done ? '✓' : idx + 1}</div>
                  <div className="pdm-step-body">
                    <span className="pdm-step-label">{step.label}</span>
                    <span className="pdm-step-desc">{step.desc}</span>
                  </div>
                  <button
                    className={`pdm-step-btn ${done ? 'pdm-step-btn-done' : active ? 'pdm-step-btn-active' : 'pdm-step-btn-locked'}`}
                    onClick={() => openStep(idx)}
                    disabled={idx > activeIdx}
                  >
                    {done ? 'Review' : active ? 'Start →' : 'Locked'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="new-project-actions">
            <button type="button" className="new-project-btn-cancel" onClick={onClose}>Close</button>
            <button type="button" className="new-project-btn-create" onClick={onEdit}>Edit</button>
          </div>
        </div>
      </div>

      {/* Step modals rendered on top */}
      {activeStep === 0 && (
        <DataInputModal projectId={project.id} onClose={() => setActiveStep(null)} onSaved={handleStepSaved} />
      )}
        {activeStep === 1 && (
        <CalibrationModal projectId={project.id} onClose={() => setActiveStep(null)} onSaved={handleStepSaved} />
      )}
      {activeStep === 2 && (
        <ComputationModal projectId={project.id} onClose={() => setActiveStep(null)} onConfirmed={handleStepSaved} />
      )}
      {activeStep === 3 && (
        <ReportModal project={project} onClose={() => setActiveStep(null)} onMarkedComplete={handleStepSaved} />
      )}
    </>
  );
};

export default ProjectDetailModal;
