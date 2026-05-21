import { useState, useEffect } from 'react';

export interface ActivityLog {
  id: number;
  type: 'success' | 'error' | 'warning' | 'system' | 'info';
  message: string;
  sub: string | null;
  details: string | null;
  created_at: string;
}

const TYPE_COLOR: Record<string, string> = {
  success: '#14AE5C',
  error:   '#FF383C',
  warning: '#FFCC00',
  system:  '#8E8E93',
  info:    '#0088FF',
};

export function dotColor(type: string) {
  return TYPE_COLOR[type] ?? '#8E8E93';
}

export async function postLog(
  type: ActivityLog['type'],
  message: string,
  sub?: string,
  details?: Record<string, { from: unknown; to: unknown }>
) {
  await fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      message,
      sub: sub ?? null,
      details: details ? JSON.stringify(details) : null,
    }),
  });
}

export function useActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const fetchLogs = () =>
    fetch('/api/logs')
      .then(r => r.json())
      .then(setLogs)
      .catch(console.error);

  useEffect(() => { fetchLogs(); }, []);

  return { logs, fetchLogs };
}
