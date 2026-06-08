import { Router } from "express";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateProfileBody } from "@workspace/api-zod";

const router = Router();

const DEFAULT_PROFILE_ID = 1;

async function ensureProfile() {
  const [existing] = await db.select().from(profilesTable).where(eq(profilesTable.id, DEFAULT_PROFILE_ID));
  if (existing) return existing;
  const [created] = await db.insert(profilesTable).values({
    name: "EcoUser",
    monthlyGoalKg: 250,
    onboardingCompleted: false,
  }).returning();
  return created;
}

router.get("/profile", async (_req, res) => {
  const profile = await ensureProfile();
  res.json(formatProfile(profile));
});

router.patch("/profile", async (req, res) => {
  const body = UpdateProfileBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid input", details: body.error.issues });
    return;
  }

  await ensureProfile();

  const updates: Record<string, unknown> = {};
  if (body.data.name !== undefined) updates.name = body.data.name;
  if (body.data.location !== undefined) updates.location = body.data.location;
  if (body.data.monthlyGoalKg !== undefined) updates.monthlyGoalKg = body.data.monthlyGoalKg;
  if (body.data.onboardingCompleted !== undefined) updates.onboardingCompleted = body.data.onboardingCompleted;

  const [updated] = await db
    .update(profilesTable)
    .set(updates)
    .where(eq(profilesTable.id, DEFAULT_PROFILE_ID))
    .returning();

  res.json(formatProfile(updated));
});

function formatProfile(p: typeof profilesTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    location: p.location ?? null,
    monthlyGoalKg: p.monthlyGoalKg,
    onboardingCompleted: p.onboardingCompleted,
    createdAt: p.createdAt.toISOString(),
  };
}

export default router;
