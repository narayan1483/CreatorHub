import { useState } from 'react';
import {
  Send,
  MessageCircle,
  Mail,
  Sparkles,
  CheckCircle2,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { mockCreatorProfile } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import './BroadcastStudioPage.css';

interface CampaignRecord {
  id: string;
  name: string;
  channel: 'whatsapp' | 'email';
  audience: string;
  sentAt: string;
  recipients: number;
  deliveredRate: string;
  openRate: string;
  clicks: number;
  revenue: string;
  status: 'Completed' | 'Scheduled' | 'Draft';
}

export function BroadcastStudioPage() {
  const { showToast } = useToast();

  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [campaignTitle, setCampaignTitle] = useState('Exclusive VIP Discount on Startup Playbook');
  const [selectedAudience, setSelectedAudience] = useState('All Customers (3,420)');
  const [messageBody, setMessageBody] = useState(
    'Hey {{first_name}}! 🎉 Thanks for supporting my journey. As a VIP supporter, here is a special 20% discount code for my new Playbook: use code VIP20 at checkout: {{store_link}}'
  );
  const [ctaText, setCtaText] = useState('Claim 20% Discount ➔');
  const [ctaUrl, setCtaUrl] = useState(`https://${mockCreatorProfile.storeUrl}`);
  const [isSending, setIsSending] = useState(false);

  const initialCampaigns: CampaignRecord[] = [
    {
      id: 'cmp-1',
      name: 'Startup Playbook Launch Announcement',
      channel: 'whatsapp',
      audience: 'All Customers (3,420)',
      sentAt: 'Yesterday, 6:30 PM',
      recipients: 3420,
      deliveredRate: '99.4%',
      openRate: '91.2%',
      clicks: 1420,
      revenue: '₹1,13,600',
      status: 'Completed',
    },
    {
      id: 'cmp-2',
      name: 'Weekend Flash Sale (30% OFF)',
      channel: 'whatsapp',
      audience: 'Lead Magnet Subscribers (1,840)',
      sentAt: '3 days ago',
      recipients: 1840,
      deliveredRate: '98.8%',
      openRate: '88.5%',
      clicks: 640,
      revenue: '₹51,200',
      status: 'Completed',
    },
    {
      id: 'cmp-3',
      name: 'Abandoned Checkout Recovery DM',
      channel: 'email',
      audience: 'Abandoned Checkouts (290)',
      sentAt: 'Scheduled for tomorrow',
      recipients: 290,
      deliveredRate: '—',
      openRate: '—',
      clicks: 0,
      revenue: '—',
      status: 'Scheduled',
    },
  ];

  const [campaigns, setCampaigns] = useState<CampaignRecord[]>(initialCampaigns);

  const audienceSegments = [
    { label: 'All Customers (3,420)', count: 3420, desc: 'Every user who purchased any product' },
    { label: 'Lead Magnet Subscribers (1,840)', count: 1840, desc: 'Users who downloaded free guides' },
    { label: 'Abandoned Checkouts (290)', count: 290, desc: 'Initiated checkout in past 7 days' },
    { label: 'VIP Repeat Buyers (480)', count: 480, desc: 'Customers with 2+ purchases' },
  ];

  const handleInsertToken = (token: string) => {
    setMessageBody((prev) => `${prev} ${token}`);
  };

  const handleSendCampaign = () => {
    if (!campaignTitle.trim() || !messageBody.trim()) {
      showToast('Please fill out campaign title and message body', 'error');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      const newRecord: CampaignRecord = {
        id: `cmp-${Date.now()}`,
        name: campaignTitle,
        channel,
        audience: selectedAudience,
        sentAt: 'Just now',
        recipients: 3420,
        deliveredRate: '100%',
        openRate: 'Pending',
        clicks: 0,
        revenue: '₹0',
        status: 'Completed',
      };
      setCampaigns([newRecord, ...campaigns]);
      showToast(`Campaign "${campaignTitle}" dispatched to ${selectedAudience}! 🚀`, 'success');
    }, 1200);
  };

  // Preview replacement
  const previewText = messageBody
    .replace(/{{first_name}}/g, 'Rahul')
    .replace(/{{store_link}}/g, `creatorhub.to/@${mockCreatorProfile.handle}`);

  return (
    <div className="broadcast-page-container">
      {/* Page Header */}
      <div className="broadcast-header">
        <div>
          <div className="broadcast-badge">
            <Sparkles size={14} />
            <span>Multi-Channel Creator Messaging</span>
          </div>
          <h1 className="broadcast-title">Broadcast & Marketing Campaigns</h1>
          <p className="broadcast-subtitle">
            Engage your audience, announce new digital drops, and re-target leads via high-converting WhatsApp & Email broadcasts.
          </p>
        </div>

        <div className="broadcast-stats-mini">
          <div className="mini-stat">
            <span className="mini-stat-label">Total Reach</span>
            <strong className="mini-stat-val">5,550 contacts</strong>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">Avg Open Rate</span>
            <strong className="mini-stat-val" style={{ color: '#22c55e' }}>89.8%</strong>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="broadcast-studio-grid">
        {/* Left: Campaign Composer */}
        <div className="composer-column">
          {/* Channel Selector */}
          <div className="channel-switch-card">
            <label className="composer-label">Select Delivery Channel</label>
            <div className="channel-tabs">
              <button
                type="button"
                className={`channel-btn ${channel === 'whatsapp' ? 'channel-btn--active' : ''}`}
                onClick={() => setChannel('whatsapp')}
              >
                <MessageCircle size={18} color="#22c55e" />
                <div>
                  <strong>WhatsApp Broadcast</strong>
                  <span>98% open rate within 10 mins</span>
                </div>
              </button>
              <button
                type="button"
                className={`channel-btn ${channel === 'email' ? 'channel-btn--active' : ''}`}
                onClick={() => setChannel('email')}
              >
                <Mail size={18} color="#38bdf8" />
                <div>
                  <strong>Email Blast</strong>
                  <span>Best for newsletters & digests</span>
                </div>
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="composer-form-card">
            <div className="form-group-custom">
              <label>Campaign Title (Internal Reference)</label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="checkout-input"
                placeholder="e.g. Summer Ebook Launch"
              />
            </div>

            <div className="form-group-custom">
              <label>Audience Segment</label>
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="checkout-input"
              >
                {audienceSegments.map((seg) => (
                  <option key={seg.label} value={seg.label}>
                    {seg.label} — {seg.desc}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group-custom">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label>Message Content</label>
                <div className="token-pills-row">
                  <button type="button" className="token-pill" onClick={() => handleInsertToken('{{first_name}}')}>
                    + first_name
                  </button>
                  <button type="button" className="token-pill" onClick={() => handleInsertToken('{{store_link}}')}>
                    + store_link
                  </button>
                  <button type="button" className="token-pill" onClick={() => handleInsertToken('{{discount_code}}')}>
                    + discount_code
                  </button>
                </div>
              </div>
              <textarea
                rows={5}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="composer-textarea"
                placeholder="Write your broadcast message..."
              />
            </div>

            <div className="cta-inputs-grid">
              <div className="form-group-custom">
                <label>Call-to-Action Button Label</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="checkout-input"
                />
              </div>

              <div className="form-group-custom">
                <label>Destination URL</label>
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="checkout-input"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="composer-actions">
              <button
                type="button"
                className="btn btn-primary btn-send-campaign"
                disabled={isSending}
                onClick={handleSendCampaign}
              >
                {isSending ? (
                  <span>Dispatching to Meta Network...</span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Broadcast Now ({selectedAudience.split(' ')[0]})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => showToast('Campaign saved as draft!', 'info')}
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Realistic Phone Preview */}
        <div className="preview-column">
          <div className="preview-label-row">
            <Smartphone size={16} />
            <span>Recipient Real-Time Preview ({channel === 'whatsapp' ? 'WhatsApp' : 'Email'})</span>
          </div>

          <div className="preview-phone-device">
            {channel === 'whatsapp' ? (
              /* WHATSAPP CHAT PREVIEW */
              <div className="wa-preview-screen">
                <div className="wa-chat-header">
                  <img src={mockCreatorProfile.avatarUrl} alt="avatar" className="wa-avatar" />
                  <div>
                    <div className="wa-name">
                      <span>{mockCreatorProfile.name}</span>
                      <CheckCircle2 size={12} fill="#22c55e" color="#fff" />
                    </div>
                    <div className="wa-status">Official Business Account</div>
                  </div>
                </div>

                <div className="wa-chat-body">
                  <div className="wa-chat-bubble">
                    <p className="wa-bubble-text">{previewText}</p>
                    <div className="wa-bubble-cta">
                      <a href={ctaUrl} target="_blank" rel="noreferrer" className="wa-cta-btn">
                        <span>{ctaText}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    <div className="wa-bubble-time">
                      <span>10:30 AM</span>
                      <span className="wa-double-check">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* EMAIL PREVIEW */
              <div className="email-preview-screen">
                <div className="email-header-meta">
                  <div className="email-from">From: {mockCreatorProfile.name} &lt;alex@creatorhub.to&gt;</div>
                  <div className="email-subject">Subject: {campaignTitle}</div>
                </div>
                <div className="email-body-content">
                  <img src={mockCreatorProfile.avatarUrl} alt="" className="email-header-avatar" />
                  <h3 style={{ fontSize: 16, color: 'var(--color-text-primary)', margin: '8px 0' }}>
                    {campaignTitle}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {previewText}
                  </p>
                  <div style={{ marginTop: 16 }}>
                    <a
                      href={ctaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                      style={{ display: 'inline-flex' }}
                    >
                      {ctaText}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Analytics & History Table */}
      <div className="campaigns-history-card">
        <div className="history-header">
          <h3 className="history-title">Recent Broadcast Performance</h3>
          <span className="history-subtitle">Track delivery, open rate, and sales revenue generated</span>
        </div>

        <div className="table-wrapper">
          <table className="broadcast-table">
            <thead>
              <tr>
                <th>CAMPAIGN NAME</th>
                <th>CHANNEL</th>
                <th>AUDIENCE</th>
                <th>SENT TIME</th>
                <th>DELIVERY RATE</th>
                <th>OPEN RATE</th>
                <th>CLICKS</th>
                <th>REVENUE GENERATED</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td>
                    <span className={`channel-badge channel-badge--${c.channel}`}>
                      {c.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
                    </span>
                  </td>
                  <td>{c.audience}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{c.sentAt}</td>
                  <td>
                    <span style={{ color: '#22c55e', fontWeight: 600 }}>{c.deliveredRate}</span>
                  </td>
                  <td>
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>{c.openRate}</span>
                  </td>
                  <td>{c.clicks}</td>
                  <td>
                    <strong style={{ color: '#22c55e' }}>{c.revenue}</strong>
                  </td>
                  <td>
                    <span className="badge badge-emerald">{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
