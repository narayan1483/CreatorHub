import { useState } from 'react';
import {
  Sparkles,
  FileText,
  Flame,
  Hash,
  ShoppingBag,
  Megaphone,
  Copy,
  Check,
  RefreshCw,
  Info,
} from 'lucide-react';
import type {
  AITone,
  ContentFormatType,
  AIContentGeneratorInput,
  AIContentDraft,
} from '../types/ai';
import { aiService } from '../services/aiService';
import { useToast } from '../context/ToastContext';
import './AIContentStudioPage.css';

export function AIContentStudioPage() {
  const [formatType, setFormatType] = useState<ContentFormatType>('caption');
  const [topic, setTopic] = useState('Fullstack AI Apps with React & Node.js');
  const [targetAudience, setTargetAudience] = useState('Junior & Mid-level Developers');
  const [tone, setTone] = useState<AITone>('persuasive');
  const [language, setLanguage] = useState('English');
  const [callToAction, setCallToAction] = useState('Comment "AI" to get the complete roadmap in your DMs');

  const [generatedDraft, setGeneratedDraft] = useState<string>(
    `If you are serious about leveling up, pay close attention to this ⚡\n\nWhen it comes to Fullstack AI Apps with React & Node.js, most Junior & Mid-level Developers get stuck trying to do everything at once.\n\nHere are 3 rules that will save you months of trial & error:\n\n1️⃣ Focus on high-leverage fundamentals first.\n2️⃣ Automate the repetitive tasks so you can focus on creative engineering.\n3️⃣ Always ship real projects rather than staying trapped in tutorial hell.\n\nDrop a comment with "FULLSTACK" and I will send you the full breakdown in your DMs!\n\n🔗 Link in bio to explore the complete resource library.`
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recentDrafts, setRecentDrafts] = useState<AIContentDraft[]>([
    {
      id: 'd-1',
      formatType: 'caption',
      topic: 'Fullstack AI Apps with React & Node.js',
      targetAudience: 'Junior & Mid-level Developers',
      tone: 'persuasive',
      language: 'English',
      callToAction: 'Comment "AI" to get the complete roadmap in your DMs',
      generatedText: generatedDraft,
      createdAt: '10 min ago',
    },
  ]);

  const { showToast } = useToast();

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      showToast('Please specify a topic for the content generator', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const input: AIContentGeneratorInput = {
        topic,
        targetAudience,
        tone,
        language,
        callToAction,
        formatType,
      };

      const result = await aiService.generateContentDraft(input);
      setGeneratedDraft(result);

      const newDraft: AIContentDraft = {
        id: `draft-${Date.now()}`,
        ...input,
        generatedText: result,
        createdAt: 'Just now',
      };
      setRecentDrafts((prev) => [newDraft, ...prev.slice(0, 4)]);
      showToast('Content draft generated successfully! ✨', 'success');
    } catch {
      showToast('Failed to generate draft', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(generatedDraft);
    setCopied(true);
    showToast('Draft copied to clipboard! 📋', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatOptions: { id: ContentFormatType; label: string; icon: any }[] = [
    { id: 'caption', label: 'Reel Caption', icon: FileText },
    { id: 'hooks', label: 'Viral Hooks', icon: Flame },
    { id: 'hashtags', label: 'Hashtag Set', icon: Hash },
    { id: 'product_description', label: 'Product Copy', icon: ShoppingBag },
    { id: 'promo_message', label: 'Broadcast DM', icon: Megaphone },
  ];

  return (
    <div className="content-studio-page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Sparkles size={14} /> AI Content Engine
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 2 }}>
            AI Content Studio
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Draft viral Instagram captions, hooks, product landing descriptions, and promotional DMs grounded in creator psychology.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              padding: '4px 10px',
              borderRadius: 8,
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            ⚡ Fast Local Engine
          </span>
        </div>
      </div>

      {/* Main Split: Form & Output */}
      <div className="studio-split-layout">
        {/* Left Card: Input Parameters */}
        <form onSubmit={handleGenerate} className="studio-form-card">
          <div>
            <label className="form-label">Content Format</label>
            <div className="format-tabs-grid">
              {formatOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`format-tab-btn ${formatType === opt.id ? 'format-tab-btn--active' : ''}`}
                  onClick={() => setFormatType(opt.id)}
                >
                  <opt.icon size={15} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Topic / Offer *</label>
            <input
              type="text"
              required
              className="form-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 5 Mistakes in React 19, Free Python CheatSheet"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Audience</label>
            <input
              type="text"
              className="form-input"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Freelancers, Beginner Designers, CS Students"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Tone of Voice</label>
              <select
                className="form-input"
                value={tone}
                onChange={(e) => setTone(e.target.value as AITone)}
              >
                <option value="friendly">Friendly & Warm</option>
                <option value="professional">Professional</option>
                <option value="persuasive">High-Converting Persuasive</option>
                <option value="concise">Concise & Direct</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Language</label>
              <select
                className="form-input"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="Hinglish">Hinglish (Hindi + Eng)</option>
                <option value="Hindi">Hindi (Devanagari)</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Call to Action (CTA)</label>
            <input
              type="text"
              className="form-input"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
              placeholder="e.g. Comment CODE to get the GitHub link in DM"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isGenerating || !topic.trim()}
            style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }}
          >
            <Sparkles size={16} className={isGenerating ? 'animate-spin' : ''} />
            <span>{isGenerating ? 'Drafting with AI...' : 'Generate Content Draft'}</span>
          </button>
        </form>

        {/* Right Card: Generated Output & Editor */}
        <div className="studio-output-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-emerald">● Generated Draft</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                {formatType.replace('_', ' ')} • {tone}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-sm btn-secondary"
                type="button"
                disabled={isGenerating}
                onClick={() => handleGenerate()}
              >
                <RefreshCw size={13} className={isGenerating ? 'animate-spin' : ''} />
                <span>Regenerate</span>
              </button>

              <button className="btn btn-sm btn-primary" type="button" onClick={handleCopy}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy Draft'}</span>
              </button>
            </div>
          </div>

          {/* Editable Draft Textarea */}
          <textarea
            className="generated-draft-textarea"
            value={generatedDraft}
            onChange={(e) => setGeneratedDraft(e.target.value)}
            placeholder="Generated draft will appear here..."
          />

          {/* Publishing Policy Notice */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: 'rgba(251, 191, 36, 0.08)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 11,
              color: 'var(--color-text-secondary)',
            }}
          >
            <Info size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
            <span>
              <strong>Draft Mode Disclaimer:</strong> This text is generated as an editorial draft for your creator workflow. It has <u>not</u> been published automatically to your Instagram or social accounts. Copy and review before scheduling.
            </span>
          </div>

          {/* Recent Drafts Carousel / Chips */}
          {recentDrafts.length > 1 && (
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 6 }}>
                Recent Draft History
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {recentDrafts.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setGeneratedDraft(d.generatedText);
                      setTopic(d.topic);
                      setFormatType(d.formatType);
                      showToast('Loaded past draft', 'info');
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border)',
                      fontSize: 11,
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {d.topic.slice(0, 24)}... ({d.createdAt})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
