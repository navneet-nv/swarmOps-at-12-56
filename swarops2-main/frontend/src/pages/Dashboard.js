import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Hexagon, Zap, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentEventId, API } = useContext(AppContext);
  const navigate = useNavigate();
  const [agentStatus, setAgentStatus] = useState([
    { name: 'Content Strategist', status: 'idle', icon: 'Share2', color: '#00FF94' },
    { name: 'Email Agent', status: 'idle', icon: 'Mail', color: '#00F0FF' },
    { name: 'Scheduler', status: 'idle', icon: 'CalendarClock', color: '#D4A017' },
    { name: 'Budget Tracker', status: 'idle', icon: 'CreditCard', color: '#FF2A2A' },
    { name: 'Volunteer Coordinator', status: 'idle', icon: 'Users', color: '#00F0FF' },
  ]);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      await axios.get(`${API}/health`);
    } catch (e) {
      console.error('Health check failed', e);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'idle':
        return 'bg-gray-800 text-gray-500 border-gray-700';
      case 'running':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse';
      case 'complete':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      default:
        return 'bg-gray-800 text-gray-500 border-gray-700';
    }
  };

  return (
    <div className="p-8 space-y-8" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-5xl tracking-widest uppercase text-white" data-testid="dashboard-title">
            SWARMOPS
          </h1>
          <p className="font-body text-base text-gray-400 mt-2" data-testid="dashboard-subtitle">
            Autonomous Event Logistics Command Center
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="font-mono text-xs text-gray-500 uppercase" data-testid="event-id-label">
            Event ID:
          </div>
          <div className="font-mono text-sm text-[#D4A017] bg-black/50 px-3 py-1 border border-white/10 rounded-sm" data-testid="event-id-value">
            {currentEventId}
          </div>
        </div>
      </div>

      {/* Swarm Status */}
      <div className="bg-[#101010] border border-white/5 p-6 rounded-sm" data-testid="swarm-status-card">
        <div className="flex items-center space-x-3 mb-6">
          <Hexagon className="w-6 h-6 text-[#D4A017]" strokeWidth={1.5} />
          <h2 className="font-heading font-bold text-3xl tracking-wide text-white/90" data-testid="swarm-status-title">
            Swarm Status
          </h2>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {agentStatus.map((agent, index) => (
            <div
              key={index}
              className="bg-[#121212] border border-white/10 p-4 rounded-sm hover:border-[#D4A017]/30 group"
              data-testid={`agent-card-${index}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-sm flex items-center justify-center"
                  style={{ backgroundColor: `${agent.color}15`, border: `1px solid ${agent.color}30` }}
                  data-testid={`agent-icon-${index}`}
                >
                  <Hexagon className="w-5 h-5" style={{ color: agent.color }} strokeWidth={1.5} />
                </div>
                <span
                  className={`font-mono text-xs px-2 py-0.5 uppercase border ${getStatusColor(
                    agent.status
                  )}`}
                  data-testid={`agent-status-${index}`}
                >
                  {agent.status}
                </span>
              </div>
              <h3 className="font-subheading font-bold text-sm uppercase tracking-wider text-white/80" data-testid={`agent-name-${index}`}>
                {agent.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#101010] border border-white/5 p-6 rounded-sm" data-testid="stat-card-tasks">
          <div className="flex items-center space-x-3 mb-2">
            <Zap className="w-5 h-5 text-[#00FF94]" strokeWidth={1.5} />
            <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Tasks Completed</span>
          </div>
          <div className="font-heading font-bold text-4xl text-white" data-testid="tasks-completed-value">0</div>
        </div>

        <div className="bg-[#101010] border border-white/5 p-6 rounded-sm" data-testid="stat-card-handoffs">
          <div className="flex items-center space-x-3 mb-2">
            <Hexagon className="w-5 h-5 text-[#00F0FF]" strokeWidth={1.5} />
            <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Agent Handoffs</span>
          </div>
          <div className="font-heading font-bold text-4xl text-white" data-testid="handoffs-value">0</div>
        </div>

        <div className="bg-[#101010] border border-white/5 p-6 rounded-sm" data-testid="stat-card-uptime">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-5 h-5 text-[#D4A017]" strokeWidth={1.5} />
            <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">System Uptime</span>
          </div>
          <div className="font-heading font-bold text-4xl text-white" data-testid="uptime-value">100%</div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-[#101010] border border-white/5 p-6 rounded-sm" data-testid="getting-started-card">
        <h2 className="font-subheading font-bold text-xl uppercase tracking-wider text-[#D4A017] mb-4" data-testid="getting-started-title">
          Getting Started
        </h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3" data-testid="step-1">
            <div className="w-6 h-6 bg-[#D4A017] text-black font-mono text-xs flex items-center justify-center rounded-sm font-bold">
              1
            </div>
            <p className="font-body text-base text-gray-400 leading-relaxed">
              Navigate to <span className="text-[#D4A017] font-semibold">Content Agent</span> to generate promotional materials
            </p>
          </div>
          <div className="flex items-start space-x-3" data-testid="step-2">
            <div className="w-6 h-6 bg-[#D4A017] text-black font-mono text-xs flex items-center justify-center rounded-sm font-bold">
              2
            </div>
            <p className="font-body text-base text-gray-400 leading-relaxed">
              Upload participant data in <span className="text-[#D4A017] font-semibold">Email Agent</span> for bulk communication
            </p>
          </div>
          <div className="flex items-start space-x-3" data-testid="step-3">
            <div className="w-6 h-6 bg-[#D4A017] text-black font-mono text-xs flex items-center justify-center rounded-sm font-bold">
              3
            </div>
            <p className="font-body text-base text-gray-400 leading-relaxed">
              Create your event schedule in <span className="text-[#D4A017] font-semibold">Scheduler Agent</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Launch Swarm */}
      <div className="bg-gradient-to-r from-[#D4A017]/10 via-[#D4A017]/5 to-transparent border border-[#D4A017]/30 p-6 rounded-sm" data-testid="quick-launch-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-2xl tracking-wide text-[#D4A017] mb-2" data-testid="quick-launch-title">
              Launch Full Swarm Workflow
            </h2>
            <p className="font-body text-base text-gray-400">
              Run the complete orchestrated multi-agent workflow with LangGraph
            </p>
          </div>
          <Button
            onClick={() => navigate('/run-swarm')}
            className="bg-[#D4A017] text-black font-subheading font-bold uppercase tracking-wider hover:bg-[#F0B020] h-14 px-8"
            data-testid="launch-swarm-button"
          >
            <Zap className="w-5 h-5 mr-2" />
            Run Swarm
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
