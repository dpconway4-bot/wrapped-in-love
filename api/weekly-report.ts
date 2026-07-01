import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const resend = new Resend(process.env.RESEND_API_KEY);

const PAGE_ID = process.env.FACEBOOK_PAGE_ID || '';
const PAGE_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';

// ─── Auth ────────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const weekEnd = new Date();
  const weekStart = new Date();
  weekStart.setDate(weekEnd.getDate() - 7);

  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  try {
    // ─── Run all Supabase queries in parallel ─────────────────────────────
    const [volumeResult, classResult, responseResult, crisisResult, pendingResult] =
      await Promise.all([
        // Query 1: Volume by source
        supabase.rpc('exec_sql', { sql: `
          SELECT source, COUNT(*) as total,
            COUNT(*) FILTER (WHERE crisis_flag = true) as crisis_count
          FROM engagement_queue
          WHERE created_at >= NOW() - INTERVAL '7 days'
          GROUP BY source
        ` }),

        // Query 2: Classification breakdown
        supabase
          .from('engagement_queue')
          .select('classification')
          .gte('created_at', weekStart.toISOString())
          .not('classification', 'is', null),

        // Query 3: Response rate
        supabase
          .from('engagement_queue')
          .select('status')
          .gte('created_at', weekStart.toISOString()),

        // Query 4: Crisis flags
        supabase
          .from('engagement_queue')
          .select('id, source, sender_name, message_text, status, created_at')
          .eq('crisis_flag', true)
          .gte('created_at', weekStart.toISOString())
          .order('created_at', { ascending: false }),

        // Query 5: Pending items
        supabase
          .from('engagement_queue')
          .select('id, source, sender_name, classification, message_text, created_at')
          .eq('status', 'pending')
          .order('created_at', { ascending: true })
          .limit(10),
      ]);

    // ─── Process engagement data ──────────────────────────────────────────
    const allMessages = responseResult.data || [];
    const totalReceived = allMessages.length;
    const totalReplied = allMessages.filter((m: any) => m.status === 'approved').length;
    const totalPending = allMessages.filter((m: any) => m.status === 'pending').length;
    const totalEscalated = allMessages.filter((m: any) => m.status === 'escalated').length;
    const responseRate = totalReceived > 0
      ? Math.round((totalReplied / totalReceived) * 1000) / 10
      : 0;

    const classifications = classResult.data || [];
    const classCount: Record<string, number> = {
      encouragement: 0, question: 0, sensitive: 0, hostile: 0,
    };
    classifications.forEach((m: any) => {
      if (m.classification && classCount[m.classification] !== undefined) {
        classCount[m.classification]++;
      }
    });

    const comments = (volumeResult.data || []).find((r: any) => r.source === 'comment');
    const dms = (volumeResult.data || []).find((r: any) => r.source === 'dm');
    const totalComments = comments?.total || 0;
    const totalDMs = dms?.total || 0;
    const crisisFlags = (crisisResult.data || []).length;
    const pendingItems = pendingResult.data || [];

    // ─── Facebook Page Insights ───────────────────────────────────────────
    let pageInsights = {
      followers: 0,
      newFollowers: 0,
      reach: 0,
      engagements: 0,
      pageViews: 0,
    };

    let topPosts: any[] = [];

    try {
      const metricsUrl = `https://graph.facebook.com/v19.0/${PAGE_ID}/insights?metric=page_fans,page_fan_adds_unique,page_impressions_unique,page_post_engagements,page_views_total&period=week&access_token=${PAGE_TOKEN}`;
      const metricsRes = await fetch(metricsUrl);
      const metricsData = await metricsRes.json();

      if (metricsData.data) {
        metricsData.data.forEach((metric: any) => {
          const val = metric.values?.[metric.values.length - 1]?.value || 0;
          if (metric.name === 'page_fans') pageInsights.followers = val;
          if (metric.name === 'page_fan_adds_unique') pageInsights.newFollowers = val;
          if (metric.name === 'page_impressions_unique') pageInsights.reach = val;
          if (metric.name === 'page_post_engagements') pageInsights.engagements = val;
          if (metric.name === 'page_views_total') pageInsights.pageViews = val;
        });
      }

      const postsUrl = `https://graph.facebook.com/v19.0/${PAGE_ID}/posts?fields=message,created_time,insights.metric(post_impressions_unique,post_engaged_users)&limit=5&access_token=${PAGE_TOKEN}`;
      const postsRes = await fetch(postsUrl);
      const postsData = await postsRes.json();
      topPosts = postsData.data || [];
    } catch (fbErr) {
      console.warn('Facebook insights fetch failed:', fbErr);
    }

    // ─── Find top post ────────────────────────────────────────────────────
    let topPost = null;
    if (topPosts.length > 0) {
      topPost = topPosts.reduce((best: any, post: any) => {
        const engaged = post.insights?.data?.find((d: any) => d.name === 'post_engaged_users')?.values?.[0]?.value || 0;
        const bestEngaged = best?.engagements || 0;
        return engaged > bestEngaged ? { ...post, engagements: engaged } : best;
      }, null);
    }

    // ─── Build HTML email ─────────────────────────────────────────────────
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const pendingSection = pendingItems.length > 0
      ? `
        <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:16px;margin:16px 0;border-radius:4px;">
          <h3 style="margin:0 0 12px;color:#856404;">⚠️ ${pendingItems.length} Message${pendingItems.length > 1 ? 's' : ''} Awaiting Your Review</h3>
          ${pendingItems.map((item: any, i: number) => `
            <div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #ffeaa7;">
              <strong>${i + 1}. ${item.sender_name || 'Unknown'}</strong> (${item.source})
              <span style="background:#e9ecef;padding:2px 6px;border-radius:3px;font-size:12px;margin-left:8px;">${item.classification || 'unclassified'}</span>
              <p style="margin:4px 0;color:#555;font-size:14px;">"${(item.message_text || '').substring(0, 120)}${item.message_text?.length > 120 ? '...' : ''}"</p>
            </div>
          `).join('')}
          <a href="https://www.wrappedinlove.app/admin" style="background:#ffc107;color:#000;padding:8px 16px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:8px;">Review Now →</a>
        </div>
      ` : `<div style="background:#d4edda;border-left:4px solid #28a745;padding:12px 16px;border-radius:4px;"><strong>✅ All messages have been reviewed. Inbox is clear.</strong></div>`;

    const crisisSection = crisisFlags > 0
      ? `<div style="background:#f8d7da;border-left:4px solid #dc3545;padding:12px 16px;border-radius:4px;margin:8px 0;"><strong>🚨 ${crisisFlags} crisis flag${crisisFlags > 1 ? 's' : ''} this week.</strong> Please review immediately.</div>`
      : '';

    const topPostSection = topPost
      ? `
        <div style="background:#f8f9fa;padding:12px;border-radius:4px;margin-top:8px;">
          <strong>Top Post:</strong>
          <p style="margin:4px 0;color:#555;">"${(topPost.message || '').substring(0, 100)}${topPost.message?.length > 100 ? '...' : ''}"</p>
          <span style="font-size:13px;color:#666;">Engagements: ${topPost.engagements || 0}</span>
        </div>
      ` : '';

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:20px;color:#333;background:#fff;">

  <!-- Header -->
  <div style="background:#0a1628;color:#fff;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
    <h1 style="margin:0;font-size:22px;letter-spacing:1px;">WRAPPED IN LOVE</h1>
    <p style="margin:6px 0 0;color:#c9a84c;font-size:14px;">Weekly Performance Report</p>
    <p style="margin:4px 0 0;color:#aaa;font-size:12px;">${formatDate(weekStart)} — ${formatDate(weekEnd)}</p>
  </div>

  <div style="border:1px solid #e0e0e0;border-top:none;padding:24px;border-radius:0 0 8px 8px;">

    <!-- Action Items First -->
    ${pendingSection}
    ${crisisSection}

    <!-- Page Growth -->
    <h2 style="color:#0a1628;border-bottom:2px solid #c9a84c;padding-bottom:6px;">📈 Page Growth</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 0;color:#555;">Total Followers</td>
        <td style="padding:8px 0;font-weight:bold;text-align:right;">${pageInsights.followers.toLocaleString()}</td>
      </tr>
      <tr style="background:#f8f9fa;">
        <td style="padding:8px;color:#555;">New This Week</td>
        <td style="padding:8px;font-weight:bold;text-align:right;color:#28a745;">+${pageInsights.newFollowers}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#555;">Unique Reach</td>
        <td style="padding:8px 0;font-weight:bold;text-align:right;">${pageInsights.reach.toLocaleString()}</td>
      </tr>
      <tr style="background:#f8f9fa;">
        <td style="padding:8px;color:#555;">Page Views</td>
        <td style="padding:8px;font-weight:bold;text-align:right;">${pageInsights.pageViews.toLocaleString()}</td>
      </tr>
    </table>

    <!-- Content Performance -->
    <h2 style="color:#0a1628;border-bottom:2px solid #c9a84c;padding-bottom:6px;margin-top:24px;">📝 Content Performance</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 0;color:#555;">Total Engagements</td>
        <td style="padding:8px 0;font-weight:bold;text-align:right;">${pageInsights.engagements.toLocaleString()}</td>
      </tr>
    </table>
    ${topPostSection}

    <!-- Engagement Activity -->
    <h2 style="color:#0a1628;border-bottom:2px solid #c9a84c;padding-bottom:6px;margin-top:24px;">💬 Engagement Activity</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 0;color:#555;">Total Messages & Comments</td>
        <td style="padding:8px 0;font-weight:bold;text-align:right;">${totalReceived}</td>
      </tr>
      <tr style="background:#f8f9fa;">
        <td style="padding:8px;color:#555;">→ Comments</td>
        <td style="padding:8px;text-align:right;">${totalComments}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#555;">→ Direct Messages</td>
        <td style="padding:8px 0;text-align:right;">${totalDMs}</td>
      </tr>
    </table>

    <h3 style="color:#555;font-size:14px;margin:16px 0 8px;">Classification Breakdown</h3>
    <table style="width:100%;border-collapse:collapse;">
      ${Object.entries(classCount).map(([label, count], i) => `
        <tr ${i % 2 === 0 ? '' : 'style="background:#f8f9fa;"'}>
          <td style="padding:6px ${i % 2 === 0 ? '0' : '8px'};color:#555;text-transform:capitalize;">${label}</td>
          <td style="padding:6px ${i % 2 === 0 ? '0' : '8px'};font-weight:bold;text-align:right;">${count} ${totalReceived > 0 ? `(${Math.round(count / totalReceived * 100)}%)` : ''}</td>
        </tr>
      `).join('')}
    </table>

    <!-- Response Performance -->
    <h2 style="color:#0a1628;border-bottom:2px solid #c9a84c;padding-bottom:6px;margin-top:24px;">✅ Response Performance</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 0;color:#555;">Replies Sent</td>
        <td style="padding:8px 0;font-weight:bold;text-align:right;">${totalReplied}</td>
      </tr>
      <tr style="background:#f8f9fa;">
        <td style="padding:8px;color:#555;">Response Rate</td>
        <td style="padding:8px;font-weight:bold;text-align:right;color:${responseRate >= 70 ? '#28a745' : responseRate >= 40 ? '#ffc107' : '#dc3545'};">${responseRate}%</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#555;">Awaiting Review</td>
        <td style="padding:8px 0;font-weight:bold;text-align:right;color:${totalPending > 0 ? '#dc3545' : '#28a745'};">${totalPending}</td>
      </tr>
      <tr style="background:#f8f9fa;">
        <td style="padding:8px;color:#555;">Escalated</td>
        <td style="padding:8px;font-weight:bold;text-align:right;">${totalEscalated}</td>
      </tr>
    </table>

    <!-- Footer -->
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;text-align:center;color:#888;font-size:13px;">
      <p style="font-style:italic;color:#0a1628;">"Love is patient, love is kind." — 1 Corinthians 13:4</p>
      <p style="margin:4px 0;">Wrapped In Love · Dallas, TX</p>
      <p style="margin:4px 0;">This report was generated automatically every Monday at 7:00 AM CDT</p>
    </div>

  </div>
</body>
</html>
    `;

    // ─── Send email ───────────────────────────────────────────────────────
    const emailResult = await resend.emails.send({
      from: 'Wrapped In Love <onboarding@resend.dev>',
      to: ['dpconway4@gmail.com'],
      subject: `WIL Weekly Report — Week of ${formatDate(weekStart)}`,
      html,
    });

    // ─── Log to Supabase ──────────────────────────────────────────────────
    await supabase.from('report_log').insert({
      week_start: weekStartStr,
      week_end: weekEndStr,
      total_messages: totalReceived,
      total_posts: topPosts.length,
      new_followers: pageInsights.newFollowers,
      response_rate: responseRate,
      crisis_flags: crisisFlags,
      email_sent: !emailResult.error,
      error_message: emailResult.error ? JSON.stringify(emailResult.error) : null,
    });

    return res.status(200).json({
      success: true,
      week: `${weekStartStr} to ${weekEndStr}`,
      metrics: {
        totalMessages: totalReceived,
        responseRate: `${responseRate}%`,
        newFollowers: pageInsights.newFollowers,
        crisisFlags,
        pending: totalPending,
      },
    });

  } catch (err: any) {
    console.error('Weekly report error:', err);

    await supabase.from('report_log').insert({
      week_start: weekStartStr,
      week_end: weekEndStr,
      total_messages: 0,
      total_posts: 0,
      new_followers: 0,
      response_rate: 0,
      crisis_flags: 0,
      email_sent: false,
      error_message: err.message,
    });

    return res.status(500).json({ error: err.message });
  }
}
