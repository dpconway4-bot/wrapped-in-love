// /api/send-emails
// Called by the hourly cron. Finds all users whose local time is 5am,
// checks if they are due for an email (every 3 days from signup),
// and sends a personalized daily anchor email via Resend.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const CRON_SECRET   = process.env.CRON_SECRET || '';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// ── Day computation (mirrors client-side logic) ────────────────────────────
function computeCurrentDay(createdAt: string): number {
  const signupDate  = new Date(createdAt);
  const now         = new Date();
  const daysSince   = Math.floor((now.getTime() - signupDate.getTime()) / 86400000);

  if (daysSince < 6)          return -6 + daysSince;        // Intro days
  const mainDay = daysSince - 5;
  if (mainDay <= 100)         return mainDay;
  return ((mainDay - 1) % 100) + 1;                          // Restart
}

// Is this user due for an email today? (every 3 days from signup)
function isDueToday(createdAt: string): boolean {
  const signupDate = new Date(createdAt);
  const now        = new Date();
  const daysSince  = Math.floor((now.getTime() - signupDate.getTime()) / 86400000);
  return daysSince % 3 === 0;
}

// What local hour is it right now for a given IANA timezone?
function getLocalHour(timezone: string): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour:     'numeric',
      hour12:   false,
    }).formatToParts(new Date());
    const h = parts.find(p => p.type === 'hour');
    return h ? parseInt(h.value, 10) : -1;
  } catch {
    return -1;
  }
}

// ── Day labels ─────────────────────────────────────────────────────────────
function getDayLabel(day: number): string {
  if (day <= 0) return `Introduction ${day + 7}/6`;
  if (day >= 92) return `Day ${day} · Wrapped In Love`;
  return `Day ${day} of 100`;
}

