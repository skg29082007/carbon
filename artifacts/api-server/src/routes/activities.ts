import { Router } from "express";
import { db, activitiesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import {
  CreateActivityBody,
  UpdateActivityBody,
  ListActivitiesQueryParams,
  GetActivityParams,
  UpdateActivityParams,
  DeleteActivityParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/activities", async (req, res) => {
  const query = ListActivitiesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { category, limit = 50 } = query.data;

  const conditions = [];
  if (category) {
    conditions.push(eq(activitiesTable.category, category as "transport" | "energy" | "food" | "shopping"));
  }

  const activities = await db
    .select()
    .from(activitiesTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(activitiesTable.date), desc(activitiesTable.createdAt))
    .limit(limit);

  res.json(activities.map(formatActivity));
});

router.post("/activities", async (req, res) => {
  const body = CreateActivityBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid input", details: body.error.issues });
    return;
  }
  const { category, activityType, amount, unit, co2Kg, notes } = body.data;
  const dateStr = body.data.date instanceof Date
    ? body.data.date.toISOString().split("T")[0]
    : String(body.data.date);
  const [activity] = await db
    .insert(activitiesTable)
    .values({ category: category as "transport" | "energy" | "food" | "shopping", activityType, amount, unit, co2Kg, notes, date: dateStr })
    .returning();
  res.status(201).json(formatActivity(activity));
});

router.get("/activities/:id", async (req, res) => {
  const params = GetActivityParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [activity] = await db
    .select()
    .from(activitiesTable)
    .where(eq(activitiesTable.id, params.data.id));
  if (!activity) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  res.json(formatActivity(activity));
});

router.patch("/activities/:id", async (req, res) => {
  const params = UpdateActivityParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateActivityBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (body.data.amount !== undefined) updates.amount = body.data.amount;
  if (body.data.co2Kg !== undefined) updates.co2Kg = body.data.co2Kg;
  if (body.data.notes !== undefined) updates.notes = body.data.notes;
  if (body.data.date !== undefined) {
    updates.date = body.data.date instanceof Date
      ? body.data.date.toISOString().split("T")[0]
      : String(body.data.date);
  }

  const [updated] = await db
    .update(activitiesTable)
    .set(updates)
    .where(eq(activitiesTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  res.json(formatActivity(updated));
});

router.delete("/activities/:id", async (req, res) => {
  const params = DeleteActivityParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [deleted] = await db
    .delete(activitiesTable)
    .where(eq(activitiesTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  res.status(204).send();
});

function formatActivity(a: typeof activitiesTable.$inferSelect) {
  return {
    id: a.id,
    category: a.category,
    activityType: a.activityType,
    amount: a.amount,
    unit: a.unit,
    co2Kg: a.co2Kg,
    notes: a.notes ?? null,
    date: a.date,
    createdAt: a.createdAt.toISOString(),
  };
}

export default router;
