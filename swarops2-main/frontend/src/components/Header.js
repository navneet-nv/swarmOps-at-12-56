import React, { useContext } from 'react';
import { AppContext } from '../App';
import { ShieldCheck, User, Globe } from 'lucide-react';

const Header = () => {
  const { currentEventId, userId } = useContext(AppContext);

  return (
    <header className="h-16 border-b border-white/10 premium-glass flex items-center justify-between px-8 z-50">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-xs font-mono tracking-widest uppercase text-gray-500">
          <Globe className="w-3 h-3 text-[var(--accent-cyan)]" />
          <span>Network: <span className="text-white">Mainnet</span></span>
        </div>
        <div className="h-4 w-[1px] bg-white/10" />
        <div className="flex items-center space-x-2 text-xs font-mono tracking-widest uppercase text-gray-500">
          <ShieldCheck className="w-3 h-3 text-[var(--accent-green)]" />
          <span>Status: <span className="text-white">Secured</span></span>
        </div>
      </div>

      <div className="flex items-center space-x-8">
        <div className="flex flex-col items-end">
          <div className="text-[10px] font-mono uppercase text-gray-500 tracking-tighter">Current Event</div>
          <div className="text-sm font-subheading font-bold text-[var(--primary)] uppercase">{currentEventId}</div>
        </div>
        
        <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full premium-glass-hover transition-all">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dim)] flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-black" fill="currentColor" />
          </div>
          <span className="text-xs font-mono font-medium text-gray-300 uppercase tracking-wider">{userId}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
