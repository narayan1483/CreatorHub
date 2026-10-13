import {
  GraduationCap,
  Play,
  TrendingUp,
  MessageCircle,
  IndianRupee,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export function LearnPage() {
  const { showToast } = useToast();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        maxWidth: 1040,
        margin: '0 auto',
        padding: '1.5rem 1.5rem 4rem',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {/* Hero Banner (Screenshot 3) */}
      <div
        style={{
          borderRadius: 24,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '3rem 2rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#38bdf8', fontWeight: 600, marginBottom: 12 }}>
          <GraduationCap size={16} />
          <span>Creator Academy</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', maxWidth: 640, margin: '0 auto', lineHeight: 1.25 }}>
          Learn how to grow and sell with CreatorHub
        </h1>
        <p style={{ fontSize: 14, color: '#cbd5e1', marginTop: 10, maxWidth: 520, margin: '10px auto 0', lineHeight: 1.5 }}>
          Actionable playbooks, video masterclasses, and step-by-step scaling guides for modern creators.
        </p>
      </div>

      {/* Essentials Section (Screenshot 3) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 16 }}>
          <span>👇</span>
          <span>Essentials — Start here</span>
        </div>

        {/* Masterclass Card (Screenshot 3) */}
        <div
          style={{
            background: 'var(--color-surface-solid)',
            border: '1px solid var(--color-border)',
            borderRadius: 20,
            padding: '2rem',
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          {/* Video Box */}
          <div
            style={{
              width: '100%',
              height: 200,
              borderRadius: 16,
              background: '#0f172a',
              backgroundImage: 'url(https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
            }}
            onClick={() => showToast('Playing Masterclass Video...', 'info')}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                border: '2px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              <Play size={22} fill="#fff" />
            </div>
          </div>

          {/* Masterclass Info & Stats (Screenshot 3) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
              The only Masterclass you need to Make Money Online
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Learn the proven model to make money online — used by thousands of creators to turn Instagram engagement into daily income.
            </p>

            <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              ◆ Creators using this system achieved ◆
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: 'var(--color-bg-secondary)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  <TrendingUp size={14} style={{ color: '#34d399' }} /> 10x
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Increase in followers</div>
              </div>

              <div style={{ background: 'var(--color-bg-secondary)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#38bdf8' }}>
                  <MessageCircle size={14} style={{ color: '#38bdf8' }} /> 200–300
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Automated DMs/day</div>
              </div>

              <div style={{ background: 'var(--color-bg-secondary)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  <MessageCircle size={14} style={{ color: '#e879f9' }} /> 5,000+
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Comments on single reel</div>
              </div>

              <div style={{ background: 'var(--color-bg-secondary)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  <IndianRupee size={14} style={{ color: '#fbbf24' }} /> ₹500 – ₹5,000
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Daily from product sales</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
