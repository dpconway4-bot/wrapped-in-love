import { Link, useParams } from "wouter";
import { LogoWordmark } from "@/components/Logo";
import { AudioPlayer } from "@/components/AudioPlayer";
import { JournalPanel } from "@/components/JournalPanel";
import { getDayData, getWeekForDay, getWeekNumber, allDays, TOTAL_DAYS } from "@/data/index";

const DAY_ACCENTS: Record<string, string> = {
  "The Word":     "var(--color-cream)",
  "The Truth":    "var(--color-cream)",
  "The Mirror":   "var(--color-rose)",
  "The Story":    "var(--color-gold)",
  "The Practice": "var(--color-gold)",
  "The Prayer":   "var(--color-rose)",
  "The Carry":    "var(--color-gold)",
};

export default function DayPage() {
  const params  = useParams<{ day: string }>();
  const dayNum  = parseInt(params.day || "1");
  const dayData = getDayData(dayNum);
  const week    = getWeekForDay(dayNum);
  const weekNum = getWeekNumber(dayNum);

  if (!dayData || !week) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-display text-xl" style={{ color: "var(--color-cream)" }}>Day not found.</p>
          <Link href="/home"><button className="mt-4 text-sm" style={{ color: "var(--color-gold)" }}>← Home</button></Link>
        </div>
      </div>
    );
  }

  if (dayData.type === "The Carry") return <CarryDay dayData={dayData} weekNum={weekNum} characteristic={week.characteristic} />;

  const accentColor = DAY_ACCENTS[dayData.type] || "var(--color-cream)";
  // Navigation: intro days are negative, conclusion days are 92–100, core days are 1–91
  const nextDay     = dayNum + 1 <= TOTAL_DAYS ? dayNum + 1 : null;
  const prevDay     = dayNum > -6 ? dayNum - 1 : null;
  // Label: show "Intro", "Week N", or "Conclusion"
  const weekLabel   = weekNum === 0 ? "Intro" : weekNum === 14 ? "Conclusion" : `Week ${weekNum}`;

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--color-bg)", maxWidth: "500px", margin: "0 auto", width: "100%" }}
    >
      <header className="flex items-center justify-between px-6 pt-8 pb-4">
        <Link href="/home">
          <button
            className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase transition-opacity hover:opacity-70"
            style={{ color: "var(--color-rose)" }}
            data-testid="btn-back"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>
        </Link>
        <LogoWordmark />
      </header>

      <main className="flex-1 px-6 pb-12">

        {/* Day label */}
        <div className="mb-2 opacity-0-initial animate-fade-in">
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: accentColor }}>
            {weekLabel} · {dayData.day > 0 ? `Day ${dayData.day}` : "Before Day 1"} · {dayData.type}
          </p>
        </div>

        {/* Title */}
        <div className="mb-1 opacity-0-initial animate-fade-up delay-100">
          <h1 className="font-display text-[2rem] font-light leading-tight" style={{ color: "var(--color-cream)" }}>
            {dayData.title}
          </h1>
        </div>

        <div className="mb-6 opacity-0-initial animate-fade-in delay-100">
          <p className="text-sm" style={{ color: "var(--color-rose)" }}>{dayData.subtitle}</p>
        </div>

        {/* Divider */}
        <div
          className="h-px mb-8 opacity-0-initial animate-fade-in delay-200"
          style={{ background: `linear-gradient(to right, ${accentColor === "var(--color-cream)" ? "rgba(245,239,230,0.3)" : accentColor}, rgba(250,178,77,0.2), transparent)` }}
        />

        {/* Audio player */}
        {dayData.hasAudio && (
          <div className="mb-8 opacity-0-initial animate-fade-up delay-200">
            <AudioPlayer
              audioFile={(dayData as any).audioFile ?? "love-is-patient"}
              title={dayData.title}
              dayLabel={`Week ${weekNum} · ${dayData.type}`}
            />
          </div>
        )}

        {/* Scripture */}
        <div
          className="rounded-2xl p-5 mb-8 opacity-0-initial animate-fade-up delay-300"
          style={{
            background: "var(--color-surface)",
            border: "1px solid rgba(250,178,77,0.2)",
            boxShadow: "0 4px 24px rgba(13,28,67,0.4)",
          }}
          data-testid="day-scripture"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: "var(--color-gold)" }}>
            {dayData.scripture.reference}
          </p>
          <p
            className="font-display text-base font-light italic leading-relaxed"
            style={{ color: "var(--color-cream)", lineHeight: "1.75" }}
          >
            "{dayData.scripture.text}"
          </p>
        </div>

        {/* Opening line */}
        {dayData.openingLine && (
          <div className="mb-6 opacity-0-initial animate-fade-up delay-300">
            <p className="font-display text-xl font-light leading-relaxed" style={{ color: "var(--color-cream)" }}>
              {dayData.openingLine}
            </p>
          </div>
        )}

        {/* Body */}
        {dayData.body.length > 0 && (
          <div className="space-y-4 mb-8 opacity-0-initial animate-fade-up delay-400">
            {dayData.body.map((para, i) => (
              <p
                key={i}
                className="text-base leading-relaxed"
                style={{ color: "rgba(245,239,230,0.85)", lineHeight: "1.85" }}
              >
                {para}
              </p>
            ))}
          </div>
        )}

        {/* Closing line — covenant card */}
        <div
          className="rounded-2xl p-5 mb-8 opacity-0-initial animate-fade-up delay-500"
          style={{
            background: "rgba(118,0,0,0.18)",
            border: "1px solid rgba(118,0,0,0.35)",
          }}
          data-testid="closing-line"
        >
          <p className="font-display text-lg font-light italic text-center" style={{ color: "var(--color-gold)" }}>
            "{dayData.closingLine}"
          </p>
        </div>

        {/* Journal */}
        <div className="opacity-0-initial animate-fade-up delay-600">
          <JournalPanel day={dayData.day} prompt={dayData.prompt} />
        </div>

        {/* Day nav */}
        <div className="flex justify-between mt-12 opacity-0-initial animate-fade-in delay-600">
          {prevDay ? (
            <Link href={`/day/${prevDay}`}>
              <button
                className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase transition-opacity hover:opacity-70"
                style={{ color: "var(--color-rose)" }}
                data-testid="btn-prev-day"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Day {prevDay}
              </button>
            </Link>
          ) : <div />}

          {nextDay ? (
            <Link href={`/day/${nextDay}`}>
              <button
                className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase"
                style={{ color: "var(--color-gold)" }}
                data-testid="btn-next-day"
              >
                Day {nextDay}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </Link>
          ) : (
            <Link href="/home">
              <button className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--color-gold)" }} data-testid="btn-home">
                Home
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </Link>
          )}
        </div>

      </main>
    </div>
  );
}

