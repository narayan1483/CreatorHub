import { useState } from 'react';
import { Plus, Download, Copy } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface LeadMagnetItem {
  id: string;
  title: string;
  fileFormat: string;
  leadsCollected: number;
  conversionRate: string;
  status: 'active' | 'draft';
}

export function LeadMagnetPage() {
  const [magnets] = useState<LeadMagnetItem[]>([
    {
      id: 'lm-1',
      title: 'Free 50+ Figma SaaS Design Tokens Starter Pack',
      fileFormat: 'Figma File (.fig)',
      leadsCollected: 4820,
      conversionRate: '34.2%',
      status: 'active',
    },
    {
      id: 'lm-2',
      title: 'AI Engineering Roadmap 2026 (PDF)',
      fileFormat: 'PDF Document',
      leadsCollected: 8940,
      conversionRate: '41.5%',
      status: 'active',
    },
  ]);

  const { showToast } = useToast();

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
            Lead Magnets (Freebies & Email Capture)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Offer free downloads to turn casual followers into email subscribers and paying customers
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => showToast('Create Lead Magnet wizard opened', 'info')}
          type="button"
        >
          <Plus size={15} />
          <span>Create Lead Magnet</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {magnets.map((lm) => (
          <div
            key={lm.id}
            style={{
              background: 'var(--color-surface-solid)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge badge-emerald">● Live on Store</span>
              <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>{lm.fileFormat}</span>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
              {lm.title}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
              <div style={{ background: 'var(--color-bg-secondary)', padding: '10px 12px', borderRadius: 10 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {lm.leadsCollected.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Emails Captured</div>
              </div>

              <div style={{ background: 'var(--color-bg-secondary)', padding: '10px 12px', borderRadius: 10 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}>
                  {lm.conversionRate}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Visitor Opt-in Rate</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
              <button
                className="btn btn-sm btn-secondary"
                style={{ flex: 1 }}
                onClick={() => showToast(`Exported ${lm.leadsCollected} emails to CSV`, 'success')}
                type="button"
              >
                <Download size={13} />
                <span>Export Leads</span>
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => showToast('Lead magnet link copied', 'info')}
                type="button"
              >
                <Copy size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
