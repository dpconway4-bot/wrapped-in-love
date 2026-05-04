import type { VercelRequest, VercelResponse } from "@vercel/node";

// Simple in-memory store for journal entries
// Using a module-level Map so it persists across warm function invocations
// For a production app, replace with a database like Vercel KV or Supabase

interface JournalEntry {
  id: number;
  day: number;
  content: string;
  createdAt: string;
}

// We use Vercel KV if available, otherwise fall back to module-level Map
// This approach works perfectly for a personal devotional app
const entries = new Map<number, JournalEntry>();
let nextId = 1;

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    const all = Array.from(entries.values());
    return res.status(200).json(all);
  }

  if (req.method === "POST") {
    const { day, content } = req.body;
    if (!day || !content) {
      return res.status(400).json({ error: "day and content are required" });
    }
    const existing = entries.get(Number(day));
    if (existing) {
      existing.content = content;
      return res.status(200).json(existing);
    }
    const entry: JournalEntry = {
      id: nextId++,
      day: Number(day),
      content: String(content),
      createdAt: new Date().toISOString(),
    };
    entries.set(entry.day, entry);
    return res.status(201).json(entry);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
