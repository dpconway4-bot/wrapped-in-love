import { Link, useLocation } from "wouter";
import { useState } from "react";
import { LogoWordmark } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { NotificationSettings } from "@/components/NotificationSettings";
import { RestartModal } from "@/components/RestartModal";

async function openBillingPortal(token: string) {
  const res = await fetch('/api/billing', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else {
    alert('Could not open billing portal. Please email hello@wrappedinlove.app for help.');
  }
}

export default function AccountPage() {
  const { user, session, signOut } = useAuth();
  const [, navigate] = useLocation();
  const [billingLoading, setBillingLoading] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);

  const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '18px 20px',
    background: 'rgba(25,59,137,0.2)',
    border: '1px solid rgba(25,59,137,0.35)',
    borderRadius: '14px',
    cursor: 'pointer',
    fontFamily: 'Jost, sans-serif',
    fontSize: '0.9rem',
    letterSpacing: '0.05em',
    color: 'var(--color-cream)' as const,
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    WebkitTapHighlightColor: 'transparent',
    textAlign: 'left' as const,
  };

  const chevron = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgba(201,123,107,0.4)', flexShrink: 0 }}>
      <path d="M9 18l6-6-6-6"/>
    </svg>
  );

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--color-bg)", maxWidth: "500px", margin: "0 auto", width: "100%" }}
    >
      <header className="flex items-center justify-between px-6 pt-8 pb-4">
        <Link href="/home">
          <button
            className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--color-rose)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Home
          </button>
        </Link>
        <LogoWordmark />
      </header>

      <main className="flex-1 px-6 pb-12">
        <div className="mb-1 opacity-0-initial animate-fade-in">
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--color-gold)" }}>
            Settings
          </p>
        </div>
        <div className="mb-7 opacity-0-initial animate-fade-up delay-100">
          <h1 className="font-display text-[2rem] font-light leading-tight" style={{ color: "var(--color-cream)" }}>
            Account
          </h1>
        </div>

        <div className="space-y-3 opacity-0-initial animate-fade-up delay-200">

          {/* Manage Subscription */}
          <button
            style={{ ...menuItemStyle }}
            onClick={async () => {
              if (!session?.access_token) return;
              setBillingLoading(true);
              await openBillingPortal(session.access_token);
              setBillingLoading(false);
            }}
          >
            <span>{billingLoading ? 'Loading…' : 'Manage Subscription'}</span>
            {chevron}
          </button>

          {/* Email Reminders */}
          <button
            style={{ ...menuItemStyle }}
            onClick={() => setShowNotifSettings(s => !s)}
          >
            <span>Email Reminders</span>
            {chevron}
          </button>

          {/* Getting Started */}
          <button
            style={{ ...menuItemStyle }}
            onClick={() => {
              localStorage.removeItem('wil_onboarding_complete');
              navigate('/onboarding');
            }}
          >
            <span>Getting Started</span>
            {chevron}
          </button>

          {/* Restart Journey */}
          <button
            style={{ ...menuItemStyle, color: 'var(--color-gold)', border: '1px solid rgba(214,154,45,0.2)' }}
            onClick={() => setShowRestartModal(true)}
          >
            <span>Restart Journey</span>
            {chevron}
          </button>

          {/* Sign Out */}
          <button
            style={{ ...menuItemStyle, color: 'var(--color-rose)', border: '1px solid rgba(201,123,107,0.15)', marginTop: '24px' }}
            onClick={() => {
              signOut().then(() => {
                window.location.href = '/login';
              });
            }}
          >
            <span>Sign Out</span>
            {chevron}
          </button>

        </div>

        {/* User info */}
        {user?.email && (
          <p className="text-center text-[11px] mt-10" style={{ color: 'rgba(201,123,107,0.3)' }}>
            {user.email}
          </p>
        )}
      </main>

      {/* Notification settings modal */}
      {showNotifSettings && user && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowNotifSettings(false); }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(13,28,67,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <NotificationSettings userId={user.id} onClose={() => setShowNotifSettings(false)} />
        </div>
      )}

      {/* Restart Journey modal */}
      {showRestartModal && (
        <RestartModal
          onClose={() => setShowRestartModal(false)}
          onRestarted={() => {
            setShowRestartModal(false);
            window.location.href = '/home';
          }}
        />
      )}
    </div>
  );
}
