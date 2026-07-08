import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Sidebar.css';
import AboutModal from './AboutModal';
import SettingsModal from './SettingsModal';

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
const IconPin = ({ pinned }: { pinned: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: pinned ? 'rotate(0deg)' : 'rotate(45deg)', transition: 'transform 0.2s' }}>
    <path d="M16 9V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v5L4 14v2h6v6l2 2 2-2v-6h6v-2l-4-5z" fill={pinned ? 'currentColor' : 'none'}/>
  </svg>
);

const IconAbout = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="8" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
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
  const [pinned, setPinned] = useState(() => localStorage.getItem('sb_pinned') !== 'false');
  const [hovered, setHovered] = useState(() => sessionStorage.getItem('sb_was_expanded') === 'true');
  const [showAbout, setShowAbout] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const userRef = React.useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const handleUserClick = () => {
    if (userRef.current) {
      const rect = userRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.top, left: rect.right + 8 });
    }
    setShowUserMenu(p => !p);
  };
  const expanded = pinned || hovered;
  const userName = sessionStorage.getItem('userName') || 'User';
  const avatarLetter = userName.charAt(0).toUpperCase();

  useEffect(() => {
    document.title = PAGE_TITLES[activePath] ?? 'Survey Leveling';
  }, [activePath]);

  useEffect(() => {
    // Clear the flag after component mounts
    const timer = setTimeout(() => {
      sessionStorage.removeItem('sb_was_expanded');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const togglePin = () => {
    setPinned(p => {
      localStorage.setItem('sb_pinned', String(!p));
      return !p;
    });
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const handleNavClick = (path: string, isActive: boolean) => {
    if (!isActive) {
      if (hovered || pinned) {
        sessionStorage.setItem('sb_was_expanded', 'true');
      }
      window.location.href = path;
    }
  };

  const sidebarClass = `sb-sidebar ${expanded ? 'expanded' : ''}`;
  return (
    <aside
      className={sidebarClass}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div>
        <div className="sb-header">
          <img src="/lexen logo.png" alt="Lexen Logo" className="sb-logo" />
          <button className="sb-toggle" onClick={togglePin} title={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}>
            <IconPin pinned={pinned} />
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
                onClick={() => handleNavClick(item.path, isActive)}
              >
                <span className="sb-nav-icon">{item.icon}</span>
                <span className="sb-nav-label">{item.label}</span>
                <span className="sb-nav-chevron">›</span>
              </div>
            );
          })}
        </nav>
      </div>
      <div className="sb-bottom">
        <div className="sb-user" ref={userRef} onClick={handleUserClick} title="Account">
          <div className="sb-user-avatar">{avatarLetter}</div>
          <div className="sb-user-info">
            <span className="sb-user-name">{userName}</span>
            <span className="sb-user-role">Engineer</span>
          </div>
          <span className="sb-user-chevron">›</span>
        </div>

        {showUserMenu && createPortal(
          <>
            <div className="sb-user-menu-backdrop" onClick={() => setShowUserMenu(false)} />
            <div className="sb-user-menu" style={{ top: menuPos.top, left: menuPos.left }}>
              <div className="sb-user-menu-item" onClick={() => { setShowUserMenu(false); setShowSettings(true); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Settings
              </div>
              <div className="sb-user-menu-item sb-user-menu-logout" onClick={() => { setShowUserMenu(false); onLogout(); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </div>
            </div>
          </>,
          document.body
        )}
        <div
          className="sb-nav-item sb-about-item"
          title="About"
          onClick={() => setShowAbout(true)}
        >
          <span className="sb-nav-icon"><IconAbout /></span>
          <span className="sb-nav-label">About</span>
          <span className="sb-nav-chevron">›</span>
        </div>
      </div>
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </aside>
  );
};

export default Sidebar;
