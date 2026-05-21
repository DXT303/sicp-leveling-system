import React, { useState, useEffect } from 'react';
import './Sidebar.css';

const IconDashboard = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);
const IconProjects = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 7h18M3 12h18M3 17h18"/>
  </svg>
);
const IconReports = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>
  </svg>
);

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <IconDashboard />, path: '/dashboard' },
  { label: 'Projects',  icon: <IconProjects />,  path: '/projects'  },
  { label: 'Reports',   icon: <IconReports />,   path: '/reports'   },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard — Survey Leveling',
  '/projects':  'Projects — Survey Leveling',
  '/reports':   'Reports — Survey Leveling',
};

interface SidebarProps {
  activePath: string;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePath, onLogout }) => {
  const [pinned, setPinned] = useState(() => localStorage.getItem('sb_pinned') === 'true');
  const [hovered, setHovered] = useState(false);
  const expanded = pinned || hovered;
  const userName = sessionStorage.getItem('userName') || 'User';
  const avatarLetter = userName.charAt(0).toUpperCase();

  useEffect(() => {
    document.title = PAGE_TITLES[activePath] ?? 'Survey Leveling';
  }, [activePath]);

  const togglePin = () => {
    setPinned(p => {
      localStorage.setItem('sb_pinned', String(!p));
      return !p;
    });
  };

  return (
    <aside
      className={`sb-sidebar ${expanded ? 'expanded' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        <div className="sb-header">
          <span className="sb-title">LOGO</span>
          <button className="sb-toggle" onClick={togglePin} title={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}>
            {pinned ? '«' : '»'}
          </button>
        </div>
        <nav className="sb-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = activePath === item.path;
            return (
              <div
                key={item.label}
                className={`sb-nav-item ${isActive ? 'sb-nav-active' : ''}`}
                title={item.label}
                onClick={() => { if (!isActive) window.location.href = item.path; }}
              >
                <span className="sb-nav-icon">{item.icon}</span>
                <span className="sb-nav-label">{item.label}</span>
                <span className="sb-nav-chevron">›</span>
              </div>
            );
          })}
        </nav>
      </div>
      <div className="sb-user">
        <div className="sb-user-avatar">{avatarLetter}</div>
        <div className="sb-user-info">
          <span className="sb-user-name">{userName}</span>
          <span className="sb-user-role">Engineer</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
