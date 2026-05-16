import React, { useState } from 'react';
import './Sidebar.css';

const IconDashboard = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);
const IconDataInput = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 5v14M5 12h14"/><rect x="3" y="3" width="18" height="18" rx="3"/>
  </svg>
);
const IconComputation = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 7h6M9 12h6M9 17h4"/><rect x="3" y="3" width="18" height="18" rx="3"/>
  </svg>
);
const IconCalibration = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>
    <line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/>
    <line x1="3" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21" y2="12"/>
  </svg>
);
const IconReports = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>
  </svg>
);
const IconProjects = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 7h18M3 12h18M3 17h18"/>
  </svg>
);

const NAV_ITEMS = [
  { label: 'Dashboard',   icon: <IconDashboard />,   path: '/dashboard'   },
  { label: 'Data Input',  icon: <IconDataInput />,   path: '/data-input'  },
  { label: 'Computation', icon: <IconComputation />, path: '/computation' },
  { label: 'Calibration', icon: <IconCalibration />, path: '/calibration' },
  { label: 'Reports',     icon: <IconReports />,     path: '/reports'     },
  { label: 'Projects',    icon: <IconProjects />,    path: '/projects'    },
];

interface SidebarProps {
  activePath: string;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePath, onLogout }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={`sb-sidebar ${expanded ? 'expanded' : ''}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div>
        <div className="sb-header">
          <span className="sb-title">LOGO</span>
        </div>
        <nav className="sb-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = activePath === item.path;
            return (
              <div
                key={item.label}
                className={`sb-nav-item ${isActive ? 'sb-nav-active' : ''}`}
                onClick={() => !isActive && (window.location.href = item.path)}
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
        <div className="sb-user-avatar">R</div>
        <div className="sb-user-info">
          <span className="sb-user-name">Ronald Talagtag</span>
          <span className="sb-user-role">Engineer</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
