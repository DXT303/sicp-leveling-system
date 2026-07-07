import React from 'react';
import './LogoutModal.css';

interface MarkCompleteModalProps {
  isOpen: boolean;
  projectName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const MarkCompleteModal: React.FC<MarkCompleteModalProps> = ({ isOpen, projectName, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay" onClick={onClose}>
      <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-icon">✅</div>
        <h2 className="logout-modal-title">Mark as Complete?</h2>
        <p className="logout-modal-message">Are you sure you want to mark "{projectName}" as completed?</p>
        <div className="logout-modal-actions">
          <button className="logout-modal-btn cancel" onClick={onClose}>Cancel</button>
          <button className="logout-modal-btn confirm" onClick={onConfirm}>Complete</button>
        </div>
      </div>
    </div>
  );
};

export default MarkCompleteModal;
