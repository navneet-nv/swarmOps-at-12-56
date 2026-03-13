import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Share2, Sparkles, ThumbsUp, ThumbsDown, Edit, Terminal, Clock, FileText, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const ContentAgent = () => {
  const { currentEventId, userId, API } = useContext(AppContext);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [contentList, setContentList] = useState([]);

  useEffect(() => {
    fetchContent();
  }, [currentEventId]);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/agent/content/${currentEventId}`);
      setContentList(response.data);
    } catch (e) {
      console.error('Failed to fetch content', e);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter an event description');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await axios.post(`${API}/agent/content/generate`, {
        event_id: currentEventId,
        prompt: prompt,
        user_id: userId
      });

      setGeneratedContent(response.data.data);
      toast.success('Content generated successfully!');
      fetchContent();
    } catch (e) {
      toast.error('Failed to generate content: ' + (e.response?.data?.detail || e.message));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async (contentId) => {
    try {
      await axios.post(`${API}/agent/content/approve`, { content_id: contentId });
      toast.success('Content approved!');
      fetchContent();
    } catch (e) {
      toast.error('Failed to approve content');
    }
  };

  return (
    <div className="py-10 space-y-10 max-w-6xl mx-auto" data-testid="content-agent-page">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-8 rounded-3xl premium-glass">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-[var(--accent-green)]/10 rounded-2xl flex items-center justify-center border border-[var(--accent-green)]/20 shadow-[0_0_20px_rgba(0,255,148,0.1)]">
            <Share2 className="w-8 h-8 text-[var(--accent-green)]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading font-bold text-4xl tracking-tight text-white" data-testid="page-title">
              Content Strategist
            </h1>
            <p className="font-mono text-xs text-gray-500 uppercase tracking-[0.3em] mt-1" data-testid="page-subtitle">
              Neural Media & Promotion Engine
            </p>
          </div>
        </div>
        
        <div className={`px-6 py-2 rounded-full border flex items-center space-x-3 transition-all ${isGenerating ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${isGenerating ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
            {isGenerating ? 'Generating Assets' : 'Unit Ready'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Control Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="premium-glass bg-transparent border-white/5 overflow-hidden h-full">
            <CardHeader className="bg-white/[0.03] border-b border-white/5 py-4">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-[var(--accent-green)]" />
                <CardTitle className="font-heading text-sm uppercase tracking-widest text-white">Input Buffer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500 ml-1">Context Reference</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your event parameters..." 
                  className="bg-black/40 border-white/10 text-white min-h-[200px] rounded-xl focus:border-[var(--accent-green)]/40 transition-all font-body text-base leading-relaxed"
                  data-testid="event-description-input"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-[var(--accent-green)] text-black font-subheading font-bold uppercase tracking-[0.2em] hover:bg-[#00E080] h-16 rounded-xl text-lg shadow-[0_10px_30px_rgba(0,255,148,0.15)] group transition-all"
                data-testid="generate-button"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-6 h-6 mr-3 animate-spin" />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                    Generate Assets
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Output Matrix */}
        <div className="lg:col-span-7 space-y-8">
          {generatedContent ? (
            <Card className="premium-glass bg-transparent border-[var(--primary)]/30 overflow-hidden animate-in-fade">
               <CardHeader className="bg-[var(--primary)]/5 border-b border-[var(--primary)]/20 py-4 flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[var(--primary)]" />
                  <CardTitle className="font-heading text-sm uppercase tracking-widest text-white">Generated Content Output</CardTitle>
                </div>
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-widest">Verification Required</span>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8 text-white">
                <div className="space-y-4">
                  <h3 className="font-heading text-xs uppercase tracking-widest text-[var(--primary)]">Macro Promotional Copy</h3>
                  <div className="bg-white/[0.03] p-6 border border-white/10 rounded-2xl">
                    <p className="font-body text-gray-300 leading-relaxed whitespace-pre-wrap selection:bg-[var(--primary)]/20">
                      {generatedContent.promo_copy}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-heading text-xs uppercase tracking-widest text-[var(--primary)]">Micro-Content (Socials)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                    {generatedContent.social_posts?.map((post, index) => (
                      <div
                        key={index}
                        className="premium-glass bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:border-white/20 transition-all group"
                        data-testid={`social-post-${index}`}
                      >
                        <div className="flex items-center justify-between mb-4 text-white">
                          <span className="font-mono text-[10px] text-[var(--primary)] uppercase font-bold tracking-widest" data-testid={`post-platform-${index}`}>
                            {post.platform}
                          </span>
                          <div className="flex items-center space-x-3 text-white">
                            <div className="flex items-center space-x-1 text-[9px] font-mono text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{post.optimal_time}:00</span>
                            </div>
                            <div className="px-2 py-0.5 bg-[var(--accent-green)]/10 text-[var(--accent-green)] border border-[var(--accent-green)]/20 rounded text-[9px] font-mono font-bold">
                              {post.engagement_score}/10
                            </div>
                          </div>
                        </div>
                        <p className="font-body text-xs text-gray-400 leading-relaxed group-hover:text-gray-200 transition-colors" data-testid={`post-content-${index}`}>
                          {post.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-4 border-t border-white/10 text-white">
                   <Button
                    onClick={() => handleApprove(generatedContent.content_id)}
                    className="flex-1 bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30 text-[var(--accent-green)] hover:bg-[var(--accent-green)]/20 h-14 rounded-xl font-subheading font-bold uppercase tracking-widest"
                    data-testid="approve-button"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Confirm Asset
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-white/10 text-white hover:bg-white/5 h-14 rounded-xl font-subheading font-bold uppercase tracking-widest"
                    data-testid="edit-button"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modify
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
             <Card className="premium-glass bg-transparent border-white/5 h-full opacity-40 grayscale flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6">
                  <FileText className="w-10 h-10 text-gray-600" />
                </div>
                <p className="font-body text-gray-500 max-w-xs">Waiting for synthesized intelligence to generate assets.</p>
             </Card>
          )}
        </div>
      </div>

      {/* History Matrix */}
      {contentList.length > 0 && (
        <Card className="premium-glass bg-transparent border-white/5 overflow-hidden">
           <CardHeader className="bg-white/[0.03] border-b border-white/5 py-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <CardTitle className="font-heading text-sm uppercase tracking-widest text-white">Historical Logs</CardTitle>
              </div>
            </CardHeader>
           <CardContent className="p-8 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-white">
              {contentList.map((content, index) => (
                <div key={index} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-[var(--primary)]/30 transition-all text-white" data-testid={`history-item-${index}`}>
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-white font-bold" data-testid={`history-id-${index}`}>REF_{content.content_id?.split('_')[1] || content.content_id}</span>
                    <p className="font-mono text-[8px] text-gray-600 uppercase tracking-widest" data-testid={`history-date-${index}`}>
                      {new Date(content.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-widest ${
                      content.status === 'approved'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                    {content.status}
                  </div>
                </div>
              ))}
            </div>
           </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentAgent;
