// api/admin/post-queue.ts
// Vercel serverless API route — POST QUEUE management
// ---------------------------------------------------------------------------
// GET  /api/admin/post-queue  → pending_review rows, ordered by post_date ASC
// PATCH /api/admin/post-queue → approve or reject a post
// ---------------------------------------------------------------------------

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PatchBody {
  id: string;
  action: 'approve' | 'reject';
  note?: string;
  caption?: string; // optional edited caption for "Edit & Approve"
}

// ---------------------------------------------------------------------------
// Supabase client (service role — bypasses RLS)
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
  // CORS for same-origin admin usage
  res.setHeader('Access-Control-Allow-Origin', 'https://www.wrappedinlove.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Auth check
  const auth = await verifyAuth(req);
  if (!auth.ok) {
    res.status(401).json({ error: auth.message });
    return;
  }

  const supabase = getSupabase();

  // -------------------------------------------------------------------------
  // GET — fetch pending_review rows
  // -------------------------------------------------------------------------
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('post_queue')
      .select(
        'id, quality_name, pillar, post_day, caption, visual_direction, post_date, status, updated_at',
      )
      .eq('status', 'pending_review')
      .order('post_date', { ascending: true });

    if (error) {
      console.error('[post-queue GET]', error);
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json(data ?? []);
    return;
  }

  // -------------------------------------------------------------------------
  // PATCH — approve or reject
  // -------------------------------------------------------------------------
  if (req.method === 'PATCH') {
    const body = req.body as PatchBody;

    if (!body?.id || !body?.action) {
      res.status(400).json({ error: 'id and action are required' });
      return;
    }

    if (!['approve', 'reject'].includes(body.action)) {
      res.status(400).json({ error: 'action must be approve or reject' });
      return;
    }

    let updates: Record<string, unknown>;

    if (body.action === 'approve') {
      updates = {
        status: 'approved',
        approved_at: new Date().toISOString(),
        ...(body.caption !== undefined ? { caption: body.caption } : {}),
      };
    } else {
      updates = {
        status: 'rejected',
        ...(body.note ? { founder_notes: body.note } : {}),
      };
    }

    const { data, error } = await supabase
      .from('post_queue')
      .update(updates)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('[post-queue PATCH]', error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json(data);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
