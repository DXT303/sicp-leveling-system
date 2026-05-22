import React, { useState, useRef, useEffect } from "react";
import "./NewProjectModal.css";
import { Project } from "./useProjects";

interface Props {
  project: Project;
  onClose: () => void;
  onSave: (data: Partial<Omit<Project, "id" | "created_at">>) => void;
}

const EditProjectModal: React.FC<Props> = ({ project, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: project.name,
    instrument: project.instrument,
    bm_elevation: project.bm_elevation,
    method: project.method,
    distance_k: project.distance_k,
    status: project.status,
  });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onSave(form);
      showToast("success", "Project updated successfully!");
      setTimeout(onClose, 3000);
    } catch {
      showToast("error", "Failed to update project. Please try again.");
    }
  };

  const Dropdown = ({ field, options }: { field: "instrument" | "method" | "status"; options: string[] }) => (
    <div className="custom-dropdown">
      <div className="custom-dropdown-selected" onClick={() => setOpenDropdown(openDropdown === field ? null : field)}>
        {form[field]}
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1L6 6L11 1" stroke="#9197B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {openDropdown === field && (
        <div className="custom-dropdown-options">
          {options.map((opt) => (
            <div
              key={opt}
              className={`custom-dropdown-option ${form[field] === opt ? "selected" : ""}`}
              onClick={() => { setForm({ ...form, [field]: opt }); setOpenDropdown(null); }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );

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
      <div className="new-project-modal" ref={containerRef} onClick={(e) => e.stopPropagation()}>
        <div className="new-project-header">
          <h2>Edit Project</h2>
          <button className="new-project-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="new-project-field">
            <label>Project Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="new-project-field">
            <label>Instrument</label>
            <Dropdown field="instrument" options={["Auto Level", "Digital Level", "Laser Level"]} />
          </div>
          <div className="new-project-field">
            <label>BM Elevation</label>
            <input type="text" value={form.bm_elevation} onChange={(e) => setForm({ ...form, bm_elevation: e.target.value })} required />
          </div>
          <div className="new-project-field">
            <label>Method</label>
            <Dropdown field="method" options={["Hi Method (Height of Instrument)", "Rise and Fall Method"]} />
          </div>
          <div className="new-project-field">
            <label>Distance K</label>
            <input type="text" value={form.distance_k} onChange={(e) => setForm({ ...form, distance_k: e.target.value })} required />
          </div>
          <div className="new-project-field">
            <label>Status</label>
            <Dropdown field="status" options={["active", "pending", "completed"]} />
          </div>

          <div className="new-project-actions">
            <button type="button" className="new-project-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="new-project-btn-create">Save Changes</button>
          </div>
        </form>
      </div>
      </div>
    </>
  );
};

export default EditProjectModal;
