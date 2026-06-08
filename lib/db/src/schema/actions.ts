import { pgTable, serial, text, real, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const actionCategoryEnum = pgEnum("action_category", ["transport", "energy", "food", "shopping", "lifestyle"]);
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

export const actionsTable = pgTable("actions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: actionCategoryEnum("category").notNull(),
  co2SavedKgPerYear: real("co2_saved_kg_per_year").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertActionSchema = createInsertSchema(actionsTable).omit({ id: true });
export type InsertAction = z.infer<typeof insertActionSchema>;
export type Action = typeof actionsTable.$inferSelect;
