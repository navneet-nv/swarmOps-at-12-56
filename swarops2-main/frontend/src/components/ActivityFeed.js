import React from 'react';
import { Activity, Radio, Cpu, Bell } from 'lucide-react';

const ActivityFeed = ({ activities }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30 shadow-[0_0_12px_hsl(var(--accent-cyan)/0.2)]';
      case 'failed':
        return 'text-destructive bg-destructive/10 border-destructive/30';
      case 'started':
        return 'text-accent-purple bg-accent-purple/10 border-accent-purple/30 shadow-[0_0_12px_hsl(var(--accent-purple)/0.2)]';
      case 'handoff':
        return 'text-primary bg-primary/10 border-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.2)]';
      case 'alert':
        return 'text-destructive bg-destructive/10 border-destructive/30 animate-pulse';
      default:
        return 'text-muted-foreground bg-secondary/50 border-border';
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
    <aside className="w-96 bg-background/50 backdrop-blur-3xl border-l border-border overflow-hidden flex flex-col z-40" data-testid="activity-feed">
      <div className="p-6 border-b border-border flex items-center justify-between premium-glass">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Radio className="w-5 h-5 text-primary" strokeWidth={2} />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
          </div>
          <h2 className="font-heading font-black text-xs uppercase tracking-[0.3em] text-foreground">
            Live Intelligence
          </h2>
        </div>
        <Bell className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {activities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40 space-y-4">
            <Cpu className="w-10 h-10 text-muted-foreground animate-float" strokeWidth={1.5} />
            <p className="font-mono text-[10px] uppercase tracking-widest text-center text-muted-foreground">
              Awaiting neural signals...
            </p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={activity.activity_id || index}
              className="bg-secondary/40 border border-border/50 p-5 rounded-xl space-y-3 transition-all hover:bg-secondary/80 hover:border-primary/30 hover:shadow-[0_4px_20px_0_hsl(var(--primary)/0.05)] hover:-translate-y-0.5"
              data-testid={`activity-item-${index}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-[9px] px-2.5 py-1 uppercase rounded-full border font-bold tracking-wider ${getStatusColor(
                    activity.status
                  )}`}
                  data-testid={`activity-status-${index}`}
                >
                  {activity.agent || 'SYSTEM'}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground font-medium" data-testid={`activity-time-${index}`}>
                  {formatTime(activity.timestamp)}
                </span>
              </div>
              <p className="font-body text-[13px] text-foreground/80 leading-relaxed font-normal" data-testid={`activity-message-${index}`}>
                {activity.message}
              </p>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 bg-secondary/30 border-t border-border text-center backdrop-blur-md">
        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest flex justify-center items-center gap-2">
          Connection Status: 
          <span className="text-accent-cyan font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_5px_hsl(var(--accent-cyan))]"></span> Optimally Synced
          </span>
        </span>
      </div>
    </aside>
  );
};

export default ActivityFeed;