function CarryQuote({ line }: { line: string }) {
  const parts = line.split(". ");
  const hasTwo = parts.length > 1;
  return (
    <blockquote
      className="font-display text-[1.65rem] font-light leading-snug mb-12"
      style={{ color: "var(--color-cream)", letterSpacing: "0.01em" }}
      data-testid="carry-quote"
    >
      {hasTwo ? (
        <>
          &ldquo;{parts[0]}.<br />
          <span style={{ color: "var(--color-gold)" }}>
            {parts.slice(1).join(". ")}&rdquo;
          </span>
        </>
      ) : (
        <span style={{ color: "var(--color-gold)" }}>&ldquo;{line}&rdquo;</span>
      )}
    </blockquote>
  );
}

function CarryDay({ dayData, weekNum, characteristic }: {
  dayData: ReturnType<typeof getDayData>;
  weekNum: number;
  characteristic: string;
}) {
  if (!dayData) return null;
  const nextDay = dayData.day + 1;
  const weekLabel = weekNum === 0 ? "Intro" : weekNum === 14 ? "Conclusion" : `Week ${weekNum}`;

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--color-bg)", maxWidth: "500px", margin: "0 auto", width: "100%" }}
    >
      <header className="flex items-center justify-between px-6 pt-8 pb-4">
        <Link href="/home">
          <button className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--color-rose)" }} data-testid="btn-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>
        </Link>
        <LogoWordmark />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 pb-16 text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase mb-8" style={{ color: "var(--color-gold)" }}>
          {weekLabel} · {dayData.day > 0 ? `Day ${dayData.day}` : "Before Day 1"} · The Carry
        </p>

        <div className="h-px w-16 mb-12" style={{ background: "linear-gradient(to right, transparent, rgba(250,178,77,0.6), transparent)" }} />

        <p className="text-sm tracking-[0.15em] uppercase mb-8" style={{ color: "var(--color-rose)" }}>
          Simple enough to memorize.<br />Deep enough to mean something.
        </p>

        <CarryQuote line={dayData.closingLine} />

        <div className="h-px w-16 mb-10" style={{ background: "linear-gradient(to right, transparent, rgba(250,178,77,0.6), transparent)" }} />

        <JournalPanel day={dayData.day} prompt={dayData.prompt} />

        <div className="flex gap-4 mt-10">
          <Link href="/home">
            <button
              className="px-6 py-3 rounded-full text-[11px] tracking-[0.25em] uppercase transition-all"
              style={{ color: "var(--color-rose)", border: "1px solid rgba(207,150,153,0.3)" }}
              data-testid="btn-home-carry"
            >
              Home
            </button>
          </Link>
          {nextDay <= TOTAL_DAYS && (
            <Link href={`/day/${nextDay}`}>
              <button
                className="px-6 py-3 rounded-full text-[11px] tracking-[0.25em] uppercase transition-all"
                style={{ color: "var(--color-gold)", border: "1px solid rgba(250,178,77,0.35)" }}
                data-testid="btn-next-week"
              >
                {weekNum === 13 ? "Conclusion →" : `Week ${weekNum + 1} →`}
              </button>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
