import React from 'react';
import { createPortal } from 'react-dom';
import './AboutModal.css';
import { COPYRIGHT, APP_VERSION } from './version';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEATURES = [
  { f: 'User Authentication',   d: 'Secure login with bcrypt-hashed passwords and session management' },
  { f: 'Project Management',    d: 'Create, edit, delete, and track multiple survey projects' },
  { f: 'Data Input',            d: 'Manual entry or CSV import of leveling observations' },
  { f: 'Auto-Computation',      d: 'Automatic HI, RL, Rise, and Fall calculation' },
  { f: 'Closure Error Check',   d: 'Real-time misclose detection against 12mm√K tolerance' },
  { f: 'Two-Peg Calibration',   d: 'Automated collimation error calculation with ±3mm pass/fail' },
  { f: 'Progress Tracking',     d: 'Milestone-based progress (0% → 25% → 50% → 75% → 100%)' },
  { f: 'Recycle Bin',           d: 'Soft-delete with restore and permanent delete — no accidental data loss' },
  { f: 'Reports',               d: 'Unified view of leveling and calibration records' },
  { f: 'Data Export',           d: 'CSV, TXT, PDF, and Excel export formats' },
  { f: 'Activity Logs',         d: 'Full audit trail of all system actions with search and date filter' },
];

const WORKFLOW = [
  { step: '01', title: 'Data Input',   desc: 'Enter or import leveling observations. HI and ELEV are auto-calculated.',         progress: '25%' },
  { step: '02', title: 'Calibration',  desc: 'Two-Peg Test validates instrument accuracy against ±3mm tolerance.',               progress: '50%' },
  { step: '03', title: 'Computation',  desc: 'Rise & Fall method applied. 3-way arithmetic check and closure error analysis.',   progress: '75%' },
  { step: '04', title: 'Report',       desc: 'Review, export to CSV / TXT / PDF / Excel, and mark the survey as complete.',      progress: '100%' },
];

const PATCHES_V13 = [
  { id: '1', component: 'NewProjectModal', fix: 'Modal stuck on success overlay — toast state kept component alive after onClose. Fixed by clearing toast and closing together.' },
  { id: '2', component: 'ProjectListPage', fix: 'handleNewProjectSave was synchronous — modal resolved instantly without waiting for the API. Made async with await.' },
  { id: '3', component: 'useProjects', fix: 'addProject silently ignored API errors. Added res.ok check to throw and surface failures to the modal catch block.' },
  { id: '4', component: 'SettingsModal', fix: 'Current Password field had a show/hide eye toggle that could expose the typed password. Removed toggle and locked field to type="password" permanently.' },
];

