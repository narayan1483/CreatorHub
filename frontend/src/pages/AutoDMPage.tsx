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
import { apiClient } from '../services/apiClient';
import './AutoDMPage.css';

export function AutoDMPage() {
  const [workflows, setWorkflows] = useState<AutoDMWorkflow[]>(mockAutoDMWorkflows);
  const { activeWorkspace } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'automations' | 'simulator' | 'ai_workflow_builder' | 'ai_reply_assistant' | 'product_knowledge' | 'ai_usage' | 'must_haves' | 'settings'
  >('automations');

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

      {/* Create Automation Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} style={{ color: '#38bdf8' }} />
                <h3 className="modal-title">Create AutoDM Workflow</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Automation Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Reel: AI Roadmap -> Send PDF"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Trigger Keyword *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI, LINK, PRICE, START"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    className="form-input"
                  />
                  <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                    When a follower comments this word on your post, the DM triggers instantly.
                  </span>
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
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <span
                      style={{ fontSize: 10, background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4, cursor: 'pointer' }}
                      onClick={() => setNewDmMessage((prev) => `${prev} {{first_name}}`)}
                    >
                      + first_name
                    </span>
                    <span
                      style={{ fontSize: 10, background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4, cursor: 'pointer' }}
                      onClick={() => setNewDmMessage((prev) => `${prev} {{link}}`)}
                    >
                      + link
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
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Launch Automation
                </button>
              </div>
            </form>
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
