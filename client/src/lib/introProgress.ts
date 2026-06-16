// ── Intro Progress Helpers ────────────────────────────────────────────────────
// Intro pages: -6, -5, -4, -3, -2, -1 (6 pages total)
// We store the highest intro page the user has reached and whether intro is complete.

const INTRO_PAGE_KEY  = 'wil_intro_page';   // highest intro day reached, e.g. "-4"
const INTRO_DONE_KEY  = 'wil_intro_done';   // "1" when all 6 pages done

export const INTRO_START = -6;  // first intro day
export const INTRO_END   = -1;  // last intro day

/** Returns the highest intro day the user has reached (-6 to -1), or INTRO_START if never set. */
export function getIntroPage(): number {
  try {
    const val = localStorage.getItem(INTRO_PAGE_KEY);
    if (val === null) return INTRO_START;
    return parseInt(val, 10);
  } catch {
    return INTRO_START;
  }
}

/** Advance the stored intro page if the new page is further along. */
export function advanceIntroPage(day: number): void {
  if (day < INTRO_START || day > INTRO_END) return;
  try {
    const current = getIntroPage();
    if (day > current) {
      localStorage.setItem(INTRO_PAGE_KEY, String(day));
    }
  } catch {}
}

/** Returns true if the user has completed all 6 intro pages. */
export function isIntroComplete(): boolean {
  try {
    return localStorage.getItem(INTRO_DONE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Mark intro as fully complete. */
export function markIntroComplete(): void {
  try {
    localStorage.setItem(INTRO_DONE_KEY, '1');
    localStorage.setItem(INTRO_PAGE_KEY, String(INTRO_END));
  } catch {}
}

/**
 * Returns what day the user should be on in the anchor screen.
 * - If intro not complete: return their current intro page progress
 * - If intro complete: return the stored progress-based day (set externally by AnchorPage)
 */
export function computeCurrentDayWithIntro(progressDay: number): number {
  if (isIntroComplete()) {
    // Intro done — use whatever day was loaded from Supabase/localStorage
    return progressDay;
  }
  // Intro not complete — return current intro page
  return getIntroPage();
}
