import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Hexagon, Zap, Clock, ArrowRight, Activity, Cpu, Sparkles, TrendingUp, Mail, CalendarClock, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const Dashboard = () => {
  const { currentEventId, API } = useContext(AppContext);
  const navigate = useNavigate();
  const [agentStatus, setAgentStatus] = useState([
    { name: 'Content Strategist', status: 'idle', icon: Sparkles, color: '#00FF94' },
    { name: 'Email Agent', status: 'idle', icon: Mail, color: '#00F0FF' },
    { name: 'Scheduler', status: 'idle', icon: CalendarClock, color: '#D4A017' },
    { name: 'Budget Tracker', status: 'idle', icon: TrendingUp, color: '#FF2A2A' },
    { name: 'Volunteer Coordinator', status: 'idle', icon: Users, color: '#00F0FF' },
  ]);



  const checkHealth = useCallback(async () => {
    try {
      await axios.get(`${API}/health`);
    } catch (e) {
      console.error('Health check failed', e);
    }
  }, [API]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'idle':
        return 'text-gray-500 border-white/5 bg-white/5';
      case 'running':
        return 'text-amber-400 border-amber-500/20 bg-amber-500/5 animate-pulse';
      case 'complete':
        return 'text-green-400 border-green-500/20 bg-green-500/5';
      default:
        return 'text-gray-500 border-white/5 bg-white/5';
    }
  };

  return (
    <div className="py-10 space-y-12 max-w-7xl mx-auto" data-testid="dashboard-page">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 px-8 rounded-[2rem] premium-glass border border-white/10 group">
        <div className="absolute top-0 right-0 -m-20 w-80 h-80 bg-[var(--primary)] opacity-[0.03] blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 -m-20 w-60 h-60 bg-[var(--accent-cyan)] opacity-[0.02] blur-[80px] rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--primary)]">
              <Cpu className="w-3 h-3" />
              <span>Quantum Core: Active</span>
            </div>
            <h1 className="font-heading font-black text-6xl tracking-tighter text-white leading-none">
              SWARM<span className="text-gradient-gold">OPS</span>
            </h1>
            <p className="font-body text-xl text-gray-400 max-w-xl">
              Next-generation autonomous event management powered by collaborative AI swarms.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
             <Button
              onClick={() => navigate('/run-swarm')}
              className="bg-[var(--primary)] text-black font-subheading font-bold uppercase tracking-widest hover:bg-[#F0B020] h-16 px-10 rounded-2xl shadow-[0_0_30px_rgba(212,160,23,0.2)] transition-all hover:scale-[1.02] group"
              data-testid="launch-swarm-button"
            >
              <Zap className="w-5 h-5 mr-3 group-hover:animate-pulse" />
              Launch full Swarm
              <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Tasks Completed', value: '42', icon: Zap, color: '[var(--accent-green)]' },
          { label: 'Agent Handoffs', value: '12', icon: Hexagon, color: '[var(--accent-cyan)]' },
          { label: 'System Uptime', value: '100%', icon: Clock, color: '[var(--primary)]' },
        ].map((stat, i) => (
          <Card key={i} className="premium-glass premium-glass-hover bg-transparent border-white/5 border overflow-hidden relative">
            <div className={`absolute top-0 left-0 w-1 h-full bg-${stat.color}`} style={{ backgroundColor: stat.color }} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-heading font-bold text-white tabular-nums">{stat.value}</div>
              <div className="mt-2 text-[10px] font-mono text-gray-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1 text-[var(--accent-green)]" />
                +12% FROM LAST SESSION
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agents Status */}
      <Card className="premium-glass bg-transparent border-white/5">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
          <div className="space-y-1">
            <CardTitle className="font-heading text-2xl tracking-wide text-white uppercase">Swarm Pulse</CardTitle>
            <CardDescription className="font-mono text-[10px] uppercase tracking-widest">Real-time status of independent specialized units</CardDescription>
          </div>
          <div className="flex items-center space-x-2 bg-green-500/5 border border-green-500/20 px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">All Units Operational</span>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {agentStatus.map((agent, index) => (
              <div
                key={index}
                className="premium-glass-hover border border-white/5 bg-white/[0.02] p-6 rounded-2xl flex flex-col items-center text-center space-y-4 group transition-all"
                data-testid={`agent-card-${index}`}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 relative group-hover:scale-110"
                  style={{ background: `radial-gradient(circle at center, ${agent.color}15 0%, transparent 70%)`, border: `1px solid ${agent.color}15` }}
                >
                  <agent.icon className="w-8 h-8 group-hover:rotate-12 transition-transform" style={{ color: agent.color }} strokeWidth={1} />
                  <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 blur-xl transition-opacity" style={{ color: agent.color }} />
                </div>
                <div className="space-y-2 w-full">
                  <h3 className="font-subheading font-bold text-sm uppercase tracking-wider text-white truncate px-2">{agent.name}</h3>
                  <div className={`text-[10px] font-mono px-3 py-1 rounded-full border uppercase tracking-widest inline-block ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer Meta */}
      <div className="flex items-center justify-between pt-8 border-t border-white/5">
        <div className="flex items-center space-x-4">
          <div className="text-[10px] font-mono text-gray-600 uppercase tracking-tighter">System Version</div>
          <div className="text-[10px] font-mono text-[var(--primary)] px-2 py-0.5 rounded border border-[var(--primary)]/20 uppercase tracking-widest">v2.1.0-ALPHA</div>
        </div>
        <div className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.3em]">Build with ❤️ for Neurathon '26</div>
      </div>
    </div>
  );
};

export default Dashboard;
