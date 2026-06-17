import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Get user from Authorization header (Supabase JWT)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Get current journey_number for this user
  const { data: purchaser } = await supabase
    .from('verified_purchasers')
    .select('journey_number')
    .eq('email', user.email)
    .single();
  const journeyNumber = purchaser?.journey_number ?? 1;

  if (req.method === 'GET') {
    // If ?day= param provided, return single entry for that day
    if (req.query.day !== undefined) {
      const dayInt = parseInt(req.query.day as string);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('day', dayInt)
        .eq('journey_number', journeyNumber)
        .single();

      if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json(data || { day: dayInt, content: '' });
    }

    // Return all entries grouped by journey for the journal page
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('journey_number', { ascending: false })
      .order('day', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }

  if (req.method === 'POST') {
    const { day, content } = req.body;

    // Use null check instead of falsy — day can be negative (intro days -6 to -1)
    if (day === undefined || day === null || content === undefined) {
      return res.status(400).json({ error: 'Missing day or content' });
    }

    const dayInt = parseInt(day);

    // Check if an entry already exists for this user/day (constraint is on user_id+day only)
    const { data: existing } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('user_id', user.id)
      .eq('day', dayInt)
      .single();

    let data, error;

    if (existing?.id) {
      // Update existing entry
      ({ data, error } = await supabase
        .from('journal_entries')
        .update({ content })
        .eq('id', existing.id)
        .select()
        .single());
    } else {
      // Insert new entry — only send columns we know exist
      ({ data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          day: dayInt,
          journey_number: journeyNumber,
          content,
        })
        .select()
        .single());
    }

    if (error) {
      console.error('[journal POST] Supabase error:', JSON.stringify(error));
      return res.status(500).json({ error: error.message, code: error.code, details: error.details });
    }
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
