import { Link } from "wouter";
import { LogoWordmark } from "@/components/Logo";
import { getDayData, getWeekForDay, TOTAL_DAYS } from "@/data/index";

// In production this would be computed from the user's start date.
// For the prototype, Day 1 is always today.
const TODAY_DAY = 1;

function getDayOfWeek() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}
function getDate() {
  return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export default function AnchorPage() {
  const todayData = getDayData(TODAY_DAY);
  const currentWeek = getWeekForDay(TODAY_DAY);
  const journeyProgress = Math.round((TODAY_DAY / TOTAL_DAYS) * 100);

  if (!todayData || !currentWeek) return null;

  const weekDays = currentWeek.days;

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--color-bg)", maxWidth: "500px", margin: "0 auto", width: "100%" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-8 pb-4 opacity-0-initial animate-fade-in">
        <LogoWordmark />
        <Link href="/journey">
          <button
            className="text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 rounded-full transition-all"
            style={{ color: "var(--color-rose)", border: "1px solid rgba(207,150,153,0.3)" }}
            data-testid="btn-journey"
          >
            Journey
          </button>
        </Link>
      </header>

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
            100 Days In Love · Day {TODAY_DAY}
          </p>
        </div>

        {/* Hero title */}
        <div className="mb-6 opacity-0-initial animate-fade-up delay-300">
          <h1
            className="font-display text-[2.8rem] font-light leading-tight"
            style={{ color: "var(--color-cream)", letterSpacing: "-0.01em" }}
          >
            Love Is<br />
            <span style={{ color: "var(--color-gold)" }}>
              {currentWeek.characteristic}.
            </span>
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
            Week {currentWeek.days[0].day <= TODAY_DAY ? Math.ceil(TODAY_DAY / 7) : 1} · Love Is {currentWeek.characteristic}
          </p>
          <div className="flex justify-center gap-2">
            {weekDays.map(d => (
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
              Day {TODAY_DAY} of {TOTAL_DAYS}
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
