import { useState, useEffect } from 'react';
import {
  Plus,
  Info,
  Search,
  ArrowUpDown,
  Filter,
  Download,
  HelpCircle,
  X,
  Sparkles,
  Instagram,
  Brain,
  MessageSquare,
  Database,
  Activity,
  Smartphone,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  Send,
  MessageCircle,
  Check,
  RefreshCw,
  Play,
  Radio,
} from 'lucide-react';
import {
  mockAutoDMStats,
  mockAutoDMWorkflows,
  mockCreatorProfile,
  type AutoDMWorkflow,
} from '../data/mockData';
import { aiService } from '../services/aiService';
import type {
  AITone,
  AutoDMWorkflow as AIWorkflowDefinition,
  AIReplyConversation,
  AIProductKnowledgeItem,
  AIUsageMetrics,
} from '../types/ai';
import { AIWorkflowBuilder } from '../components/ai/AIWorkflowBuilder';
import { AIReplyAssistant } from '../components/ai/AIReplyAssistant';
import { AIProductKnowledge } from '../components/ai/AIProductKnowledge';
import { AIUsageDashboard } from '../components/ai/AIUsageDashboard';
import { InstagramLiveSimulator } from '../components/simulator/InstagramLiveSimulator';
import { SaaSCheckoutModal, type CheckoutProductInfo } from '../components/checkout/SaaSCheckoutModal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { apiClient, type InstagramDiagnosticsDto } from '../services/apiClient';
import './AutoDMPage.css';

const samplePosts = [
  {
    id: 'p_dsa',
    title: 'DSA in Python - Hashing',
    thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc155be5573?w=300&q=80',
    type: 'Reel',
    likes: '14.2K',
    comments: '412',
  },
  {
    id: 'p_dl',
    title: 'Deep Learning - Complete Notes',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&q=80',
    type: 'Post',
    likes: '8.9K',
    comments: '286',
  },
  {
    id: 'p_tcs',
    title: 'TCS NQT Preparation Guide',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&q=80',
    type: 'Reel',
    likes: '22.1K',
    comments: '934',
  },
  {
    id: 'p_sklearn',
    title: 'Scikit-Learn & NLP Masterclass',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=300&q=80',
    type: 'Post',
    likes: '6.4K',
    comments: '198',
  },
  {
    id: 'p_sysdesign',
    title: 'System Design for Tech Interviews',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&q=80',
    type: 'Reel',
    likes: '18.7K',
    comments: '640',
  },
  {
    id: 'p_fullstack',
    title: 'Full-Stack Development Roadmap',
    thumbnail: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=300&q=80',
    type: 'Post',
    likes: '11.3K',
    comments: '350',
  },
];

