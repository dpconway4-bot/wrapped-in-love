import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET — Facebook webhook verification handshake
// Facebook sends this to confirm the endpoint is yours
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN) {
      console.log('Facebook webhook verified successfully');
      return res.status(200).send(challenge);
    }

    console.warn('Webhook verification failed — token mismatch');
    return res.status(403).json({ error: 'Forbidden' });
  }

  // POST — Incoming comment or DM event from Facebook
  if (req.method === 'POST') {
    try {
      const body = req.body;

      // Process each entry in the webhook payload
      for (const entry of body?.entry || []) {
        // Handle Page feed events (comments on posts)
        for (const change of entry?.changes || []) {
          if (change.field === 'feed') {
            await processComment(change.value);
          }
        }

        // Handle Messenger DM events
        for (const messaging of entry?.messaging || []) {
          if (messaging?.message?.text) {
            await processDM(messaging);
          }
        }
      }

      // Always respond 200 immediately — Facebook resends if you don't
      return res.status(200).json({ received: true });
    } catch (err) {
      console.error('Webhook processing error:', err);
      // Still return 200 so Facebook doesn't deactivate the webhook
      return res.status(200).json({ received: true });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function processComment(value: any) {
  try {
    const messageText = value?.message || '';
    const commentId = value?.comment_id || value?.post_id || `comment_${Date.now()}`;
    const fromName = value?.from?.name || 'Unknown';
    const postId = value?.post_id || null;

    // Skip empty messages and page's own comments
    if (!messageText || messageText.trim() === '') return;

    await supabase.from('engagement_queue').insert({
      type: 'comment',
      external_id: commentId,
      from_name: fromName,
      post_id: postId,
      message_text: messageText,
      status: 'pending_classification',
      received_at: new Date().toISOString()
    });

    console.log(`Comment queued for classification: ${commentId}`);
  } catch (err) {
    console.error('Error processing comment:', err);
  }
}

async function processDM(messaging: any) {
  try {
    const messageText = messaging?.message?.text || '';
    const senderId = messaging?.sender?.id || `dm_${Date.now()}`;

    // Skip empty messages
    if (!messageText || messageText.trim() === '') return;

    await supabase.from('engagement_queue').insert({
      type: 'dm',
      external_id: senderId,
      from_name: 'DM Sender',
      post_id: null,
      message_text: messageText,
      status: 'pending_classification',
      received_at: new Date().toISOString()
    });

    console.log(`DM queued for classification from sender: ${senderId}`);
  } catch (err) {
    console.error('Error processing DM:', err);
  }
}