const PATCHES_V14 = [
  { id: '1', component: 'vercel.json', fix: 'PATCH/DELETE on /api/projects/:id returned 405 — catch-all rewrite intercepted API routes. Fixed with negative lookahead rewrite /((?!api/).*) → /index.html.' },
  { id: '2', component: 'api/_db.js', fix: 'Migrations ran at runtime on every cold start. Moved to build time via vercel.json buildCommand.' },
  { id: '3', component: 'api/projects/[id]/restore.js', fix: 'Restore via PATCH returned 405 on Vercel dynamic routes. Created dedicated POST /api/projects/:id/restore endpoint.' },
  { id: '4', component: 'RecycleBinModal / DashboardPage', fix: 'Project list and logs did not update after restore without a page reload. Wired onProjectRestored callback through Sidebar → SettingsModal → RecycleBinModal to call refetch() + fetchLogs().' },
  { id: '5', component: 'RecycleBinModal.css / NewProjectModal.css', fix: 'Success modal rendered behind Recycle Bin overlay. Fixed z-index: ep-notif-overlay → 99999, rb-overlay → 9000.' },
  { id: '6', component: 'NewProjectModal', fix: 'Double-clicking create submitted multiple requests. Added saving state — button disabled and shows "Creating…" while request is in flight.' },
  { id: '7', component: 'ProjectListPage', fix: 'Delete action did not log the project name — state was cleared before postLog was called. Added deleteTargetName state to capture name before clearing.' },
];

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="about-overlay" onClick={onClose}>
      <div className="about-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="about-header">
          <div className="about-header-text">
            <h2 className="about-title">Survey Leveling System</h2>
            <span className="about-version">Version {APP_VERSION}</span>
          </div>
          <button className="about-close" onClick={onClose}>✕</button>
        </div>

        <div className="about-body">

          {/* Overview */}
          <section className="about-section">
            <h3 className="about-section-title">📋 System Overview</h3>
            <p className="about-text">
              The <strong>Survey Leveling System (SLS)</strong> is a full-stack web application developed as a
              thesis project to modernize the practice of differential leveling in civil engineering and geodetic
              surveying. It replaces manual field notebooks and hand computations with a structured digital
              workflow — from raw field observations through to a validated, exportable survey report.
            </p>
            <p className="about-text">
              Accessible through any modern web browser with no software installation required, making it
              practical for both office and field environments.
            </p>
          </section>

          {/* Purpose */}
          <section className="about-section">
            <h3 className="about-section-title">🎯 Purpose & Scope</h3>
            <p className="about-text">
              Purpose-built for <strong>differential leveling</strong> — a surveying technique used to determine
              elevation differences between two or more points. Covers the complete survey lifecycle:
            </p>
            <ul className="about-list">
              <li>Recording field observations (Back Sight, Fore Sight, Intermediate Sight)</li>
              <li>Automated computation of Height of Instrument (HI) and Reduced Levels (RL)</li>
              <li>Instrument calibration via the Two-Peg Test</li>
              <li>Closure error detection and validation against standard tolerances</li>
              <li>Report generation and multi-format data export</li>
            </ul>
          </section>

          {/* Features */}
          <section className="about-section">
            <h3 className="about-section-title">✨ Key Features</h3>
            <div className="about-features-grid">
              {FEATURES.map(({ f, d }) => (
                <div className="about-feature-card" key={f}>
                  <span className="about-feature-name">{f}</span>
                  <span className="about-feature-desc">{d}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Workflow */}
          <section className="about-section">
            <h3 className="about-section-title">🔄 Survey Workflow</h3>
            <div className="about-workflow">
              {WORKFLOW.map(({ step, title, desc, progress }) => (
                <div className="about-workflow-step" key={step}>
                  <div className="about-step-num">{step}</div>
                  <div className="about-step-info">
                    <div className="about-step-header">
                      <span className="about-step-title">{title}</span>
                      <span className="about-step-progress">{progress}</span>
                    </div>
                    <span className="about-step-desc">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Patch Notes v1.3 */}
          <section className="about-section">
            <h3 className="about-section-title">🔧 Patch Notes — v1.3</h3>
            <div className="about-patches">
              {PATCHES_V13.map(({ id, component, fix }) => (
                <div className="about-patch-item" key={id}>
                  <span className="about-patch-id">#{id}</span>
                  <div className="about-patch-info">
                    <span className="about-patch-component">{component}</span>
                    <span className="about-patch-fix">{fix}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Patch Notes v1.4 */}
          <section className="about-section">
            <h3 className="about-section-title">🚀 What's New — v1.4</h3>
            <div className="about-patches">
              {PATCHES_V14.map(({ id, component, fix }) => (
                <div className="about-patch-item" key={id}>
                  <span className="about-patch-id">#{id}</span>
                  <div className="about-patch-info">
                    <span className="about-patch-component">{component}</span>
                    <span className="about-patch-fix">{fix}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Dev Background */}
          <section className="about-section">
            <h3 className="about-section-title">🛠️ Development Background</h3>
            <div className="about-meta-grid">
              <div className="about-meta-item"><span className="about-meta-label">Project Type</span><span className="about-meta-value">Undergraduate Thesis / Capstone Project</span></div>
              <div className="about-meta-item"><span className="about-meta-label">Version</span><span className="about-meta-value">1.4</span></div>
              <div className="about-meta-item"><span className="about-meta-label">Development Period</span><span className="about-meta-value">2025 – 2026</span></div>
              <div className="about-meta-item"><span className="about-meta-label">Platform</span><span className="about-meta-value">Web — React 18 + TypeScript + Vite</span></div>
              <div className="about-meta-item"><span className="about-meta-label">Backend</span><span className="about-meta-value">Express.js + Node.js</span></div>
              <div className="about-meta-item"><span className="about-meta-label">Database</span><span className="about-meta-value">Turso (cloud-hosted libSQL)</span></div>
              <div className="about-meta-item"><span className="about-meta-label">Hosting</span><span className="about-meta-value">Vercel (serverless deployment)</span></div>
              <div className="about-meta-item"><span className="about-meta-label">Styling</span><span className="about-meta-value">Custom CSS + Poppins font</span></div>
            </div>
          </section>

        </div>

        <div className="about-footer">
          <span>{COPYRIGHT}</span>
          <button className="about-close-btn" onClick={onClose}>Close</button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default AboutModal;
