import { Link } from "wouter";
import { LogoWordmark } from "@/components/Logo";
import { ALL_CHARACTERISTICS, TOTAL_DAYS } from "@/data/index";
import { useAuth } from "@/context/AuthContext";
import { useBadges } from "@/hooks/useBadges";
import { BADGE_DEFS } from "@/data/badges";

const TODAY_DAY = 1;
const CURRENT_WEEK = Math.ceil(TODAY_DAY / 7);

// The three-part scripture arc
const PART_1 = ALL_CHARACTERISTICS.filter(c => c.part === 1);
const PART_2 = ALL_CHARACTERISTICS.filter(c => c.part === 2);
const PART_3 = ALL_CHARACTERISTICS.filter(c => c.part === 3);

export default function JourneyPage() {
  const { user } = useAuth();
  const { earned } = useBadges(user?.id);
  const journeyProgress = Math.round((TODAY_DAY / TOTAL_DAYS) * 100);

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
            data-testid="btn-back"
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

        {/* Hero */}
        <div className="mb-1 opacity-0-initial animate-fade-in">
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--color-gold)" }}>
            1 Corinthians 13:4–7
          </p>
        </div>
        <div className="mb-1 opacity-0-initial animate-fade-up delay-100">
          <h1 className="font-display text-[2rem] font-light leading-tight" style={{ color: "var(--color-cream)" }}>
            100 Days In Love
          </h1>
        </div>
        <div className="mb-7 opacity-0-initial animate-fade-in delay-100">
          <p className="text-sm" style={{ color: "var(--color-rose)" }}>
            13 characteristics. 100 days. One truth. Begin anywhere.
          </p>
        </div>

        {/* Overall progress */}
        <div
          className="rounded-2xl p-5 mb-8 opacity-0-initial animate-fade-up delay-200"
          style={{
            background: "var(--color-surface)",
            border: "1px solid rgba(250,178,77,0.18)",
            boxShadow: "0 4px 24px rgba(13,28,67,0.4)",
          }}
          data-testid="overall-progress"
        >
          <div className="flex justify-between mb-3">
            <span className="text-xs" style={{ color: "var(--color-rose)" }}>Overall Progress</span>
            <span className="text-xs font-medium" style={{ color: "var(--color-gold)" }}>
              Day {TODAY_DAY} of {TOTAL_DAYS}
            </span>
          </div>
          <div className="h-[3px] rounded-full overflow-hidden mb-3" style={{ background: "rgba(250,178,77,0.12)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(journeyProgress, 2)}%`,
                background: "linear-gradient(to right, var(--color-red), var(--color-gold))",
              }}
            />
          </div>
          <p className="text-[11px]" style={{ color: "var(--color-rose)" }}>
            {journeyProgress}% complete · Week {CURRENT_WEEK} of 13 underway · Plus intro &amp; conclusion
          </p>
        </div>

        {/* ── INTRO: The Growth Spurt ──────────────────────────────────────── */}
        <div className="mb-6 opacity-0-initial animate-fade-up delay-200">
          <SectionHeader
            label="The Introduction"
            verse="Before Day 1"
            color="var(--color-rose)"
            borderColor="rgba(207,150,153,0.25)"
            tag="The Growth Spurt"
          />
          <p className="font-display text-xs italic mb-4" style={{ color: "rgba(245,239,230,0.45)", paddingLeft: "2px" }}>
            "When I grew up, I put away childish things." — 1 Corinthians 13:11
          </p>
          <Link href="/day/-6">
            <div
              className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all"
              style={{
                background: "rgba(25,59,137,0.25)",
                border: "1px solid rgba(25,59,137,0.4)",
                cursor: "pointer",
              }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--color-gold)" }} />
              <span className="text-[10px] w-5 text-center flex-shrink-0" style={{ color: "var(--color-rose)" }}>0</span>
              <div className="flex-1">
                <p className="text-sm" style={{ color: "rgba(245,239,230,0.6)" }}>The Growth Spurt</p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(207,150,153,0.5)" }}>5 days · Before you begin</p>
              </div>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--color-gold)" }}>
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
          </Link>
        </div>

        {/* ── PART 1: Love IS ── v.4a ─────────────────────────────────────── */}
        <div className="mb-2 opacity-0-initial animate-fade-up delay-200">
          <SectionHeader
            label="Love Is"
            verse="v. 4"
            color="var(--color-gold)"
            borderColor="rgba(250,178,77,0.3)"
          />
          <p className="font-display text-xs italic mb-4" style={{ color: "rgba(245,239,230,0.45)", paddingLeft: "2px" }}>
            "Love is patient and kind."
          </p>
          <div className="space-y-2 mb-6">
            {PART_1.map(char => (
              <CharRow key={char.id} char={char} currentWeek={CURRENT_WEEK} />
            ))}
          </div>
        </div>

        {/* ── PART 2: Love IS NOT ── v.4b–6 ───────────────────────────────── */}
        <div className="mb-2 opacity-0-initial animate-fade-up delay-300">
          <SectionHeader
            label="Love Is Not"
            verse="v. 4–6"
            color="var(--color-rose)"
            borderColor="rgba(118,0,0,0.45)"
          />
          <p className="font-display text-xs italic mb-4" style={{ color: "rgba(245,239,230,0.45)", paddingLeft: "2px" }}>
            "Love is not jealous or boastful or proud or rude. It does not demand its own way. It is not irritable, and it keeps no record of being wronged. It does not rejoice about injustice…"
          </p>
          <div className="space-y-2 mb-6">
            {PART_2.map(char => (
              <CharRow key={char.id} char={char} currentWeek={CURRENT_WEEK} />
            ))}
          </div>
        </div>

        {/* ── PART 3: Love IS — the return ── v.7 ─────────────────────────── */}
        <div className="mb-6 opacity-0-initial animate-fade-up delay-400">
          <SectionHeader
            label="Love Is"
            verse="v. 7"
            color="var(--color-gold)"
            borderColor="rgba(250,178,77,0.3)"
            tag="The Return"
          />
          <p className="font-display text-xs italic mb-4" style={{ color: "rgba(245,239,230,0.45)", paddingLeft: "2px" }}>
            "Love never gives up, never loses faith, is always hopeful, and endures through every circumstance."
          </p>
          <div className="space-y-2 mb-6">
            {PART_3.map(char => (
              <CharRow key={char.id} char={char} currentWeek={CURRENT_WEEK} />
            ))}
          </div>
        </div>

        {/* ── CONCLUSION: Wrapped In Love ───────────────────────────────────── */}
        <div className="mb-6 opacity-0-initial animate-fade-up delay-400">
          <SectionHeader
            label="The Conclusion"
            verse="Days 92–100"
            color="var(--color-gold)"
            borderColor="rgba(250,178,77,0.3)"
            tag="Wrapped Up"
          />
          <p className="font-display text-xs italic mb-4" style={{ color: "rgba(245,239,230,0.45)", paddingLeft: "2px" }}>
            "The greatest of these is love." — 1 Corinthians 13:13
          </p>
          <Link href="/day/92">
            <div
              className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all"
              style={{
                background: "rgba(25,59,137,0.25)",
                border: "1px solid rgba(25,59,137,0.4)",
                cursor: "pointer",
              }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--color-gold)" }} />
              <span className="text-[10px] w-5 text-center flex-shrink-0" style={{ color: "var(--color-rose)" }}>14</span>
              <div className="flex-1">
                <p className="text-sm" style={{ color: "rgba(245,239,230,0.6)" }}>Wrapped In Love</p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(207,150,153,0.5)" }}>9 days · Days 92–100</p>
              </div>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--color-gold)" }}>
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
          </Link>
        </div>

        {/* ── Badge Shelf ──────────────────────────────────────────────────── */}
        <div className="mb-8 opacity-0-initial animate-fade-up delay-400">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1" style={{ background: 'rgba(250,178,77,0.15)' }} />
            <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--color-rose)' }}>
              Your Badges
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(250,178,77,0.15)' }} />
          </div>

          {earned.length === 0 ? (
            <p
              className="text-center text-xs"
              style={{ color: 'rgba(207,150,153,0.4)', fontFamily: 'Jost, sans-serif', fontStyle: 'italic' }}
            >
              Your first badge is waiting. Keep going.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
              }}
            >
              {BADGE_DEFS.map(def => {
                const earnedEntry = earned.find(e => e.badgeId === def.id);
                const isEarned = !!earnedEntry;
                return (
                  <div
                    key={def.id}
                    title={isEarned ? `${def.name} — ${def.description}` : 'Not yet earned'}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: isEarned
                          ? 'rgba(250,178,77,0.12)'
                          : 'rgba(13,28,67,0.6)',
                        border: isEarned
                          ? '1px solid rgba(250,178,77,0.4)'
                          : '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: isEarned ? '1.4rem' : '1.2rem',
                        opacity: isEarned ? 1 : 0.25,
                        filter: isEarned ? 'none' : 'grayscale(1)',
                        transition: 'all 0.3s ease',
                        boxShadow: isEarned ? '0 0 16px rgba(250,178,77,0.15)' : 'none',
                      }}
                    >
                      {def.icon}
                    </div>
                    <p
                      style={{
                        fontFamily: 'Jost, sans-serif',
                        fontSize: '0.6rem',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                        color: isEarned ? 'var(--color-gold)' : 'rgba(207,150,153,0.25)',
                        lineHeight: 1.3,
                        maxWidth: '56px',
                      }}
                    >
                      {def.name}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Full scripture */}
        <div
          className="rounded-2xl p-5 opacity-0-initial animate-fade-up delay-400"
          style={{
            background: "rgba(118,0,0,0.15)",
            border: "1px solid rgba(118,0,0,0.3)",
          }}
          data-testid="journey-scripture"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: "var(--color-gold)" }}>
            1 Corinthians 13:4–7 (NLT)
          </p>
          <p className="font-display text-sm font-light italic leading-relaxed" style={{ color: "rgba(245,239,230,0.8)", lineHeight: "1.95" }}>
            <span style={{ color: "var(--color-gold)" }}>4 </span>
            Love is patient and kind.{" "}
            <span style={{ color: "var(--color-rose)" }}>
              Love is not jealous or boastful or proud{" "}
              <span style={{ color: "var(--color-cream)" }}>5</span>{" "}
              or rude. It does not demand its own way. It is not irritable,
              and it keeps no record of being wronged.{" "}
              <span style={{ color: "var(--color-cream)" }}>6</span>{" "}
              It does not rejoice about injustice but rejoices whenever the truth wins out.
            </span>{" "}
            <span style={{ color: "var(--color-cream)" }}>7</span>{" "}
            <span style={{ color: "var(--color-gold)" }}>
              Love never gives up, never loses faith, is always hopeful,
              and endures through every circumstance.
            </span>
          </p>
        </div>

      </main>
    </div>
  );
}

