// Badge definitions for 100 Days In Love

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "presence" | "depth" | "journey";
  earnedAtDay?: number;
  journalCount?: number;
}

export const BADGE_DEFS: BadgeDef[] = [
  // ── Presence ──────────────────────────────────────────────────────────────
  {
    id: "first-step",
    name: "First Step",
    description: "You started the introduction.",
    icon: "🕊",
    category: "presence",
    earnedAtDay: -6,
  },
  {
    id: "intro-complete",
    name: "Ready to Begin",
    description: "You completed the introduction.",
    icon: "🌅",
    category: "presence",
    earnedAtDay: 1,
  },
  {
    id: "day-7",
    name: "Week 1 Complete",
    description: "Seven days of love. You are building something real.",
    icon: "✦",
    category: "presence",
    earnedAtDay: 8,
  },
  {
    id: "day-14",
    name: "Two Weeks In",
    description: "Love is kind. You are proving it.",
    icon: "💛",
    category: "presence",
    earnedAtDay: 15,
  },
  {
    id: "day-30",
    name: "30 Days of Love",
    description: "A full month. This is becoming a practice.",
    icon: "🔥",
    category: "presence",
    earnedAtDay: 31,
  },
  {
    id: "day-50",
    name: "Halfway There",
    description: "Fifty days in. The journey is shaping you.",
    icon: "⚡",
    category: "presence",
    earnedAtDay: 51,
  },
  {
    id: "day-75",
    name: "75 Days Strong",
    description: "Three quarters of the way. You are going the distance.",
    icon: "🏔",
    category: "presence",
    earnedAtDay: 76,
  },

  // ── Depth ──────────────────────────────────────────────────────────────────
  {
    id: "first-word",
    name: "First Word",
    description: "You wrote your first journal entry.",
    icon: "✍",
    category: "depth",
    journalCount: 1,
  },
  {
    id: "open-book",
    name: "Open Book",
    description: "Ten journal entries. You are doing the inner work.",
    icon: "📖",
    category: "depth",
    journalCount: 10,
  },
  {
    id: "deep-roots",
    name: "Deep Roots",
    description: "25 journal entries. This is going deep.",
    icon: "🌿",
    category: "depth",
    journalCount: 25,
  },

  // ── Journey ────────────────────────────────────────────────────────────────
  {
    id: "love-is-patient",
    name: "Love Is Patient",
    description: "Week 1 complete. You sat with the hardest one first.",
    icon: "🕊",
    category: "journey",
    earnedAtDay: 8,
  },
  {
    id: "journey-complete",
    name: "Love Never Fails",
    description: "100 days. You finished what you started.",
    icon: "♾",
    category: "journey",
    earnedAtDay: 101,
  },
];

export type EarnedBadge = {
  badgeId: string;
  earnedAt: string;
};
