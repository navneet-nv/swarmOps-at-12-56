import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Users, Upload, UserCheck, Shield, Target, Plus, Search, CheckCircle, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

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
    <div className="py-10 space-y-10 max-w-7xl mx-auto text-white" data-testid="volunteer-agent-page">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-8 rounded-3xl premium-glass">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-[var(--accent-green)]/10 rounded-2xl flex items-center justify-center border border-[var(--accent-green)]/20 shadow-[0_0_20px_rgba(72,255,174,0.1)]">
            <Users className="w-8 h-8 text-[var(--accent-green)]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading font-bold text-4xl tracking-tight text-white" data-testid="page-title">
              Personnel Matrix
            </h1>
            <p className="font-mono text-xs text-gray-500 uppercase tracking-[0.3em] mt-1" data-testid="page-subtitle">
              Skill-Based Unit Deployment & Coordination
            </p>
          </div>
        </div>
        
        <div className={`px-6 py-2 rounded-full border flex items-center space-x-3 transition-all ${isProcessing ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
            {isProcessing ? 'Analyzing Personnel' : 'Personnel Ready'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Population & Pools */}
        <div className="lg:col-span-5 space-y-6">
          {/* File Upload Card */}
          <Card className="premium-glass bg-transparent border-white/5 overflow-hidden">
             <CardHeader className="bg-white/[0.03] border-b border-white/5 py-4">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-[var(--accent-green)]" />
                <CardTitle className="font-heading text-sm uppercase tracking-widest text-white">Personnel Inbound</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-10 group hover:border-[var(--accent-green)]/30 transition-all cursor-pointer relative overflow-hidden">
                <input
                  id="volunteer-file-upload"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  disabled={isProcessing}
                />
                <div className="relative z-0 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Search className="w-8 h-8 text-gray-400 group-hover:text-[var(--accent-green)]" />
                  </div>
                  <p className="font-heading text-sm text-white uppercase tracking-widest mb-1 text-center">Scan Personnel Data</p>
                  <p className="font-mono text-[9px] text-gray-500 uppercase tracking-tighter text-center">CSV / XLSX Layout Required</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <Shield className="w-4 h-4 text-[var(--accent-green)] mt-0.5" />
                <p className="font-body text-xs text-gray-500 leading-relaxed italic">
                  Mapping attributes: <span className="text-gray-300 font-mono">Name, Skills, Availability</span>. 
                  Unit will perform real-time verification upon ingest.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Volunteer Pools List */}
          {volunteerPools.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 ml-2">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Available Unit Batches</span>
              </div>
              <div className="space-y-3">
                {volunteerPools.map((pool, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedPool(pool)}
                    className={`group p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedPool?.volunteer_pool_id === pool.volunteer_pool_id
                        ? 'bg-[var(--accent-green)]/10 border-[var(--accent-green)]/30'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-mono text-[10px] text-white font-bold tracking-widest">BATCH://{pool.volunteer_pool_id?.slice(-8).toUpperCase()}</div>
                      <div className="font-mono text-[8px] text-gray-600 uppercase">Synchronized: {new Date(pool.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-heading text-xl text-white tabular-nums">{pool.total_count}</div>
                        <div className="text-[8px] font-mono text-gray-500 uppercase tracking-tighter">Personnel</div>
                      </div>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${selectedPool?.volunteer_pool_id === pool.volunteer_pool_id ? 'bg-[var(--accent-green)] text-black border-[var(--accent-green)]' : 'bg-black/40 border-white/10 text-white/20 group-hover:text-white group-hover:border-white/20'}`}>
                        <CheckCircle className="w-4 h-4" strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Task Deployment */}
        <div className="lg:col-span-7">
          <Card className={`premium-glass bg-transparent border-white/5 h-full flex flex-col transition-all duration-700 ${!selectedPool ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
             <CardHeader className="bg-white/[0.03] border-b border-white/5 py-4 flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-[var(--accent-green)]" />
                  <CardTitle className="font-heading text-sm uppercase tracking-widest text-white">Directive Definition</CardTitle>
                </div>
                <Button
                  onClick={addTask}
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5 h-8 px-4 rounded-lg font-mono text-[9px] uppercase tracking-widest"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Objective
                </Button>
            </CardHeader>
            <CardContent className="p-8 space-y-8 flex-1">
              {!selectedPool ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-24 opacity-30">
                  <Target className="w-20 h-20 text-gray-600 mb-6" strokeWidth={1} />
                  <p className="font-heading text-sm text-gray-400 uppercase tracking-[0.3em] max-w-xs leading-relaxed">Select specialized personnel batch to access deployment console</p>
                </div>
              ) : (
                <div className="space-y-8 animate-in-fade">
                   <div className="space-y-3">
                    {tasks.map((task, index) => (
                      <div key={index} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 group transition-all hover:bg-white/[0.04]">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest ml-1">Duty Assignment</label>
                          <Input
                            placeholder="e.g. Security Perimeter"
                            value={task.name}
                            onChange={(e) => updateTask(index, 'name', e.target.value)}
                            className="bg-black/40 border-white/10 text-white h-12 rounded-xl focus:border-[var(--accent-green)]/40 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest ml-1">Required Expertise</label>
                          <Input
                            placeholder="e.g. First Aid, Fast Logic"
                            value={task.required_skills}
                            onChange={(e) => updateTask(index, 'required_skills', e.target.value)}
                            className="bg-black/40 border-white/10 text-white h-12 rounded-xl focus:border-[var(--accent-green)]/40 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleAssignTasks}
                    className="w-full bg-[var(--accent-green)] text-black font-subheading font-bold uppercase tracking-[0.2em] hover:brightness-110 h-20 rounded-2xl text-xl shadow-[0_20px_50px_rgba(72,255,174,0.15)] group transition-all transform active:scale-[0.98]"
                  >
                    <Shield className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                    Deploy Units to Objective
                  </Button>
                  
                  <div className="flex items-start space-x-3 bg-white/[0.01] p-4 rounded-xl border border-white/5 mt-8">
                    <Info className="w-4 h-4 text-gray-600 mt-0.5" />
                    <p className="font-body text-[10px] text-gray-600 leading-relaxed uppercase tracking-tighter italic">
                      Personnel will be matched based on neural skill vectors. 
                      Optimal assignment is calculated via the Skill-Symmetry protocol.
                    </p>
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

export default VolunteerAgent;
