// api/admin-performance.ts
// Vercel serverless API route — PERFORMANCE DASHBOARD
// ---------------------------------------------------------------------------
// GET /api/admin/performance
//   Returns post performance metrics from Facebook Insights API.
//   Falls back to demo data if FACEBOOK_PAGE_ACCESS_TOKEN is not set.
// ---------------------------------------------------------------------------

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PostMetric {
  id: string;
  message: string;
  created_time: string;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  engagement_rate: number; // (likes+comments+shares) / reach * 100
}

export interface PerformanceSummary {
  total_reach: number;
  total_impressions: number;
  avg_engagement_rate: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  posts: PostMetric[];
  page_name: string;
  page_id: string;
  period: string;
}

// ---------------------------------------------------------------------------
// Supabase client (service role)
// ---------------------------------------------------------------------------

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key, { auth: { persistSession: false } });
}

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

const ALLOWED_EMAIL = 'dpconway4@gmail.com';

async function verifyAuth(
  req: VercelRequest,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const auth = req.headers.authorization ?? '';
  if (!auth.startsWith('Bearer ')) {
    return { ok: false, message: 'Missing Authorization header' };
  }
  const token = auth.slice(7);
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { ok: false, message: 'Invalid or expired token' };
  if (data.user.email !== ALLOWED_EMAIL) return { ok: false, message: 'Forbidden' };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Facebook Insights fetch
// ---------------------------------------------------------------------------

async function fetchPageInsights(pageToken: string, pageId: string): Promise<PerformanceSummary> {
  // Get recent posts
  const postsUrl = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=id,message,created_time&limit=10&access_token=${pageToken}`;
  const postsRes = await fetch(postsUrl);
  const postsJson = await postsRes.json() as { data?: { id: string; message?: string; created_time: string }[]; error?: { message: string } };

  if (postsJson.error) throw new Error(`Facebook API: ${postsJson.error.message}`);

  const rawPosts = postsJson.data ?? [];

  // Fetch insights for each post in parallel
  const metrics: PostMetric[] = await Promise.all(
    rawPosts.map(async (post) => {
      const insightUrl = `https://graph.facebook.com/v19.0/${post.id}/insights?metric=post_impressions,post_impressions_unique,post_reactions_by_type_total,post_comments,post_shares&access_token=${pageToken}`;
      const insightRes = await fetch(insightUrl);
      const insightJson = await insightRes.json() as { data?: { name: string; values: { value: number | Record<string, number> }[] }[] };

      const getMetric = (name: string): number => {
        const m = insightJson.data?.find((d) => d.name === name);
        if (!m) return 0;
        const val = m.values[0]?.value;
        if (typeof val === 'number') return val;
        if (typeof val === 'object') return Object.values(val).reduce((a, b) => a + b, 0);
        return 0;
      };

      const reach = getMetric('post_impressions_unique');
      const impressions = getMetric('post_impressions');
      const likes = getMetric('post_reactions_by_type_total');
      const comments = getMetric('post_comments');
      const shares = getMetric('post_shares');
      const engagement_rate = reach > 0 ? ((likes + comments + shares) / reach) * 100 : 0;

      return {
        id: post.id,
        message: post.message ?? '(no caption)',
        created_time: post.created_time,
        reach,
        impressions,
        likes,
        comments,
        shares,
        engagement_rate: Math.round(engagement_rate * 10) / 10,
      };
    })
  );

  // Get page name
  const pageUrl = `https://graph.facebook.com/v19.0/${pageId}?fields=name&access_token=${pageToken}`;
  const pageRes = await fetch(pageUrl);
  const pageJson = await pageRes.json() as { name?: string };

  const totals = metrics.reduce(
    (acc, p) => ({
      total_reach: acc.total_reach + p.reach,
      total_impressions: acc.total_impressions + p.impressions,
      total_likes: acc.total_likes + p.likes,
      total_comments: acc.total_comments + p.comments,
      total_shares: acc.total_shares + p.shares,
    }),
    { total_reach: 0, total_impressions: 0, total_likes: 0, total_comments: 0, total_shares: 0 }
  );

  const avg_engagement_rate =
    metrics.length > 0
      ? Math.round((metrics.reduce((a, p) => a + p.engagement_rate, 0) / metrics.length) * 10) / 10
      : 0;

  return {
    ...totals,
    avg_engagement_rate,
    posts: metrics,
    page_name: pageJson.name ?? 'Wrapped In Love',
    page_id: pageId,
    period: 'Last 10 posts',
  };
}

// ---------------------------------------------------------------------------
// Demo data fallback
// ---------------------------------------------------------------------------

function demoData(): PerformanceSummary {
  const posts: PostMetric[] = [
    {
      id: 'demo_1',
      message: 'Patience isn\'t passive. It\'s one of the hardest acts of love — choosing to trust God\'s timing when everything in you wants to move faster.',
      created_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      reach: 1842,
      impressions: 2310,
      likes: 147,
      comments: 23,
      shares: 41,
      engagement_rate: 11.5,
    },
    {
      id: 'demo_2',
      message: 'Kindness is a choice, not a feeling. In relationships under stress, we often wait until we feel kind before we act kind.',
      created_time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      reach: 2103,
      impressions: 2890,
      likes: 198,
      comments: 34,
      shares: 67,
      engagement_rate: 14.2,
    },
    {
      id: 'demo_3',
      message: 'Envy says: I deserve what they have. Love says: I want good things for them.',
      created_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      reach: 1654,
      impressions: 2100,
      likes: 124,
      comments: 18,
      shares: 29,
      engagement_rate: 10.4,
    },
    {
      id: 'demo_4',
      message: 'Love does not boast. The quietest strength in a relationship is the person who doesn\'t need to be right — they just need to be present.',
      created_time: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      reach: 1920,
      impressions: 2540,
      likes: 163,
      comments: 27,
      shares: 44,
      engagement_rate: 12.2,
    },
    {
      id: 'demo_5',
      message: 'What does it mean to truly honor someone? Not just when it\'s easy. When it costs you something.',
      created_time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      reach: 1488,
      impressions: 1870,
      likes: 109,
      comments: 15,
      shares: 22,
      engagement_rate: 9.8,
    },
  ];

  const totals = posts.reduce(
    (acc, p) => ({
      total_reach: acc.total_reach + p.reach,
      total_impressions: acc.total_impressions + p.impressions,
      total_likes: acc.total_likes + p.likes,
      total_comments: acc.total_comments + p.comments,
      total_shares: acc.total_shares + p.shares,
    }),
    { total_reach: 0, total_impressions: 0, total_likes: 0, total_comments: 0, total_shares: 0 }
  );

  return {
    ...totals,
    avg_engagement_rate: 11.6,
    posts,
    page_name: 'Wrapped In Love',
    page_id: process.env.FACEBOOK_PAGE_ID ?? 'demo',
    period: 'Last 5 posts',
  };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.wrappedinlove.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const auth = await verifyAuth(req);
  if (!auth.ok) { res.status(401).json({ error: auth.message }); return; }

  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  try {
    if (pageToken && pageId) {
      const data = await fetchPageInsights(pageToken, pageId);
      res.status(200).json(data);
    } else {
      // Return demo data when FB credentials not yet configured
      res.status(200).json({ ...demoData(), _demo: true });
    }
  } catch (err) {
    console.error('[admin-performance]', err);
    // Fallback to demo data on any FB API error
    res.status(200).json({ ...demoData(), _demo: true, _error: (err as Error).message });
  }
}
