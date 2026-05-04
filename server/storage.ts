import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import type { InsertJournalEntry, JournalEntry } from "@shared/schema";

const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

export interface IStorage {
  getJournalEntries(): JournalEntry[];
  getJournalEntryByDay(day: number): JournalEntry | undefined;
  createJournalEntry(entry: InsertJournalEntry): JournalEntry;
  updateJournalEntry(id: number, content: string): JournalEntry | undefined;
}

export class Storage implements IStorage {
  getJournalEntries(): JournalEntry[] {
    return db.select().from(schema.journalEntries).all();
  }

  getJournalEntryByDay(day: number): JournalEntry | undefined {
    return db.select().from(schema.journalEntries)
      .where(eq(schema.journalEntries.day, day)).get();
  }

  createJournalEntry(entry: InsertJournalEntry): JournalEntry {
    return db.insert(schema.journalEntries).values(entry).returning().get();
  }

  updateJournalEntry(id: number, content: string): JournalEntry | undefined {
    return db.update(schema.journalEntries)
      .set({ content })
      .where(eq(schema.journalEntries.id, id))
      .returning().get();
  }
}

export const storage = new Storage();
