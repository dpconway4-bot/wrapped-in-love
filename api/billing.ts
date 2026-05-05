import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify the Supabase JWT from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Look up the Stripe customer by email
  const customers = await stripe.customers.list({ email: user.email, limit: 1 });

  if (customers.data.length === 0) {
    return res.status(404).json({ error: 'No Stripe customer found for this account.' });
  }

  const customerId = customers.data[0].id;

  // Create a billing portal session
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: 'https://wrappedinlove.app',
  });

  return res.status(200).json({ url: session.url });
}
