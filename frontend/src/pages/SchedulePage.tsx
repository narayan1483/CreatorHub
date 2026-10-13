import { useState } from 'react';
import { Plus, Clock, Instagram } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ScheduledPost {
  id: string;
  caption: string;
  platform: 'Instagram Reel' | 'Carousel' | 'Story';
  scheduledTime: string;
  status: 'scheduled' | 'published';
  thumbnailUrl: string;
}

export function SchedulePage() {
  const [posts] = useState<ScheduledPost[]>([
    {
      id: 'sp-1',
      caption: 'Top 3 AI tools that replaced my 4-person design team. Comment "TOOLS" for link! 👇',
      platform: 'Instagram Reel',
      scheduledTime: 'Tomorrow at 06:30 PM',
      status: 'scheduled',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
    },
    {
      id: 'sp-2',
      caption: 'The complete Fullstack Roadmap for 2026. Save this reel!',
      platform: 'Carousel',
      scheduledTime: '15 Oct 2026 at 11:00 AM',
      status: 'scheduled',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300&q=80',
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
            Schedule & Content Planner
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Plan, preview, and auto-publish Instagram Reels and Carousels with AutoDM pre-attached
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => showToast('Post scheduler modal opened', 'info')}
          type="button"
        >
          <Plus size={15} />
          <span>Schedule New Reel / Post</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {posts.map((p) => (
          <div
            key={p.id}
            style={{
              background: 'var(--color-surface-solid)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ height: 160, position: 'relative' }}>
              <img
                src={p.thumbnailUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  background: 'rgba(0, 0, 0, 0.75)',
                  color: '#fff',
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 999,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Instagram size={12} style={{ color: '#e1306c' }} /> {p.platform}
              </span>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#38bdf8', fontWeight: 600 }}>
                <Clock size={13} />
                <span>{p.scheduledTime}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                {p.caption}
              </p>
            </div>

            <div
              style={{
                padding: '0.85rem 1.25rem',
                background: 'var(--color-bg-subtle)',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span className="badge badge-indigo">AutoDM Linked</span>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => showToast('Post details edited', 'info')}
                type="button"
              >
                Edit Post
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
