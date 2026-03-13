import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Users, Upload, UserCheck, Shield, Target, Plus, Search, CheckCircle, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { motion } from 'framer-motion';

const VolunteerAgent = () => {
  const { currentEventId, userId, API } = useContext(AppContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [volunteerPools, setVolunteerPools] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [tasks, setTasks] = useState([{ name: '', required_skills: '' }]);

  const fetchVolunteers = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/agent/volunteer/${currentEventId}`);
      setVolunteerPools(response.data);
    } catch (e) {
      console.error('Failed to fetch volunteers', e);
    }
  }, [API, currentEventId]);

  useEffect(() => {
    fetchVolunteers();
  }, [currentEventId, fetchVolunteers]);

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
      data-testid="volunteer-agent-page"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between bg-card/40 border border-border p-8 rounded-3xl premium-glass gap-6">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-accent-green/10 rounded-2xl flex items-center justify-center border border-accent-green/20 shadow-[0_0_20px_hsl(var(--accent-green)/0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-accent-green/5 group-hover:bg-accent-green/10 transition-colors" />
            <Users className="w-8 h-8 text-accent-green group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading font-black text-4xl md:text-5xl tracking-tight text-foreground" data-testid="page-title">
              Volunteer Agent
            </h1>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mt-2 flex items-center gap-2" data-testid="page-subtitle">
              Skill-Based <span className="text-accent-green opacity-50">&bull;</span> Unit Deployment
            </p>
          </div>
        </div>
        
        <div className={`px-6 py-2.5 rounded-full border flex items-center space-x-3 transition-all ${isProcessing ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-accent-green/10 border-accent-green/30 text-accent-green shadow-[0_0_15px_hsl(var(--accent-green)/0.15)]'}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-accent-green shadow-[0_0_8px_currentColor]'}`} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
            {isProcessing ? 'Analyzing Personnel' : 'Personnel Ready'}
          </span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Population & Pools */}
        <div className="lg:col-span-5 space-y-6">
          {/* File Upload Card */}
          <Card className="premium-glass bg-card/30 border-border overflow-hidden hover:border-border/80 transition-all">
             <CardHeader className="bg-secondary/30 border-b border-border py-5">
              <div className="flex items-center space-x-3">
                <Upload className="w-4 h-4 text-accent-green" />
                <CardTitle className="font-heading text-sm uppercase tracking-widest text-foreground">Personnel Inbound</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-2xl p-10 group hover:border-accent-green/50 hover:bg-secondary/30 transition-all cursor-pointer relative overflow-hidden">
                <input
                  id="volunteer-file-upload"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  disabled={isProcessing}
                />
                <div className="relative z-0 flex flex-col items-center">
                  <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                    <Search className="w-8 h-8 text-muted-foreground group-hover:text-accent-green transition-colors" />
                  </div>
                  <p className="font-heading text-sm text-foreground uppercase tracking-widest mb-2 font-bold group-hover:text-accent-green transition-colors">Scan Personnel Data</p>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">CSV / XLSX Layout Required</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 bg-secondary/30 p-4 rounded-xl border border-border/50">
                <Shield className="w-4 h-4 text-accent-green mt-0.5 shrink-0" />
                <p className="font-body text-xs text-muted-foreground leading-relaxed italic">
                  Mapping attributes: <span className="text-foreground font-mono bg-background/50 px-1 py-0.5 rounded text-[10px]">Name, Skills, Availability</span>. 
                  Unit will perform real-time verification upon ingest.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Volunteer Pools List */}
          {volunteerPools.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 ml-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground font-bold">Available Unit Batches</span>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                {volunteerPools.map((pool, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedPool(pool)}
                    className={`group p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedPool?.volunteer_pool_id === pool.volunteer_pool_id
                        ? 'bg-accent-green/10 border-accent-green/40 shadow-[0_0_15px_hsl(var(--accent-green)/0.1)]'
                        : 'bg-secondary/30 border-border/50 hover:bg-secondary/50 hover:border-border/80'
                    }`}
                  >
                    <div className="space-y-1.5 flex flex-col">
                      <span className="font-mono text-[11px] text-foreground font-bold flex items-center gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-accent-green opacity-50" />
                        BATCH://{pool.volunteer_pool_id?.slice(-8).toUpperCase()}
                      </span>
                      <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider ml-3">SYNC: {new Date(pool.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-heading text-xl text-foreground tabular-nums font-bold">{pool.total_count}</div>
                        <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Personnel</div>
                      </div>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${selectedPool?.volunteer_pool_id === pool.volunteer_pool_id ? 'bg-accent-green text-black border-accent-green shadow-[0_0_10px_hsl(var(--accent-green)/0.3)]' : 'bg-background/40 border-border/50 text-muted-foreground group-hover:text-foreground group-hover:border-border'}`}>
                        <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
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
          <Card className={`premium-glass bg-card/30 border-border h-full flex flex-col transition-all duration-700 hover:border-border/80 ${!selectedPool ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
             <CardHeader className="bg-secondary/30 border-b border-border py-5 flex flex-row items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-4 h-4 text-accent-green" />
                  <CardTitle className="font-heading text-sm uppercase tracking-widest text-foreground">Directive Definition</CardTitle>
                </div>
                <Button
                  onClick={addTask}
                  variant="outline"
                  className="border-border text-foreground hover:bg-secondary/80 h-9 px-4 rounded-lg font-mono text-[10px] uppercase tracking-widest"
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Add Objective
                </Button>
            </CardHeader>
            <CardContent className="p-8 md:p-10 space-y-8 flex-1 flex flex-col justify-center">
              {!selectedPool ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-50 min-h-[400px]">
                  <div className="w-24 h-24 rounded-full bg-secondary/50 border border-border flex items-center justify-center mb-8">
                    <Target className="w-10 h-10 text-muted-foreground" strokeWidth={1} />
                  </div>
                  <p className="font-heading text-sm text-muted-foreground max-w-xs uppercase tracking-[0.2em] leading-relaxed">Select specialized personnel batch to access deployment console</p>
                </div>
              ) : (
                <div className="space-y-8 animate-in-fade flex-1 flex flex-col">
                   <div className="space-y-4">
                    {tasks.map((task, index) => (
                      <div key={index} className="bg-secondary/30 border border-border/50 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-5 group transition-all hover:bg-secondary/50">
                        <div className="space-y-2">
                          <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-1">Duty Assignment</label>
                          <Input
                            placeholder="e.g. Security Perimeter"
                            value={task.name}
                            onChange={(e) => updateTask(index, 'name', e.target.value)}
                            className="bg-background/80 border-border/50 text-foreground h-12 rounded-xl focus:border-accent-green/50 text-sm focus:ring-1 focus:ring-accent-green/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-1">Required Expertise</label>
                          <Input
                            placeholder="e.g. First Aid, Fast Logic"
                            value={task.required_skills}
                            onChange={(e) => updateTask(index, 'required_skills', e.target.value)}
                            className="bg-background/80 border-border/50 text-foreground h-12 rounded-xl focus:border-accent-green/50 text-sm focus:ring-1 focus:ring-accent-green/50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleAssignTasks}
                    className="w-full bg-accent-green text-black font-subheading font-bold uppercase tracking-[0.2em] hover:opacity-90 h-20 rounded-2xl text-xl shadow-[0_20px_50px_hsl(var(--accent-green)/0.15)] group transition-all transform active:scale-[0.98] mt-auto"
                  >
                    <Shield className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                    Deploy Units to Objective
                  </Button>
                  
                  <div className="flex items-start space-x-3 bg-secondary/30 p-4 rounded-xl border border-border/50 mt-8">
                    <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="font-body text-[10px] text-muted-foreground leading-relaxed uppercase tracking-widest italic">
                      Personnel will be matched based on neural skill vectors. 
                      Optimal assignment is calculated via the Skill-Symmetry protocol.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VolunteerAgent;
