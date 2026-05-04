import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const journalEntries = sqliteTable("journal_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  day: integer("day").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({ id: true });
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
