import React from 'react';
import { ActivityLog, dotColor } from './useActivityLogs';

interface Props {
  log: ActivityLog;
  onClose: () => void;
}

const ActivityLogDetailModal: React.FC<Props> = ({ log, onClose }) => {
  let changes: Record<string, { from: unknown; to: unknown }> | null = null;
  try {
    if (log.details) changes = JSON.parse(log.details);
  } catch (_) {}

  return (
    <div className="new-project-overlay" onClick={onClose}>
      <div className="new-project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="new-project-header">
          <h2>Activity Detail</h2>
          <button className="new-project-close" onClick={onClose}>×</button>
        </div>

        <div className="new-project-field">
          <label>Event</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor(log.type), flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>{log.message}</span>
          </div>
        </div>

        <div className="new-project-field">
          <label>Category</label>
          <p style={{ margin: 0, padding: '10px 0', fontSize: 13, color: '#9197B3' }}>{log.sub ?? log.type}</p>
        </div>

        <div className="new-project-field">
          <label>Timestamp</label>
          <p style={{ margin: 0, padding: '10px 0', fontSize: 13, color: '#9197B3' }}>{log.created_at}</p>
        </div>

        {changes && Object.keys(changes).length > 0 && (
          <div className="new-project-field">
            <label>Changes Made</label>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(changes).map(([field, { from, to }]) => (
                <div key={field} style={{ background: '#F8F8FB', borderRadius: 10, padding: '10px 14px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: '#9197B3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ color: '#FF383C', background: '#FFE5E5', padding: '2px 8px', borderRadius: 6 }}>{String(from) || '—'}</span>
                    <span style={{ color: '#9197B3' }}>→</span>
                    <span style={{ color: '#14AE5C', background: '#E5F9EE', padding: '2px 8px', borderRadius: 6 }}>{String(to) || '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="new-project-actions">
          <button type="button" className="new-project-btn-create" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogDetailModal;
