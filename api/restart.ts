import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  // Get user's email from verified_purchasers
  const { data: purchaser, error: fetchError } = await supabase
    .from('verified_purchasers')
    .select('email, journey_number')
    .eq('email', user.email)
    .single();

  if (fetchError || !purchaser) return res.status(404).json({ error: 'User not found' });

  const currentJourney = purchaser.journey_number ?? 1;
  const nextJourney = currentJourney + 1;

  // Reset progress and increment journey_number
  const { error: updateError } = await supabase
    .from('verified_purchasers')
    .update({
      current_day: 1,
      journey_number: nextJourney,
    })
    .eq('email', purchaser.email);

  if (updateError) return res.status(500).json({ error: updateError.message });

  return res.status(200).json({ journey_number: nextJourney });
}
