import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/cNi4gz4CA1QffiwdOkafS03';

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
        Complete your purchase to unlock full access to 100 Days In Love.
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
        Start My Journey — $14.97/mo
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

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [purchaseChecked, setPurchaseChecked] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

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
      .select('email')
      .eq('email', user.email.toLowerCase())
      .maybeSingle()
      .then(({ data }) => {
        setHasPurchased(!!data);
        setPurchaseChecked(true);
      });
  }, [user?.email]);

  if (loading || !user) return <LoadingScreen />;
  if (!purchaseChecked) return <LoadingScreen />;
  if (!hasPurchased) return <PaywallScreen email={user.email} />;

  return <>{children}</>;
}
