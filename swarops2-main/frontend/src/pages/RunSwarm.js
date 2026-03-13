import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Zap, Play, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

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
    <div className="p-8 space-y-8" data-testid="run-swarm-page">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Zap className="w-8 h-8 text-[#D4A017]" strokeWidth={1.5} />
        <div>
          <h1 className="font-heading font-bold text-3xl tracking-wide text-white" data-testid="page-title">
            Run Full Swarm
          </h1>
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest" data-testid="page-subtitle">
            Orchestrated Multi-Agent Workflow
          </p>
        </div>
      </div>

      {/* Swarm Status */}
      <div className="bg-[#101010] border border-white/5 p-4 rounded-sm flex items-center justify-between" data-testid="swarm-status-bar">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} data-testid="status-indicator" />
          <span className="font-mono text-sm text-gray-400" data-testid="status-text">
            {isRunning ? 'Swarm executing...' : 'Ready to launch'}
          </span>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-[#101010] border border-white/5 p-6 rounded-sm space-y-4" data-testid="input-section">
        <div className="space-y-2">
          <label className="font-subheading font-bold text-lg uppercase tracking-wider text-[#D4A017]" data-testid="event-name-label">
            Event Name
          </label>
          <Input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="e.g., AI Hackathon 2026"
            className="bg-black/50 border border-white/10 text-white h-12 font-mono text-sm"
            data-testid="event-name-input"
          />
        </div>

        <div className="space-y-2">
          <label className="font-subheading font-bold text-lg uppercase tracking-wider text-[#D4A017]" data-testid="event-details-label">
            Event Details
          </label>
          <Textarea
            value={rawPrompt}
            onChange={(e) => setRawPrompt(e.target.value)}
            placeholder="Describe your event in detail..."
            className="bg-black/50 border border-white/10 text-white min-h-[120px] font-mono text-sm"
            data-testid="event-details-input"
          />
        </div>

        <Button
          onClick={handleRunSwarm}
          disabled={isRunning}
          className="bg-[#D4A017] text-black font-subheading font-bold uppercase tracking-wider hover:bg-[#F0B020] h-14 px-10 text-lg"
          data-testid="run-swarm-button"
        >
          {isRunning ? (
            <>
              <Zap className="w-5 h-5 mr-2 animate-pulse" />
              Executing Swarm...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Launch Swarm
            </>
          )}
        </Button>
      </div>

      {/* Swarm Timeline */}
      {swarmResult && (
        <div className="bg-[#101010] border border-[#D4A017] p-6 rounded-sm space-y-6" data-testid="swarm-timeline">
          <h2 className="font-subheading font-bold text-xl uppercase tracking-wider text-[#D4A017]" data-testid="timeline-title">
            Swarm Execution Timeline
          </h2>

          {/* Agent Flow Visualization */}
          <div className="relative">
            {swarmResult.messages?.map((message, index) => (
              <div key={index} className="flex items-start space-x-4 mb-4" data-testid={`timeline-item-${index}`}>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-[#D4A017] text-black rounded-sm flex items-center justify-center font-mono font-bold">
                    {index + 1}
                  </div>
                  {index < (swarmResult.messages?.length || 0) - 1 && (
                    <div className="w-0.5 h-12 bg-[#D4A017]/30 my-2" />
                  )}
                </div>
                <div className="flex-1 bg-[#121212] border border-white/10 p-4 rounded-sm">
                  <p className="font-mono text-sm text-white" data-testid={`timeline-message-${index}`}>
                    {message}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-[#121212] border border-white/10 p-4 rounded-sm" data-testid="content-result">
              <div className="flex items-center space-x-2 mb-2">
                {swarmResult.content_status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="font-subheading font-bold text-sm uppercase text-white">Content Agent</span>
              </div>
              <p className="font-mono text-xs text-gray-400">
                Generated {swarmResult.generated_posts?.length || 0} posts
              </p>
            </div>

            <div className="bg-[#121212] border border-white/10 p-4 rounded-sm" data-testid="scheduler-result">
              <div className="flex items-center space-x-2 mb-2">
                {swarmResult.scheduler_status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                )}
                <span className="font-subheading font-bold text-sm uppercase text-white">Scheduler Agent</span>
              </div>
              <p className="font-mono text-xs text-gray-400">
                {swarmResult.conflicts_found ? 'Conflicts detected' : 'No conflicts'}
              </p>
            </div>

            <div className="bg-[#121212] border border-white/10 p-4 rounded-sm" data-testid="email-result">
              <div className="flex items-center space-x-2 mb-2">
                {swarmResult.email_status ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-subheading font-bold text-sm uppercase text-white">Email Agent</span>
              </div>
              <p className="font-mono text-xs text-gray-400">
                {swarmResult.email_status || 'Not triggered'}
              </p>
            </div>
          </div>

          {/* View Results Link */}
          <div className="flex items-center justify-center pt-4">
            <p className="font-mono text-sm text-gray-400">
              View detailed results in respective agent tabs
              <ArrowRight className="inline w-4 h-4 ml-2" />
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunSwarm;
