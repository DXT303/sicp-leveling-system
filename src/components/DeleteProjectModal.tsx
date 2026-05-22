import React from 'react';
import './LogoutModal.css';

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({ isOpen, onClose, onConfirm, projectName }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay" onClick={onClose}>
      <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-icon">🗑️</div>
        <h2 className="logout-modal-title">Delete Project?</h2>
        <p className="logout-modal-message">
          Are you sure you want to delete "<strong>{projectName}</strong>"? This action cannot be undone.
        </p>
        <div className="logout-modal-actions">
          <button className="logout-modal-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="logout-modal-btn confirm" onClick={onConfirm} style={{ background: '#FF383C' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProjectModal;
