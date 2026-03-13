import React, { useContext } from 'react';
import { AppContext } from '../App';
import { ShieldCheck, User, Globe } from 'lucide-react';

const Header = () => {
  const { currentEventId, userId } = useContext(AppContext);

  return (
    <header className="h-16 border-b border-border premium-glass flex items-center justify-between px-8 z-40 relative">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-xs font-mono tracking-widest uppercase text-muted-foreground">
          <Globe className="w-3 h-3 text-accent-cyan animate-pulse" />
          <span>Network: <span className="text-foreground">Mainnet</span></span>
        </div>
        <div className="h-4 w-[1px] bg-border" />
        <div className="flex items-center space-x-2 text-xs font-mono tracking-widest uppercase text-muted-foreground">
          <ShieldCheck className="w-3 h-3 text-accent-cyan" />
          <span>Status: <span className="text-foreground">Secured</span></span>
        </div>
      </div>

      <div className="flex items-center space-x-8">
        <div className="flex flex-col items-end">
          <div className="text-[10px] font-mono uppercase text-muted-foreground tracking-tighter">Current Event</div>
          <div className="text-sm font-heading font-bold text-transparent bg-clip-text text-gradient-cyan uppercase tracking-wider">{currentEventId}</div>
        </div>
        
        <div className="flex items-center space-x-3 bg-secondary/50 border border-border px-4 py-1.5 rounded-full premium-glass-hover transition-all cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-primary" fill="currentColor" />
          </div>
          <span className="text-xs font-mono font-medium text-foreground uppercase tracking-wider">{userId}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
