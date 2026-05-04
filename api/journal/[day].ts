import type { VercelRequest, VercelResponse } from "@vercel/node";

// GET /api/journal/:day — returns null for missing entries
// Since serverless functions are stateless, each invocation starts fresh.
// Journal entries are ephemeral in this serverless version.
// For persistent storage, integrate Vercel KV or Supabase.

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    // In serverless, we can't share state between invocations without a DB
    // Return null — the frontend handles this gracefully (empty journal)
    return res.status(200).json(null);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
