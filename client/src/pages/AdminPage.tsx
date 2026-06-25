import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter';
import { LogoWordmark } from '@/components/Logo';

interface SurveyResponse {
  id: string;
  user_email: string;
  day: number;
  week: string;
  response: string;
  submitted_at: string;
}

const ADMIN_EMAIL = 'dpconway4@gmail.com';

export default function AdminPage() {
  const { user, session } = useAuth();
  const [, navigate] = useLocation();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.email !== ADMIN_EMAIL) { navigate('/home'); return; }
    fetchResponses();
  }, [user]);

  async function fetchResponses() {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch('/api/survey', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setResponses(data.responses || []);
    } catch {
      setResponses([]);
    } finally {
      setLoading(false);
    }
  }

  const days = [1, 8, 15];
  const filtered = filter === 'all' ? responses : responses.filter(r => r.day === filter);
  const weekLabel = (day: number) => day === 1 ? 'The Introduction' : day === 8 ? 'Week 1: Patience' : 'Week 2: Kindness';

  return (
    <div
      className="min-h-dvh"
      style={{ background: 'var(--color-bg)', maxWidth: '640px', margin: '0 auto', padding: '0 1.5rem 4rem' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between pt-8 pb-6">
        <LogoWordmark />
        <button
          onClick={() => navigate('/home')}
          style={{ color: 'var(--color-rose)', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          ← Home
        </button>
      </header>

      {/* Title */}
      <div className="mb-8">
        <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.5rem' }}>
          Admin · Survey Responses
        </p>
        <h1 className="font-display text-2xl font-light" style={{ color: 'var(--color-cream)' }}>
          What users are saying
        </h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {(['all', ...days] as const).map((d) => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '2rem',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: '1px solid rgba(214,154,45,0.3)',
              background: filter === d ? 'var(--color-gold)' : 'transparent',
              color: filter === d ? '#0B1F3A' : 'var(--color-cream)',
              fontWeight: filter === d ? 700 : 400,
              cursor: 'pointer',
            }}
          >
            {d === 'all' ? 'All' : weekLabel(d)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-8">
        {days.map(d => {
          const count = responses.filter(r => r.day === d).length;
          return (
            <div
              key={d}
              style={{
                flex: 1,
                background: 'var(--color-surface)',
                borderRadius: '0.875rem',
                border: '1px solid rgba(214,154,45,0.15)',
                padding: '1rem',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-gold)' }}>{count}</p>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-rose)', marginTop: '0.25rem' }}>
                {weekLabel(d).split(':')[0]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Responses */}
      {loading ? (
        <p style={{ color: 'var(--color-rose)', fontStyle: 'italic', textAlign: 'center', marginTop: '3rem' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--color-rose)', fontStyle: 'italic', textAlign: 'center', marginTop: '3rem' }}>No responses yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((r) => (
            <div
              key={r.id}
              style={{
                background: 'var(--color-surface)',
                borderRadius: '1rem',
                border: '1px solid rgba(214,154,45,0.15)',
                padding: '1.25rem 1.5rem',
              }}
            >
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <span style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
                  {r.week}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-rose)' }}>
                  {new Date(r.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p style={{ color: 'var(--color-cream)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                {r.response}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(250,245,236,0.4)' }}>
                {r.user_email}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
