// api/admin/engagement-queue.ts
// Vercel serverless API route — ENGAGEMENT QUEUE management
// ---------------------------------------------------------------------------
// GET   /api/admin/engagement-queue → pending rows, crisis first
// PATCH /api/admin/engagement-queue → approve (send reply) or reject
// ---------------------------------------------------------------------------

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PatchBody {
  id: string;
  action: 'approve' | 'reject';
  reply_text?: string;
}

interface EngagementRow {
  id: string;
  sender_id: string;
  sender_name: string;
  source: string;
  classification: string;
  message_text: string;
  suggested_reply: string;
  crisis_flag: boolean;
  status: string;
  updated_at: string;
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
  if (error || !data.user) {
    return { ok: false, message: 'Invalid or expired token' };
  }
  if (data.user.email !== ALLOWED_EMAIL) {
    return { ok: false, message: 'Forbidden: insufficient permissions' };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Facebook Messenger — send reply
// ---------------------------------------------------------------------------

async function sendFacebookReply(
  senderId: string,
  replyText: string,
): Promise<void> {
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageToken) throw new Error('Missing FACEBOOK_PAGE_ACCESS_TOKEN');

  const url = 'https://graph.facebook.com/v19.0/me/messages';
  const body = {
    recipient: { id: senderId },
    message: { text: replyText },
    messaging_type: 'RESPONSE',
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${pageToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Facebook API error ${res.status}: ${JSON.stringify(err)}`,
    );
  }
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
  // GET — fetch pending rows, crisis first, then by created_at ASC
  // -------------------------------------------------------------------------
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('engagement_queue')
      .select(
        'id, sender_id, sender_name, source, classification, message_text, suggested_reply, crisis_flag, status, updated_at',
      )
      .eq('status', 'pending')
      .order('crisis_flag', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[engagement-queue GET]', error);
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json(data ?? []);
    return;
  }

  // -------------------------------------------------------------------------
  // PATCH — approve (send reply) or reject
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

    if (body.action === 'approve') {
      if (!body.reply_text?.trim()) {
        res.status(400).json({ error: 'reply_text is required for approve' });
        return;
      }

      // Fetch the row to get sender_id
      const { data: row, error: fetchError } = await supabase
        .from('engagement_queue')
        .select('sender_id')
        .eq('id', body.id)
        .single<Pick<EngagementRow, 'sender_id'>>();

      if (fetchError || !row) {
        console.error('[engagement-queue PATCH fetch]', fetchError);
        res.status(404).json({ error: 'Row not found' });
        return;
      }

      // Send via Facebook Messenger
      try {
        await sendFacebookReply(row.sender_id, body.reply_text);
      } catch (fbErr) {
        console.error('[Facebook send]', fbErr);
        res.status(502).json({
          error: `Failed to send Facebook reply: ${(fbErr as Error).message}`,
        });
        return;
      }

      // Update DB
      const { data: updated, error: updateError } = await supabase
        .from('engagement_queue')
        .update({
          status: 'approved',
          founder_reviewed_at: new Date().toISOString(),
          sent_reply: body.reply_text,
        })
        .eq('id', body.id)
        .select()
        .single();

      if (updateError) {
        console.error('[engagement-queue PATCH update approve]', updateError);
        res.status(500).json({ error: updateError.message });
        return;
      }

      res.status(200).json(updated);
      return;
    }

    // action === 'reject'
    const { data: updated, error: updateError } = await supabase
      .from('engagement_queue')
      .update({
        status: 'rejected',
        founder_reviewed_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select()
      .single();

    if (updateError) {
      console.error('[engagement-queue PATCH update reject]', updateError);
      res.status(500).json({ error: updateError.message });
      return;
    }

    res.status(200).json(updated);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
