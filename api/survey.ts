import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  // POST — save a survey response
  if (req.method === 'POST') {
    const { day, week, response } = req.body;
    if (!day || !week || !response) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // Upsert — one response per user per day
    const { error } = await supabase
      .from('survey_responses')
      .upsert(
        {
          user_id: user.id,
          user_email: user.email,
          day,
          week,
          response,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,day' }
      );

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  // GET — admin fetch all responses (only for owner email)
  if (req.method === 'GET') {
    if (user.email !== 'dpconway4@gmail.com') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ responses: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
