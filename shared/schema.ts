import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for transaction categories and sources
export const categoryEnum = pgEnum("category", ["session", "session-coaching", "monthly-subscription", "weekly-subscription"]);
export const sourceEnum = pgEnum("source", ["wave", "orange-money", "manual"]);
export const statusEnum = pgEnum("status", ["completed", "pending", "failed"]);

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: categoryEnum("category").notNull(),
  source: sourceEnum("source").notNull(),
  status: statusEnum("status").notNull().default("completed"),
  date: timestamp("date").notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.coerce.date().optional(), // Allow string dates that can be coerced to Date
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
