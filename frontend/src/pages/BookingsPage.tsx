import { useState } from 'react';
import { Video, Calendar } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface BookingSlot {
  id: string;
  clientName: string;
  clientEmail: string;
  sessionTitle: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  meetLink: string;
}

export function BookingsPage() {
  const [bookings] = useState<BookingSlot[]>([
    {
      id: 'bk-1',
      clientName: 'Arjun Mehta',
      clientEmail: 'arjun.m@techcorp.in',
      sessionTitle: '1:1 Career Strategy & Code Review Call',
      date: 'Tomorrow, 14 Oct 2026',
      time: '04:30 PM - 05:15 PM',
      duration: '45 mins',
      price: 1999,
      meetLink: 'https://meet.google.com/abc-defg-hij',
    },
    {
      id: 'bk-2',
      clientName: 'Neha Gupta',
      clientEmail: 'neha.g@designhub.co',
      sessionTitle: 'Portfolio Audit & Resume Revamp',
      date: 'Friday, 16 Oct 2026',
      time: '06:00 PM - 06:45 PM',
      duration: '45 mins',
      price: 1999,
      meetLink: 'https://meet.google.com/xyz-uvwx-rst',
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
            1:1 Bookings & Consultations
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Manage upcoming video consultation calls, calendar availability slots, and Google Meet links
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => showToast('Availability slots setting opened', 'info')}
          type="button"
        >
          <Calendar size={15} />
          <span>Configure Availability Slots</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {bookings.map((b) => (
          <div
            key={b.id}
            style={{
              background: 'var(--color-surface-solid)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: '1.5rem',
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
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(251, 191, 36, 0.12)',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Video size={22} />
              </div>

              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {b.sessionTitle}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  Client: <strong>{b.clientName}</strong> ({b.clientEmail})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#38bdf8', marginTop: 4 }}>
                  <span>{b.date}</span>
                  <span>•</span>
                  <span>{b.time}</span>
                  <span>•</span>
                  <span>{b.duration}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <strong style={{ fontSize: 16, color: '#34d399' }}>₹{b.price}</strong>
              <a
                href={b.meetLink}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                <Video size={14} /> Join Google Meet
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
