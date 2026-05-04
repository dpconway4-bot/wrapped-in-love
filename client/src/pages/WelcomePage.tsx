import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';

type Step = 'create' | 'verify';

export default function WelcomePage() {
  const { signUp } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>('create');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      if (error.includes('already registered') || error.includes('already been registered')) {
        setError('An account with this email already exists. Please log in instead.');
      } else {
        setError(error);
      }
    } else {
      setStep('verify');
    }
  };

  if (step === 'verify') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: 'linear-gradient(180deg, #0D1C43 0%, #0a1530 100%)' }}>
        <div className="grain-overlay" aria-hidden="true" />

        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo />
        </div>

        <div className="text-center max-w-xs">
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '2rem',
            fontWeight: 300,
            color: '#FAB24D',
            lineHeight: 1.3,
            marginBottom: '1.25rem',
          }}>
            You're almost in.
          </h1>
          <p style={{
            fontFamily: 'Jost, sans-serif',
            fontSize: '0.95rem',
            color: '#CF9699',
            lineHeight: 1.7,
            marginBottom: '2rem',
          }}>
            We sent a confirmation link to <strong style={{ color: '#ffffff' }}>{email}</strong>.
            Open it to activate your account, then come back here to begin.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: '#FAB24D',
              color: '#0D1C43',
              border: 'none',
              borderRadius: '8px',
              padding: '0.9rem 2rem',
              fontFamily: 'Jost, sans-serif',
              fontWeight: 600,
              fontSize: '0.95rem',
              letterSpacing: '0.08em',
              cursor: 'pointer',
            }}
          >
            Go to Login
          </button>
        </div>

        <p style={{
          marginTop: '3rem',
          fontFamily: 'Cormorant Garamond, serif',
          fontStyle: 'italic',
          fontSize: '0.85rem',
          color: 'rgba(207, 150, 153, 0.5)',
          textAlign: 'center',
          maxWidth: '260px',
          lineHeight: 1.6,
        }}>
          "Love never gives up, never loses faith, is always hopeful."
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(180deg, #0D1C43 0%, #0a1530 100%)' }}>
      <div className="grain-overlay" aria-hidden="true" />

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <Logo />
        <p className="text-center text-sm tracking-widest uppercase" style={{ color: '#FAB24D', fontFamily: 'Jost, sans-serif', letterSpacing: '0.2em' }}>
          100 Days In Love
        </p>
      </div>

      {/* Motivational welcome */}
      <div className="mb-8 text-center max-w-xs">
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '2rem',
          fontWeight: 300,
          color: '#ffffff',
          lineHeight: 1.3,
          marginBottom: '0.75rem',
        }}>
          Your journey begins here.
        </h1>
        <p style={{
          fontFamily: 'Jost, sans-serif',
          fontSize: '0.9rem',
          color: '#CF9699',
          lineHeight: 1.7,
        }}>
          You've made a courageous choice. Create your account and step into 100 days that will transform how you love.
        </p>
      </div>

      {/* Signup form */}
      <form onSubmit={handleCreate} className="w-full max-w-sm flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" style={{
            fontFamily: 'Jost, sans-serif',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#CF9699',
          }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              background: 'rgba(25, 59, 137, 0.25)',
              border: '1px solid rgba(250, 178, 77, 0.25)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              color: '#ffffff',
              fontFamily: 'Jost, sans-serif',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(250, 178, 77, 0.6)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(250, 178, 77, 0.25)')}
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" style={{
            fontFamily: 'Jost, sans-serif',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#CF9699',
          }}>
            Create Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              background: 'rgba(25, 59, 137, 0.25)',
              border: '1px solid rgba(250, 178, 77, 0.25)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              color: '#ffffff',
              fontFamily: 'Jost, sans-serif',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(250, 178, 77, 0.6)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(250, 178, 77, 0.25)')}
            placeholder="At least 8 characters"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm" style={{
            fontFamily: 'Jost, sans-serif',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#CF9699',
          }}>
            Confirm Password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            style={{
              background: 'rgba(25, 59, 137, 0.25)',
              border: '1px solid rgba(250, 178, 77, 0.25)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              color: '#ffffff',
              fontFamily: 'Jost, sans-serif',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(250, 178, 77, 0.6)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(250, 178, 77, 0.25)')}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p style={{
            fontFamily: 'Jost, sans-serif',
            fontSize: '0.85rem',
            color: '#CF9699',
            textAlign: 'center',
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '0.5rem',
            background: loading ? 'rgba(250, 178, 77, 0.5)' : '#FAB24D',
            color: '#0D1C43',
            border: 'none',
            borderRadius: '8px',
            padding: '0.9rem 1rem',
            fontFamily: 'Jost, sans-serif',
            fontWeight: 600,
            fontSize: '0.95rem',
            letterSpacing: '0.08em',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating your account...' : 'Begin the Journey'}
        </button>
      </form>

      <div style={{ margin: '1.5rem 0 0.5rem', color: '#CF9699', fontFamily: 'Jost, sans-serif', fontSize: '0.8rem' }}>
        Already have an account?
      </div>
      <a
        href="/login"
        style={{
          fontFamily: 'Jost, sans-serif',
          fontSize: '0.85rem',
          color: '#FAB24D',
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
        }}
      >
        Sign in here →
      </a>

      <p style={{
        marginTop: '3rem',
        fontFamily: 'Cormorant Garamond, serif',
        fontStyle: 'italic',
        fontSize: '0.85rem',
        color: 'rgba(207, 150, 153, 0.5)',
        textAlign: 'center',
        maxWidth: '260px',
        lineHeight: 1.6,
      }}>
        "Love is patient. Love is kind." — 1 Corinthians 13:4
      </p>
    </div>
  );
}
