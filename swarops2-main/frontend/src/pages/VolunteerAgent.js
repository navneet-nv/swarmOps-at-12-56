import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Users, Upload, UserCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

const VolunteerAgent = () => {
  const { currentEventId, userId, API } = useContext(AppContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [volunteerPools, setVolunteerPools] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [tasks, setTasks] = useState([{ name: '', required_skills: '' }]);

  useEffect(() => {
    fetchVolunteers();
  }, [currentEventId]);

  const fetchVolunteers = async () => {
    try {
      const response = await axios.get(`${API}/agent/volunteer/${currentEventId}`);
      setVolunteerPools(response.data);
    } catch (e) {
      console.error('Failed to fetch volunteers', e);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('event_id', currentEventId);
    formData.append('user_id', userId);

    try {
      const response = await axios.post(`${API}/agent/volunteer/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Processed ${response.data.data.total_count} volunteers`);
      fetchVolunteers();
    } catch (e) {
      toast.error('Failed to process file: ' + (e.response?.data?.detail || e.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const addTask = () => {
    setTasks([...tasks, { name: '', required_skills: '' }]);
  };

  const updateTask = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const handleAssignTasks = async () => {
    if (!selectedPool) {
      toast.error('Please select a volunteer pool');
      return;
    }

    const validTasks = tasks.filter(t => t.name).map(t => ({
      ...t,
      required_skills: t.required_skills.split(',').map(s => s.trim())
    }));

    if (validTasks.length === 0) {
      toast.error('Please add at least one task');
      return;
    }

    try {
      const response = await axios.post(`${API}/agent/volunteer/assign`, {
        event_id: currentEventId,
        volunteer_pool_id: selectedPool.volunteer_pool_id,
        tasks: validTasks
      });
      toast.success(`Assigned ${response.data.data.assignments.length} volunteers`);
      fetchVolunteers();
    } catch (e) {
      toast.error('Failed to assign tasks: ' + (e.response?.data?.detail || e.message));
    }
  };

  return (
    <div className="p-8 space-y-8" data-testid="volunteer-agent-page">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Users className="w-8 h-8 text-[#D4A017]" strokeWidth={1.5} />
        <div>
          <h1 className="font-heading font-bold text-3xl tracking-wide text-white" data-testid="page-title">
            Volunteer Coordinator Agent
          </h1>
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest" data-testid="page-subtitle">
            Skill-Based Task Assignment
          </p>
        </div>
      </div>

      {/* Agent Status */}
      <div className="bg-[#101010] border border-white/5 p-4 rounded-sm flex items-center justify-between" data-testid="agent-status-bar">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} data-testid="status-indicator" />
          <span className="font-mono text-sm text-gray-400" data-testid="status-text">
            {isProcessing ? 'Processing...' : 'Agent ready'}
          </span>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-[#101010] border border-white/5 p-6 rounded-sm space-y-4" data-testid="upload-section">
        <label className="font-subheading font-bold text-xl uppercase tracking-wider text-[#D4A017]" data-testid="upload-label">
          Upload Volunteer List
        </label>
        <p className="font-body text-sm text-gray-400">Supports CSV and Excel (.xlsx) files with columns: Name, Email, Skills, Availability</p>
        <div className="flex items-center space-x-4">
          <label htmlFor="volunteer-file-upload" className="cursor-pointer">
            <div className="bg-[#D4A017] text-black font-subheading font-bold uppercase tracking-wider hover:bg-[#F0B020] h-12 px-8 flex items-center justify-center rounded-sm" data-testid="upload-button">
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </div>
            <input
              id="volunteer-file-upload"
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
              data-testid="file-input"
            />
          </label>
        </div>
      </div>

      {/* Volunteer Pools */}
      {volunteerPools.length > 0 && (
        <div className="bg-[#101010] border border-white/5 p-6 rounded-sm space-y-4" data-testid="volunteer-pools-section">
          <h2 className="font-subheading font-bold text-xl uppercase tracking-wider text-[#D4A017]" data-testid="pools-title">
            Volunteer Pools
          </h2>
          <div className="space-y-3">
            {volunteerPools.map((pool, index) => (
              <div
                key={index}
                onClick={() => setSelectedPool(pool)}
                className={`bg-[#121212] border p-4 rounded-sm cursor-pointer ${
                  selectedPool?.volunteer_pool_id === pool.volunteer_pool_id
                    ? 'border-[#D4A017]'
                    : 'border-white/10 hover:border-white/20'
                }`}
                data-testid={`pool-item-${index}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm text-white" data-testid={`pool-id-${index}`}>{pool.volunteer_pool_id}</span>
                    <p className="font-mono text-xs text-gray-500" data-testid={`pool-date-${index}`}>
                      {new Date(pool.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className="font-mono text-xs px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-sm"
                    data-testid={`pool-count-${index}`}
                  >
                    {pool.total_count} volunteers
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Assignment */}
      {selectedPool && (
        <div className="bg-[#101010] border border-[#D4A017] p-6 rounded-sm space-y-4" data-testid="task-assignment-section">
          <div className="flex items-center justify-between">
            <h2 className="font-subheading font-bold text-xl uppercase tracking-wider text-[#D4A017]" data-testid="tasks-title">
              Define Tasks
            </h2>
            <Button
              onClick={addTask}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5 h-10 px-4"
              data-testid="add-task-button"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>

          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div key={index} className="bg-[#121212] border border-white/10 p-4 rounded-sm grid grid-cols-2 gap-3" data-testid={`task-row-${index}`}>
                <Input
                  placeholder="Task Name"
                  value={task.name}
                  onChange={(e) => updateTask(index, 'name', e.target.value)}
                  className="bg-black/50 border border-white/10 text-white h-10 font-mono text-sm"
                  data-testid={`task-name-${index}`}
                />
                <Input
                  placeholder="Required Skills (comma-separated)"
                  value={task.required_skills}
                  onChange={(e) => updateTask(index, 'required_skills', e.target.value)}
                  className="bg-black/50 border border-white/10 text-white h-10 font-mono text-sm"
                  data-testid={`task-skills-${index}`}
                />
              </div>
            ))}
          </div>

          <Button
            onClick={handleAssignTasks}
            className="bg-[#D4A017] text-black font-subheading font-bold uppercase tracking-wider hover:bg-[#F0B020] h-12 px-8"
            data-testid="assign-tasks-button"
          >
            Assign Volunteers to Tasks
          </Button>
        </div>
      )}
    </div>
  );
};

export default VolunteerAgent;
