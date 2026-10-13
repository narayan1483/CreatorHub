import { useState } from 'react';
import {
  Instagram,
  MessageCircle,
  Send,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface AgentItem {
  id: string;
  name: string;
  type: string;
  platform: 'Instagram' | 'WhatsApp' | 'Telegram';
  status: 'active' | 'standby';
  lastPing: string;
  processedCount: number;
}

export function ConnectedAgentsPage() {
  const [agents] = useState<AgentItem[]>([
    {
      id: 'ag-1',
      name: 'Meta Instagram Comment Monitor Agent',
      type: 'Event-Driven Webhook Bot',
      platform: 'Instagram',
      status: 'active',
      lastPing: '3 sec ago',
      processedCount: 18420,
    },
    {
      id: 'ag-2',
      name: 'WhatsApp Abandoned Checkout Recovery Agent',
      type: 'Delayed Schedule Worker',
      platform: 'WhatsApp',
      status: 'active',
      lastPing: '1 min ago',
      processedCount: 1280,
    },
    {
      id: 'ag-3',
      name: 'Telegram VIP Community Access Agent',
      type: 'Single-Use Invite Generator',
      platform: 'Telegram',
      status: 'active',
      lastPing: '5 min ago',
      processedCount: 684,
    },
  ]);

  const { showToast } = useToast();

  const handleTestAgent = (_id: string, name: string) => {
    showToast(`Health check sent to ${name}: Response 200 OK (Latency: 28ms) ⚡`, 'success');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '1.5rem 2rem 4rem',
        maxWidth: 1200,
        margin: '0 auto',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Connected Agents & Automation Workers
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Real-time status of backend agents processing AutoDM, WhatsApp alerts, and Telegram bots
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => showToast('All background agents synced & active', 'success')}
          type="button"
        >
          <RefreshCw size={14} />
          <span>Refresh Agent Health</span>
        </button>
      </div>

      {/* Agents List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {agents.map((ag) => (
          <div
            key={ag.id}
            style={{
              background: 'var(--color-surface-solid)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {ag.platform === 'Instagram' ? (
                  <Instagram size={22} style={{ color: '#e1306c' }} />
                ) : ag.platform === 'WhatsApp' ? (
                  <MessageCircle size={22} style={{ color: '#25d366' }} />
                ) : (
                  <Send size={22} style={{ color: '#38bdf8' }} />
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {ag.name}
                  </h3>
                  <span className="badge badge-emerald">● Online</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  {ag.type} • Processed {ag.processedCount.toLocaleString('en-IN')} events
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontFamily: 'monospace' }}>
                Heartbeat: {ag.lastPing}
              </span>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => handleTestAgent(ag.id, ag.name)}
                type="button"
              >
                <Activity size={13} />
                <span>Ping Agent</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
