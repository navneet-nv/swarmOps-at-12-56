import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Mail, Upload, Send, FileText, CheckCircle, Terminal, Users, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { motion } from 'framer-motion';

const EmailAgent = () => {
  const { currentEventId, userId, API } = useContext(AppContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [emailTemplate, setEmailTemplate] = useState('Hi {name},\n\nWelcome to our event! As a {role}, you\'re part of Team {team}.\n\nBest regards,\nSwarmOps Team');
  const [emailSubject, setEmailSubject] = useState('Welcome to the Event!');
  const [isSending, setIsSending] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/agent/email/registrations/${currentEventId}`);
      setRegistrations(response.data);
    } catch (e) {
      console.error('Failed to fetch registrations', e);
    }
  }, [API, currentEventId]);

  useEffect(() => {
    fetchRegistrations();
  }, [currentEventId, fetchRegistrations]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('event_id', currentEventId);
    formData.append('user_id', userId);

    try {
      const response = await axios.post(`${API}/agent/email/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Processed ${response.data.data.total_count} participants`);
      fetchRegistrations();
    } catch (e) {
      toast.error('Failed to process file: ' + (e.response?.data?.detail || e.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendBulk = async () => {
    if (!selectedRegistration) {
      toast.error('Please select a registration list');
      return;
    }

    setIsSending(true);
    try {
      const response = await axios.post(`${API}/agent/email/send-bulk`, {
        event_id: currentEventId,
        registration_id: selectedRegistration.registration_id,
        subject: emailSubject,
        template: emailTemplate
      });
      toast.success(`Sent ${response.data.data.sent_count} emails!`);
    } catch (e) {
      toast.error('Failed to send emails: ' + (e.response?.data?.detail || e.message));
    } finally {
      setIsSending(false);
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
      data-testid="email-agent-page"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between bg-card/40 border border-border p-8 rounded-3xl premium-glass gap-6">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-accent-purple/10 rounded-2xl flex items-center justify-center border border-accent-purple/20 shadow-[0_0_20px_hsl(var(--accent-purple)/0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-accent-purple/5 group-hover:bg-accent-purple/10 transition-colors" />
            <Mail className="w-8 h-8 text-accent-purple group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading font-black text-4xl md:text-5xl tracking-tight text-foreground" data-testid="page-title">
              Email Agent
            </h1>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mt-2 flex items-center gap-2" data-testid="page-subtitle">
              Mass Participant <span className="text-accent-purple opacity-50">&bull;</span> Engagement Engine
            </p>
          </div>
        </div>
        
        <div className={`px-6 py-2.5 rounded-full border flex items-center space-x-3 transition-all ${isProcessing || isSending ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-accent-green/10 border-accent-green/20 text-accent-green shadow-[0_0_15px_hsl(var(--accent-green)/0.1)]'}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${isProcessing || isSending ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,1)]' : 'bg-accent-green shadow-[0_0_8px_hsl(var(--accent-green))]'}`} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
            {isProcessing ? 'Processing Data' : isSending ? 'Transmitting' : 'Datalink Stable'}
          </span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Operations */}
        <div className="lg:col-span-5 space-y-6">
          {/* File Upload Card */}
          <Card className="premium-glass bg-card/30 border-border overflow-hidden group hover:border-border/80 transition-all">
             <CardHeader className="bg-secondary/30 border-b border-border py-5">
              <div className="flex items-center space-x-3">
                <Upload className="w-4 h-4 text-accent-cyan" />
                <CardTitle className="font-heading text-sm uppercase tracking-widest text-foreground">Ingestion Module</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-2xl p-10 group hover:border-accent-cyan/50 hover:bg-secondary/30 transition-all cursor-pointer relative overflow-hidden">
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  disabled={isProcessing}
                />
                <div className="relative z-0 flex flex-col items-center">
                  <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                    <Upload className="w-8 h-8 text-muted-foreground group-hover:text-accent-cyan transition-colors" />
                  </div>
                  <p className="font-heading text-sm text-foreground uppercase tracking-widest mb-2 font-bold group-hover:text-accent-cyan transition-colors">Drop registration file</p>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">CSV or XLSX (Max 10MB)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 bg-secondary/30 p-4 rounded-xl border border-border/50">
                <Info className="w-4 h-4 text-accent-cyan mt-0.5 shrink-0" />
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  Required Schema: <span className="text-foreground font-mono bg-background/50 px-1 py-0.5 rounded text-[10px]">Name, Email, Role, Team</span>. 
                  Unit will automatically map fields and validate entries.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Registrations List */}
          {registrations.length > 0 && (
            <Card className="premium-glass bg-card/30 border-border overflow-hidden">
              <CardHeader className="bg-secondary/30 border-b border-border py-5">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-accent-purple" />
                  <CardTitle className="font-heading text-sm uppercase tracking-widest text-foreground">Data Repositories</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {registrations.map((reg, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedRegistration(reg)}
                      className={`group p-5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedRegistration?.registration_id === reg.registration_id
                          ? 'bg-accent-cyan/10 border-accent-cyan/40 shadow-[0_0_15px_hsl(var(--accent-cyan)/0.1)]'
                          : 'bg-secondary/30 border-border/50 hover:bg-secondary/50 hover:border-border/80'
                      }`}
                    >
                      <div className="space-y-1.5 flex flex-col">
                        <span className="font-mono text-[11px] text-foreground font-bold flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan opacity-50" />
                          INDEX-{reg.registration_id?.slice(-4).toUpperCase()}
                        </span>
                        <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider ml-3">SYNC: {new Date(reg.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-heading text-xl text-foreground tabular-nums font-bold">{reg.total_count}</div>
                          <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">ENTRIES</div>
                        </div>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${selectedRegistration?.registration_id === reg.registration_id ? 'bg-accent-cyan text-accent-cyan-foreground border-accent-cyan shadow-[0_0_10px_hsl(var(--accent-cyan)/0.3)]' : 'bg-background/40 border-border/50 text-muted-foreground group-hover:text-foreground group-hover:border-border'}`}>
                          <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Composer */}
        <div className="lg:col-span-7">
          <Card className={`premium-glass bg-card/30 border-border h-full flex flex-col transition-all duration-700 hover:border-border/80 ${!selectedRegistration ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
             <CardHeader className="bg-secondary/30 border-b border-border py-5 flex flex-row items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Terminal className="w-4 h-4 text-accent-cyan" />
                  <CardTitle className="font-heading text-sm uppercase tracking-widest text-foreground">Transmission Composer</CardTitle>
                </div>
                {selectedRegistration && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-accent-cyan/10 border border-accent-cyan/20 rounded-md">
                    <Users className="w-3.5 h-3.5 text-accent-cyan" />
                    <span className="text-[10px] font-mono font-bold text-accent-cyan uppercase tracking-widest flex gap-1">
                      {selectedRegistration.total_count} <span className="opacity-70">Targets</span>
                    </span>
                  </div>
                )}
            </CardHeader>
            <CardContent className="p-8 md:p-10 space-y-8 flex-1 flex flex-col justify-center">
              {!selectedRegistration ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-50 min-h-[400px]">
                  <div className="w-24 h-24 rounded-full bg-secondary/50 border border-border flex items-center justify-center mb-8">
                    <Mail className="w-10 h-10 text-muted-foreground" strokeWidth={1} />
                  </div>
                  <p className="font-heading text-sm text-muted-foreground max-w-xs uppercase tracking-[0.2em] leading-relaxed">Select a data repository to begin transmission sequence</p>
                </div>
              ) : (
                <div className="space-y-8 animate-in-fade flex-1 flex flex-col">
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground ml-1">Universal Header</label>
                    <Input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Transmission Subject..."
                      className="bg-background/60 border-border/80 text-foreground h-14 rounded-xl focus:border-accent-cyan/50 transition-all font-body text-lg"
                    />
                  </div>

                  <div className="space-y-3 flex-1 flex flex-col">
                    <div className="flex items-center justify-between ml-1 bg-secondary/30 p-2 rounded-t-lg border border-border/50 border-b-0">
                      <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground ml-2">Neural Payload Template</label>
                      <div className="flex space-x-2">
                        {['{name}', '{role}', '{team}'].map(tag => (
                          <span key={tag} className="text-[9px] font-mono bg-background/50 px-2 py-1 rounded shadow-sm border border-border/50 text-muted-foreground select-none cursor-copy hover:text-accent-cyan transition-colors" title="Click to insert">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      value={emailTemplate}
                      onChange={(e) => setEmailTemplate(e.target.value)}
                      className="bg-background/60 border-border/80 text-foreground flex-1 min-h-[300px] rounded-b-xl rounded-t-none focus:border-accent-cyan/50 transition-all font-body text-base leading-relaxed custom-scrollbar p-5"
                    />
                  </div>

                  <Button
                    onClick={handleSendBulk}
                    disabled={isSending}
                    className="w-full bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-subheading font-bold uppercase tracking-[0.2em] hover:opacity-90 h-16 rounded-xl text-lg shadow-[0_15px_30px_hsl(var(--accent-purple)/0.2)] group transition-all transform active:scale-[0.98] border-0 disabled:opacity-50 mt-6"
                  >
                    {isSending ? (
                      <>
                        <Send className="w-6 h-6 mr-3 animate-ping" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        Execute Bulk Dispatch
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmailAgent;
