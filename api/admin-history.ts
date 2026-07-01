// api/admin/history.ts
// Vercel serverless API route — ADMIN HISTORY
// ---------------------------------------------------------------------------
// GET /api/admin/history
//   Returns last 30 items combined from:
//     - engagement_queue (status IN 'approved','rejected','escalated')
//     - post_queue       (status IN 'approved','rejected','published')
//   Sorted by updated_at DESC, limited to 30 total.
// ---------------------------------------------------------------------------

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PostHistoryRow {
  id: string;
  quality_name: string;
  pillar: string;
  post_day: number;
  caption: string;
  visual_direction: string;
  post_date: string;
  status: string;
  updated_at: string;
  _type: 'post';
}

interface EngagementHistoryRow {
  id: string;
  sender_name: string;
  source: string;
  classification: string;
  message_text: string;
  suggested_reply: string;
  crisis_flag: boolean;
  status: string;
  updated_at: string;
  _type: 'engagement';
}

type HistoryItem = PostHistoryRow | EngagementHistoryRow;

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
  if (error || !data.user) {
    return { ok: false, message: 'Invalid or expired token' };
  }
  if (data.user.email !== ALLOWED_EMAIL) {
    return { ok: false, message: 'Forbidden: insufficient permissions' };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://www.wrappedinlove.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Auth check
  const auth = await verifyAuth(req);
  if (!auth.ok) {
    res.status(401).json({ error: auth.message });
    return;
  }

  const supabase = getSupabase();

  // Fetch both tables in parallel
  const [postResult, engResult] = await Promise.all([
    supabase
      .from('post_queue')
      .select(
        'id, quality_name, pillar, post_day, caption, visual_direction, post_date, status, updated_at',
      )
      .in('status', ['approved', 'rejected', 'published'])
      .order('updated_at', { ascending: false })
      .limit(30),

    supabase
      .from('engagement_queue')
      .select(
        'id, sender_name, source, classification, message_text, suggested_reply, crisis_flag, status, updated_at',
      )
      .in('status', ['approved', 'rejected', 'escalated'])
      .order('updated_at', { ascending: false })
      .limit(30),
  ]);

  if (postResult.error) {
    console.error('[history GET post_queue]', postResult.error);
    res.status(500).json({ error: postResult.error.message });
    return;
  }

  if (engResult.error) {
    console.error('[history GET engagement_queue]', engResult.error);
    res.status(500).json({ error: engResult.error.message });
    return;
  }

  // Tag rows with their type
  const posts: PostHistoryRow[] = (postResult.data ?? []).map((r) => ({
    ...(r as Omit<PostHistoryRow, '_type'>),
    _type: 'post' as const,
  }));

  const engagements: EngagementHistoryRow[] = (engResult.data ?? []).map(
    (r) => ({
      ...(r as Omit<EngagementHistoryRow, '_type'>),
      _type: 'engagement' as const,
    }),
  );

  // Combine, sort by updated_at DESC, take top 30
  const combined: HistoryItem[] = [...posts, ...engagements]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
    .slice(0, 30);

  res.status(200).json(combined);
}
