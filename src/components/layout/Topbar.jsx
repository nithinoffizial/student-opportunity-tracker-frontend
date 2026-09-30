import { Menu } from 'lucide-react';

export default function Topbar({ title, onMenuClick }) {
  return (
    <header className="topbar">
      <button className="topbar__menu-btn" type="button" onClick={onMenuClick} aria-label="Open navigation menu">
        <Menu size={22} />
      </button>
      <h1 className="topbar__title">{title}</h1>
    </header>
  );
}
