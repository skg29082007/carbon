import { pgTable, serial, text, real, date, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoryEnum = pgEnum("category", ["transport", "energy", "food", "shopping"]);

export const activitiesTable = pgTable("activities", {
  id: serial("id").primaryKey(),
  category: categoryEnum("category").notNull(),
  activityType: text("activity_type").notNull(),
  amount: real("amount").notNull(),
  unit: text("unit").notNull(),
  co2Kg: real("co2_kg").notNull(),
  notes: text("notes"),
  date: date("date", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivitySchema = createInsertSchema(activitiesTable).omit({ id: true, createdAt: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activitiesTable.$inferSelect;
