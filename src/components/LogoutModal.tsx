import React from 'react';
import './LogoutModal.css';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay" onClick={onClose}>
      <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-icon">🚪</div>
        <h2 className="logout-modal-title">Log Out?</h2>
        <p className="logout-modal-message">Are you sure you want to log out?</p>
        <div className="logout-modal-actions">
          <button className="logout-modal-btn cancel" onClick={onClose}>Cancel</button>
          <button className="logout-modal-btn confirm" onClick={onConfirm}>Log Out</button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
