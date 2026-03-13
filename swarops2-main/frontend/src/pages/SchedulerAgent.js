import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { CalendarClock, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

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
    <div className="p-8 space-y-8" data-testid="scheduler-agent-page">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <CalendarClock className="w-8 h-8 text-[#D4A017]" strokeWidth={1.5} />
        <div>
          <h1 className="font-heading font-bold text-3xl tracking-wide text-white" data-testid="page-title">
            Scheduler Agent
          </h1>
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest" data-testid="page-subtitle">
            Automated Schedule Building & Conflict Resolution
          </p>
        </div>
      </div>

      {/* Agent Status */}
      <div className="bg-[#101010] border border-white/5 p-4 rounded-sm flex items-center justify-between" data-testid="agent-status-bar">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} data-testid="status-indicator" />
          <span className="font-mono text-sm text-gray-400" data-testid="status-text">
            {isProcessing ? 'Building schedule...' : 'Agent ready'}
          </span>
        </div>
      </div>

      {/* Add Sessions */}
      <div className="bg-[#101010] border border-white/5 p-6 rounded-sm space-y-4" data-testid="add-sessions-section">
        <div className="flex items-center justify-between">
          <label className="font-subheading font-bold text-xl uppercase tracking-wider text-[#D4A017]" data-testid="sessions-label">
            Add Sessions
          </label>
          <Button
            onClick={addSession}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/5 h-10 px-4"
            data-testid="add-session-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Session
          </Button>
        </div>

        <div className="space-y-3">
          {sessions.map((session, index) => (
            <div key={index} className="bg-[#121212] border border-white/10 p-4 rounded-sm grid grid-cols-5 gap-3" data-testid={`session-row-${index}`}>
              <Input
                placeholder="Session Name"
                value={session.name}
                onChange={(e) => updateSession(index, 'name', e.target.value)}
                className="bg-black/50 border border-white/10 text-white h-10 font-mono text-sm"
                data-testid={`session-name-${index}`}
              />
              <Input
                placeholder="Speaker"
                value={session.speaker}
                onChange={(e) => updateSession(index, 'speaker', e.target.value)}
                className="bg-black/50 border border-white/10 text-white h-10 font-mono text-sm"
                data-testid={`session-speaker-${index}`}
              />
              <Input
                placeholder="Duration (min)"
                type="number"
                value={session.duration}
                onChange={(e) => updateSession(index, 'duration', parseInt(e.target.value))}
                className="bg-black/50 border border-white/10 text-white h-10 font-mono text-sm"
                data-testid={`session-duration-${index}`}
              />
              <Input
                placeholder="Room"
                value={session.room}
                onChange={(e) => updateSession(index, 'room', e.target.value)}
                className="bg-black/50 border border-white/10 text-white h-10 font-mono text-sm"
                data-testid={`session-room-${index}`}
              />
              <Input
                placeholder="Preferred Time"
                value={session.preferred_time}
                onChange={(e) => updateSession(index, 'preferred_time', e.target.value)}
                className="bg-black/50 border border-white/10 text-white h-10 font-mono text-sm"
                data-testid={`session-time-${index}`}
              />
            </div>
          ))}
        </div>

        <Button
          onClick={handleCreateSchedule}
          disabled={isProcessing}
          className="bg-[#D4A017] text-black font-subheading font-bold uppercase tracking-wider hover:bg-[#F0B020] h-12 px-8"
          data-testid="create-schedule-button"
        >
          {isProcessing ? 'Building...' : 'Build Schedule'}
        </Button>
      </div>

      {/* Generated Schedules */}
      {schedules.length > 0 && (
        <div className="bg-[#101010] border border-white/5 p-6 rounded-sm space-y-4" data-testid="schedules-section">
          <h2 className="font-subheading font-bold text-xl uppercase tracking-wider text-[#D4A017]" data-testid="schedules-title">
            Generated Schedules
          </h2>
          {schedules.map((schedule, scheduleIndex) => (
            <div key={scheduleIndex} className="bg-[#121212] border border-white/10 p-4 rounded-sm" data-testid={`schedule-${scheduleIndex}`}>
              <div className="mb-4">
                <span className="font-mono text-sm text-white" data-testid={`schedule-id-${scheduleIndex}`}>{schedule.schedule_id}</span>
                <p className="font-mono text-xs text-gray-500" data-testid={`schedule-date-${scheduleIndex}`}>
                  {new Date(schedule.created_at).toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                {schedule.sessions?.map((session, sessionIndex) => (
                  <div
                    key={sessionIndex}
                    className={`bg-black/30 border p-3 rounded-sm ${
                      session.conflicts?.length > 0 ? 'border-red-500/50' : 'border-white/5'
                    }`}
                    data-testid={`session-${scheduleIndex}-${sessionIndex}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-subheading font-bold text-base text-white" data-testid={`session-name-display-${scheduleIndex}-${sessionIndex}`}>
                          {session.name}
                        </h4>
                        <p className="font-mono text-xs text-gray-400" data-testid={`session-details-${scheduleIndex}-${sessionIndex}`}>
                          {session.speaker} • {session.start_time} - {session.end_time} • {session.room}
                        </p>
                      </div>
                      {session.conflicts?.length > 0 && (
                        <div className="flex items-center space-x-2 text-red-400" data-testid={`session-conflict-${scheduleIndex}-${sessionIndex}`}>
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-mono text-xs">Conflict</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchedulerAgent;
