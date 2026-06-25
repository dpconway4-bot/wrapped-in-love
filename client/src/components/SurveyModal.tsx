import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { SurveyQuestion } from '@/data/surveys';

interface SurveyModalProps {
  survey: SurveyQuestion;
  onClose: () => void;
}

export function SurveyModal({ survey, onClose }: SurveyModalProps) {
  const { session } = useAuth();
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit() {
    if (!response.trim() || !session) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          day: survey.day,
          week: survey.week,
          response: response.trim(),
        }),
      });
      setSaved(true);
      setTimeout(() => onClose(), 1200);
    } catch {
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: 'rgba(11,31,58,0.92)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '1.25rem',
          border: '1px solid rgba(214,154,45,0.25)',
          padding: '2rem 1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        {/* Eyebrow */}
        <p
          style={{
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-gold)',
          }}
        >
          {survey.week} · Reflection
        </p>

        {/* Question */}
        <p
          className="font-display"
          style={{
            fontSize: '1.15rem',
            fontWeight: 300,
            lineHeight: 1.55,
            color: 'var(--color-cream)',
          }}
        >
          {survey.question}
        </p>

        {/* Text input */}
        {!saved ? (
          <>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Write something honest..."
              rows={4}
              style={{
                width: '100%',
                backgroundColor: 'rgba(11,31,58,0.6)',
                border: '1px solid rgba(214,154,45,0.2)',
                borderRadius: '0.75rem',
                padding: '0.875rem 1rem',
                color: 'var(--color-cream)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '2rem',
                  border: '1px solid rgba(214,154,45,0.3)',
                  background: 'transparent',
                  color: 'var(--color-rose)',
                  fontSize: '0.8rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !response.trim()}
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: '2rem',
                  border: 'none',
                  background: response.trim() ? 'var(--color-gold)' : 'rgba(214,154,45,0.3)',
                  color: response.trim() ? '#0B1F3A' : 'rgba(11,31,58,0.5)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: response.trim() ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}
              >
                {saving ? 'Saving...' : 'Submit'}
              </button>
            </div>
          </>
        ) : (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--color-gold)',
              fontStyle: 'italic',
              fontSize: '1rem',
            }}
          >
            Thank you. Your reflection was saved.
          </p>
        )}
      </div>
    </div>
  );
}
