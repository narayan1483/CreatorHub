import React, { useState } from 'react';
import {
  MessageCircle,
  Sparkles,
  Copy,
  Check,
  Send,
  RefreshCw,
  ThumbsDown,
  Info,
  Clock,
  Instagram,
} from 'lucide-react';
import type { AIReplyConversation, AITone } from '../../types/ai';
import { useToast } from '../../context/ToastContext';
import './AIReplyAssistant.css';

interface AIReplyAssistantProps {
  conversations: AIReplyConversation[];
  onApprove: (id: string, replyText: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onRegenerate: (commentText: string, tone: AITone) => Promise<string>;
}

export const AIReplyAssistant: React.FC<AIReplyAssistantProps> = ({
  conversations,
  onApprove,
  onReject,
  onRegenerate,
}) => {
  const [selectedId, setSelectedId] = useState<string>(conversations[0]?.id || '');
  const [activeTone, setActiveTone] = useState<AITone>('friendly');
  const [currentReplyText, setCurrentReplyText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const { showToast } = useToast();

  const selectedConv = conversations.find((c) => c.id === selectedId) || conversations[0];

  // Sync draft reply text whenever conversation or tone changes
  React.useEffect(() => {
    if (selectedConv) {
      setCurrentReplyText(selectedConv.suggestedReplies[activeTone] || selectedConv.customReply);
    }
  }, [selectedConv, activeTone]);

  if (!selectedConv) {
    return (
      <div className="empty-state">
        <MessageCircle size={36} className="text-secondary" />
        <h3>No conversations in reply queue</h3>
      </div>
    );
  }

  const handleToneChange = (tone: AITone) => {
    setActiveTone(tone);
    if (selectedConv.suggestedReplies[tone]) {
      setCurrentReplyText(selectedConv.suggestedReplies[tone]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(currentReplyText);
    setCopied(true);
    showToast('Reply text copied to clipboard! 📋', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newText = await onRegenerate(selectedConv.lastComment, activeTone);
      setCurrentReplyText(newText);
      showToast(`Regenerated ${activeTone} suggestion with simulated AI ✨`, 'success');
    } catch {
      showToast('Failed to regenerate reply', 'error');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleApproveSend = async () => {
    try {
      await onApprove(selectedConv.id, currentReplyText);
      showToast(`Approved & queued simulated DM response to ${selectedConv.userHandle} 🚀`, 'success');
    } catch {
      showToast('Failed to approve reply', 'error');
    }
  };

  const handleReject = async () => {
    try {
      await onReject(selectedConv.id);
      showToast(`Dismissed comment from ${selectedConv.userHandle}`, 'info');
    } catch {
      showToast('Failed to dismiss comment', 'error');
    }
  };

  return (
    <div className="ai-reply-assistant">
      {/* Left Column: Comments Stream */}
      <div className="conversations-list-col">
        <div className="conversations-header">
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Comment Inquiries
            </h3>
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              {conversations.length} items awaiting review
            </span>
          </div>

          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              background: 'rgba(251, 191, 36, 0.15)',
              color: '#fbbf24',
              padding: '2px 8px',
              borderRadius: 6,
            }}
          >
            DEMO DATA
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {conversations.map((conv) => {
            const isSel = conv.id === selectedConv.id;
            return (
              <div
                key={conv.id}
                className={`conversation-card ${isSel ? 'conversation-card--selected' : ''}`}
                onClick={() => setSelectedId(conv.id)}
              >
                <div className="conversation-user-row">
                  <div className="user-info-left">
                    <img src={conv.userAvatar} alt="" className="user-avatar-img" />
                    <div>
                      <strong style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                        {conv.userHandle}
                      </strong>
                      <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} /> {conv.commentTimestamp}
                      </div>
                    </div>
                  </div>

                  <span
                    className="badge badge-indigo"
                    style={{ fontSize: 10, textTransform: 'capitalize' }}
                  >
                    {conv.detectedIntent.replace('_', ' ')}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  "{conv.lastComment}"
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: '#38bdf8' }}>
                  <span>{conv.postTitle}</span>
                  {conv.status === 'approved' && (
                    <span style={{ color: '#34d399', fontWeight: 700 }}>● Approved</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: AI Reply Composer */}
      <div className="reply-editor-pane">
        {/* Post & Comment Context Banner */}
        <div
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: '1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
          }}
        >
          <img
            src={selectedConv.postThumbnail}
            alt=""
            style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover' }}
          />

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Instagram size={14} style={{ color: '#e1306c' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {selectedConv.userHandle} commented on "{selectedConv.postTitle}"
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic', lineHeight: 1.4 }}>
              "{selectedConv.lastComment}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, fontSize: 11 }}>
              <span style={{ color: '#38bdf8' }}>
                Intent: <strong>{selectedConv.detectedIntent.replace('_', ' ')}</strong>
              </span>
              <span style={{ color: '#34d399' }}>
                AI Confidence: <strong>{Math.round(selectedConv.confidence * 100)}%</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Tone Selector */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Select Response Tone:
            </label>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
              Click to preview tone variation
            </span>
          </div>

          <div className="tone-selector-row">
            {(['friendly', 'professional', 'persuasive', 'concise'] as AITone[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`tone-chip-btn ${activeTone === t ? 'tone-chip-btn--active' : ''}`}
                onClick={() => handleToneChange(t)}
              >
                <Sparkles size={12} />
                <span style={{ textTransform: 'capitalize' }}>{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Editable Reply Textarea */}
        <div className="reply-textarea-wrap">
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6, display: 'block' }}>
            Suggested Direct Message (Fully Editable):
          </label>
          <textarea
            className="reply-textarea"
            value={currentReplyText}
            onChange={(e) => setCurrentReplyText(e.target.value)}
            placeholder="Type or edit reply text here..."
          />
        </div>

        {/* Action Buttons */}
        <div className="reply-actions-row">
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-sm btn-secondary"
              type="button"
              disabled={isRegenerating}
              onClick={handleRegenerate}
            >
              <RefreshCw size={13} className={isRegenerating ? 'animate-spin' : ''} />
              <span>{isRegenerating ? 'Generating...' : 'Regenerate'}</span>
            </button>

            <button className="btn btn-sm btn-secondary" type="button" onClick={handleCopy}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-sm btn-ghost"
              type="button"
              onClick={handleReject}
              style={{ color: '#ef4444' }}
            >
              <ThumbsDown size={13} />
              <span>Dismiss</span>
            </button>

            <button
              className="btn btn-sm btn-primary"
              type="button"
              onClick={handleApproveSend}
            >
              <Send size={13} />
              <span>Approve & Dispatch DM</span>
            </button>
          </div>
        </div>

        {/* Mock/Demo Data Disclaimer */}
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11,
            color: 'var(--color-text-secondary)',
          }}
        >
          <Info size={14} style={{ color: '#38bdf8', flexShrink: 0 }} />
          <span>
            <strong>Simulated AutoDM Preview:</strong> Responses are generated locally via the CreatorHub AI assistant service for testing. No live Meta API calls or real DMs are dispatched until connected in production settings.
          </span>
        </div>
      </div>
    </div>
  );
};
