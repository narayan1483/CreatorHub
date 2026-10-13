import { useState } from 'react';
import {
  Plus,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface SuperLinkItem {
  id: string;
  title: string;
  slug: string;
  destination: string;
  clicks: number;
  ctr: string;
}

export function SuperLinksPage() {
  const [links] = useState<SuperLinkItem[]>([
    {
      id: 'sl-1',
      title: 'YouTube Latest Video',
      slug: 'youtube-latest',
      destination: 'https://youtube.com/watch?v=xyz123',
      clicks: 4820,
      ctr: '18.4%',
    },
    {
      id: 'sl-2',
      title: 'Free GitHub Repo Star Link',
      slug: 'github-starter',
      destination: 'https://github.com/codewithnarayan/starter',
      clicks: 8940,
      ctr: '32.1%',
    },
    {
      id: 'sl-3',
      title: 'Discord VIP Invite Tracker',
      slug: 'discord-vip',
      destination: 'https://discord.gg/creators',
      clicks: 2150,
      ctr: '14.2%',
    },
  ]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleCopy = (id: string, slug: string) => {
    navigator.clipboard?.writeText(`https://creatorhub.io/l/${slug}`);
    setCopiedId(id);
    showToast('SuperLink copied to clipboard! 🔗', 'success');
    setTimeout(() => setCopiedId(null), 2000);
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
            SuperLinks (Short Links & UTM Tracking)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Create branded short links, track real-time click through rates, and attribute sales
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => showToast('Create SuperLink modal opened', 'info')}
          type="button"
        >
          <Plus size={15} />
          <span>Create New SuperLink</span>
        </button>
      </div>

      <div className="audience-table-card">
        <table className="autodm-table">
          <thead>
            <tr>
              <th>LINK TITLE</th>
              <th>SHORT URL</th>
              <th>DESTINATION</th>
              <th>CLICKS</th>
              <th>CTR</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {links.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong style={{ color: 'var(--color-text-primary)' }}>{item.title}</strong>
                </td>
                <td>
                  <code style={{ color: '#38bdf8', fontSize: 12 }}>creatorhub.io/l/{item.slug}</code>
                </td>
                <td style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
                  {item.destination}
                </td>
                <td>
                  <strong>{item.clicks.toLocaleString('en-IN')}</strong>
                </td>
                <td>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>{item.ctr}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleCopy(item.id, item.slug)}
                      type="button"
                      title="Copy Link"
                    >
                      {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                    <a
                      href={item.destination}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-ghost"
                      title="Open link"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
