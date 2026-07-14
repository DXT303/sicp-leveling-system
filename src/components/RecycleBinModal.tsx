import React, { useEffect, useState } from 'react';
import './RecycleBinModal.css';
import { Project } from './useProjects';
import { postLog } from './useActivityLogs';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fetchTrash: () => Promise<Project[]>;
  onRestore: (id: number) => Promise<void>;
  onPermanentDelete: (id: number) => Promise<void>;
}

const RecycleBinModal: React.FC<Props> = ({ isOpen, onClose, fetchTrash, onRestore, onPermanentDelete }) => {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchTrash().then(setItems).catch(console.error).finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRestore = async (id: number) => {
    const project = items.find(p => p.id === id);
    await onRestore(id);
    setItems(prev => prev.filter(p => p.id !== id));
    const userName = sessionStorage.getItem('userName') || 'User';
    await postLog('success', `Project "${project?.name}" restored by ${userName}`, 'Success / Project restored');
  };

  const handlePermanentDelete = async (id: number) => {
    await onPermanentDelete(id);
    setItems(prev => prev.filter(p => p.id !== id));
    setConfirmId(null);
  };

  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-modal" onClick={e => e.stopPropagation()}>
        <div className="rb-header">
          <span className="rb-icon">🗑️</span>
          <h2>Recycle Bin</h2>
          <button className="rb-close" onClick={onClose}>×</button>
        </div>
        <p className="rb-subtitle">Deleted projects can be restored or permanently removed.</p>

        {confirmId !== null && (
          <div className="rb-confirm">
            <p>Permanently delete this project? This <strong>cannot be undone</strong>.</p>
            <div className="rb-confirm-actions">
              <button className="rb-btn-cancel" onClick={() => setConfirmId(null)}>Cancel</button>
              <button className="rb-btn-perm" onClick={() => handlePermanentDelete(confirmId)}>Delete Forever</button>
            </div>
          </div>
        )}

        <div className="rb-list">
          {loading ? (
            <p className="rb-empty">Loading...</p>
          ) : items.length === 0 ? (
            <p className="rb-empty">Recycle bin is empty.</p>
          ) : (
            items.map(p => (
              <div className="rb-item" key={p.id}>
                <div className="rb-item-info">
                  <span className="rb-item-name">{p.name}</span>
                  <span className="rb-item-meta">{p.instrument} · {p.method} · deleted {p.deleted_at?.slice(0, 10)}</span>
                </div>
                <div className="rb-item-actions">
                  <button className="rb-btn-restore" onClick={() => handleRestore(p.id)}>Restore</button>
                  <button className="rb-btn-delete" onClick={() => setConfirmId(p.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecycleBinModal;
