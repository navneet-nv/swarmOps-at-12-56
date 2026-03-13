import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Zap, Play, CheckCircle, AlertCircle, ArrowRight, Activity, Terminal, Layers, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const RunSwarm = () => {
  const { currentEventId, userId, API } = useContext(AppContext);
  const [eventName, setEventName] = useState('AI Hackathon 2026');
  const [rawPrompt, setRawPrompt] = useState('We\'re hosting a 48-hour AI hackathon with 500 participants focusing on multi-agent systems');
  const [isRunning, setIsRunning] = useState(false);
  const [swarmResult, setSwarmResult] = useState(null);

  const handleRunSwarm = async () => {
    if (!rawPrompt.trim()) {
      toast.error('Please enter event details');
      return;
    }

    setIsRunning(true);
    setSwarmResult(null);
    try {
      const response = await axios.post(`${API}/swarm/run`, {
        event_id: currentEventId,
        user_id: userId,
        event_name: eventName,
        raw_prompt: rawPrompt,
        schedule: []
      });

      setSwarmResult(response.data.data);
      toast.success('Swarm execution completed!');
    } catch (e) {
      toast.error('Failed to run swarm: ' + (e.response?.data?.detail || e.message));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="py-10 space-y-10 max-w-6xl mx-auto" data-testid="run-swarm-page">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-8 rounded-3xl premium-glass">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center border border-[var(--primary)]/20 shadow-[0_0_20px_rgba(212,160,23,0.1)]">
            <Zap className="w-8 h-8 text-[var(--primary)]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading font-bold text-4xl tracking-tight text-white" data-testid="page-title">
              Swarm Orchestrator
            </h1>
            <p className="font-mono text-xs text-gray-500 uppercase tracking-[0.3em] mt-1" data-testid="page-subtitle">
              Multi-Agent Autonomous Execution Engine
            </p>
          </div>
        </div>
        
        <div className={`px-6 py-2 rounded-full border flex items-center space-x-3 transition-all ${isRunning ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-green-500'}`} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
            {isRunning ? 'Swarm in operation' : 'Engine Ready'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Input Console */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <Card className="premium-glass bg-transparent border-white/5 overflow-hidden">
            <CardHeader className="bg-white/[0.03] border-b border-white/5 py-4">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-[var(--primary)]" />
                <CardTitle className="font-heading text-sm uppercase tracking-widest text-white">Mission Parameters</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500 ml-1">Event Designation</label>
                <Input
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g., AI Hackathon 2026"
                  className="bg-black/40 border-white/10 text-white h-14 rounded-xl focus:border-[var(--primary)]/50 transition-all font-body text-lg"
                  data-testid="event-name-input"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500 ml-1">Operational Requirements</label>
                <Textarea
                  value={rawPrompt}
                  onChange={(e) => setRawPrompt(e.target.value)}
                  placeholder="Describe your event in detail..."
                  className="bg-black/40 border-white/10 text-white min-h-[160px] rounded-xl focus:border-[var(--primary)]/50 transition-all font-body text-base leading-relaxed"
                  data-testid="event-details-input"
                />
              </div>

              <Button
                onClick={handleRunSwarm}
                disabled={isRunning}
                className="w-full bg-[var(--primary)] text-black font-subheading font-bold uppercase tracking-[0.2em] hover:bg-[#F0B020] h-16 rounded-xl text-lg shadow-[0_10px_30px_rgba(212,160,23,0.15)] group transition-all transform active:scale-[0.98]"
                data-testid="run-swarm-button"
              >
                {isRunning ? (
                  <>
                    <Activity className="w-6 h-6 mr-3 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-3 group-hover:fill-current" />
                    Launch Mission
                  </>
                )}
              </Button>
              
              <div className="flex items-center justify-center space-x-2 text-[10px] font-mono text-gray-600 uppercase tracking-widest pt-2">
                <Info className="w-3 h-3 text-[var(--accent-cyan)]" />
                <span>Expected units involved: 5 AI Agents</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Execution Timeline */}
        <div className="lg:col-span-12 xl:col-span-7">
          <Card className={`premium-glass bg-transparent border-white/5 h-full flex flex-col transition-all duration-700 ${!swarmResult && !isRunning ? 'opacity-40 grayscale pointer-events-none scale-[0.98]' : ''}`}>
             <CardHeader className="bg-white/[0.03] border-b border-white/5 py-4">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[var(--accent-cyan)]" />
                <CardTitle className="font-heading text-sm uppercase tracking-widest text-white">Execution Matrix</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-8 overflow-y-auto">
              {isRunning && !swarmResult && (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-2 border-[var(--primary)]/20 border-t-[var(--primary)] animate-spin" />
                    <Zap className="absolute inset-0 m-auto w-8 h-8 text-[var(--primary)] animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-heading text-xl text-white uppercase tracking-widest">Processing...</p>
                    <p className="font-mono text-[10px] text-gray-500 uppercase tracking-[0.3em]">Handoffs in progress</p>
                  </div>
                </div>
              )}
              
              {!isRunning && !swarmResult && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <div className="w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6">
                    <Terminal className="w-10 h-10 text-gray-600" />
                  </div>
                  <p className="font-body text-gray-500 max-w-xs">Waiting for mission parameters to begin neural processing.</p>
                </div>
              )}

              {swarmResult && (
                <div className="space-y-8 animate-in-fade relative" data-testid="swarm-timeline">
                  {/* Progress Line */}
                  <div className="absolute left-[27px] top-6 bottom-6 w-[2px] bg-white/5" />
                  
                  {swarmResult.messages?.map((message, index) => {
                    const isLast = index === swarmResult.messages.length - 1;
                    return (
                      <div key={index} className="flex items-start space-x-6 relative group" data-testid={`timeline-item-${index}`}>
                        <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${isLast ? 'bg-[var(--primary)] text-black border-[var(--primary)] shadow-[0_0_20px_rgba(212,160,23,0.3)]' : 'bg-black/50 text-gray-400 border-white/10 group-hover:border-white/30'}`}>
                          <span className="font-heading text-lg font-bold">{index + 1}</span>
                        </div>
                        
                        <div className={`flex-1 p-6 rounded-2xl border transition-all duration-500 ${isLast ? 'bg-[var(--primary)]/5 border-[var(--primary)]/20 shadow-[0_0_40px_rgba(212,160,23,0.05)]' : 'bg-white/[0.02] border-white/5 group-hover:bg-white/[0.04]'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">Log Entry #{1024 + index}</div>
                            {isLast && (
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3 text-[var(--accent-green)]" />
                                <span className="text-[10px] font-bold text-[var(--accent-green)] uppercase">Synchronized</span>
                              </div>
                            )}
                          </div>
                          <p className="font-body text-gray-300 leading-relaxed" data-testid={`timeline-message-${index}`}>
                            {message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Results Summary HUD */}
                  <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-3 gap-4">
                    {[
                      { label: 'Content Unit', status: swarmResult.content_status, detail: `${swarmResult.generated_posts?.length || 0} Assets` },
                      { label: 'Scheduler Unit', status: swarmResult.scheduler_status, detail: swarmResult.conflicts_found ? 'Conflict detected' : 'Schedule Ready' },
                      { label: 'Comms Unit', status: swarmResult.email_status ? 'complete' : 'none', detail: swarmResult.email_status || 'Offline' },
                    ].map((res, i) => (
                      <div key={i} className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-gray-600 uppercase tracking-tighter">{res.label}</span>
                          {res.status === 'completed' || res.status === 'complete' ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] shadow-[0_0_5px_var(--accent-green)]" />
                          ) : res.status === 'failed' ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-red)]" />
                          ) : (
                             <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                          )}
                        </div>
                        <div className="text-[10px] font-subheading font-bold text-white uppercase truncate">{res.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RunSwarm;