// ── Section header with verse reference ────────────────────────────────────
function SectionHeader({
  label,
  verse,
  color,
  borderColor,
  tag,
}: {
  label: string;
  verse: string;
  color: string;
  borderColor: string;
  tag?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="h-px flex-1" style={{ background: borderColor }} />
      <div className="flex items-center gap-2">
        <span className="text-[10px] tracking-[0.35em] uppercase font-medium" style={{ color }}>
          {label}
        </span>
        {tag && (
          <span
            className="text-[8px] tracking-[0.2em] uppercase px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(250,178,77,0.12)", color: "var(--color-gold)", border: "1px solid rgba(250,178,77,0.2)" }}
          >
            {tag}
          </span>
        )}
      </div>
      <span className="text-[9px] tracking-[0.15em]" style={{ color: "rgba(245,239,230,0.3)" }}>{verse}</span>
      <div className="h-px flex-1" style={{ background: borderColor }} />
    </div>
  );
}

// ── Single characteristic row ───────────────────────────────────────────────
function CharRow({
  char,
  currentWeek,
}: {
  char: typeof ALL_CHARACTERISTICS[0];
  currentWeek: number;
}) {
  const isActive   = char.week === currentWeek;
  const isComplete = char.week < currentWeek;
  const isLocked   = char.week > currentWeek;
  const isNotType  = char.type === "is not";
  const firstDay   = (char.week - 1) * 7 + 1;
  const isClickable = true; // All weeks are clickable

  const inner = (
    <div
      className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all"
      style={{
        background: isActive
          ? "rgba(250,178,77,0.1)"
          : isComplete
          ? "rgba(25,59,137,0.25)"
          : "rgba(13,28,67,0.5)",
        border: isActive
          ? "1px solid rgba(250,178,77,0.3)"
          : isComplete
          ? "1px solid rgba(25,59,137,0.4)"
          : "1px solid rgba(255,255,255,0.04)",
        cursor: "pointer",
      }}
      data-testid={`char-row-${char.id}`}
    >
      {/* Status dot */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{
          background: isComplete
            ? "var(--color-gold)"
            : isActive
            ? "rgba(250,178,77,0.9)"
            : isNotType
            ? "rgba(118,0,0,0.4)"
            : "rgba(250,178,77,0.18)",
          boxShadow: isActive ? "0 0 8px rgba(250,178,77,0.5)" : "none",
        }}
      />

      {/* Week number */}
      <span
        className="text-[10px] w-5 text-center flex-shrink-0"
        style={{ color: isLocked ? "rgba(207,150,153,0.25)" : "var(--color-rose)" }}
      >
        {char.week}
      </span>

      {/* Name */}
      <div className="flex-1">
        <p
          className="text-sm"
          style={{
            fontWeight: isActive ? 500 : 400,
            color: isLocked
              ? "rgba(245,239,230,0.28)"
              : isActive
              ? "var(--color-cream)"
              : "rgba(245,239,230,0.6)",
          }}
        >
          {char.name}
        </p>
      </div>

      {/* Right status */}
      <div className="flex-shrink-0">
        {isActive && (
          <span
            className="text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded-full"
            style={{ background: "rgba(250,178,77,0.18)", color: "var(--color-gold)" }}
          >
            Now
          </span>
        )}
        {isComplete && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--color-gold)" }}>
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        )}
        {isLocked && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "rgba(207,150,153,0.22)" }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        )}
      </div>
    </div>
  );

  if (isClickable) {
    return (
      <Link href={`/day/${firstDay}`}>
        {inner}
      </Link>
    );
  }
  return inner;
}
