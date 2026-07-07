import React, { useState } from 'react';
import { ActivityLog, dotColor } from './useActivityLogs';
import ActivityLogDetailModal from './ActivityLogDetailModal';

interface Props {
  logs: ActivityLog[];
  onClose: () => void;
}

const ActivityLogsModal: React.FC<Props> = ({ logs, onClose }) => {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const filtered = logs.filter(log => {
    const matchesSearch =
      !search ||
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      (log.sub ?? '').toLowerCase().includes(search.toLowerCase());

    const logDate = log.created_at.slice(0, 10);
    const matchesFrom = !dateFrom || logDate >= dateFrom;
    const matchesTo   = !dateTo   || logDate <= dateTo;

    return matchesSearch && matchesFrom && matchesTo;
  });

  return (
    <>
      <div className="new-project-overlay" onClick={onClose}>
        <div className="new-project-modal pdm-modal" style={{ maxWidth: 680, width: '95%' }} onClick={e => e.stopPropagation()}>
          <div className="new-project-header">
            <h2>Activity Logs</h2>
            <button className="new-project-close" onClick={onClose}>×</button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, padding: '12px 24px', flexWrap: 'wrap', borderBottom: '1px solid #F0F0F0' }}>
            <div className="db-logs-search" style={{ flex: 1, minWidth: 160 }}>
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search by name or category"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="db-logs-search-input"
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 12, color: '#9197B3', whiteSpace: 'nowrap' }}>From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                style={{ fontSize: 13, border: '1px solid #E0E0E0', borderRadius: 8, padding: '6px 10px', fontFamily: 'Poppins', color: '#333' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 12, color: '#9197B3', whiteSpace: 'nowrap' }}>To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                style={{ fontSize: 13, border: '1px solid #E0E0E0', borderRadius: 8, padding: '6px 10px', fontFamily: 'Poppins', color: '#333' }} />
            </div>
            {(search || dateFrom || dateTo) && (
              <button onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); }}
                style={{ fontSize: 12, color: '#FF383C', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins', padding: '6px 4px' }}>
                Clear
              </button>
            )}
          </div>

          {/* Log list */}
          <div style={{ maxHeight: 420, overflowY: 'auto', padding: '8px 24px' }}>
            {filtered.length === 0 ? (
              <p style={{ color: '#9197B3', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>No logs found.</p>
            ) : (
              filtered.map(log => (
                <div key={log.id} className="db-log-item" onClick={() => setSelectedLog(log)}
                  style={{ cursor: 'pointer', padding: '10px 0', borderBottom: '1px solid #F5F5F5' }}>
                  <div className="db-log-dot" style={{ background: dotColor(log.type) }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="db-log-title" style={{ marginBottom: 2 }}>{log.message}</p>
                    <p className="db-log-sub">{log.sub ?? log.type} · {log.created_at.slice(0, 16).replace('T', ' ')}</p>
                  </div>
                  {log.details && (
                    <span style={{ fontSize: 11, color: '#0088FF', flexShrink: 0, alignSelf: 'center' }}>View ›</span>
                  )}
                </div>
              ))
            )}
          </div>

          <div style={{ padding: '12px 24px', borderTop: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#9197B3' }}>{filtered.length} of {logs.length} logs</span>
            <button className="new-project-btn-create" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      {selectedLog && <ActivityLogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </>
  );
};

export default ActivityLogsModal;
