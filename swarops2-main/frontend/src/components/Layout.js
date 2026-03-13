import React, { useContext } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Hexagon, LayoutDashboard, Share2, Mail, CalendarClock, CreditCard, Users } from 'lucide-react';
import { AppContext } from '../App';
import ActivityFeed from './ActivityFeed';
import Header from './Header';

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
    <div className="flex h-screen overflow-hidden bg-black text-white selection:bg-[#D4A017]/30">
      {/* Sidebar */}
      <aside className="w-20 bg-[#050505] border-r border-white/5 flex flex-col items-center py-8 z-50">
        {/* Logo */}
        <div className="relative group mb-12">
          <div className="absolute inset-0 bg-[#D4A017] blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative flex items-center justify-center w-12 h-12 bg-[#D4A017] rounded-xl transform rotate-45 group-hover:rotate-0 transition-all duration-500 shadow-2xl" data-testid="swarmops-logo">
            <Hexagon className="w-7 h-7 text-black transform -rotate-45 group-hover:rotate-0 transition-all duration-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col space-y-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              data-testid={item.testId}
              className={({ isActive }) =>
                `w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 relative group ${isActive
                  ? 'bg-[#D4A017] text-black shadow-[0_0_20px_rgba(212,160,23,0.4)] scale-110'
                  : item.highlight
                  ? 'bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/30 hover:bg-[#D4A017]/20'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={1.5} />
              <div className="absolute left-16 bg-black border border-white/10 px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-widest whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100] premium-glass">
                {item.label}
              </div>
            </NavLink>
          ))}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-[1600px] mx-auto animate-in-fade px-4">
              <Outlet />
            </div>
          </main>

          {/* Activity Feed */}
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
