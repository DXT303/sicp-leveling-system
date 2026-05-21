import React from "react";
import { Project } from "./useProjects";

interface Props {
  project: Project;
  onClose: () => void;
  onEdit: () => void;
}

const statusColor: Record<string, string> = {
  active: "#FF8D28",
  completed: "#34C759",
  pending: "#FFCC00",
};

const ProjectDetailModal: React.FC<Props> = ({ project, onClose, onEdit }) => (
  <div className="new-project-overlay" onClick={onClose}>
    <div className="new-project-modal" onClick={(e) => e.stopPropagation()}>
      <div className="new-project-header">
        <h2>Project Details</h2>
        <button className="new-project-close" onClick={onClose}>×</button>
      </div>

      <div className="new-project-field">
        <label>Project Name</label>
        <p style={{ margin: 0, padding: "10px 0", fontWeight: 600 }}>{project.name}</p>
      </div>
      <div className="new-project-field">
        <label>Instrument</label>
        <p style={{ margin: 0, padding: "10px 0" }}>{project.instrument}</p>
      </div>
      <div className="new-project-field">
        <label>BM Elevation</label>
        <p style={{ margin: 0, padding: "10px 0" }}>{project.bmElevation} m</p>
      </div>
      <div className="new-project-field">
        <label>Method</label>
        <p style={{ margin: 0, padding: "10px 0" }}>{project.method}</p>
      </div>
      <div className="new-project-field">
        <label>Distance K</label>
        <p style={{ margin: 0, padding: "10px 0" }}>{project.distanceK} km</p>
      </div>
      <div className="new-project-field">
        <label>Status</label>
        <span
          className="pl-status"
          style={{ background: statusColor[project.status] + "22", color: statusColor[project.status] }}
        >
          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        </span>
      </div>
      <div className="new-project-field">
        <label>Created</label>
        <p style={{ margin: 0, padding: "10px 0" }}>{project.createdAt}</p>
      </div>

      <div className="new-project-actions">
        <button type="button" className="new-project-btn-cancel" onClick={onClose}>Close</button>
        <button type="button" className="new-project-btn-create" onClick={onEdit}>Edit</button>
      </div>
    </div>
  </div>
);

export default ProjectDetailModal;
