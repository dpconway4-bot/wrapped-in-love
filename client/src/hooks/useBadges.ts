import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { BADGE_DEFS, type EarnedBadge } from '@/data/badges';

const BADGES_KEY = 'wil_earned_badges';

// Load earned badges from localStorage (fast, offline-capable)
function loadLocal(): EarnedBadge[] {
  try {
    return JSON.parse(localStorage.getItem(BADGES_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocal(badges: EarnedBadge[]) {
  localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
}

export interface BadgeNotification {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
}

interface UseBadgesReturn {
  earned: EarnedBadge[];
  newBadge: BadgeNotification | null;
  dismissBadge: () => void;
  checkBadges: (params: { currentDay: number; journalCount: number }) => void;
}

export function useBadges(userId: string | undefined): UseBadgesReturn {
  const [earned, setEarned] = useState<EarnedBadge[]>([]);
  const [newBadge, setNewBadge] = useState<BadgeNotification | null>(null);

  // Load earned badges on mount — first from Supabase, fall back to localStorage
  useEffect(() => {
    if (!userId) return;

    const local = loadLocal();
    setEarned(local);

    // Also sync from Supabase (cross-device)
    supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const remote: EarnedBadge[] = data.map(r => ({
            badgeId: r.badge_id,
            earnedAt: r.earned_at,
          }));
          setEarned(remote);
          saveLocal(remote);
        }
      });
  }, [userId]);

  const awardBadge = useCallback(async (badgeId: string) => {
    const def = BADGE_DEFS.find(b => b.id === badgeId);
    if (!def || !userId) return;

    const now = new Date().toISOString();
    const newEntry: EarnedBadge = { badgeId, earnedAt: now };

    // Update state + local
    setEarned(prev => {
      const updated = [...prev, newEntry];
      saveLocal(updated);
      return updated;
    });

    // Show toast
    setNewBadge({ badgeId, name: def.name, description: def.description, icon: def.icon });

    // Persist to Supabase
    await supabase.from('user_badges').upsert({
      user_id: userId,
      badge_id: badgeId,
      earned_at: now,
    }, { onConflict: 'user_id,badge_id' });
  }, [userId]);

  const checkBadges = useCallback(({ currentDay, journalCount }: { currentDay: number; journalCount: number }) => {
    const earnedIds = new Set(earned.map(e => e.badgeId));

    for (const def of BADGE_DEFS) {
      if (earnedIds.has(def.id)) continue;

      // Day-based badges
      if (def.earnedAtDay !== undefined && currentDay >= def.earnedAtDay) {
        awardBadge(def.id);
        return; // Show one at a time
      }

      // Journal count badges
      if (def.journalCount !== undefined && journalCount >= def.journalCount) {
        awardBadge(def.id);
        return;
      }
    }
  }, [earned, awardBadge]);

  const dismissBadge = useCallback(() => {
    setNewBadge(null);
  }, []);

  return { earned, newBadge, dismissBadge, checkBadges };
}
