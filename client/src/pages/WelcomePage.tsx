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
        "Love is patient. Love is kind." — 1 Corinthians 13:4
      </p>
    </div>
  );
}

export default function WelcomePage() {
  const { sendOtp, verifyOtp } = useAuth();
  const [, navigate] = useLocation();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Step 1: Send OTP ──
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

  // ── Step 2: Handle 6-digit code input ──
  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    // Auto-advance focus
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

  // ── Step 2: Verify OTP ──
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
      setError('That code didn\'t work. Check your email and try again.');
    } else {
      // Supabase session is now active — navigate into the app
      navigate('/home');
    }
  };

  const handleResend = async () => {
    setError('');
    setCode(['', '', '', '', '', '']);
    setLoading(true);
    const { error } = await sendOtp(email);
    setLoading(false);
    if (error) {
      setError(error);
    }
    inputRefs.current[0]?.focus();
  };

  // ── Step 1: Email entry ──
  if (step === 'email') {
    return (
      <PageWrapper>
        <div className="mb-8 text-center max-w-xs">
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, color: '#ffffff', lineHeight: 1.3, marginBottom: '0.75rem' }}>
            Your journey begins here.
          </h1>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.9rem', color: '#CF9699', lineHeight: 1.7 }}>
            Enter your email and we'll send you a 6-digit code to get started. No password needed.
          </p>
        </div>

        <form onSubmit={handleSendOtp} className="w-full max-w-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#CF9699' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(250, 178, 77, 0.6)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(250, 178, 77, 0.25)')}
              placeholder="you@example.com"
            />
          </div>

          {error && (
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

        <div style={{ margin: '1.5rem 0 0.5rem', color: '#CF9699', fontFamily: 'Jost, sans-serif', fontSize: '0.8rem' }}>
          Already have an account?
        </div>
        <a href="/login" style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', color: '#FAB24D', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
          Sign in here →
        </a>
      </PageWrapper>
    );
  }

  // ── Step 2: Code entry ──
  return (
    <Wrapper>
      <div className="mb-8 text-center max-w-xs">
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, color: '#FAB24D', lineHeight: 1.3, marginBottom: '0.75rem' }}>
          You're almost in.
        </h1>
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.9rem', color: '#CF9699', lineHeight: 1.7 }}>
          We sent a 6-digit code to <strong style={{ color: '#ffffff' }}>{email}</strong>. Enter it below to begin.
        </p>
      </div>

      <form onSubmit={handleVerify} className="w-full max-w-sm flex flex-col gap-6">
        {/* 6-digit code boxes */}
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
              data-testid={`otp-input-${i}`}
            />
          ))}
        </div>

        {error && (
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
          {loading ? 'Verifying...' : 'Begin the Journey'}
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
    </PageWrapper>
  );
}
