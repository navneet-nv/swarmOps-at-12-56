import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Share2, Sparkles, ThumbsUp, ThumbsDown, Edit } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

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
    <div className="p-8 space-y-8" data-testid="content-agent-page">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Share2 className="w-8 h-8 text-[#D4A017]" strokeWidth={1.5} />
        <div>
          <h1 className="font-heading font-bold text-3xl tracking-wide text-white" data-testid="page-title">
            Content Strategist Agent
          </h1>
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest" data-testid="page-subtitle">
            AI-Powered Promotional Content Generation
          </p>
        </div>
      </div>

      {/* Agent Status */}
      <div className="bg-[#101010] border border-white/5 p-4 rounded-sm flex items-center justify-between" data-testid="agent-status-bar">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isGenerating ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} data-testid="status-indicator" />
          <span className="font-mono text-sm text-gray-400" data-testid="status-text">
            {isGenerating ? 'Agent is thinking...' : 'Agent ready'}
          </span>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-[#101010] border border-white/5 p-6 rounded-sm space-y-4" data-testid="input-section">
        <label className="font-subheading font-bold text-xl uppercase tracking-wider text-[#D4A017]" data-testid="input-label">
          Event Description
        </label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your event (e.g., 'We're hosting a 48-hour AI hackathon with 500 participants...')" 
          className="bg-black/50 border border-white/10 text-white min-h-[120px] font-mono text-sm"
          data-testid="event-description-input"
        />
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-[#D4A017] text-black font-subheading font-bold uppercase tracking-wider hover:bg-[#F0B020] h-12 px-8"
          data-testid="generate-button"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>
      </div>

      {/* Generated Content */}
      {generatedContent && (
        <div className="bg-[#101010] border border-[#D4A017] p-6 rounded-sm space-y-6" data-testid="generated-content-card">
          <div className="flex items-center justify-between">
            <h2 className="font-subheading font-bold text-xl uppercase tracking-wider text-[#D4A017]" data-testid="promo-copy-title">
              Promotional Copy
            </h2>
            <span
              className="font-mono text-xs px-2 py-1 uppercase border bg-amber-500/10 text-amber-400 border-amber-500/20"
              data-testid="approval-status"
            >
              Pending Approval
            </span>
          </div>
          <div className="bg-black/30 p-4 border border-white/5 rounded-sm" data-testid="promo-copy-content">
            <p className="font-body text-base text-gray-300 leading-relaxed whitespace-pre-wrap">
              {generatedContent.promo_copy}
            </p>
          </div>

          {/* Social Media Posts */}
          <div>
            <h3 className="font-subheading font-bold text-lg uppercase tracking-wider text-white/80 mb-4" data-testid="social-posts-title">
              Social Media Posts
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {generatedContent.social_posts?.map((post, index) => (
                <div
                  key={index}
                  className="bg-[#121212] border border-white/10 p-4 rounded-sm hover:border-[#D4A017]/30"
                  data-testid={`social-post-${index}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-[#D4A017] uppercase" data-testid={`post-platform-${index}`}>
                      {post.platform}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-gray-500" data-testid={`post-time-${index}`}>
                        {post.optimal_time}:00
                      </span>
                      <span
                        className="font-mono text-xs px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-sm"
                        data-testid={`post-score-${index}`}
                      >
                        Score: {post.engagement_score}/10
                      </span>
                    </div>
                  </div>
                  <p className="font-body text-sm text-gray-400 leading-relaxed" data-testid={`post-content-${index}`}>
                    {post.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
            <Button
              onClick={() => handleApprove(generatedContent.content_id)}
              className="bg-green-900/20 border border-green-500/50 text-green-500 hover:bg-green-900/40 h-10 px-6"
              data-testid="approve-button"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5 h-10 px-6"
              data-testid="edit-button"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              className="border-red-500/50 text-red-500 hover:bg-red-900/20 h-10 px-6"
              data-testid="reject-button"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      )}

      {/* Content History */}
      {contentList.length > 0 && (
        <div className="bg-[#101010] border border-white/5 p-6 rounded-sm" data-testid="content-history-section">
          <h2 className="font-subheading font-bold text-xl uppercase tracking-wider text-[#D4A017] mb-4" data-testid="history-title">
            Content History
          </h2>
          <div className="space-y-3">
            {contentList.map((content, index) => (
              <div key={index} className="bg-[#121212] border border-white/10 p-4 rounded-sm flex items-center justify-between" data-testid={`history-item-${index}`}>
                <div>
                  <span className="font-mono text-sm text-white" data-testid={`history-id-${index}`}>{content.content_id}</span>
                  <p className="font-mono text-xs text-gray-500" data-testid={`history-date-${index}`}>{new Date(content.created_at).toLocaleString()}</p>
                </div>
                <span
                  className={`font-mono text-xs px-2 py-1 uppercase border ${
                    content.status === 'approved'
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                  data-testid={`history-status-${index}`}
                >
                  {content.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentAgent;