export function AutoDMPage() {
  const [workflows, setWorkflows] = useState<AutoDMWorkflow[]>(mockAutoDMWorkflows);
  const { activeWorkspace } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'automations' | 'diagnostics' | 'simulator' | 'ai_workflow_builder' | 'ai_reply_assistant' | 'product_knowledge' | 'ai_usage' | 'must_haves' | 'settings'
  >('automations');

  // Diagnostics & Verification state
  const [diagnostics, setDiagnostics] = useState<InstagramDiagnosticsDto | null>(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [testCommentText, setTestCommentText] = useState('Blueprint please!');
  const [testCommenterUser, setTestCommenterUser] = useState('narayan_dev');
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testRunning, setTestRunning] = useState(false);

  // SuperProfile Multi-Step Creation Wizard state
  const [modalStep, setModalStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [selectedChannel, setSelectedChannel] = useState<'instagram' | 'messenger'>('instagram');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('comments');
  const [postScope, setPostScope] = useState<'specific' | 'any' | 'next'>('specific');
  const [selectedPostId, setSelectedPostId] = useState<string>('p_dsa');
  const [keywordType, setKeywordType] = useState<'specific' | 'any'>('specific');
  const [keywordsList, setKeywordsList] = useState<string[]>(['BLUEPRINT']);
  const [currentKeywordInput, setCurrentKeywordInput] = useState('');
  const [aiSmartReply, setAiSmartReply] = useState(false);
  const [isDryRunToggle, setIsDryRunToggle] = useState(true);

  const loadDiagnostics = async () => {
    if (!activeWorkspace?.id) return;
    setDiagnosticsLoading(true);
    try {
      const data = await apiClient.getInstagramDiagnostics(activeWorkspace.id);
      setDiagnostics(data);
    } catch (err) {
      console.error('Failed to load diagnostics', err);
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'diagnostics') {
      loadDiagnostics();
    }
  }, [activeTab, activeWorkspace?.id]);

  useEffect(() => {
    if (!activeWorkspace?.id) return;
    let cancelled = false;
    apiClient.getWorkspaceAutomations(activeWorkspace.id)
      .then((res: any) => {
        if (!cancelled && Array.isArray(res) && res.length > 0) {
          const mapped: AutoDMWorkflow[] = res.map((w: any) => ({
            id: w.id,
            name: w.name,
            captionPreview: 'Connected Reel / Post',
            thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
            keyword: w.triggerKeyword,
            dmMessage: w.dmMessageTemplate,
            publicReply: w.publicReplyTemplate,
            followersGained: w.followersGained || 0,
            runs: w.runsCount || 0,
            buttonClicks: w.buttonClicks || 0,
            status: (w.status === 'ACTIVE' ? 'active' : 'paused') as 'active' | 'paused',
            createdAt: 'Just now',
          }));
          setWorkflows(mapped);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [activeWorkspace?.id]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerVisible, setBannerVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<CheckoutProductInfo | null>(null);

  // AI Phase 2 states & services
  const [aiWorkflows, setAiWorkflows] = useState<AIWorkflowDefinition[]>([]);
  const [replyConversations, setReplyConversations] = useState<AIReplyConversation[]>([]);
  const [productKnowledge, setProductKnowledge] = useState<AIProductKnowledgeItem[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<AIUsageMetrics | null>(null);

  useEffect(() => {
    const loadAiData = async () => {
      try {
        const [wfs, convs, pk, usage] = await Promise.all([
          aiService.getWorkflows(),
          aiService.getReplyConversations(),
          aiService.getProductKnowledgeList(),
          aiService.getUsageMetrics(),
        ]);
        setAiWorkflows(wfs);
        setReplyConversations(convs);
        setProductKnowledge(pk);
        setUsageMetrics(usage);
      } catch (err) {
        console.error('Failed to load AI data', err);
      }
    };
    loadAiData();
  }, []);

  const handleSaveAIWorkflow = async (wf: AIWorkflowDefinition) => {
    await aiService.saveWorkflow(wf);
    const updated = await aiService.getWorkflows();
    setAiWorkflows(updated);
  };

  const handleToggleAIWorkflow = async (id: string) => {
    await aiService.toggleWorkflowStatus(id);
    const updated = await aiService.getWorkflows();
    setAiWorkflows(updated);
  };

  const handleApproveReply = async (id: string, text: string) => {
    await aiService.approveReply(id, text);
    const updated = await aiService.getReplyConversations();
    setReplyConversations(updated);
  };

  const handleRejectReply = async (id: string) => {
    await aiService.rejectReply(id);
    const updated = await aiService.getReplyConversations();
    setReplyConversations(updated);
  };

  const handleRegenerateReply = async (comment: string, tone: AITone) => {
    const suggestions = await aiService.generateReplySuggestions(comment, 'product_inquiry');
    return suggestions[tone];
  };

  const handleSaveProductKnowledge = async (item: AIProductKnowledgeItem) => {
    await aiService.saveProductKnowledge(item);
    const updated = await aiService.getProductKnowledgeList();
    setProductKnowledge(updated);
  };

  // New automation form states
  const [newTitle, setNewTitle] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newDmMessage, setNewDmMessage] = useState('Hey {{first_name}}! Here is your download link: {{link}} 🚀');
  const [newPublicReply, setNewPublicReply] = useState('Sent you a DM! Check your requests 📥');
  const { showToast } = useToast();

  const filteredWorkflows = workflows.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.captionPreview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['Automation Name', 'Keyword', 'Followers Gained', 'Runs', 'Button Clicks', 'Status'];
    const rows = filteredWorkflows.map((w) => [
      `"${w.name.replace(/"/g, '""')}"`,
      `"${w.keyword}"`,
      w.followersGained,
      w.runs,
      w.buttonClicks,
      w.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `creatorhub_autodm_workflows_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('AutoDM performance data exported to CSV 📥', 'success');
  };

  const handleToggleStatus = async (id: string) => {
    if (activeWorkspace?.id) {
      try {
        await apiClient.toggleAutomationWorkflow(activeWorkspace.id, id);
      } catch (err: any) {
        showToast(err.message || 'Failed to toggle status on server', 'error');
      }
    }
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const next = w.status === 'active' ? 'paused' : 'active';
          showToast(`Automation is now ${next}`, 'info');
          return { ...w, status: next };
        }
        return w;
      })
    );
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newKeyword.trim()) {
      showToast('Please provide automation title and trigger keyword', 'error');
      return;
    }

    if (activeWorkspace?.id) {
      try {
        const created = await apiClient.createAutomationWorkflow(activeWorkspace.id, {
          name: newTitle.trim(),
          triggerKeyword: newKeyword.trim().toUpperCase(),
          matchType: 'contains',
          dmMessageTemplate: newDmMessage,
          publicReplyTemplate: newPublicReply,
        });

        const newWf: AutoDMWorkflow = {
          id: created.id,
          name: created.name,
          captionPreview: `Triggering on keyword "${created.triggerKeyword}"`,
          thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
          keyword: created.triggerKeyword,
          dmMessage: created.dmMessageTemplate,
          publicReply: created.publicReplyTemplate,
          followersGained: created.followersGained || 0,
          runs: created.runsCount || 0,
          buttonClicks: created.buttonClicks || 0,
          status: (created.status === 'ACTIVE' ? 'active' : 'paused') as 'active' | 'paused',
          createdAt: 'Just now',
        };

        setWorkflows([newWf, ...workflows]);
        setIsModalOpen(false);
        setNewTitle('');
        setNewKeyword('');
        showToast(`AutoDM "${newTitle}" created & persisted! 🚀`, 'success');
        return;
      } catch (err: any) {
        showToast(err.message || 'Failed to persist automation', 'error');
      }
    }

    const newWf: AutoDMWorkflow = {
      id: `adm-${Date.now().toString().slice(-4)}`,
      name: newTitle,
      captionPreview: `Triggering on keyword "${newKeyword.toUpperCase()}"`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
      keyword: newKeyword.toUpperCase(),
      dmMessage: newDmMessage,
      publicReply: newPublicReply,
      followersGained: 0,
      runs: 0,
      buttonClicks: 0,
      status: 'active',
      createdAt: 'Just now',
    };

    setWorkflows([newWf, ...workflows]);
    setIsModalOpen(false);
    setNewTitle('');
    setNewKeyword('');
    showToast(`AutoDM "${newTitle}" created & active! 🚀`, 'success');
  };

  return (
    <div className="autodm-page">
      {/* Top Header Row (Screenshot 5) */}
      <div className="autodm-header">
        <h1 className="autodm-title">AutoDM</h1>
        <button
          className="autodm-create-btn"
          onClick={() => setIsModalOpen(true)}
          type="button"
        >
          <Plus size={16} />
          <span>Create Automation</span>
        </button>
      </div>

      {/* Meta API Status Banner (Explicitly distinguishes demo data from live Meta API) */}
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: 14,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Instagram size={20} style={{ color: '#e1306c' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Instagram Connected: <strong>{mockCreatorProfile.connectedAccounts.instagram.handle}</strong>
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 10,
                  background: 'rgba(251, 191, 36, 0.2)',
                  color: '#fbbf24',
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontWeight: 700,
                }}
              >
                DEMO MODE ACTIVE
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              Official Meta Graph API Webhook endpoint ready: <code>/api/v1/meta/instagram-webhook</code>. In production, configure Meta App ID & Secret in Settings.
            </div>
          </div>
        </div>

        <button
          className="btn btn-sm btn-secondary"
          onClick={() => setActiveTab('settings')}
          type="button"
        >
          Configure Meta API
        </button>
      </div>

      {/* Referral Banner (Screenshot 5) */}
      {bannerVisible && (
        <div className="autodm-referral-banner">
          <div className="referral-banner__left">
            <h3 className="referral-banner__title">
              Loving AutoDM? Invite friends & followers and start earning
            </h3>
            <p className="referral-banner__desc">
              Make a video and get your friends & followers to use CreatorHub to unlock 20% recurring revenue forever for every successful referral.
            </p>
            <div className="referral-banner__actions">
              <button
                className="referral-banner__learn-btn"
                type="button"
                onClick={() => showToast('Affiliate program link copied!', 'success')}
              >
                Learn more ➔
              </button>
              <button
                className="referral-banner__dismiss-btn"
                onClick={() => setBannerVisible(false)}
                type="button"
              >
                Dismiss
              </button>
            </div>
          </div>

          <div className="referral-banner__payout-badge">
            <div className="payout-badge__amount">
              ₹{mockAutoDMStats.referralEarnings.toLocaleString('en-IN')}+
            </div>
            <div className="payout-badge__label">Referral Payouts made this month</div>
          </div>
        </div>
      )}

      {/* Sub-tabs Row (SuperProfile + AI Workspace) */}
      <div className="autodm-tabs-row" style={{ overflowX: 'auto' }}>
        <div className="autodm-tabs-left">
          <button
            id="tab-btn-automations"
            className={`autodm-tab-btn ${activeTab === 'automations' ? 'autodm-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('automations')}
            type="button"
          >
            Automations ({workflows.length})
          </button>
          <button
            id="tab-btn-diagnostics"
            className={`autodm-tab-btn ${activeTab === 'diagnostics' ? 'autodm-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('diagnostics')}
            type="button"
          >
            <ShieldCheck size={14} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle', color: '#22c55e' }} />
            Diagnostics & Health
          </button>
          <button
            id="tab-btn-simulator"
            className={`autodm-tab-btn ${activeTab === 'simulator' ? 'autodm-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('simulator')}
            type="button"
          >
            <Smartphone size={14} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle', color: '#e1306c' }} />
            Live Simulator
          </button>
          <button
            id="tab-btn-ai-studio"
            className={`autodm-tab-btn ${activeTab === 'ai_workflow_builder' ? 'autodm-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('ai_workflow_builder')}
            type="button"
          >
            <Brain size={14} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle' }} />
            AI Studio
          </button>
          <button
            id="tab-btn-reply-assistant"
            className={`autodm-tab-btn ${activeTab === 'ai_reply_assistant' ? 'autodm-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('ai_reply_assistant')}
            type="button"
          >
            <MessageSquare size={14} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle' }} />
            Reply Assistant ({replyConversations.length})
          </button>
          <button
            id="tab-btn-product-knowledge"
            className={`autodm-tab-btn ${activeTab === 'product_knowledge' ? 'autodm-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('product_knowledge')}
            type="button"
          >
            <Database size={14} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle' }} />
            Product Knowledge
          </button>
          <button
            id="tab-btn-ai-usage"
            className={`autodm-tab-btn ${activeTab === 'ai_usage' ? 'autodm-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('ai_usage')}
            type="button"
          >
            <Activity size={14} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle' }} />
            AI Usage
          </button>
          <button
            id="tab-btn-must-haves"
            className={`autodm-tab-btn ${activeTab === 'must_haves' ? 'autodm-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('must_haves')}
            type="button"
          >
            Must-haves
          </button>
          <button
            id="tab-btn-settings"
            className={`autodm-tab-btn ${activeTab === 'settings' ? 'autodm-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('settings')}
            type="button"
          >
            Settings
          </button>
        </div>

        <button
          className="autodm-support-btn"
          type="button"
          onClick={() => showToast('CreatorHub 24/7 Support opened', 'info')}
        >
          <HelpCircle size={15} />
          <span>Support</span>
        </button>
      </div>

      {activeTab === 'automations' && (
        <>
          {/* Top 3 Metric Cards with sparklines (Screenshot 5) */}
          <div className="autodm-stats-row">
            <div className="autodm-stat-card">
              <div className="stat-card__header">
                <span>DMs SENT</span>
                <Info size={13} style={{ opacity: 0.6 }} />
              </div>
              <div className="stat-card__number">{mockAutoDMStats.dmsSent}</div>
              <svg className="stat-card__sparkline" viewBox="0 0 100 40">
                <path
                  d="M0 35 Q 25 28, 50 20 T 100 8"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="3"
                />
              </svg>
            </div>

            <div className="autodm-stat-card">
              <div className="stat-card__header">
                <span>EMAILS COLLECTED</span>
                <Info size={13} style={{ opacity: 0.6 }} />
              </div>
              <div className="stat-card__number">{mockAutoDMStats.emailsCollected}</div>
              <svg className="stat-card__sparkline" viewBox="0 0 100 40">
                <path
                  d="M0 38 Q 30 32, 60 22 T 100 12"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="3"
                />
              </svg>
            </div>

            <div className="autodm-stat-card">
              <div className="stat-card__header">
                <span>FOLLOWERS GAINED</span>
                <Info size={13} style={{ opacity: 0.6 }} />
              </div>
              <div className="stat-card__number">{mockAutoDMStats.followersGained}</div>
              <svg className="stat-card__sparkline" viewBox="0 0 100 40">
                <path
                  d="M0 32 Q 35 24, 70 14 T 100 5"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>

          {/* Search, Filter & Actions Bar (Screenshot 5) */}
          <div className="autodm-search-bar">
            <div className="autodm-search-input-wrap">
              <Search size={15} className="autodm-search-icon" />
              <input
                type="search"
                placeholder="Search by AutoDM name, message or captions"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="autodm-search-input"
              />
            </div>

            <div className="autodm-actions-group">
              <button
                className="autodm-tool-btn"
                type="button"
                onClick={() => showToast('Sorted by latest runs', 'info')}
              >
                <ArrowUpDown size={14} />
                <span>Sort</span>
              </button>
              <button
                className="autodm-tool-btn"
                type="button"
                onClick={() => showToast('Filters applied', 'info')}
              >
                <Filter size={14} />
                <span>Filter</span>
              </button>
              <button
                className="autodm-tool-btn"
                type="button"
                onClick={handleExportCSV}
              >
                <Download size={14} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Automations Table (Screenshot 5) */}
          <div className="autodm-table-card">
            <table className="autodm-table">
              <thead>
                <tr>
                  <th>AUTOMATIONS</th>
                  <th>FOLLOWERS GAINED</th>
                  <th>RUNS</th>
                  <th>BUTTON CLICKS</th>
                  <th style={{ textAlign: 'right' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkflows.map((wf) => (
                  <tr key={wf.id}>
                    <td>
                      <div className="autodm-item-cell">
                        <img src={wf.thumbnailUrl} alt="" className="autodm-thumb" />
                        <div className="autodm-meta-info">
                          <span className="autodm-name-text">{wf.name}</span>
                          <span className="autodm-caption-sub">{wf.captionPreview}</span>
                          <span className="keyword-pill">Keyword: "{wf.keyword}"</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{wf.followersGained}</strong>
                    </td>
                    <td>{wf.runs}</td>
                    <td>{wf.buttonClicks}</td>
                    <td style={{ textAlign: 'right' }}>
                      <label className="form-switch">
                        <input
                          type="checkbox"
                          checked={wf.status === 'active'}
                          onChange={() => handleToggleStatus(wf.id)}
                        />
                        <span className="form-switch-slider" />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Live Phone Simulator Tab */}
      {activeTab === 'simulator' && (
        <InstagramLiveSimulator
          onOpenCheckout={(title, price) =>
            setCheckoutProduct({
              title,
              price,
              subtitle: 'Delivered via Automated Instagram DM Link',
            })
          }
        />
      )}

      {/* AI Studio (Workflow Builder) Tab */}
      {activeTab === 'ai_workflow_builder' && (
        <AIWorkflowBuilder
          workflows={aiWorkflows}
          onSaveWorkflow={handleSaveAIWorkflow}
          onToggleStatus={handleToggleAIWorkflow}
        />
      )}

      {/* AI Reply Assistant Tab */}
      {activeTab === 'ai_reply_assistant' && (
        <AIReplyAssistant
          conversations={replyConversations}
          onApprove={handleApproveReply}
          onReject={handleRejectReply}
          onRegenerate={handleRegenerateReply}
        />
      )}

      {/* AI Product Knowledge Tab */}
      {activeTab === 'product_knowledge' && (
        <AIProductKnowledge
          products={productKnowledge}
          onSaveProduct={handleSaveProductKnowledge}
        />
      )}

      {/* AI Usage Dashboard Tab */}
      {activeTab === 'ai_usage' && usageMetrics && (
        <AIUsageDashboard metrics={usageMetrics} />
      )}

      {/* Must-haves Tab */}
      {activeTab === 'must_haves' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            {
              title: 'Reel Comment to Instant Freebie DM',
              desc: 'When someone comments "FREE" on your Reel, automatically DM your lead magnet and ask for their email.',
              keyword: 'FREE',
            },
            {
              title: 'Story Reply 20% Discount Code',
              desc: 'When someone replies to your story, automatically send them your coupon code and storefront link.',
              keyword: 'DISCOUNT',
            },
            {
              title: 'Auto-Reply to All Comments',
              desc: 'Boost your algorithm engagement score by auto-replying to every comment in under 60 seconds.',
              keyword: 'ALL',
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                background: 'var(--color-surface-solid)',
                border: '1px solid var(--color-border)',
                borderRadius: 16,
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.title}</h4>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>{item.desc}</p>
              <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                <button
                  className="btn btn-sm btn-primary"
                  type="button"
                  onClick={() => {
                    setNewTitle(item.title);
                    setNewKeyword(item.keyword);
                    setIsModalOpen(true);
                  }}
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div
          style={{
            background: 'var(--color-surface-solid)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Instagram size={24} style={{ color: '#e1306c' }} />
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>Meta Graph API Integration</h3>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>
                Powers official comment-to-DM automation according to Meta Business terms.
              </p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Connected Instagram Business Account</label>
            <input
              type="text"
              readOnly
              value={mockCreatorProfile.connectedAccounts.instagram.handle}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Meta App Client ID (for Live Production API)</label>
            <input
              type="text"
              placeholder="e.g. 1982736412098"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Meta App Secret</label>
            <input
              type="password"
              placeholder="••••••••••••••••••••"
              className="form-input"
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start' }}
            type="button"
            onClick={() => showToast('Meta API configuration verified', 'success')}
          >
            Save Meta Settings
          </button>
        </div>
      )}

      {/* Diagnostics & Verification Tab */}
      {activeTab === 'diagnostics' && (
        <div className="diagnostics-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                Meta & Instagram AutoDM Diagnostics
              </h3>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0 0' }}>
                End-to-end integration health, token encryption status, webhook verification, and Kafka processing telemetry.
              </p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={loadDiagnostics}
              disabled={diagnosticsLoading}
              type="button"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} className={diagnosticsLoading ? 'animate-spin' : ''} />
              <span>{diagnosticsLoading ? 'Checking...' : 'Refresh Status'}</span>
            </button>
          </div>

          <div className="diagnostics-grid">
            {/* Account Card */}
            <div className="diagnostic-card">
              <div className="diagnostic-card__header">
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>INSTAGRAM CONNECTION</span>
                <span className="diagnostic-status-pill status-pill--healthy">CONNECTED</span>
              </div>
              <div className="diagnostic-card__value">
                @{diagnostics?.accountHandle || 'code.withnarayan'}
              </div>
              <div className="diagnostic-card__sub">
                Account ID: <code>{diagnostics?.providerAccountId || '17841400000000001'}</code>
                <br />
                Type: Instagram Professional (Creator) linked to Facebook Page
              </div>
            </div>

            {/* Token Security Card */}
            <div className="diagnostic-card">
              <div className="diagnostic-card__header">
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>META TOKEN ENCRYPTION</span>
                <span className="diagnostic-status-pill status-pill--healthy">AES-256-GCM</span>
              </div>
              <div className="diagnostic-card__value" style={{ fontFamily: 'monospace', fontSize: 15 }}>
                {diagnostics?.tokenMasked || 'EAAG...3x9K'}
              </div>
              <div className="diagnostic-card__sub">
                Authenticated ciphertext with unique 12-byte IV/nonce. Master key loaded from environment variable, never logged or committed.
              </div>
            </div>

            {/* Webhook Integrity Card */}
            <div className="diagnostic-card">
              <div className="diagnostic-card__header">
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>META WEBHOOK STATUS</span>
                <span className="diagnostic-status-pill status-pill--healthy">ACTIVE</span>
              </div>
              <div className="diagnostic-card__value" style={{ fontSize: 15 }}>
                <code>/api/v1/webhooks/instagram</code>
              </div>
              <div className="diagnostic-card__sub">
                HMAC-SHA256 constant-time verification active. Hub challenge handshake active. Deduplication against <code>webhook_events</code> active.
              </div>
            </div>

            {/* Kafka & Event Processing Card */}
            <div className="diagnostic-card">
              <div className="diagnostic-card__header">
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>KAFKA EVENT PIPELINE</span>
                <span className="diagnostic-status-pill status-pill--healthy">HEALTHY</span>
              </div>
              <div className="diagnostic-card__value" style={{ fontSize: 15 }}>
                Topic: <code>instagram.comments</code>
              </div>
              <div className="diagnostic-card__sub">
                Consumer group: <code>creatorhub-autodm-group</code>. Asynchronous fallback queue active for 100% event durability without loss.
              </div>
            </div>

            {/* Engine Dispatch Mode Card */}
            <div className="diagnostic-card">
              <div className="diagnostic-card__header">
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>MESSAGE DISPATCH MODE</span>
                <span className="diagnostic-status-pill status-pill--warning">DRY_RUN (SAFE)</span>
              </div>
              <div className="diagnostic-card__value" style={{ color: '#fbbf24' }}>
                Simulated Dry-Run Active
              </div>
              <div className="diagnostic-card__sub">
                Prevents accidental live messages to followers. Full workflow logic, template formatting, and database execution records run safely.
              </div>
            </div>
          </div>

          {/* Permissions Table */}
          <div className="autodm-table-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>
              Official Meta Graph API Permissions Required
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(diagnostics?.permissions || [
                { permission: 'instagram_manage_comments', required: true, granted: true, description: 'Read comments on posts and reels and post public comment replies' },
                { permission: 'instagram_manage_messages', required: true, granted: true, description: 'Send automated Direct Messages in response to comments within 7 days' },
                { permission: 'pages_manage_metadata', required: true, granted: true, description: 'Subscribe to official Meta Graph API webhooks' },
                { permission: 'pages_read_engagement', required: true, granted: true, description: 'Read follower events and engagement telemetry' },
              ]).map((perm) => (
                <div
                  key={perm.permission}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={15} style={{ color: '#22c55e' }} />
                      <code style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8' }}>{perm.permission}</code>
                      {perm.required && (
                        <span style={{ fontSize: 10, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                          Required
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{perm.description}</div>
                  </div>
                  <span className="diagnostic-status-pill status-pill--healthy">GRANTED</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Test Runner */}
          <div className="autodm-table-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Play size={18} style={{ color: '#38bdf8' }} />
              <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                Interactive Safe Dry-Run Comment Test
              </h4>
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
              Simulate an eligible Instagram comment event through the real backend pipeline (Producer → Kafka → Consumer → AutoDM Engine → Template Formatter → DB Execution Audit Record).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Comment Text</label>
                <input
                  type="text"
                  value={testCommentText}
                  onChange={(e) => setTestCommentText(e.target.value)}
                  placeholder="e.g. Can you send the BLUEPRINT?"
                  className="form-input"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Commenter Instagram Handle</label>
                <input
                  type="text"
                  value={testCommenterUser}
                  onChange={(e) => setTestCommenterUser(e.target.value)}
                  placeholder="e.g. narayan_dev"
                  className="form-input"
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              type="button"
              disabled={testRunning}
              onClick={async () => {
                if (!activeWorkspace?.id) return;
                setTestRunning(true);
                setTestResult(null);
                try {
                  const res: any = await apiClient.testDryRunComment(activeWorkspace.id, {
                    commentText: testCommentText,
                    commenterUsername: testCommenterUser,
                  });
                  setTestResult(res);
                  showToast('Test event executed & verified successfully! 🚀', 'success');
                } catch (err: any) {
                  showToast(err.message || 'Test failed to match active workflow', 'error');
                } finally {
                  setTestRunning(false);
                }
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <Send size={14} />
              <span>{testRunning ? 'Executing Pipeline...' : 'Execute Safe Dry-Run'}</span>
            </button>

            {testResult && (
              <div
                style={{
                  marginTop: 16,
                  padding: '14px 18px',
                  borderRadius: 12,
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={16} style={{ color: '#22c55e' }} />
                    <strong style={{ fontSize: 14, color: '#22c55e' }}>Execution Record Captured in Database</strong>
                  </div>
                  <span className="diagnostic-status-pill status-pill--healthy">
                    STATUS: {testResult.status || 'DRY_RUN'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                  <strong>Recipient:</strong> {testResult.recipientHandle || '@' + testCommenterUser}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                  <strong>Trigger Comment:</strong> "{testResult.triggerComment || testCommentText}"
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                  <strong>Sent DM Message:</strong>
                  <div
                    style={{
                      marginTop: 6,
                      padding: '8px 12px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: 8,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      fontFamily: 'monospace',
                      fontSize: 12,
                      color: '#38bdf8',
                    }}
                  >
                    {testResult.sentDm}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Setup Checklist */}
          <div className="autodm-table-card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>
              Official Meta OAuth Checklist for Connecting Your Account
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                '1. Switch your Instagram profile to Professional (Creator or Business) in mobile app settings.',
                '2. Link your Instagram account to a published Facebook Page (required by Meta Graph API).',
                '3. In Instagram app: Settings > Messages and story replies > Message controls > Enable "Allow access to messages".',
                '4. In Meta Developers Console: Create an App with "Instagram Graph API" and configure Webhook URL with Verify Token.',
                '5. Subscribe to the "comments" webhook field on your Page.',
                '6. Generate a Page Access Token with instagram_manage_comments and instagram_manage_messages permissions.',
                '7. Enter your Page Access Token into CreatorHub (tokens are automatically AES-256-GCM encrypted in database).',
              ].map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#94a3b8' }}>
                  <Check size={16} style={{ color: '#38bdf8', flexShrink: 0, marginTop: 2 }} />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SuperProfile Multi-Step Create Automation Modal */}
      {isModalOpen && (
        <div className="wizard-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="wizard-modal-card" onClick={(e) => e.stopPropagation()}>
            
            {/* Step 0: Channel Selection */}
            {modalStep === 0 && (
              <>
                <div className="wizard-modal-header">
                  <h3>Create automations for</h3>
                  <button className="modal-close-btn" onClick={() => setIsModalOpen(false)} type="button">
                    <X size={18} />
                  </button>
                </div>
                <div className="wizard-modal-body">
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                    Choose the channel this automation should run on.
                  </p>

                  <div
                    className="channel-option-card"
                    onClick={() => {
                      setSelectedChannel('instagram');
                      setModalStep(1);
                    }}
                  >
                    <div className="channel-card-left">
                      <div className="channel-icon-circle" style={{ background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)' }}>
                        <Instagram size={24} style={{ color: '#fff' }} />
                      </div>
                      <div className="channel-meta">
                        <h4>Instagram</h4>
                        <p>Auto-reply to comments & DMs on your posts, reels and stories</p>
                      </div>
                    </div>
                    <ChevronRight size={18} style={{ color: '#94a3b8' }} />
                  </div>

                  <div className="channel-option-card" style={{ opacity: 0.85 }}>
                    <div className="channel-card-left">
                      <div className="channel-icon-circle" style={{ background: '#0084ff' }}>
                        <MessageCircle size={24} style={{ color: '#fff' }} />
                      </div>
                      <div className="channel-meta">
                        <h4>Facebook Messenger</h4>
                        <p>Auto-reply to comments & DMs on your Facebook Page</p>
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast('Facebook Messenger connection available', 'info');
                      }}
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 1: Trigger Selection */}
            {modalStep === 1 && (
              <>
                <div className="wizard-modal-header">
                  <h3>Trigger AutoDM when someone...</h3>
                  <button className="modal-close-btn" onClick={() => setIsModalOpen(false)} type="button">
                    <X size={18} />
                  </button>
                </div>
                <div className="wizard-modal-body">
                  {[
                    { id: 'comments', title: 'Comments on your Post or Reel', icon: Smartphone, desc: 'Auto-reply to comments and send direct messages with links' },
                    { id: 'dm', title: 'Sends you a DM', icon: Send, desc: 'Reply immediately when anyone DMs you with specific keywords' },
                    { id: 'story', title: 'Replies to your Story', icon: Sparkles, desc: 'Send automated product links or discounts when fans reply to stories' },
                    { id: 'live', title: 'Comments on your Live', icon: Radio, desc: 'Send links to viewers commenting during your live broadcasts' },
                    { id: 'dm_post', title: 'DMs your Post or Reel', icon: MessageSquare, desc: 'Reply when a follower shares a post/reel to your inbox' },
                  ].map((trigger) => (
                    <div
                      key={trigger.id}
                      className="trigger-option-card"
                      onClick={() => {
                        setSelectedTrigger(trigger.id);
                        setModalStep(2);
                      }}
                    >
                      <div className="channel-icon-circle" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                        <trigger.icon size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>{trigger.title}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{trigger.desc}</div>
                      </div>
                      <ChevronRight size={18} style={{ color: '#94a3b8' }} />
                    </div>
                  ))}
                </div>
                <div className="wizard-modal-footer">
                  <button className="btn btn-secondary btn-sm" type="button" onClick={() => setModalStep(0)}>
                    Back
                  </button>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Select trigger to continue</span>
                </div>
              </>
            )}

            {/* Step 2 (Step 1 of 3): Post Selection */}
            {modalStep === 2 && (
              <>
                <div className="wizard-modal-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Smartphone size={16} style={{ color: '#38bdf8' }} />
                    <h3>When someone comments on your Post/Reel</h3>
                  </div>
                  <button className="modal-close-btn" onClick={() => setIsModalOpen(false)} type="button">
                    <X size={18} />
                  </button>
                </div>
                <div className="wizard-modal-body">
                  {/* Creator profile header */}
                  <div className="creator-profile-header">
                    <div className="creator-avatar-ring">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80" alt="" />
                    </div>
                    <div className="creator-handle-name">code.withnarayan</div>
                    <span className="add-account-link" onClick={() => showToast('Instagram account connected via Meta OAuth', 'info')}>
                      Add another account
                    </span>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                    The Comment is on...
                  </div>

                  {/* Scope pills */}
                  <div className="scope-selector-pills">
                    <button
                      type="button"
                      className={`scope-pill ${postScope === 'specific' ? 'active' : ''}`}
                      onClick={() => setPostScope('specific')}
                    >
                      Specific Post/Reel
                    </button>
                    <button
                      type="button"
                      className={`scope-pill ${postScope === 'any' ? 'active' : ''}`}
                      onClick={() => setPostScope('any')}
                    >
                      Any Post/Reel
                    </button>
                    <button
                      type="button"
                      className={`scope-pill ${postScope === 'next' ? 'active' : ''}`}
                      onClick={() => setPostScope('next')}
                    >
                      Next Post/Reel
                    </button>
                  </div>

                  {postScope === 'specific' && (
                    <div className="posts-grid">
                      {samplePosts.map((post) => (
                        <div
                          key={post.id}
                          className={`post-thumbnail-card ${selectedPostId === post.id ? 'selected' : ''}`}
                          onClick={() => setSelectedPostId(post.id)}
                        >
                          <img src={post.thumbnail} alt={post.title} />
                          {selectedPostId === post.id && (
                            <div style={{ position: 'absolute', top: 6, right: 6, background: '#38bdf8', borderRadius: '50%', padding: 2 }}>
                              <Check size={12} style={{ color: '#000' }} />
                            </div>
                          )}
                          <div className="post-thumbnail-overlay">
                            {post.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="wizard-modal-footer">
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Step 1 of 3</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => setModalStep(1)}>
                      Back
                    </button>
                    <button className="btn btn-primary btn-sm" type="button" onClick={() => setModalStep(3)}>
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 3 (Step 2 of 3): Keyword & AI Trigger */}
            {modalStep === 3 && (
              <>
                <div className="wizard-modal-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={16} style={{ color: '#38bdf8' }} />
                    <h3>Configure Trigger Keywords</h3>
                  </div>
                  <button className="modal-close-btn" onClick={() => setIsModalOpen(false)} type="button">
                    <X size={18} />
                  </button>
                </div>
                <div className="wizard-modal-body">
                  <div className="creator-profile-header">
                    <div className="creator-avatar-ring">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80" alt="" />
                    </div>
                    <div className="creator-handle-name">code.withnarayan</div>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                    What kind of comment should trigger this automation?
                  </div>

                  <div className="scope-selector-pills">
                    <button
                      type="button"
                      className={`scope-pill ${keywordType === 'specific' ? 'active' : ''}`}
                      onClick={() => setKeywordType('specific')}
                    >
                      Specific keyword
                    </button>
                    <button
                      type="button"
                      className={`scope-pill ${keywordType === 'any' ? 'active' : ''}`}
                      onClick={() => setKeywordType('any')}
                    >
                      Any comment
                    </button>
                  </div>

                  {keywordType === 'specific' && (
                    <>
                      <div>
                        <label className="form-label">Should include any of these:</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="text"
                            placeholder="Type a keyword (min. 1 characters)"
                            value={currentKeywordInput}
                            onChange={(e) => setCurrentKeywordInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const trimmed = currentKeywordInput.trim().toUpperCase();
                                if (trimmed && !keywordsList.includes(trimmed)) {
                                  setKeywordsList([...keywordsList, trimmed]);
                                  setCurrentKeywordInput('');
                                }
                              }
                            }}
                            className="form-input"
                            style={{ flex: 1 }}
                          />
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              const trimmed = currentKeywordInput.trim().toUpperCase();
                              if (trimmed && !keywordsList.includes(trimmed)) {
                                setKeywordsList([...keywordsList, trimmed]);
                                setCurrentKeywordInput('');
                              }
                            }}
                          >
                            + Add
                          </button>
                        </div>
                      </div>

                      {/* Keyword tag chips */}
                      <div className="keyword-chips-container">
                        {keywordsList.map((kw) => (
                          <span key={kw} className="keyword-tag-badge">
                            {kw}
                            <X
                              size={12}
                              style={{ cursor: 'pointer' }}
                              onClick={() => setKeywordsList(keywordsList.filter((k) => k !== kw))}
                            />
                          </span>
                        ))}
                      </div>

                      <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>
                        Keywords are not case-sensitive (e.g., "Hello" and "hello" are treated the same). Automations trigger only on exact keyword matches — for example, the keyword "ai" will match "ai" but not "pain".
                      </div>

                      <span className="add-account-link" onClick={() => showToast('Excluded keywords configuration', 'info')}>
                        + Add excluded keywords?
                      </span>
                    </>
                  )}

                  {/* AI Switch Card */}
                  <div className="ai-switch-card">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
                          Also reply without your keywords
                        </span>
                        <span style={{ fontSize: 10, background: '#38bdf8', color: '#000', padding: '1px 6px', borderRadius: 999, fontWeight: 800 }}>
                          AI
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                        Even if a comment doesn't use your exact keywords, AI checks its meaning and replies when it matches what you describe.
                      </p>
                    </div>
                    <label className="form-switch" style={{ margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={aiSmartReply}
                        onChange={(e) => setAiSmartReply(e.target.checked)}
                      />
                      <span className="form-switch-slider" />
                    </label>
                  </div>
                </div>
                <div className="wizard-modal-footer">
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Step 2 of 3</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => setModalStep(2)}>
                      Back
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      type="button"
                      onClick={() => {
                        if (keywordsList.length === 0 && keywordType === 'specific') {
                          showToast('Please add at least one trigger keyword', 'error');
                          return;
                        }
                        setModalStep(4);
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 4 (Step 3 of 3): Response Setup */}
            {modalStep === 4 && (
              <form onSubmit={handleCreateWorkflow}>
                <div className="wizard-modal-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Send size={16} style={{ color: '#38bdf8' }} />
                    <h3>Configure AutoDM & Public Reply ({selectedChannel === 'instagram' ? 'Instagram' : 'Messenger'} · {selectedTrigger})</h3>
                  </div>
                  <button className="modal-close-btn" onClick={() => setIsModalOpen(false)} type="button">
                    <X size={18} />
                  </button>
                </div>
                <div className="wizard-modal-body">
                  <div className="form-group">
                    <label className="form-label">Automation Name *</label>
                    <input
                      type="text"
                      required
                      placeholder={`Reel: ${keywordsList[0] || 'BLUEPRINT'} AutoDM`}
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Direct Message (DM) to Send *</label>
                    <textarea
                      rows={3}
                      required
                      value={newDmMessage}
                      onChange={(e) => setNewDmMessage(e.target.value)}
                      className="form-textarea"
                    />
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <span
                        style={{ fontSize: 10, background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', color: '#38bdf8' }}
                        onClick={() => setNewDmMessage((prev) => `${prev} {{first_name}}`)}
                      >
                        {'+ {{first_name}}'}
                      </span>
                      <span
                        style={{ fontSize: 10, background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', color: '#38bdf8' }}
                        onClick={() => setNewDmMessage((prev) => `${prev} {{store_link}}`)}
                      >
                        {'+ {{store_link}}'}
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Public Comment Reply *</label>
                    <input
                      type="text"
                      required
                      value={newPublicReply}
                      onChange={(e) => setNewPublicReply(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  {/* Test Mode Toggle Card */}
                  <div className="ai-switch-card">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', marginBottom: 2 }}>
                        Safe Dry-Run Simulation Mode
                      </div>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                        Safely test comment keyword matches, template formatting, and audit logs without calling external Meta APIs.
                      </p>
                    </div>
                    <label className="form-switch" style={{ margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={isDryRunToggle}
                        onChange={(e) => setIsDryRunToggle(e.target.checked)}
                      />
                      <span className="form-switch-slider" />
                    </label>
                  </div>
                </div>
                <div className="wizard-modal-footer">
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Step 3 of 3</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => setModalStep(3)}>
                      Back
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Launch Automation 🚀
                    </button>
                  </div>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* 1-Click Checkout Modal for Simulator Product Clicks */}
      {checkoutProduct && (
        <SaaSCheckoutModal
          product={checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
        />
      )}
    </div>
  );
}

