import React from 'react';
import { Activity, Radio, Cpu, Bell } from 'lucide-react';

const ActivityFeed = ({ activities }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-[var(--accent-green)] bg-[var(--accent-green)]/5 border-[var(--accent-green)]/20 shadow-[0_0_10px_rgba(0,255,148,0.1)]';
      case 'failed':
        return 'text-[var(--accent-red)] bg-[var(--accent-red)]/5 border-[var(--accent-red)]/20';
      case 'started':
        return 'text-amber-400 bg-amber-400/5 border-amber-400/20';
      case 'handoff':
        return 'text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/5 border-[var(--accent-cyan)]/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]';
      case 'alert':
        return 'text-[var(--accent-red)] bg-[var(--accent-red)]/5 border-[var(--accent-red)]/20 animate-pulse';
      default:
        return 'text-gray-500 bg-white/5 border-white/10';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <aside className="w-96 bg-[#050505] border-l border-white/5 overflow-hidden flex flex-col z-40" data-testid="activity-feed">
      <div className="p-6 border-b border-white/5 flex items-center justify-between premium-glass">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Radio className="w-5 h-5 text-[var(--primary)]" strokeWidth={2} />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--primary)] rounded-full animate-ping" />
          </div>
          <h2 className="font-heading font-black text-xs uppercase tracking-[0.3em] text-white">
            Live Intelligence
          </h2>
        </div>
        <Bell className="w-4 h-4 text-gray-600 hover:text-white transition-colors cursor-pointer" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {activities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-4">
            <Cpu className="w-10 h-10 text-gray-500" strokeWidth={1} />
            <p className="font-mono text-[10px] uppercase tracking-widest text-center">
              Awaiting neural signals...
            </p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={activity.activity_id || index}
              className="premium-glass-hover bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-3 transition-all animate-in-fade"
              data-testid={`activity-item-${index}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-[9px] px-2.5 py-1 uppercase rounded-full border font-bold tracking-tighter ${getStatusColor(
                    activity.status
                  )}`}
                  data-testid={`activity-status-${index}`}
                >
                  {activity.agent || 'SYSTEM'}
                </span>
                <span className="font-mono text-[9px] text-gray-600 font-medium" data-testid={`activity-time-${index}`}>
                  [{formatTime(activity.timestamp)}]
                </span>
              </div>
              <p className="font-body text-xs text-gray-400 leading-relaxed font-medium" data-testid={`activity-message-${index}`}>
                {activity.message}
              </p>
              
              <div className="flex items-center space-x-1 pt-1 opacity-20">
                <div className="h-[1px] flex-1 bg-white/40" />
                <div className="w-1 h-1 rounded-full bg-white/40" />
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
        <span className="text-[8px] font-mono text-gray-700 uppercase tracking-widest">
          Connection Status: <span className="text-[var(--accent-green)]">Optimized</span>
        </span>
      </div>
    </aside>
  );
};

export default ActivityFeed;
