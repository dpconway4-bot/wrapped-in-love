import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No auth header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token', detail: authError?.message });
  }

  // Check purchaser record
  const { data: purchaser, error: pErr } = await supabase
    .from('verified_purchasers')
    .select('email, status, journey_number, current_day')
    .eq('email', user.email)
    .single();

  // Try a test insert into journal_entries
  const { data: inserted, error: iErr } = await supabase
    .from('journal_entries')
    .insert({
      user_id: user.id,
      day: -99,
      journey_number: purchaser?.journey_number ?? 1,
      content: 'DEBUG TEST — safe to delete',
    })
    .select()
    .single();

  // Clean up the test row immediately
  if (inserted?.id) {
    await supabase.from('journal_entries').delete().eq('id', inserted.id);
  }

  return res.status(200).json({
    user_id: user.id,
    email: user.email,
    purchaser,
    purchaser_error: pErr?.message ?? null,
    insert_success: !iErr,
    insert_error: iErr ? { message: iErr.message, code: iErr.code, details: iErr.details, hint: iErr.hint } : null,
  });
}
