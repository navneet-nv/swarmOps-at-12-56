import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Mail, Upload, Send, FileText, CheckCircle, Terminal, Users, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const EmailAgent = () => {
  const { currentEventId, userId, API } = useContext(AppContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [emailTemplate, setEmailTemplate] = useState('Hi {name},\n\nWelcome to our event! As a {role}, you\'re part of Team {team}.\n\nBest regards,\nSwarmOps Team');
  const [emailSubject, setEmailSubject] = useState('Welcome to the Event!');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [currentEventId]);

  const fetchRegistrations = async () => {
    try {
      const response = await axios.get(`${API}/agent/email/registrations/${currentEventId}`);
      setRegistrations(response.data);
    } catch (e) {
      console.error('Failed to fetch registrations', e);
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

  return (
    <div className="py-10 space-y-10 max-w-6xl mx-auto text-white" data-testid="email-agent-page">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-8 rounded-3xl premium-glass">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-[var(--accent-cyan)]/10 rounded-2xl flex items-center justify-center border border-[var(--accent-cyan)]/20 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
            <Mail className="w-8 h-8 text-[var(--accent-cyan)]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading font-bold text-4xl tracking-tight text-white" data-testid="page-title">
              Communications Hub
            </h1>
            <p className="font-mono text-xs text-gray-500 uppercase tracking-[0.3em] mt-1" data-testid="page-subtitle">
              Mass Participant Engagement Engine
            </p>
          </div>
        </div>
        
        <div className={`px-6 py-2 rounded-full border flex items-center space-x-3 transition-all ${isProcessing || isSending ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${isProcessing || isSending ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
            {isProcessing ? 'Processing Data' : isSending ? 'Transmitting' : 'Datalink Stable'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Operations */}
        <div className="lg:col-span-5 space-y-6">
          {/* File Upload Card */}
          <Card className="premium-glass bg-transparent border-white/5 overflow-hidden">
             <CardHeader className="bg-white/[0.03] border-b border-white/5 py-4">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-[var(--accent-cyan)]" />
                <CardTitle className="font-heading text-sm uppercase tracking-widest text-white">Ingestion Module</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-10 group hover:border-[var(--accent-cyan)]/30 transition-all cursor-pointer relative overflow-hidden">
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  disabled={isProcessing}
                />
                <div className="relative z-0 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-[var(--accent-cyan)]" />
                  </div>
                  <p className="font-heading text-sm text-white uppercase tracking-widest mb-1">Drop registration file</p>
                  <p className="font-mono text-[10px] text-gray-500 uppercase tracking-tighter">CSV or XLSX (Max 10MB)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <Info className="w-4 h-4 text-[var(--accent-cyan)] mt-0.5" />
                <p className="font-body text-xs text-gray-500 leading-relaxed">
                  Required Schema: <span className="text-gray-300 font-mono">Name, Email, Role, Team</span>. 
                  Unit will automatically map fields and validate entries.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Registrations List */}
          {registrations.length > 0 && (
            <Card className="premium-glass bg-transparent border-white/5 overflow-hidden">
              <CardHeader className="bg-white/[0.03] border-b border-white/5 py-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <CardTitle className="font-heading text-sm uppercase tracking-widest text-white">Data Repositories</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  {registrations.map((reg, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedRegistration(reg)}
                      className={`group p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedRegistration?.registration_id === reg.registration_id
                          ? 'bg-[var(--accent-cyan)]/10 border-[var(--accent-cyan)]/30'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-mono text-[10px] text-white font-bold uppercase tracking-wider">INDEX-{reg.registration_id?.slice(-4).toUpperCase()}</div>
                        <div className="font-mono text-[8px] text-gray-600 uppercase">SYNCHRONIZED: {new Date(reg.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="font-heading text-lg text-white tabular-nums">{reg.total_count}</div>
                          <div className="text-[8px] font-mono text-gray-500 uppercase tracking-tighter">ENTRIES</div>
                        </div>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${selectedRegistration?.registration_id === reg.registration_id ? 'bg-[var(--accent-cyan)] text-black border-[var(--accent-cyan)]' : 'bg-black/40 border-white/10 text-white/20 group-hover:text-white group-hover:border-white/20'}`}>
                          <CheckCircle className="w-4 h-4" strokeWidth={3} />
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
          <Card className={`premium-glass bg-transparent border-white/5 h-full flex flex-col transition-all duration-700 ${!selectedRegistration ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
             <CardHeader className="bg-white/[0.03] border-b border-white/5 py-4 flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-[var(--accent-cyan)]" />
                  <CardTitle className="font-heading text-sm uppercase tracking-widest text-white">Transmission Composer</CardTitle>
                </div>
                {selectedRegistration && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 rounded-full">
                    <Users className="w-3 h-3 text-[var(--accent-cyan)]" />
                    <span className="text-[9px] font-mono font-bold text-[var(--accent-cyan)] uppercase tracking-widest">{selectedRegistration.total_count} Targets</span>
                  </div>
                )}
            </CardHeader>
            <CardContent className="p-8 space-y-8 flex-1">
              {!selectedRegistration ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-30">
                  <Mail className="w-16 h-16 text-gray-600 mb-6" strokeWidth={1} />
                  <p className="font-body text-gray-500 max-w-xs uppercase text-xs tracking-[0.2em]">Select a data repository to begin transmission sequence</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in-fade">
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500 ml-1">Universal Header</label>
                    <Input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Transmission Subject..."
                      className="bg-black/40 border-white/10 text-white h-14 rounded-xl focus:border-[var(--accent-cyan)]/50 transition-all font-body text-lg"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">Neural Payload Template</label>
                      <div className="flex space-x-2">
                        {['{name}', '{role}', '{team}'].map(tag => (
                          <span key={tag} className="text-[8px] font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/5 text-gray-400 select-none">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      value={emailTemplate}
                      onChange={(e) => setEmailTemplate(e.target.value)}
                      className="bg-black/40 border-white/10 text-white min-h-[300px] rounded-xl focus:border-[var(--accent-cyan)]/50 transition-all font-body text-base leading-relaxed custom-scrollbar"
                    />
                  </div>

                  <Button
                    onClick={handleSendBulk}
                    disabled={isSending}
                    className="w-full bg-[var(--accent-cyan)] text-black font-subheading font-bold uppercase tracking-[0.2em] hover:bg-[#00D0FF] h-16 rounded-xl text-lg shadow-[0_10px_30px_rgba(0,240,255,0.15)] group transition-all transform active:scale-[0.98]"
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
      </div>
    </div>
  );
};

export default EmailAgent;
