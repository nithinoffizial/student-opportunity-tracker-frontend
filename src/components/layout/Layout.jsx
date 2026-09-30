import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const pageTitles = {
  '/': 'Dashboard',
  '/opportunities': 'Opportunities',
  '/applications': 'Applications',
  '/reminders': 'Reminders',
  '/students': 'Students',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Student Opportunity Tracker';

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-layout__main">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="app-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
