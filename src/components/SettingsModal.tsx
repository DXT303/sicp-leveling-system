import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const userName = sessionStorage.getItem('userName') || '';
  const userEmail = sessionStorage.getItem('userEmail') || '';

  const [name, setName] = useState(userName);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Clear password fields every time modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowNew(false);
      setShowConfirm(false);
      setName(sessionStorage.getItem('userName') || '');
    }
  }, [isOpen]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!name.trim()) return showToast('error', 'Name cannot be empty.');
    if (newPassword && newPassword.length < 6) return showToast('error', 'New password must be at least 6 characters.');
    if (newPassword && newPassword !== confirmPassword) return showToast('error', 'Passwords do not match.');
    if (newPassword && !currentPassword) return showToast('error', 'Enter your current password to change it.');

    setSaving(true);
    try {
      const res = await fetch('/api/auth/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          name: name.trim(),
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) return showToast('error', data.message || 'Update failed.');
      sessionStorage.setItem('userName', name.trim());
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('success', 'Settings updated successfully!');
      setTimeout(onClose, 1500);
    } catch {
      showToast('error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="settings-overlay" onMouseDown={onClose}>
      <div className="settings-modal" onMouseDown={e => e.stopPropagation()}>

        <div className="settings-header">
          <h2 className="settings-title">⚙️ Settings</h2>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-body">

          {/* Profile */}
          <div className="settings-section">
            <p className="settings-section-label">Profile</p>
            <div className="settings-field">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="settings-field">
              <label>Email</label>
              <input type="email" value={userEmail} disabled className="settings-disabled" />
            </div>
          </div>

          {/* Change Password */}
          <div className="settings-section">
            <p className="settings-section-label">Change Password</p>
            <div className="settings-field">
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                autoComplete="off"
              />
            </div>
            <div className="settings-field">
              <label>New Password</label>
              <div className="settings-input-wrap">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <button type="button" className="settings-eye" onClick={() => setShowNew(p => !p)}>
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="settings-field">
              <label>Confirm New Password</label>
              <div className="settings-input-wrap">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
                <button type="button" className="settings-eye" onClick={() => setShowConfirm(p => !p)}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </div>

        </div>

        {toast && (
          <div className={`settings-toast settings-toast--${toast.type}`}>{toast.msg}</div>
        )}

        <div className="settings-footer">
          <button className="settings-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="settings-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default SettingsModal;
