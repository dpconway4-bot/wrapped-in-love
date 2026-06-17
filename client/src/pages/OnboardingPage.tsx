import { useLocation } from 'wouter';
import { useEffect } from 'react';

const ONBOARDING_KEY = 'wil_onboarding_complete';

export function shouldShowOnboarding(): boolean {
  try {
    return !localStorage.getItem(ONBOARDING_KEY);
  } catch {
    return false;
  }
}

export function markOnboardingComplete(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, '1');
  } catch {}
}

export default function OnboardingPage() {
  const [, navigate] = useLocation();

  // Safety: if already completed, go home
  useEffect(() => {
    if (!shouldShowOnboarding()) {
      navigate('/home');
    }
  }, []);

  function handleBegin() {
    markOnboardingComplete();
    navigate('/home');
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(170deg, #0B1F3A 0%, #091828 60%, #0B1F3A 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      fontFamily: 'Jost, sans-serif',
      overflowY: 'auto',
    }}>

      {/* Logo mark */}
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        border: '1.5px solid rgba(214,154,45,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
      }}>
        <span style={{ fontSize: '1.3rem', color: '#D69A2D' }}>♡</span>
      </div>

      {/* Eyebrow */}
      <p style={{
        fontSize: '0.7rem',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: '#D69A2D',
        marginBottom: '1rem',
        textAlign: 'center',
      }}>
        Welcome to Wrapped In Love
      </p>

      {/* Headline */}
      <h1 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 'clamp(2rem, 6vw, 2.75rem)',
        fontWeight: 300,
        color: '#ffffff',
        lineHeight: 1.2,
        textAlign: 'center',
        marginBottom: '1rem',
        maxWidth: '340px',
      }}>
        Here's what your next 100 days will feel like.
      </h1>

      <p style={{
        fontSize: '0.95rem',
        color: '#C97B6B',
        lineHeight: 1.75,
        textAlign: 'center',
        maxWidth: '300px',
        marginBottom: '2.5rem',
      }}>
        You're about to begin a guided journey through 1 Corinthians 13 — one day at a time, one anchor at a time.
      </p>

      {/* Four steps */}
      <div style={{
        width: '100%',
        maxWidth: '360px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '2.5rem',
      }}>

        {/* Step 1 — Save the app */}
        <div style={{
          background: 'rgba(25,59,137,0.35)',
          border: '1px solid rgba(214,154,45,0.2)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}>
          <div style={{
            minWidth: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(214,154,45,0.15)',
            border: '1px solid rgba(214,154,45,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            color: '#D69A2D',
            fontWeight: 700,
          }}>1</div>
          <div>
            <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
              Save this app to your Home Screen
            </p>
            <p style={{ color: '#C97B6B', fontSize: '0.8rem', lineHeight: 1.6 }}>
              <strong style={{ color: 'rgba(255,255,255,0.7)' }}>iPhone:</strong> Tap the Share icon <span style={{ fontSize: '0.75rem' }}>⬆</span> at the bottom of Safari → <em>Add to Home Screen</em>
            </p>
            <p style={{ color: '#C97B6B', fontSize: '0.8rem', lineHeight: 1.6, marginTop: '0.25rem' }}>
              <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Android:</strong> Tap the Menu icon <span style={{ fontSize: '0.75rem' }}>⋮</span> in Chrome → <em>Add to Home Screen</em>
            </p>
          </div>
        </div>

        {/* Step 2 — Complete intro */}
        <div style={{
          background: 'rgba(25,59,137,0.35)',
          border: '1px solid rgba(214,154,45,0.2)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}>
          <div style={{
            minWidth: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(214,154,45,0.15)',
            border: '1px solid rgba(214,154,45,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            color: '#D69A2D',
            fontWeight: 700,
          }}>2</div>
          <div>
            <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
              Complete the Introduction (6 pages)
            </p>
            <p style={{ color: '#C97B6B', fontSize: '0.8rem', lineHeight: 1.6 }}>
              Six short pages that lay the foundation for everything ahead. You can read through them in one sitting.
            </p>
          </div>
        </div>

        {/* Step 3 — Badges */}
        <div style={{
          background: 'rgba(25,59,137,0.35)',
          border: '1px solid rgba(214,154,45,0.2)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}>
          <div style={{
            minWidth: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(214,154,45,0.15)',
            border: '1px solid rgba(214,154,45,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            color: '#D69A2D',
            fontWeight: 700,
          }}>3</div>
          <div>
            <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
              Earn badges along the way
            </p>
            <p style={{ color: '#C97B6B', fontSize: '0.8rem', lineHeight: 1.6 }}>
              As you show up each day, badges mark your milestones. Check the Journey page to see your progress.
            </p>
          </div>
        </div>

        {/* Step 4 — Emails */}
        <div style={{
          background: 'rgba(25,59,137,0.35)',
          border: '1px solid rgba(214,154,45,0.2)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}>
          <div style={{
            minWidth: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(214,154,45,0.15)',
            border: '1px solid rgba(214,154,45,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            color: '#D69A2D',
            fontWeight: 700,
          }}>4</div>
          <div>
            <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
              Look out for your anchor emails
            </p>
            <p style={{ color: '#C97B6B', fontSize: '0.8rem', lineHeight: 1.6 }}>
              Every few days we'll send a short note to encourage you and keep you on track. Check your inbox and save the sender.
            </p>
          </div>
        </div>

      </div>

      {/* CTA */}
      <button
        onClick={handleBegin}
        style={{
          width: '100%',
          maxWidth: '360px',
          background: '#D69A2D',
          color: '#0B1F3A',
          border: 'none',
          borderRadius: '8px',
          padding: '1rem',
          fontFamily: 'Jost, sans-serif',
          fontWeight: 700,
          fontSize: '0.95rem',
          letterSpacing: '0.06em',
          cursor: 'pointer',
          marginBottom: '1.5rem',
        }}
      >
        BEGIN THE INTRODUCTION
      </button>

      {/* Closing verse */}
      <p style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontStyle: 'italic',
        fontSize: '0.85rem',
        color: 'rgba(201,123,107,0.5)',
        textAlign: 'center',
        maxWidth: '260px',
        lineHeight: 1.7,
      }}>
        "Love is patient, love is kind."<br />— 1 Corinthians 13:4
      </p>

    </div>
  );
}
