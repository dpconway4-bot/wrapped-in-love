import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError('Email or password is incorrect. Please try again.');
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(180deg, #0D1C43 0%, #0a1530 100%)' }}>

      {/* Grain overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <Logo />
        <p className="text-center text-sm tracking-widest uppercase" style={{ color: '#FAB24D', fontFamily: 'Jost, sans-serif', letterSpacing: '0.2em' }}>
          100 Days In Love
        </p>
      </div>

      {/* Welcome message */}
      <div className="mb-10 text-center max-w-xs">
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.75rem',
          fontWeight: 300,
          color: '#ffffff',
          lineHeight: 1.3,
          marginBottom: '0.75rem',
        }}>
          Welcome back.
        </h1>
        <p style={{
          fontFamily: 'Jost, sans-serif',
          fontSize: '0.9rem',
          color: '#CF9699',
          lineHeight: 1.6,
        }}>
          Your journey is waiting for you. Come back to the quiet.
        </p>
      </div>

      {/* Login form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
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
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
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
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? 'Signing in...' : 'Enter Your Journey'}
        </button>
      </form>

      {/* New user CTA */}
      <div style={{ margin: '2rem 0 0', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', color: '#CF9699', marginBottom: '0.5rem' }}>
          New here?
        </p>
        <a
          href="https://100-days-in-love.pages.dev"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'Jost, sans-serif',
            fontSize: '0.85rem',
            color: '#FAB24D',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          Begin your 100-day journey →
        </a>
      </div>

      {/* Scripture */}
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
        "Love bears all things, believes all things, hopes all things, endures all things."
      </p>
    </div>
  );
}
