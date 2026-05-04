import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertJournalEntrySchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<void> {
  // Get all journal entries
  app.get("/api/journal", (_req, res) => {
    const entries = storage.getJournalEntries();
    res.json(entries);
  });

  // Get journal entry for a specific day
  app.get("/api/journal/:day", (req, res) => {
    const day = parseInt(req.params.day);
    const entry = storage.getJournalEntryByDay(day);
    res.json(entry || null);
  });

  // Create or update journal entry for a day
  app.post("/api/journal", (req, res) => {
    const parsed = insertJournalEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error }) as any;
    }
    const existing = storage.getJournalEntryByDay(parsed.data.day);
    if (existing) {
      const updated = storage.updateJournalEntry(existing.id, parsed.data.content);
      return res.json(updated) as any;
    }
    const entry = storage.createJournalEntry(parsed.data);
    res.status(201).json(entry);
  });
}
