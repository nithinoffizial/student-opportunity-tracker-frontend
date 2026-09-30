import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Bell,
  Users,
  Rocket,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/opportunities', label: 'Opportunities', icon: Briefcase },
  { to: '/applications', label: 'Applications', icon: FileText },
  { to: '/reminders', label: 'Reminders', icon: Bell },
  { to: '/students', label: 'Students', icon: Users },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <Rocket size={24} className="sidebar__logo-icon" />
            <div className="sidebar__logo-text">
              <span className="sidebar__app-name">OpportunityTracker</span>
              <span className="sidebar__app-sub">Student Platform</span>
            </div>
          </div>
          <button className="sidebar__close" type="button" onClick={onClose} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
              onClick={onClose}
            >
              <Icon size={19} className="sidebar__link-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <p className="sidebar__footer-text">© 2026 OpportunityTracker</p>
        </div>
      </aside>
    </>
  );
}
