import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';

const inputStyle = {
  background: 'rgba(25, 59, 137, 0.25)',
  border: '1px solid rgba(250, 178, 77, 0.25)',
  borderRadius: '8px',
  padding: '0.85rem 1rem',
  color: '#ffffff',
  fontFamily: 'Jost, sans-serif',
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  width: '100%',
  boxSizing: 'border-box' as const,
};

// Defined OUTSIDE component so it never remounts on re-render
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(180deg, #0D1C43 0%, #0a1530 100%)' }}
    >
      <div className="grain-overlay" aria-hidden="true" />
      <div className="mb-8 flex flex-col items-center gap-3">
        <Logo />
        <p className="text-center text-sm tracking-widest uppercase" style={{ color: '#FAB24D', fontFamily: 'Jost, sans-serif', letterSpacing: '0.2em' }}>
          100 Days In Love
        </p>
      </div>
      {children}
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

export default function LoginPage() {
  const { sendOtp, verifyOtp } = useAuth();
  const [, navigate] = useLocation();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await sendOtp(email);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setStep('code');
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = code.join('');
    if (token.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setError('');
    setLoading(true);
    const { error } = await verifyOtp(email, token);
    setLoading(false);
    if (error) {
      setError("That code didn't work. Check your email and try again.");
    } else {
      navigate('/home');
    }
  };

  const handleResend = async () => {
    setError('');
    setCode(['', '', '', '', '', '']);
    setLoading(true);
    const { error } = await sendOtp(email);
    setLoading(false);
    if (error) setError(error);
    inputRefs.current[0]?.focus();
  };

  // Both steps stay mounted — show/hide with CSS to prevent keyboard dismissal on mobile
  return (
    <PageWrapper>

      {/* ── Step 1: Email ── */}
      <div style={{ display: step === 'email' ? 'contents' : 'none' }}>
        <div className="mb-8 text-center max-w-xs">
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '2rem',
            fontWeight: 300,
            color: '#ffffff',
            lineHeight: 1.3,
            marginBottom: '0.75rem',
          }}>
            Welcome back.
          </h1>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.9rem', color: '#CF9699', lineHeight: 1.7 }}>
            Your journey is waiting. Enter your email and we'll send you a code to sign in.
          </p>
        </div>

        <form onSubmit={handleSendOtp} className="w-full max-w-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#CF9699',
            }}>
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required={step === 'email'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(250, 178, 77, 0.6)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(250, 178, 77, 0.25)')}
              placeholder="you@example.com"
            />
          </div>

          {error && step === 'email' && (
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: '#CF9699', textAlign: 'center' }}>
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
            {loading ? 'Sending code...' : 'Send My Code'}
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
      </div>

      {/* ── Step 2: Code entry ── */}
      <div style={{ display: step === 'code' ? 'contents' : 'none' }}>
        <div className="mb-8 text-center max-w-xs">
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '2rem',
            fontWeight: 300,
            color: '#FAB24D',
            lineHeight: 1.3,
            marginBottom: '0.75rem',
          }}>
            You're almost in.
          </h1>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.9rem', color: '#CF9699', lineHeight: 1.7 }}>
            We sent a 6-digit code to <strong style={{ color: '#ffffff' }}>{email}</strong>. Enter it below.
          </p>
        </div>

        <form onSubmit={handleVerify} className="w-full max-w-sm flex flex-col gap-6">
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }} onPaste={handleCodePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleCodeChange(i, e.target.value)}
                onKeyDown={e => handleCodeKeyDown(i, e)}
                style={{
                  width: '48px',
                  height: '58px',
                  background: 'rgba(25, 59, 137, 0.25)',
                  border: digit ? '1px solid rgba(250, 178, 77, 0.7)' : '1px solid rgba(250, 178, 77, 0.25)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(250, 178, 77, 0.8)')}
                onBlur={e => (e.target.style.borderColor = digit ? 'rgba(250, 178, 77, 0.7)' : 'rgba(250, 178, 77, 0.25)')}
              />
            ))}
          </div>

          {error && step === 'code' && (
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: '#CF9699', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.join('').length < 6}
            style={{
              background: (loading || code.join('').length < 6) ? 'rgba(250, 178, 77, 0.5)' : '#FAB24D',
              color: '#0D1C43',
              border: 'none',
              borderRadius: '8px',
              padding: '0.9rem 1rem',
              fontFamily: 'Jost, sans-serif',
              fontWeight: 600,
              fontSize: '0.95rem',
              letterSpacing: '0.08em',
              cursor: (loading || code.join('').length < 6) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Verifying...' : 'Enter Your Journey'}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={loading}
          style={{
            marginTop: '1.5rem',
            background: 'none',
            border: 'none',
            fontFamily: 'Jost, sans-serif',
            fontSize: '0.8rem',
            color: '#CF9699',
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          Didn't get it? Resend code
        </button>

        <button
          onClick={() => { setStep('email'); setError(''); setCode(['', '', '', '', '', '']); }}
          style={{
            marginTop: '0.75rem',
            background: 'none',
            border: 'none',
            fontFamily: 'Jost, sans-serif',
            fontSize: '0.8rem',
            color: 'rgba(207, 150, 153, 0.5)',
            cursor: 'pointer',
          }}
        >
          ← Use a different email
        </button>
      </div>

    </PageWrapper>
  );
}
