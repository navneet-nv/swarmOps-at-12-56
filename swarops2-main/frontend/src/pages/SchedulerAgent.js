import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { CalendarClock, Plus, AlertTriangle, Terminal, Clock, MapPin, User, CheckCircle, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const SchedulerAgent = () => {
  const { currentEventId, userId, API } = useContext(AppContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [sessions, setSessions] = useState([{ name: '', speaker: '', duration: 60, room: '', preferred_time: '' }]);

  useEffect(() => {
    fetchSchedules();
  }, [currentEventId]);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${API}/agent/scheduler/${currentEventId}`);
      setSchedules(response.data);
    } catch (e) {
      console.error('Failed to fetch schedules', e);
    }
  };

  const addSession = () => {
    setSessions([...sessions, { name: '', speaker: '', duration: 60, room: '', preferred_time: '' }]);
  };

  const updateSession = (index, field, value) => {
    const updated = [...sessions];
    updated[index][field] = value;
    setSessions(updated);
  };

  const handleCreateSchedule = async () => {
    const validSessions = sessions.filter(s => s.name && s.speaker);
    if (validSessions.length === 0) {
      toast.error('Please add at least one session');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axios.post(`${API}/agent/scheduler/create`, {
        event_id: currentEventId,
        sessions: validSessions.map((s, i) => ({ ...s, session_id: `session_${i}` })),
        user_id: userId
      });
      toast.success('Schedule created successfully!');
      fetchSchedules();
    } catch (e) {
      toast.error('Failed to create schedule: ' + (e.response?.data?.detail || e.message));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="py-10 space-y-10 max-w-7xl mx-auto text-white" data-testid="scheduler-agent-page">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-8 rounded-3xl premium-glass">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center border border-[var(--primary)]/20 shadow-[0_0_20px_rgba(212,160,23,0.1)]">
            <CalendarClock className="w-8 h-8 text-[var(--primary)]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading font-bold text-4xl tracking-tight text-white" data-testid="page-title">
              Temporal Engine
            </h1>
            <p className="font-mono text-xs text-gray-500 uppercase tracking-[0.3em] mt-1" data-testid="page-subtitle">
              Automated Timeline Synthesis & Optimization
            </p>
          </div>
        </div>
        
        <div className={`px-6 py-2 rounded-full border flex items-center space-x-3 transition-all ${isProcessing ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
            {isProcessing ? 'Optimizing Timeline' : 'Engine Synchronized'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Session Input Matrix */}
        <Card className="premium-glass bg-transparent border-white/5 overflow-hidden">
          <CardHeader className="bg-white/[0.03] border-b border-white/5 py-4 flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-[var(--primary)]" />
              <CardTitle className="font-heading text-sm uppercase tracking-widest text-white">Neural Input Matrix</CardTitle>
            </div>
            <Button
              onClick={addSession}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5 h-9 px-4 rounded-lg font-mono text-[10px] uppercase tracking-widest"
              data-testid="add-session-button"
            >
              <Plus className="w-3 h-3 mr-2" />
              Add Session Vector
            </Button>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div key={index} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-4 animate-in-fade" data-testid={`session-row-${index}`}>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-gray-600 uppercase tracking-widest ml-1">Designation</label>
                    <Input
                      placeholder="e.g. Keynote"
                      value={session.name}
                      onChange={(e) => updateSession(index, 'name', e.target.value)}
                      className="bg-black/40 border-white/10 text-white h-11 rounded-xl focus:border-[var(--primary)]/40 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-gray-600 uppercase tracking-widest ml-1">Personnel</label>
                    <Input
                      placeholder="e.g. Dr. Smith"
                      value={session.speaker}
                      onChange={(e) => updateSession(index, 'speaker', e.target.value)}
                      className="bg-black/40 border-white/10 text-white h-11 rounded-xl focus:border-[var(--primary)]/40 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-gray-600 uppercase tracking-widest ml-1">Duration (M)</label>
                    <Input
                      type="number"
                      value={session.duration}
                      onChange={(e) => updateSession(index, 'duration', parseInt(e.target.value))}
                      className="bg-black/40 border-white/10 text-white h-11 rounded-xl focus:border-[var(--primary)]/40 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-gray-600 uppercase tracking-widest ml-1">Locus</label>
                    <Input
                      placeholder="e.g. Hall A"
                      value={session.room}
                      onChange={(e) => updateSession(index, 'room', e.target.value)}
                      className="bg-black/40 border-white/10 text-white h-11 rounded-xl focus:border-[var(--primary)]/40 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-gray-600 uppercase tracking-widest ml-1">Target Sync</label>
                    <Input
                      placeholder="e.g. 09:00"
                      value={session.preferred_time}
                      onChange={(e) => updateSession(index, 'preferred_time', e.target.value)}
                      className="bg-black/40 border-white/10 text-white h-11 rounded-xl focus:border-[var(--primary)]/40 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleCreateSchedule}
              disabled={isProcessing}
              className="w-full bg-[var(--primary)] text-black font-subheading font-bold uppercase tracking-[0.2em] hover:bg-[#F0B020] h-16 rounded-xl text-lg shadow-[0_10px_30px_rgba(212,160,23,0.15)] group transition-all"
              data-testid="create-schedule-button"
            >
              {isProcessing ? (
                <>
                  <Zap className="w-6 h-6 mr-3 animate-spin" />
                  Calculating Optimal Flow...
                </>
              ) : (
                <>
                  <CalendarClock className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                  Synthesize Timeline
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Timeline Visualization */}
        {schedules.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center space-x-3 ml-2">
              <Clock className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="font-heading font-black text-xs uppercase tracking-[0.4em] text-white">Generated Temporal Matrix</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              {schedules.map((schedule, scheduleIndex) => (
                <Card key={scheduleIndex} className="premium-glass bg-transparent border-white/5 overflow-hidden animate-in-fade" data-testid={`schedule-${scheduleIndex}`}>
                  <CardHeader className="bg-white/[0.03] border-b border-white/5 py-4 flex flex-row items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="font-mono text-[10px] uppercase tracking-widest text-white font-bold">TIMELINE_REF_{schedule.schedule_id?.split('_')[1] || scheduleIndex}</CardTitle>
                      <CardDescription className="font-mono text-[9px] uppercase tracking-tighter">Processed: {new Date(schedule.created_at).toLocaleString()}</CardDescription>
                    </div>
                    <div className="px-3 py-1 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full">
                      <span className="text-[9px] font-mono font-bold text-[var(--primary)] uppercase tracking-widest">{schedule.sessions?.length || 0} Synchronized Units</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      {schedule.sessions?.map((session, sessionIndex) => (
                        <div
                          key={sessionIndex}
                          className={`relative group p-6 rounded-2xl border transition-all duration-500 ${
                            session.conflicts?.length > 0 ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]' : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                              <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center border transition-all ${session.conflicts?.length > 0 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-black/40 border-white/10 text-white'}`}>
                                <span className="text-[10px] font-mono font-bold">{session.start_time}</span>
                                <div className="w-4 h-[1px] bg-white/20 my-1" />
                                <span className="text-[9px] font-mono opacity-50">{session.end_time}</span>
                              </div>
                              
                              <div className="space-y-1">
                                <h4 className="font-heading font-black text-xl text-white tracking-tight group-hover:text-[var(--primary)] transition-colors">
                                  {session.name}
                                </h4>
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-1.5 text-[10px] font-mono text-gray-500">
                                    <User className="w-3 h-3" />
                                    <span>{session.speaker}</span>
                                  </div>
                                  <div className="flex items-center space-x-1.5 text-[10px] font-mono text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    <span>{session.room}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {session.conflicts?.length > 0 ? (
                              <div className="flex flex-col items-end space-y-2 animate-pulse">
                                <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest">Conflict Detected</span>
                                </div>
                                <p className="text-[8px] font-mono text-red-400/60 uppercase">Manual resolution required</p>
                              </div>
                            ) : (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <CheckCircle className="w-5 h-5 text-[var(--accent-green)]" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulerAgent;
