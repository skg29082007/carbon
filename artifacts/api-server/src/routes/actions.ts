import { Router } from "express";
import { db, actionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListActionsQueryParams,
  CompleteActionParams,
  CompleteActionBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/actions", async (req, res) => {
  const query = ListActionsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { category, completed } = query.data;

  const conditions = [];
  if (category) {
    conditions.push(eq(actionsTable.category, category as "transport" | "energy" | "food" | "shopping" | "lifestyle"));
  }
  if (completed !== undefined) {
    conditions.push(eq(actionsTable.completed, completed));
  }

  const actions = await db
    .select()
    .from(actionsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(actionsTable.id);

  res.json(actions.map(formatAction));
});

router.post("/actions/:id/complete", async (req, res) => {
  const params = CompleteActionParams.safeParse({ id: Number(req.params.id) });
  const body = CompleteActionBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const [updated] = await db
    .update(actionsTable)
    .set({
      completed: body.data.completed,
      completedAt: body.data.completed ? new Date() : null,
    })
    .where(eq(actionsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Action not found" });
    return;
  }
  res.json(formatAction(updated));
});

function formatAction(a: typeof actionsTable.$inferSelect) {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    category: a.category,
    co2SavedKgPerYear: a.co2SavedKgPerYear,
    difficulty: a.difficulty,
    completed: a.completed,
    completedAt: a.completedAt ? a.completedAt.toISOString() : null,
  };
}

export default router;
