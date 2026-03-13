import React, { useContext } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Hexagon, LayoutDashboard, Share2, Mail, CalendarClock, CreditCard, Users } from 'lucide-react';
import { AppContext } from '../App';
import ActivityFeed from './ActivityFeed';
import Header from './Header';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const { activities } = useContext(AppContext);
  const location = useLocation();

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
    <div className="flex h-screen overflow-hidden bg-background text-foreground selection:bg-primary/30">
      <div className="ambient-glow" />
      {/* Sidebar */}
      <aside className="w-20 bg-secondary/80 backdrop-blur-3xl border-r border-border flex flex-col items-center py-8 z-50">
        {/* Logo */}
        <div className="relative group mb-12">
          <div className="absolute inset-0 bg-primary blur-xl opacity-20 group-hover:opacity-60 transition-opacity duration-700" />
          <div className="relative flex items-center justify-center w-12 h-12 bg-primary rounded-xl transform rotate-45 group-hover:rotate-0 transition-all duration-500 shadow-2xl" data-testid="swarmops-logo">
            <Hexagon className="w-7 h-7 text-primary-foreground transform -rotate-45 group-hover:rotate-0 transition-all duration-500" strokeWidth={1.5} />
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
                  ? 'bg-primary text-primary-foreground shadow-[0_0_25px_hsl(var(--primary)/0.4)] scale-110'
                  : item.highlight
                  ? 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:shadow-[0_0_15px_hsl(var(--primary)/0.2)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={1.5} />
              <div className="absolute left-16 bg-card border border-border px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-widest whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-[100] shadow-lg">
                {item.label}
              </div>
            </NavLink>
          ))}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-border w-12 flex justify-center">
          <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse shadow-[0_0_10px_hsl(var(--accent-cyan))]" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="max-w-[1600px] mx-auto px-6 py-6"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Activity Feed */}
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
