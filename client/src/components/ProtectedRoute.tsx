import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const TRIAL_PAYMENT_LINK = 'https://buy.stripe.com/eVq14nfhe3Yn8U85hOafS04';
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/eVq14nfhe3Yn8U85hOafS04';

type PurchaseStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | null;

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0D1C43',
    }}>
      <div style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '1.25rem',
        color: 'rgba(250, 178, 77, 0.6)',
        fontStyle: 'italic',
      }}>
        Loading your journey...
      </div>
    </div>
  );
}

function PaywallScreen({ email }: { email: string }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      background: 'linear-gradient(180deg, #0D1C43 0%, #0a1530 100%)',
      textAlign: 'center',
    }}>
      {/* Heart icon */}
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: '1.5px solid rgba(250, 178, 77, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
      }}>
        <span style={{ fontSize: '1.4rem' }}>♡</span>
      </div>

      <p style={{
        fontFamily: 'Jost, sans-serif',
        fontSize: '0.75rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: '#FAB24D',
        marginBottom: '1rem',
      }}>
        100 Days In Love
      </p>

      <h1 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '2rem',
        fontWeight: 300,
        color: '#ffffff',
        lineHeight: 1.3,
        marginBottom: '1rem',
        maxWidth: '300px',
      }}>
        Your journey is one step away.
      </h1>

      <p style={{
        fontFamily: 'Jost, sans-serif',
        fontSize: '0.9rem',
        color: '#CF9699',
        lineHeight: 1.7,
        maxWidth: '280px',
        marginBottom: '0.5rem',
      }}>
        We don't see a purchase linked to <strong style={{ color: '#ffffff' }}>{email}</strong>.
      </p>

      <p style={{
        fontFamily: 'Jost, sans-serif',
        fontSize: '0.9rem',
        color: '#CF9699',
        lineHeight: 1.7,
        maxWidth: '280px',
        marginBottom: '2.5rem',
      }}>
        Start your free 7-day trial today — no charge until day 8.
      </p>

      <a
        href={STRIPE_PAYMENT_LINK}
        style={{
          display: 'block',
          width: '100%',
          maxWidth: '320px',
          background: '#FAB24D',
          color: '#0D1C43',
          border: 'none',
          borderRadius: '8px',
          padding: '0.9rem 1rem',
          fontFamily: 'Jost, sans-serif',
          fontWeight: 600,
          fontSize: '0.95rem',
          letterSpacing: '0.08em',
          textDecoration: 'none',
          marginBottom: '1.25rem',
        }}
      >
        Start Free Trial — 7 Days Free
      </a>

      <p style={{
        fontFamily: 'Jost, sans-serif',
        fontSize: '0.75rem',
        color: 'rgba(207, 150, 153, 0.5)',
        lineHeight: 1.6,
        maxWidth: '260px',
      }}>
        Already purchased? Make sure you're signed in with the same email used at checkout.
      </p>

      <p style={{
        marginTop: '3rem',
        fontFamily: 'Cormorant Garamond, serif',
        fontStyle: 'italic',
        fontSize: '0.85rem',
        color: 'rgba(207, 150, 153, 0.4)',
        maxWidth: '260px',
        lineHeight: 1.6,
      }}>
        "Love bears all things, believes all things, hopes all things, endures all things."
      </p>
    </div>
  );
}

function CanceledScreen({ email }: { email: string }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      background: 'linear-gradient(180deg, #0D1C43 0%, #0a1530 100%)',
      textAlign: 'center',
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: '1.5px solid rgba(250, 178, 77, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
      }}>
        <span style={{ fontSize: '1.4rem' }}>♡</span>
      </div>

      <p style={{
        fontFamily: 'Jost, sans-serif',
        fontSize: '0.75rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: '#FAB24D',
        marginBottom: '1rem',
      }}>
        100 Days In Love
      </p>

      <h1 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '2rem',
        fontWeight: 300,
        color: '#ffffff',
        lineHeight: 1.3,
        marginBottom: '1rem',
        maxWidth: '300px',
      }}>
        We'd love to have you back.
      </h1>

      <p style={{
        fontFamily: 'Jost, sans-serif',
        fontSize: '0.9rem',
        color: '#CF9699',
        lineHeight: 1.7,
        maxWidth: '280px',
        marginBottom: '2.5rem',
      }}>
        Your subscription for <strong style={{ color: '#ffffff' }}>{email}</strong> has ended. Resubscribe to continue your journey.
      </p>

      <a
        href={TRIAL_PAYMENT_LINK}
        style={{
          display: 'block',
          width: '100%',
          maxWidth: '320px',
          background: '#FAB24D',
          color: '#0D1C43',
          border: 'none',
          borderRadius: '8px',
          padding: '0.9rem 1rem',
          fontFamily: 'Jost, sans-serif',
          fontWeight: 600,
          fontSize: '0.95rem',
          letterSpacing: '0.08em',
          textDecoration: 'none',
          marginBottom: '1.25rem',
        }}
      >
        Resubscribe — $14.97/mo
      </a>

      <p style={{
        marginTop: '3rem',
        fontFamily: 'Cormorant Garamond, serif',
        fontStyle: 'italic',
        fontSize: '0.85rem',
        color: 'rgba(207, 150, 153, 0.4)',
        maxWidth: '260px',
        lineHeight: 1.6,
      }}>
        "Love never gives up, never loses faith, is always hopeful."
      </p>
    </div>
  );
}

// Banner shown when trial ends in 2 days or fewer
function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const msg = daysLeft <= 0
    ? 'Your free trial ends today. You\'ll be charged $14.97 tonight.'
    : daysLeft === 1
    ? 'Your free trial ends tomorrow. You\'ll be charged $14.97.'
    : `Your free trial ends in ${daysLeft} days.`;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      background: '#FAB24D',
      color: '#0D1C43',
      fontFamily: 'Jost, sans-serif',
      fontSize: '0.8rem',
      fontWeight: 600,
      letterSpacing: '0.04em',
      textAlign: 'center',
      padding: '8px 16px',
    }}>
      {msg}
    </div>
  );
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [purchaseChecked, setPurchaseChecked] = useState(false);
  const [status, setStatus] = useState<PurchaseStatus>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Check verified_purchasers table once user is known
  useEffect(() => {
    if (!user?.email) return;

    supabase
      .from('verified_purchasers')
      .select('email, status, trial_ends_at')
      .eq('email', user.email.toLowerCase())
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setStatus((data.status as PurchaseStatus) ?? 'active');
          setTrialEndsAt(data.trial_ends_at ?? null);
        } else {
          setStatus(null);
        }
        setPurchaseChecked(true);
      });
  }, [user?.email]);

  if (loading || !user) return <LoadingScreen />;
  if (!purchaseChecked) return <LoadingScreen />;

  // No record at all → paywall
  if (status === null) return <PaywallScreen email={user.email} />;

  // Canceled → resubscribe screen
  if (status === 'canceled') return <CanceledScreen email={user.email} />;

  // Calculate trial days remaining for banner
  let trialDaysLeft: number | null = null;
  if (status === 'trialing' && trialEndsAt) {
    const msLeft = new Date(trialEndsAt).getTime() - Date.now();
    trialDaysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  }

  const showBanner = trialDaysLeft !== null && trialDaysLeft <= 2;

  return (
    <>
      {showBanner && <TrialBanner daysLeft={trialDaysLeft!} />}
      <div style={showBanner ? { paddingTop: '36px' } : undefined}>
        {children}
      </div>
    </>
  );
}
