import { Link } from "wouter";
import { useState, useEffect } from "react";
import { LogoWordmark } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { getDayData } from "@/data/index";
import { loadProgressFromSupabase } from "@/lib/userProgress";

interface JournalEntry {
  id: string;
  day: number;
  content: string;
  updated_at: string;
  journey_number?: number;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

function getDayLabel(day: number): string {
  if (day <= -1 && day >= -6) return `Introduction ${day + 7}/6`;
  if (day >= 92) return `Day ${day} · Conclusion`;
  const data = getDayData(day);
  if (!data) return `Day ${day}`;
  return `Day ${day}`;
}

function getCharacteristic(day: number): string {
  if (day <= -1 && day >= -6) return "The Growth Spurt";
  const data = getDayData(day);
  if (!data) return "";
  return data.title;
}

function getDayType(day: number): string {
  if (day <= -1 && day >= -6) return "Introduction";
  const data = getDayData(day);
  if (!data) return "";
  return data.type;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function JournalPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentJourney, setCurrentJourney] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [archiveOpen, setArchiveOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function load() {
      if (!user?.email) return;
      const [headers, journeyDay] = await Promise.all([
        getAuthHeader(),
        loadProgressFromSupabase(user.email),
      ]);
      // Get current journey_number from Supabase
      const { data: purchaser } = await supabase
        .from('verified_purchasers')
        .select('journey_number')
        .eq('email', user.email)
        .single();
      const journey = purchaser?.journey_number ?? 1;
      setCurrentJourney(journey);

      const res = await fetch("/api/journal", { headers });
      if (!res.ok) { setLoading(false); return; }
      const data: JournalEntry[] = await res.json();
      setEntries(data.filter(e => e.content?.trim()));
      setLoading(false);
    }
    load();
  }, [user]);

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const PREVIEW_LENGTH = 160;

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

        {/* Hero */}
        <div className="mb-1 opacity-0-initial animate-fade-in">
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--color-gold)" }}>
            Your Reflections
          </p>
        </div>
        <div className="mb-1 opacity-0-initial animate-fade-up delay-100">
          <h1 className="font-display text-[2rem] font-light leading-tight" style={{ color: "var(--color-cream)" }}>
            My Journal
          </h1>
        </div>
        <div className="mb-7 opacity-0-initial animate-fade-in delay-100">
          <p className="text-sm" style={{ color: "var(--color-rose)" }}>
            {loading ? "Loading…" : entries.length === 0 ? "Your first reflection is waiting." : `${entries.length} reflection${entries.length === 1 ? "" : "s"} written.`}
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="rounded-2xl h-24 animate-pulse"
                style={{ background: "rgba(25,59,137,0.15)" }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && entries.length === 0 && (
          <div
            className="rounded-2xl p-8 text-center opacity-0-initial animate-fade-up delay-200"
            style={{
              background: "rgba(25,59,137,0.15)",
              border: "1px solid rgba(25,59,137,0.25)",
            }}
          >
            <p className="font-display text-lg font-light mb-3" style={{ color: "var(--color-cream)" }}>
              Nothing written yet.
            </p>
            <p className="text-sm mb-6" style={{ color: "rgba(201,123,107,0.7)" }}>
              Your reflections appear here after you write on a day page. Each entry is private and saved just for you.
            </p>
            <Link href="/home">
              <button
                className="px-6 py-2.5 rounded-full text-[11px] tracking-[0.2em] uppercase"
                style={{
                  background: "rgba(214,154,45,0.12)",
                  color: "var(--color-gold)",
                  border: "1px solid rgba(214,154,45,0.25)",
                }}
              >
                Go to Today's Anchor
              </button>
            </Link>
          </div>
        )}

        {/* Entries */}
        {!loading && entries.length > 0 && (() => {
          const currentEntries = entries.filter(e => (e.journey_number ?? 1) === currentJourney);
          const archivedEntries = entries.filter(e => (e.journey_number ?? 1) < currentJourney);
          // Group archived by journey number
          const archiveGroups: Record<number, JournalEntry[]> = {};
          archivedEntries.forEach(e => {
            const j = e.journey_number ?? 1;
            if (!archiveGroups[j]) archiveGroups[j] = [];
            archiveGroups[j].push(e);
          });
          const archiveJourneys = Object.keys(archiveGroups).map(Number).sort((a, b) => b - a);

          return (
            <>
              {/* Current journey entries */}
              {currentEntries.length === 0 && archivedEntries.length > 0 && (
                <p className="text-sm text-center mb-6" style={{ color: 'rgba(201,123,107,0.5)', fontStyle: 'italic' }}>
                  No entries yet in this journey. Your past reflections are archived below.
                </p>
              )}
              <div className="space-y-3 opacity-0-initial animate-fade-up delay-200">
            {currentEntries.map((entry) => {
              const isOpen = expanded.has(entry.id);
              const isLong = entry.content.length > PREVIEW_LENGTH;
              const displayText = isOpen || !isLong
                ? entry.content
                : entry.content.slice(0, PREVIEW_LENGTH).trimEnd() + "…";
              const dayLabel = getDayLabel(entry.day);
              const characteristic = getCharacteristic(entry.day);
              const dayType = getDayType(entry.day);
              const isIntroEntry = entry.day <= -1;
              const accentColor = isIntroEntry ? "var(--color-rose)" : "var(--color-gold)";

              return (
                <div
                  key={entry.id}
                  className="rounded-2xl p-5 transition-all"
                  style={{
                    background: "rgba(25,59,137,0.2)",
                    border: "1px solid rgba(25,59,137,0.35)",
                  }}
                >
                  {/* Entry header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span
                          className="text-[9px] tracking-[0.25em] uppercase"
                          style={{ color: accentColor }}
                        >
                          {dayLabel}
                        </span>
                        <span
                          className="text-[8px] tracking-[0.15em] uppercase px-1.5 py-0.5 rounded-full"
                          style={{
                            background: "rgba(214,154,45,0.08)",
                            color: "rgba(214,154,45,0.5)",
                            border: "1px solid rgba(214,154,45,0.12)",
                          }}
                        >
                          {dayType}
                        </span>
                      </div>
                      <p
                        className="font-display text-base font-light leading-snug"
                        style={{ color: "var(--color-cream)" }}
                      >
                        {characteristic}
                      </p>
                    </div>
                    <Link href={`/day/${entry.day}`}>
                      <button
                        className="flex-shrink-0 text-[9px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-full transition-all"
                        style={{
                          color: "rgba(201,123,107,0.6)",
                          border: "1px solid rgba(201,123,107,0.2)",
                        }}
                      >
                        View
                      </button>
                    </Link>
                  </div>

                  {/* Divider */}
                  <div
                    className="h-px mb-3"
                    style={{ background: "rgba(214,154,45,0.08)" }}
                  />

                  {/* Entry text */}
                  <p
                    className="text-sm leading-relaxed mb-2"
                    style={{
                      color: "rgba(245,239,230,0.8)",
                      lineHeight: "1.75",
                      fontFamily: "var(--font-body)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {displayText}
                  </p>

                  {/* Expand/collapse + date */}
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className="text-[10px]"
                      style={{ color: "rgba(201,123,107,0.4)" }}
                    >
                      {formatDate(entry.updated_at)}
                    </span>
                    {isLong && (
                      <button
                        onClick={() => toggleExpand(entry.id)}
                        className="text-[10px] tracking-[0.1em] uppercase transition-all"
                        style={{ color: "rgba(214,154,45,0.55)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        {isOpen ? "Show less" : "Read more"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
              </div>

              {/* Archive sections */}
              {archiveJourneys.map(journeyNum => (
                <div key={journeyNum} className="mt-8">
                  {/* Archive header */}
                  <button
                    onClick={() => setArchiveOpen(prev => ({ ...prev, [journeyNum]: !prev[journeyNum] }))}
                    className="w-full flex items-center gap-3 mb-4"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <div className="h-px flex-1" style={{ background: 'rgba(201,123,107,0.15)' }} />
                    <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(201,123,107,0.45)' }}>
                      Journey {journeyNum} · {archiveGroups[journeyNum].length} {archiveGroups[journeyNum].length === 1 ? 'entry' : 'entries'}
                    </span>
                    <svg
                      width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ color: 'rgba(201,123,107,0.35)', transform: archiveOpen[journeyNum] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                    >
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                    <div className="h-px flex-1" style={{ background: 'rgba(201,123,107,0.15)' }} />
                  </button>

                  {archiveOpen[journeyNum] && (
                    <div className="space-y-3">
                      {archiveGroups[journeyNum].map(entry => {
                        const isOpen = expanded.has(entry.id);
                        const isLong = entry.content.length > PREVIEW_LENGTH;
                        const displayText = isOpen || !isLong ? entry.content : entry.content.slice(0, PREVIEW_LENGTH).trimEnd() + '…';
                        return (
                          <div
                            key={entry.id}
                            className="rounded-2xl p-5"
                            style={{
                              background: 'rgba(13,28,67,0.4)',
                              border: '1px solid rgba(201,123,107,0.1)',
                              opacity: 0.8,
                            }}
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] tracking-[0.25em] uppercase" style={{ color: 'rgba(201,123,107,0.5)' }}>
                                  {getDayLabel(entry.day)}
                                </span>
                                <p className="font-display text-sm font-light" style={{ color: 'rgba(245,239,230,0.5)' }}>
                                  {getCharacteristic(entry.day)}
                                </p>
                              </div>
                            </div>
                            <div className="h-px mb-3" style={{ background: 'rgba(201,123,107,0.06)' }} />
                            <p className="text-sm leading-relaxed mb-2" style={{ color: 'rgba(245,239,230,0.55)', lineHeight: '1.75', fontFamily: 'var(--font-body)', whiteSpace: 'pre-wrap' }}>
                              {displayText}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px]" style={{ color: 'rgba(201,123,107,0.3)' }}>
                                {formatDate(entry.updated_at)}
                              </span>
                              {isLong && (
                                <button
                                  onClick={() => toggleExpand(entry.id)}
                                  className="text-[10px] tracking-[0.1em] uppercase"
                                  style={{ color: 'rgba(214,154,45,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                  {isOpen ? 'Show less' : 'Read more'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </>
          );
        })()}

      </main>
    </div>
  );
}
