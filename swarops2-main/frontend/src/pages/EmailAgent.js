import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Mail, Upload, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

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
    <div className="p-8 space-y-8" data-testid="email-agent-page">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Mail className="w-8 h-8 text-[#D4A017]" strokeWidth={1.5} />
        <div>
          <h1 className="font-heading font-bold text-3xl tracking-wide text-white" data-testid="page-title">
            Email Agent
          </h1>
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest" data-testid="page-subtitle">
            Bulk Email & Participant Management
          </p>
        </div>
      </div>

      {/* Agent Status */}
      <div className="bg-[#101010] border border-white/5 p-4 rounded-sm flex items-center justify-between" data-testid="agent-status-bar">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isProcessing || isSending ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} data-testid="status-indicator" />
          <span className="font-mono text-sm text-gray-400" data-testid="status-text">
            {isProcessing ? 'Processing file...' : isSending ? 'Sending emails...' : 'Agent ready'}
          </span>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-[#101010] border border-white/5 p-6 rounded-sm space-y-4" data-testid="upload-section">
        <label className="font-subheading font-bold text-xl uppercase tracking-wider text-[#D4A017]" data-testid="upload-label">
          Upload Registration List
        </label>
        <p className="font-body text-sm text-gray-400">Supports CSV and Excel (.xlsx) files with columns: Name, Email, Role, Team</p>
        <div className="flex items-center space-x-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="bg-[#D4A017] text-black font-subheading font-bold uppercase tracking-wider hover:bg-[#F0B020] h-12 px-8 flex items-center justify-center rounded-sm" data-testid="upload-button">
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
              data-testid="file-input"
            />
          </label>
        </div>
      </div>

      {/* Registrations List */}
      {registrations.length > 0 && (
        <div className="bg-[#101010] border border-white/5 p-6 rounded-sm space-y-4" data-testid="registrations-section">
          <h2 className="font-subheading font-bold text-xl uppercase tracking-wider text-[#D4A017]" data-testid="registrations-title">
            Registration Lists
          </h2>
          <div className="space-y-3">
            {registrations.map((reg, index) => (
              <div
                key={index}
                onClick={() => setSelectedRegistration(reg)}
                className={`bg-[#121212] border p-4 rounded-sm cursor-pointer ${
                  selectedRegistration?.registration_id === reg.registration_id
                    ? 'border-[#D4A017]'
                    : 'border-white/10 hover:border-white/20'
                }`}
                data-testid={`registration-item-${index}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm text-white" data-testid={`reg-id-${index}`}>{reg.registration_id}</span>
                    <p className="font-mono text-xs text-gray-500" data-testid={`reg-date-${index}`}>
                      {new Date(reg.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className="font-mono text-xs px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-sm"
                    data-testid={`reg-count-${index}`}
                  >
                    {reg.total_count} participants
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Composer */}
      {selectedRegistration && (
        <div className="bg-[#101010] border border-[#D4A017] p-6 rounded-sm space-y-4" data-testid="email-composer-section">
          <h2 className="font-subheading font-bold text-xl uppercase tracking-wider text-[#D4A017]" data-testid="composer-title">
            Compose Email
          </h2>
          
          <div className="space-y-2">
            <label className="font-mono text-xs text-gray-400 uppercase" data-testid="subject-label">Subject</label>
            <Input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="bg-black/50 border border-white/10 text-white h-12 font-mono text-sm"
              data-testid="subject-input"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs text-gray-400 uppercase" data-testid="template-label">
              Template (Use {'{name}'}, {'{role}'}, {'{team}'} for personalization)
            </label>
            <Textarea
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              className="bg-black/50 border border-white/10 text-white min-h-[150px] font-mono text-sm"
              data-testid="template-input"
            />
          </div>

          <Button
            onClick={handleSendBulk}
            disabled={isSending}
            className="bg-[#D4A017] text-black font-subheading font-bold uppercase tracking-wider hover:bg-[#F0B020] h-12 px-8"
            data-testid="send-bulk-button"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? 'Sending...' : `Send to ${selectedRegistration.total_count} Participants`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmailAgent;
