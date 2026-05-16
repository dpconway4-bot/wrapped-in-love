import { Link, useLocation } from "wouter";
import { LogoWordmark } from "@/components/Logo";
import { getDayData, getWeekForDay, TOTAL_DAYS } from "@/data/index";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useBadges } from "@/hooks/useBadges";
import { BadgeToast } from "@/components/BadgeToast";
import { NotificationSettings } from "@/components/NotificationSettings";

async function openBillingPortal(token: string) {
  const res = await fetch('/api/billing', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else {
    alert('Could not open billing portal. Please email hello@wrappedinlove.com for help.');
  }
}

function getDayOfWeek() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}
function getDate() {
  return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

// Compute what day the user should be on based on their account creation date.
// New users (< 1 day since signup) start at intro Day -6.
// Otherwise, compute elapsed days from start date stored in user metadata.
function computeCurrentDay(createdAt: string | undefined): number {
  if (!createdAt) return -6;

  const signupDate = new Date(createdAt);
  const now = new Date();
  const msSinceSignup = now.getTime() - signupDate.getTime();
  const daysSinceSignup = Math.floor(msSinceSignup / (1000 * 60 * 60 * 24));

  // Days -6 to -1 = intro (days 0–5 since signup)
  // Day 1 starts on day 6 since signup (after intro)
  if (daysSinceSignup < 6) {
    return -6 + daysSinceSignup; // -6, -5, -4, -3, -2, -1
  }

  // Day 1–91 = main journey (days 6–96 since signup)
  const mainDay = daysSinceSignup - 5; // day 6 since signup = Day 1
  if (mainDay <= 91) return mainDay;

  // Days 92–100 = conclusion
  if (mainDay <= 100) return mainDay;

  // Beyond 100 — loop back to Day 1 for restart
  return ((mainDay - 1) % 100) + 1;
}

export default function AnchorPage() {
  const { user, session, signOut } = useAuth();
  const [, navigate] = useLocation();
  const [todayDay, setTodayDay] = useState<number>(-6);
  const [billingLoading, setBillingLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const { newBadge, dismissBadge, checkBadges } = useBadges(user?.id);

  // No outside-click handler — menu closes via backdrop tap or button action

  useEffect(() => {
    async function loadStartDay() {
      if (!user) return;

      // Get the user's created_at from Supabase auth
      const { data: { user: fullUser } } = await supabase.auth.getUser();
      const createdAt = fullUser?.created_at;
      const computed = computeCurrentDay(createdAt);
      setTodayDay(computed);
    }
    loadStartDay();
  }, [user]);

  // Check for newly earned badges when day is computed
  useEffect(() => {
    if (todayDay === -6 || !user) return;

    // Get journal count for this user
    supabase
      .from('journal_entries')
      .select('day', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => {
        checkBadges({ currentDay: todayDay, journalCount: count ?? 0 });
      });
  }, [todayDay, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const TODAY_DAY = todayDay;
  const todayData = getDayData(TODAY_DAY);
  const currentWeek = getWeekForDay(TODAY_DAY);

  // For progress bar: intro days count as 0, main journey 1-91, conclusion 92-100
  const progressDay = TODAY_DAY <= 0 ? 0 : TODAY_DAY;
  const journeyProgress = Math.round((progressDay / TOTAL_DAYS) * 100);

  if (!todayData || !currentWeek) return null;

  const weekDays = currentWeek.days;
  const isIntro = TODAY_DAY <= 0;
  const isConclusion = TODAY_DAY >= 92;

  // Display label for the section
  const sectionLabel = isIntro
    ? "The Growth Spurt"
    : isConclusion
    ? "Wrapped In Love"
    : `Love Is${(currentWeek as any).characteristic ? '' : ''}`;

  const heroTitle = isIntro ? (
    <>The Growth<br /><span style={{ color: "var(--color-gold)" }}>Spurt.</span></>
  ) : isConclusion ? (
    <>Wrapped In<br /><span style={{ color: "var(--color-gold)" }}>Love.</span></>
  ) : (
    <>Love Is<br /><span style={{ color: "var(--color-gold)" }}>{(currentWeek as any).characteristic}.</span></>
  );

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--color-bg)", maxWidth: "500px", margin: "0 auto", width: "100%" }}
    >
      <BadgeToast badge={newBadge} onDismiss={dismissBadge} />
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-8 pb-4 opacity-0-initial animate-fade-in">
        <LogoWordmark />
        <div className="flex items-center gap-2">
          <Link href="/journey">
            <button
              className="text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 rounded-full transition-all"
              style={{ color: "var(--color-rose)", border: "1px solid rgba(207,150,153,0.3)" }}
              data-testid="btn-journey"
            >
              Journey
            </button>
          </Link>
          <div style={{ position: 'relative' }}>
            <button
              data-testid="btn-account-menu"
              onClick={() => setMenuOpen(o => !o)}
              className="text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 rounded-full transition-all"
              style={{ color: "var(--color-rose)", border: "1px solid rgba(207,150,153,0.3)" }}
            >
              Account
            </button>
            {menuOpen && (
              <>
                {/* Invisible full-screen backdrop — tap outside to close */}
                <div
                  onClick={() => setMenuOpen(false)}
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 49,
                  }}
                />
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: 'var(--color-surface)',
                  border: '1px solid rgba(250,178,77,0.18)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(13,28,67,0.5)',
                  minWidth: '180px',
                  zIndex: 50,
                  overflow: 'visible',
                }}
              >
                <button
                  data-testid="btn-manage-subscription"
                  onClick={async () => {
                    setMenuOpen(false);
                    if (!session?.access_token) return;
                    setBillingLoading(true);
                    await openBillingPortal(session.access_token);
                    setBillingLoading(false);
                  }}
                  disabled={billingLoading}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid rgba(250,178,77,0.1)',
                    color: 'var(--color-cream)',
                    fontFamily: 'Jost, sans-serif',
                    fontSize: '0.8rem',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    opacity: billingLoading ? 0.5 : 1,
                  }}
                >
                  {billingLoading ? 'Loading...' : 'Manage Subscription'}
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowNotifSettings(s => !s);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid rgba(250,178,77,0.1)',
                    color: 'var(--color-cream)',
                    fontFamily: 'Jost, sans-serif',
                    fontSize: '0.8rem',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                  }}
                >
                  Email Reminders
                </button>
                <button
                  data-testid="btn-sign-out"
                  onClick={async () => {
                    setMenuOpen(false);
                    await signOut();
                    navigate('/login');
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-rose)',
                    fontFamily: 'Jost, sans-serif',
                    fontSize: '0.8rem',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                  }}
                >
                  Sign Out
                </button>
              </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Notification settings — full screen modal */}
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
          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              background: 'var(--color-surface)',
              border: '1px solid rgba(250,178,77,0.25)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(13,28,67,0.6)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 16px',
              borderBottom: '1px solid rgba(250,178,77,0.1)',
            }}>
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
                Email Reminders
              </span>
              <button
                onClick={() => setShowNotifSettings(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(207,150,153,0.5)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '4px' }}
              >
                ✕
              </button>
            </div>
            <NotificationSettings
              userId={user.id}
              userEmail={user.email || ''}
              onClose={() => setShowNotifSettings(false)}
            />
          </div>
        </div>
      )}

      {/* Date */}
      <div className="px-6 pt-2 pb-6 opacity-0-initial animate-fade-in delay-100">
        <p className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "var(--color-gold)" }}>
          {getDayOfWeek()} · {getDate()}
        </p>
      </div>

      <main className="flex-1 px-6 pb-10">

        {/* Series label */}
        <div className="mb-2 opacity-0-initial animate-fade-up delay-200">
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--color-rose)" }}>
            {isIntro
              ? `Introduction ${TODAY_DAY + 7}/6`
              : isConclusion
              ? `Wrapped In Love · Day ${TODAY_DAY}`
              : `100 Days In Love · Day ${TODAY_DAY}`}
          </p>
        </div>

        {/* Hero title */}
        <div className="mb-6 opacity-0-initial animate-fade-up delay-300">
          <h1
            className="font-display text-[2.8rem] font-light leading-tight"
            style={{ color: "var(--color-cream)", letterSpacing: "-0.01em" }}
          >
            {heroTitle}
          </h1>
        </div>

        {/* Divider */}
        <div
          className="h-px mb-6 opacity-0-initial animate-fade-in delay-300"
          style={{ background: "linear-gradient(to right, rgba(250,178,77,0.5), rgba(207,150,153,0.2), transparent)" }}
        />

        {/* Day badge */}
        <div className="mb-4 opacity-0-initial animate-fade-up delay-400">
          <span
            className="text-[10px] tracking-[0.3em] uppercase px-3 py-1 rounded-full"
            style={{
              background: "rgba(250,178,77,0.12)",
              color: "var(--color-gold)",
              border: "1px solid rgba(250,178,77,0.25)",
            }}
          >
            {todayData.type}
          </span>
        </div>

        {/* Opening line */}
        <div className="mb-8 opacity-0-initial animate-fade-up delay-400">
          <p className="font-display text-xl font-light leading-relaxed" style={{ color: "var(--color-cream)" }}>
            "{todayData.openingLine}"
          </p>
        </div>

        {/* Scripture card */}
        <div
          className="rounded-2xl p-5 mb-8 opacity-0-initial animate-fade-up delay-500"
          style={{
            background: "var(--color-surface)",
            border: "1px solid rgba(250,178,77,0.18)",
            boxShadow: "0 4px 24px rgba(13,28,67,0.4)",
          }}
          data-testid="scripture-card"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: "var(--color-gold)" }}>
            {todayData.scripture.reference}
          </p>
          <p
            className="font-display text-base font-light leading-relaxed italic"
            style={{ color: "var(--color-cream)", lineHeight: "1.75" }}
          >
            "{todayData.scripture.text}"
          </p>
        </div>

        {/* CTA */}
        <div className="opacity-0-initial animate-fade-up delay-600">
          <Link href={`/day/${TODAY_DAY}`}>
            <button
              className="w-full py-4 rounded-2xl tracking-[0.1em] uppercase text-sm transition-all active:scale-[0.98]"
              style={{
                background: "var(--color-gold)",
                color: "var(--color-navy)",
                fontWeight: 600,
                boxShadow: "0 0 48px rgba(250,178,77,0.25), 0 4px 16px rgba(13,28,67,0.5)",
              }}
              data-testid="btn-enter-anchor"
            >
              Enter Today's Anchor
            </button>
          </Link>
        </div>

        {/* Week dots */}
        <div className="mt-10 opacity-0-initial animate-fade-in delay-600">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-3 text-center" style={{ color: "var(--color-rose)" }}>
            {isIntro
              ? "The Growth Spurt · Introduction"
              : isConclusion
              ? "Wrapped In Love · Conclusion"
              : `Week ${Math.ceil(TODAY_DAY / 7)} · Love Is ${(currentWeek as any).characteristic}`}
          </p>
          <div className="flex justify-center gap-2">
            {weekDays.map((d: any) => (
              <Link href={`/day/${d.day}`} key={d.day}>
                <button
                  data-testid={`dot-day-${d.day}`}
                  className="transition-all"
                  aria-label={`Day ${d.day}: ${d.type}`}
                  title={`Day ${d.day}: ${d.type}`}
                  style={{
                    width: d.day === TODAY_DAY ? "28px" : "8px",
                    height: "8px",
                    borderRadius: "4px",
                    background: d.day === TODAY_DAY
                      ? "var(--color-gold)"
                      : d.day < TODAY_DAY
                      ? "rgba(250,178,77,0.5)"
                      : "rgba(250,178,77,0.18)",
                  }}
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Journey bar */}
        <div className="mt-8 opacity-0-initial animate-fade-in delay-700">
          <div className="flex justify-between mb-2">
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--color-rose)" }}>
              100 Days In Love
            </span>
            <span className="text-[10px]" style={{ color: "var(--color-rose)" }}>
              {isIntro ? `Intro · Day ${TODAY_DAY}` : `Day ${TODAY_DAY} of ${TOTAL_DAYS}`}
            </span>
          </div>
          <div className="h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(250,178,77,0.12)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(journeyProgress, 2)}%`,
                background: "linear-gradient(to right, var(--color-red), var(--color-gold))",
              }}
            />
          </div>
        </div>

      </main>
    </div>
  );
}
