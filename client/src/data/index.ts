import { week1 } from "./week1";
import { week2 } from "./week2";
import { week3 } from "./week3";
import { week4 } from "./week4";
import { week5 } from "./week5";
import { week6 } from "./week6";
import { week7 } from "./week7";
import { week8 } from "./week8";
import { week9 } from "./week9";
import { week10 } from "./week10";
import { week11 } from "./week11";
import { week12 } from "./week12";
import { week13 } from "./week13";
export { intro } from "./intro";
export { conclusion } from "./conclusion";

export const TOTAL_DAYS = 100;

// All weeks in order
export const allWeeks = [week1, week2, week3, week4, week5, week6, week7, week8, week9, week10, week11, week12, week13];

// Flat list of all days across all weeks
export const allDays = allWeeks.flatMap(w => w.days);

// Import intro + conclusion for cross-module access
import { intro } from "./intro";
import { conclusion } from "./conclusion";

// All intro + conclusion days (for DayPage routing)
export const allIntroDays = intro.days;
export const allConclusionDays = conclusion.days;

// Get day data by day number (1-based, negative for intro, 92-100 for conclusion)
export function getDayData(dayNum: number) {
  if (dayNum <= 0) return allIntroDays.find(d => d.day === dayNum) ?? null;
  if (dayNum >= 92) return allConclusionDays.find(d => d.day === dayNum) ?? null;
  return allDays.find(d => d.day === dayNum) ?? null;
}

// Get which week a day belongs to (returns intro/conclusion for those day ranges)
export function getWeekForDay(dayNum: number) {
  if (dayNum <= 0) return intro as any;
  if (dayNum >= 92) return conclusion as any;
  return allWeeks.find(w => w.days.some(d => d.day === dayNum)) ?? null;
}

// Get week number (1-based) for a day; 0 = intro, 14 = conclusion
export function getWeekNumber(dayNum: number): number {
  if (dayNum <= 0) return 0;
  if (dayNum >= 92) return 14;
  return allWeeks.findIndex(w => w.days.some(d => d.day === dayNum)) + 1;
}

// All 13 weeks in SCRIPTURE READING ORDER — 1 Corinthians 13:4-7 (NLT)
// This matches the live teaching arc:
//   Part 1 — Love IS (v.4a):          Patient (W1), Kind (W2)
//   Part 2 — Love IS NOT (v.4b–6):    Jealous (W3), Boastful (W4), Proud (W5), Rude (W6),
//                                      Demanding (W7), Irritable (W8), Keeps No Record (W9), Not Rejoicing in Injustice (W10)
//   Part 3 — Love IS again (v.7):     Never Gives Up + Never Loses Faith (W11 — combined),
//                                      Always Hopeful (W12), Endures (W13)
export const ALL_CHARACTERISTICS = [
  // ── Part 1: Love IS (verse 4a) ─────────────────────────────────────────
  { id: 1,  name: "Patient",                            type: "is",      week: 1,  verse: "v.4",  part: 1 },
  { id: 2,  name: "Kind",                               type: "is",      week: 2,  verse: "v.4",  part: 1 },

  // ── Part 2: Love IS NOT (verses 4b–6) ──────────────────────────────────
  { id: 3,  name: "Not Jealous",                        type: "is not",  week: 3,  verse: "v.4",  part: 2 },
  { id: 4,  name: "Not Boastful",                       type: "is not",  week: 4,  verse: "v.4",  part: 2 },
  { id: 5,  name: "Not Proud",                          type: "is not",  week: 5,  verse: "v.4",  part: 2 },
  { id: 6,  name: "Not Rude",                           type: "is not",  week: 6,  verse: "v.5",  part: 2 },
  { id: 7,  name: "Not Demanding Its Own Way",          type: "is not",  week: 7,  verse: "v.5",  part: 2 },
  { id: 8,  name: "Not Irritable",                      type: "is not",  week: 8,  verse: "v.5",  part: 2 },
  { id: 9,  name: "Keeps No Record",                    type: "is not",  week: 9,  verse: "v.5",  part: 2 },
  { id: 10, name: "Not Rejoicing in Injustice",         type: "is not",  week: 10, verse: "v.6",  part: 2 },

  // ── Part 3: Love IS (verse 7) — the return ─────────────────────────────
  // Note: Never Gives Up + Never Loses Faith are a combined lesson (Week 11)
  { id: 11, name: "Never Gives Up & Never Loses Faith", type: "is",      week: 11, verse: "v.7",  part: 3, combined: true },
  { id: 12, name: "Always Hopeful",                     type: "is",      week: 12, verse: "v.7",  part: 3 },
  { id: 13, name: "Endures",                            type: "is",      week: 13, verse: "v.7",  part: 3 },
];
