import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { CalendarClock, Plus, AlertTriangle, Terminal, Clock, MapPin, User, CheckCircle, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { motion } from 'framer-motion';

const SchedulerAgent = () => {
  const { currentEventId, userId, API } = useContext(AppContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [sessions, setSessions] = useState([{ name: '', speaker: '', duration: 60, room: '', preferred_time: '' }]);

  const fetchSchedules = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/agent/scheduler/${currentEventId}`);
      setSchedules(response.data);
    } catch (e) {
      console.error('Failed to fetch schedules', e);
    }
  }, [API, currentEventId]);

  useEffect(() => {
    fetchSchedules();
  }, [currentEventId, fetchSchedules]);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="py-10 space-y-10 max-w-7xl mx-auto text-foreground" 
      data-testid="scheduler-agent-page"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between bg-card/40 border border-border p-8 rounded-3xl premium-glass gap-6">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
            <CalendarClock className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading font-black text-4xl md:text-5xl tracking-tight text-foreground" data-testid="page-title">
              Scheduler Agent
            </h1>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mt-2 flex items-center gap-2" data-testid="page-subtitle">
              Automated Timeline <span className="text-primary opacity-50">&bull;</span> Synthesis & Optimization
            </p>
          </div>
        </div>
        
        <div className={`px-6 py-2.5 rounded-full border flex items-center space-x-3 transition-all ${isProcessing ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.15)]'}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${isProcessing ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,1)]' : 'bg-primary shadow-[0_0_8px_hsl(var(--primary))]'}`} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
            {isProcessing ? 'Optimizing Timeline' : 'Engine Synchronized'}
          </span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-10">
        {/* Session Input Matrix */}
        <Card className="premium-glass bg-card/30 border-border overflow-hidden hover:border-border/80 transition-all">
          <CardHeader className="bg-secondary/30 border-b border-border py-5 flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
              <Terminal className="w-4 h-4 text-primary" />
              <CardTitle className="font-heading text-sm uppercase tracking-widest text-foreground">Neural Input Matrix</CardTitle>
            </div>
            <Button
              onClick={addSession}
              variant="outline"
              className="border-border text-foreground hover:bg-secondary/80 h-9 px-4 rounded-lg font-mono text-[10px] uppercase tracking-widest"
              data-testid="add-session-button"
            >
              <Plus className="w-3 h-3 mr-2" />
              Add Session Vector
            </Button>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              {sessions.map((session, index) => (
                <div key={index} className="bg-secondary/30 border border-border/50 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-5 animate-in-fade hover:bg-secondary/50 transition-all" data-testid={`session-row-${index}`}>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-1 cursor-pointer">Designation</label>
                    <Input
                      placeholder="e.g. Keynote"
                      value={session.name}
                      onChange={(e) => updateSession(index, 'name', e.target.value)}
                      className="bg-background/80 border-border/50 text-foreground h-12 rounded-xl focus:border-primary/50 text-sm focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-1 cursor-pointer">Personnel</label>
                    <Input
                      placeholder="e.g. Dr. Smith"
                      value={session.speaker}
                      onChange={(e) => updateSession(index, 'speaker', e.target.value)}
                      className="bg-background/80 border-border/50 text-foreground h-12 rounded-xl focus:border-primary/50 text-sm focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-1 cursor-pointer">Duration (M)</label>
                    <Input
                      type="number"
                      value={session.duration}
                      onChange={(e) => updateSession(index, 'duration', parseInt(e.target.value))}
                      className="bg-background/80 border-border/50 text-foreground h-12 rounded-xl focus:border-primary/50 text-sm focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-1 cursor-pointer">Locus</label>
                    <Input
                      placeholder="e.g. Hall A"
                      value={session.room}
                      onChange={(e) => updateSession(index, 'room', e.target.value)}
                      className="bg-background/80 border-border/50 text-foreground h-12 rounded-xl focus:border-primary/50 text-sm focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-1 cursor-pointer">Target Sync</label>
                    <Input
                      placeholder="e.g. 09:00"
                      value={session.preferred_time}
                      onChange={(e) => updateSession(index, 'preferred_time', e.target.value)}
                      className="bg-background/80 border-border/50 text-foreground h-12 rounded-xl focus:border-primary/50 text-sm focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleCreateSchedule}
              disabled={isProcessing}
              className="w-full bg-primary text-primary-foreground font-subheading font-bold uppercase tracking-[0.2em] hover:opacity-90 h-16 rounded-xl text-lg shadow-[0_15px_30px_hsl(var(--primary)/0.15)] group transition-all mt-6 active:scale-[0.99]"
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
          <div className="space-y-8 mt-6">
            <div className="flex items-center space-x-3 ml-2 border-b border-border/50 pb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-black text-sm uppercase tracking-[0.4em] text-foreground">Generated Temporal Matrix</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-10">
              {schedules.map((schedule, scheduleIndex) => (
                <Card key={scheduleIndex} className="premium-glass bg-card/40 border-primary/20 overflow-hidden animate-in-fade shadow-[0_0_20px_hsl(var(--primary)/0.05)] hover:border-primary/40 transition-all" data-testid={`schedule-${scheduleIndex}`}>
                  <CardHeader className="bg-primary/5 border-b border-primary/20 py-5 flex flex-row items-center justify-between">
                    <div className="space-y-1.5 flex flex-col">
                      <CardTitle className="font-mono text-[11px] uppercase tracking-widest text-foreground font-bold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_currentColor]" />
                        TIMELINE_REF_{schedule.schedule_id?.split('_')[1] || scheduleIndex}
                      </CardTitle>
                      <CardDescription className="font-mono text-[9px] uppercase tracking-tighter ml-3">Processed: {new Date(schedule.created_at).toLocaleString()}</CardDescription>
                    </div>
                    <div className="px-4 py-1.5 bg-primary/10 border border-primary/30 rounded-full shadow-[0_0_10px_hsl(var(--primary)/0.1)]">
                      <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">{schedule.sessions?.length || 0} Synchronized Units</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-5 relative before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                      {schedule.sessions?.map((session, sessionIndex) => (
                        <div
                          key={sessionIndex}
                          className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}
                        >
                          {/* Timeline dot */}
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-background absolute left-8 -translate-x-1/2 md:left-1/2 md:-translate-x-1/2 z-10 ${session.conflicts?.length > 0 ? "bg-destructive text-destructive-foreground shadow-[0_0_10px_hsl(var(--destructive))]" : "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary))]"}`}>
                            {session.conflicts?.length > 0 ? <AlertTriangle className="w-3.5 h-3.5" strokeWidth={3} /> : <CheckCircle className="w-3.5 h-3.5" strokeWidth={3} />}
                          </div>

                           <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border transition-all duration-300 ml-auto md:ml-0 ${
                            session.conflicts?.length > 0 ? 'bg-destructive/10 border-destructive/30 shadow-[0_0_20px_hsl(var(--destructive)/0.15)] group-hover:border-destructive/50' : 'bg-secondary/40 border-border/50 hover:border-border hover:bg-secondary/60 hover:shadow-lg'
                           }`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-3 relative z-10">
                                <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest ${session.conflicts?.length > 0 ? 'bg-destructive text-destructive-foreground' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                                  {session.start_time} - {session.end_time}
                                </span>
                                
                                <h4 className="font-heading font-bold text-xl text-foreground tracking-tight group-hover:text-primary transition-colors leading-tight">
                                  {session.name}
                                </h4>
                                <div className="flex flex-wrap items-center gap-4 text-muted-foreground pt-1">
                                  <div className="flex items-center space-x-1.5 text-[11px] font-mono font-medium">
                                    <User className="w-3.5 h-3.5" />
                                    <span>{session.speaker}</span>
                                  </div>
                                  <div className="w-1 h-1 rounded-full bg-border" />
                                  <div className="flex items-center space-x-1.5 text-[11px] font-mono font-medium">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{session.room}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {session.conflicts?.length > 0 && (
                                <div className="flex flex-col items-start sm:items-end space-y-2 mt-4 sm:mt-0 bg-background/50 p-3 rounded-lg border border-destructive/20 border-l-2 border-l-destructive">
                                  <div className="flex items-center space-x-2 text-destructive">
                                    <AlertTriangle className="w-4 h-4 animate-pulse" />
                                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Conflict Detected</span>
                                  </div>
                                  <p className="text-[9px] font-mono text-muted-foreground uppercase">Manual override required</p>
                                </div>
                              )}
                            </div>
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
      </motion.div>
    </motion.div>
  );
};

export default SchedulerAgent;
