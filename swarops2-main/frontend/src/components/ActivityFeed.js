import React from 'react';
import { Activity } from 'lucide-react';

const ActivityFeed = ({ activities }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'failed':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'started':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'handoff':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'alert':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <aside className="w-80 bg-[#0a0a0a] border-l border-white/10 overflow-y-auto" data-testid="activity-feed">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Activity className="w-5 h-5 text-[#D4A017]" strokeWidth={1.5} />
          <h2 className="font-subheading font-bold text-xl uppercase tracking-wider text-[#D4A017]">
            Live Feed
          </h2>
        </div>

        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="font-mono text-xs text-gray-600 uppercase" data-testid="no-activities-message">
              No recent activity
            </p>
          ) : (
            activities.map((activity, index) => (
              <div
                key={activity.activity_id || index}
                className="bg-[#101010] border border-white/5 p-3 rounded-sm hover:border-[#D4A017]/30"
                data-testid={`activity-item-${index}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span
                    className={`font-mono text-xs px-2 py-0.5 uppercase rounded-sm border ${getStatusColor(
                      activity.status
                    )}`}
                    data-testid={`activity-status-${index}`}
                  >
                    {activity.agent}
                  </span>
                  <span className="font-mono text-xs text-gray-600" data-testid={`activity-time-${index}`}>
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
                <p className="font-body text-sm text-gray-400 leading-relaxed" data-testid={`activity-message-${index}`}>
                  {activity.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default ActivityFeed;
