import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { markIntroComplete, getIntroPage } from "@/lib/introProgress";

interface RestartModalProps {
  onClose: () => void;
  onRestarted: () => void;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

export function RestartModal({ onClose, onRestarted }: RestartModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRestart() {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/restart', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Restart failed');

      // Clear localStorage progress keys
      localStorage.removeItem('wil_current_day');
      localStorage.removeItem('wil_intro_page');
      localStorage.removeItem('wil_intro_done');
      localStorage.removeItem('wil_onboarding_complete');

      onRestarted();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(13,28,67,0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '320px',
          background: 'linear-gradient(135deg, rgba(25,59,137,0.98) 0%, rgba(13,28,67,0.98) 100%)',
          border: '1px solid rgba(214,154,45,0.2)',
          borderRadius: '20px',
          padding: '32px 24px',
          textAlign: 'center',
          boxShadow: '0 16px 48px rgba(13,28,67,0.7)',
        }}
      >
        {/* Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(214,154,45,0.1)',
          border: '1px solid rgba(214,154,45,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.5rem',
          fontWeight: 400,
          color: 'var(--color-cream)',
          lineHeight: 1.2,
          marginBottom: '12px',
        }}>
          Restart Journey
        </h3>

        {/* Body */}
        <p style={{
          fontFamily: 'Jost, sans-serif',
          fontSize: '0.85rem',
          color: 'rgba(201,123,107,0.85)',
          lineHeight: 1.7,
          marginBottom: '8px',
        }}>
          This will reset your progress back to the Introduction.
        </p>
        <p style={{
          fontFamily: 'Jost, sans-serif',
          fontSize: '0.85rem',
          color: 'rgba(201,123,107,0.85)',
          lineHeight: 1.7,
          marginBottom: '28px',
        }}>
          Your journal entries will be saved and available in a past journey archive. Nothing is lost.
        </p>

        {error && (
          <p style={{
            fontFamily: 'Jost, sans-serif',
            fontSize: '0.75rem',
            color: 'rgba(118,0,0,0.9)',
            marginBottom: '16px',
          }}>
            {error}
          </p>
        )}

        {/* Confirm button */}
        <button
          onClick={handleRestart}
          disabled={loading}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: '12px',
            background: loading ? 'rgba(214,154,45,0.08)' : 'rgba(214,154,45,0.15)',
            border: '1px solid rgba(214,154,45,0.3)',
            color: loading ? 'rgba(214,154,45,0.4)' : 'var(--color-gold)',
            fontFamily: 'Jost, sans-serif',
            fontSize: '0.8rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: loading ? 'default' : 'pointer',
            marginBottom: '12px',
            transition: 'all 0.2s',
          }}
        >
          {loading ? 'Restarting…' : 'Yes, Restart Journey'}
        </button>

        {/* Cancel */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: '12px',
            background: 'none',
            border: '1px solid rgba(201,123,107,0.15)',
            color: 'rgba(201,123,107,0.5)',
            fontFamily: 'Jost, sans-serif',
            fontSize: '0.8rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