// ── Email HTML template ────────────────────────────────────────────────────
function buildEmail({
  dayLabel,
  title,
  openingLine,
  scriptureRef,
  scriptureText,
  appUrl,
}: {
  dayLabel:     string;
  title:        string;
  openingLine:  string;
  scriptureRef: string;
  scriptureText:string;
  appUrl:       string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>100 Days In Love</title>
</head>
<body style="margin:0;padding:0;background:#0D1C43;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1C43;padding:40px 20px;">
  <tr><td align="center">
    <table width="100%" style="max-width:520px;">

      <!-- Header -->
      <tr><td style="padding-bottom:32px;text-align:center;">
        <div style="display:inline-block;width:44px;height:44px;border-radius:50%;border:1.5px solid rgba(250,178,77,0.5);text-align:center;line-height:44px;font-size:18px;color:#FAB24D;margin-bottom:12px;">♡</div>
        <p style="margin:0;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#FAB24D;font-family:'Helvetica Neue',Arial,sans-serif;">100 Days In Love</p>
      </td></tr>

      <!-- Day label -->
      <tr><td style="text-align:center;padding-bottom:8px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(207,150,153,0.7);font-family:'Helvetica Neue',Arial,sans-serif;">${dayLabel}</p>
      </td></tr>

      <!-- Title -->
      <tr><td style="text-align:center;padding-bottom:24px;">
        <h1 style="margin:0;font-size:32px;font-weight:300;color:#ffffff;line-height:1.2;font-family:Georgia,serif;">Love Is<br/><span style="color:#FAB24D;">${title}.</span></h1>
      </td></tr>

      <!-- Divider -->
      <tr><td style="padding-bottom:28px;">
        <div style="height:1px;background:linear-gradient(to right,rgba(250,178,77,0.5),rgba(207,150,153,0.2),transparent);"></div>
      </td></tr>

      <!-- Opening line -->
      <tr><td style="padding-bottom:28px;">
        <p style="margin:0;font-size:17px;color:rgba(245,239,230,0.9);line-height:1.7;font-family:Georgia,serif;font-style:italic;">"${openingLine}"</p>
      </td></tr>

      <!-- Scripture card -->
      <tr><td style="padding-bottom:32px;">
        <div style="background:rgba(25,59,137,0.4);border:1px solid rgba(250,178,77,0.18);border-radius:12px;padding:20px 24px;">
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#FAB24D;font-family:'Helvetica Neue',Arial,sans-serif;">${scriptureRef}</p>
          <p style="margin:0;font-size:15px;color:rgba(245,239,230,0.85);line-height:1.75;font-family:Georgia,serif;font-style:italic;">"${scriptureText}"</p>
        </div>
      </td></tr>

      <!-- CTA -->
      <tr><td style="text-align:center;padding-bottom:40px;">
        <a href="${appUrl}" style="display:inline-block;background:#FAB24D;color:#0D1C43;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-family:'Helvetica Neue',Arial,sans-serif;">Enter Today's Anchor</a>
      </td></tr>

      <!-- Divider -->
      <tr><td style="padding-bottom:28px;">
        <div style="height:1px;background:rgba(250,178,77,0.1);"></div>
      </td></tr>

      <!-- Footer -->
      <tr><td style="text-align:center;">
        <p style="margin:0 0 8px;font-size:12px;color:rgba(207,150,153,0.5);font-family:Georgia,serif;font-style:italic;line-height:1.6;">"Love bears all things, believes all things,<br/>hopes all things, endures all things."</p>
        <p style="margin:12px 0 4px;font-size:10px;color:rgba(207,150,153,0.35);letter-spacing:0.1em;text-transform:uppercase;font-family:'Helvetica Neue',Arial,sans-serif;">Remarkable Impact · Wrapped In Love</p>
        <p style="margin:0;font-size:10px;color:rgba(207,150,153,0.25);font-family:'Helvetica Neue',Arial,sans-serif;">
          <a href="${appUrl}/home" style="color:rgba(207,150,153,0.35);text-decoration:none;">Manage notifications in the app</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ── Handler ────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify cron secret so only our scheduled task can call this
  const auth = req.headers['authorization'];
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Fetch all users who have notifications enabled from user_preferences
  const { data: prefs, error: prefsError } = await supabase
    .from('user_preferences')
    .select('user_id, timezone, email')
    .eq('email_notifications', true);

  if (prefsError) {
    console.error('Error fetching prefs:', prefsError);
    return res.status(500).json({ error: prefsError.message });
  }

  if (!prefs || prefs.length === 0) {
    return res.status(200).json({ sent: 0, message: 'No users with notifications enabled' });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const pref of prefs) {
    try {
      const timezone = pref.timezone || 'America/Chicago';
      const localHour = getLocalHour(timezone);

      // Only send at 5am local time (window: 5:00–5:59)
      if (localHour !== 5) continue;

      // Get user's created_at from auth.users
      const { data: userData } = await supabase.auth.admin.getUserById(pref.user_id);
      if (!userData?.user?.created_at) continue;

      const createdAt = userData.user.created_at;

      // Check if due today (every 3 days)
      if (!isDueToday(createdAt)) continue;

      // Compute their current day
      const currentDay = computeCurrentDay(createdAt);

      // Dynamically import day data (server-side)
      // We pull the data directly from the content files
      const dayDataModule = await import('../client/src/data/index.js').catch(() => null);
      if (!dayDataModule) continue;

      const dayData = dayDataModule.getDayData(currentDay);
      if (!dayData) continue;

      const dayLabel     = getDayLabel(currentDay);
      const title        = dayData.characteristic || 'Love';
      const openingLine  = dayData.openingLine || '';
      const scriptureRef = dayData.scripture?.reference || '1 Corinthians 13';
      const scriptureText= dayData.scripture?.text || '';

      const html = buildEmail({
        dayLabel,
        title,
        openingLine,
        scriptureRef,
        scriptureText,
        appUrl: 'https://wrappedinlove.app',
      });

      // Send via Resend
      const resendRes = await fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          from:    'Wrapped In Love <hello@wrappedinlove.app>',
          to:      [pref.email],
          subject: `${dayLabel} · Love Is ${title}`,
          html,
        }),
      });

      if (resendRes.ok) {
        sent++;
      } else {
        const err = await resendRes.json();
        errors.push(`${pref.email}: ${JSON.stringify(err)}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      errors.push(`${pref.user_id}: ${msg}`);
    }
  }

  return res.status(200).json({ sent, errors });
}
