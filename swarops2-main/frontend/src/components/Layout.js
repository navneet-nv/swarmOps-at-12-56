import React, { useContext } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Hexagon, LayoutDashboard, Share2, Mail, CalendarClock, CreditCard, Users } from 'lucide-react';
import { AppContext } from '../App';
import ActivityFeed from './ActivityFeed';

const Layout = () => {
  const { activities } = useContext(AppContext);

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', testId: 'nav-dashboard' },
    { path: '/run-swarm', icon: Hexagon, label: 'Run Swarm', testId: 'nav-run-swarm', highlight: true },
    { path: '/content', icon: Share2, label: 'Content', testId: 'nav-content' },
    { path: '/email', icon: Mail, label: 'Email', testId: 'nav-email' },
    { path: '/scheduler', icon: CalendarClock, label: 'Scheduler', testId: 'nav-scheduler' },
    { path: '/budget', icon: CreditCard, label: 'Budget', testId: 'nav-budget' },
    { path: '/volunteer', icon: Users, label: 'Volunteer', testId: 'nav-volunteer' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 bg-[#0a0a0a] border-r border-white/10 flex flex-col items-center py-6 space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center w-12 h-12 bg-[#D4A017] rounded-sm" data-testid="swarmops-logo">
          <Hexagon className="w-7 h-7 text-black" strokeWidth={1.5} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col space-y-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              data-testid={item.testId}
              className={({ isActive }) =>
                `w-12 h-12 flex items-center justify-center rounded-sm ${isActive
                  ? 'bg-[#D4A017] text-black'
                  : item.highlight
                  ? 'bg-[#D4A017]/20 text-[#D4A017] border border-[#D4A017]/50 hover:bg-[#D4A017]/30'
                  : 'text-gray-500 hover:text-[#D4A017] hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5" strokeWidth={1.5} />
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Activity Feed */}
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
};

export default Layout;
