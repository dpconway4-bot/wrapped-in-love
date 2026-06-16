// ── User Progress Helpers ──────────────────────────────────────────────────────
// Tracks the user's current day (1–100) as they manually advance through the journey.
// Stored in localStorage for instant reads + synced to Supabase for cross-device persistence.

import { supabase } from './supabase';

const CURRENT_DAY_KEY = 'wil_current_day'; // localStorage key
const MAX_DAY = 100;

// ── localStorage ──────────────────────────────────────────────────────────────

/** Get current main journey day from localStorage (1–100). Returns 1 if not set. */
export function getStoredDay(): number {
  try {
    const val = localStorage.getItem(CURRENT_DAY_KEY);
    if (val === null) return 1;
    const n = parseInt(val, 10);
    return isNaN(n) ? 1 : Math.min(Math.max(1, n), MAX_DAY);
  } catch {
    return 1;
  }
}

/** Save current day to localStorage. */
function storeDay(day: number): void {
  try {
    localStorage.setItem(CURRENT_DAY_KEY, String(day));
  } catch {}
}

// ── Supabase sync ─────────────────────────────────────────────────────────────

/** Load user's progress from Supabase and seed localStorage. Returns the day. */
export async function loadProgressFromSupabase(email: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('verified_purchasers')
      .select('current_day')
      .eq('email', email)
      .single();

    if (error || !data) return getStoredDay();

    const remoteDay: number = data.current_day ?? 1;
    const localDay = getStoredDay();

    // Trust the higher of the two (user may have progressed on another device)
    const day = Math.max(remoteDay, localDay);
    storeDay(day);
    return day;
  } catch {
    return getStoredDay();
  }
}

/** Save progress to both localStorage and Supabase. */
export async function saveProgress(day: number, email: string): Promise<void> {
  const clamped = Math.min(Math.max(1, day), MAX_DAY);
  storeDay(clamped);
  try {
    await supabase
      .from('verified_purchasers')
      .update({ current_day: clamped })
      .eq('email', email);
  } catch {}
}

/** Advance to the next day (capped at MAX_DAY). Returns new day. */
export async function advanceDay(currentDay: number, email: string): Promise<number> {
  const next = Math.min(currentDay + 1, MAX_DAY);
  await saveProgress(next, email);
  return next;
}
