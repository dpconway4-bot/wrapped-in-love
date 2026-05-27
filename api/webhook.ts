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

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function getEmailFromCustomer(customerId: string): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    return (customer as Stripe.Customer).email?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).json({ error: 'Missing signature or webhook secret' });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return res.status(400).json({ error: `Webhook Error: ${message}` });
  }

  // ── checkout.session.completed ─────────────────────────────────────────────
  // Fires immediately when someone completes checkout (trial or direct pay).
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerEmail = (session.customer_details?.email || session.customer_email)?.toLowerCase();

    if (customerEmail) {
      // Determine if this checkout started a trial
      let trialEndsAt: string | null = null;
      if (session.subscription) {
        try {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          if (sub.trial_end) {
            trialEndsAt = new Date(sub.trial_end * 1000).toISOString();
          }
        } catch (e) {
          console.error('Could not retrieve subscription for trial check:', e);
        }
      }

      const status = trialEndsAt ? 'trialing' : 'active';

      const { error } = await supabase
        .from('verified_purchasers')
        .upsert({
          email: customerEmail,
          purchased_at: new Date().toISOString(),
          status,
          trial_ends_at: trialEndsAt,
        });

      if (error) {
        console.error('Error recording purchaser:', error);
      } else {
        console.log(`Verified purchaser recorded: ${customerEmail} (status: ${status})`);
      }
    }
  }

  // ── customer.subscription.updated ─────────────────────────────────────────
  // Fires when trial converts to paid, or subscription status changes.
  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const email = await getEmailFromCustomer(customerId);

    if (email) {
      const status = sub.status; // 'active', 'trialing', 'past_due', 'canceled', etc.
      const trialEndsAt = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;

      const { error } = await supabase
        .from('verified_purchasers')
        .update({ status, trial_ends_at: trialEndsAt })
        .eq('email', email);

      if (error) {
        console.error('Error updating subscription status:', error);
      } else {
        console.log(`Subscription updated for ${email}: ${status}`);
      }
    }
  }

  // ── customer.subscription.deleted ─────────────────────────────────────────
  // Fires when a subscription is fully cancelled/expired.
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const email = await getEmailFromCustomer(customerId);

    if (email) {
      const { error } = await supabase
        .from('verified_purchasers')
        .update({ status: 'canceled' })
        .eq('email', email);

      if (error) {
        console.error('Error marking subscription canceled:', error);
      } else {
        console.log(`Subscription canceled for ${email}`);
      }
    }
  }

  return res.status(200).json({ received: true });
}
