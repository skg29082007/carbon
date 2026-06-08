import { Router } from "express";
import { db, activitiesTable, actionsTable } from "@workspace/db";
import { sql, gte, and, sum } from "drizzle-orm";
import { GetBreakdownQueryParams, GetTrendsQueryParams } from "@workspace/api-zod";

const router = Router();

const GLOBAL_AVERAGE_MONTHLY_KG = 333;

router.get("/insights/dashboard", async (_req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [monthResult] = await db
    .select({ total: sum(activitiesTable.co2Kg), count: sql<number>`count(*)` })
    .from(activitiesTable)
    .where(gte(activitiesTable.date, startOfMonth));

  const [weekResult] = await db
    .select({ total: sum(activitiesTable.co2Kg) })
    .from(activitiesTable)
    .where(gte(activitiesTable.date, startOfWeek));

  const [allTimeResult] = await db
    .select({ total: sum(activitiesTable.co2Kg) })
    .from(activitiesTable);

  const actions = await db.select().from(actionsTable);
  const completedActions = actions.filter((a) => a.completed);
  const co2SavedByActions = completedActions.reduce((acc, a) => acc + a.co2SavedKgPerYear / 12, 0);

  const totalThisMonth = Number(monthResult?.total ?? 0);
  const percentageVsAverage = GLOBAL_AVERAGE_MONTHLY_KG > 0
    ? Math.round((totalThisMonth / GLOBAL_AVERAGE_MONTHLY_KG) * 100)
    : 0;

  // Streak: count consecutive days with activity up to today
  const recentActivities = await db
    .select({ date: activitiesTable.date })
    .from(activitiesTable)
    .orderBy(sql`${activitiesTable.date} DESC`);

  const uniqueDates = [...new Set(recentActivities.map((a) => a.date))];
  let streak = 0;
  const todayStr = now.toISOString().split("T")[0];
  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    if (uniqueDates[i] === expected || (i === 0 && uniqueDates[0] <= todayStr)) {
      streak++;
    } else {
      break;
    }
  }

  res.json({
    totalCo2ThisMonth: Math.round(totalThisMonth * 10) / 10,
    totalCo2ThisWeek: Math.round(Number(weekResult?.total ?? 0) * 10) / 10,
    totalCo2AllTime: Math.round(Number(allTimeResult?.total ?? 0) * 10) / 10,
    averagePersonCo2Monthly: GLOBAL_AVERAGE_MONTHLY_KG,
    percentageVsAverage,
    activitiesThisMonth: Number(monthResult?.count ?? 0),
    actionsCompleted: completedActions.length,
    co2SavedByActions: Math.round(co2SavedByActions * 10) / 10,
    streak,
  });
});

router.get("/insights/breakdown", async (req, res) => {
  const query = GetBreakdownQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const period = query.data.period ?? "month";

  const now = new Date();
  let startDate: string;
  if (period === "week") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  } else if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  } else {
    startDate = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
  }

  const results = await db
    .select({
      category: activitiesTable.category,
      co2Kg: sum(activitiesTable.co2Kg),
      count: sql<number>`count(*)`,
    })
    .from(activitiesTable)
    .where(gte(activitiesTable.date, startDate))
    .groupBy(activitiesTable.category);

  const totalCo2 = results.reduce((acc, r) => acc + Number(r.co2Kg ?? 0), 0);

  const breakdown = results.map((r) => ({
    category: r.category,
    co2Kg: Math.round(Number(r.co2Kg ?? 0) * 10) / 10,
    percentage: totalCo2 > 0 ? Math.round((Number(r.co2Kg ?? 0) / totalCo2) * 100) : 0,
    count: Number(r.count ?? 0),
  }));

  res.json(breakdown);
});

router.get("/insights/trends", async (req, res) => {
  const query = GetTrendsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const weeks = query.data.weeks ?? 12;

  const trendPoints = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const weekStartStr = weekStart.toISOString().split("T")[0];
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    const [result] = await db
      .select({ total: sum(activitiesTable.co2Kg) })
      .from(activitiesTable)
      .where(
        and(
          gte(activitiesTable.date, weekStartStr),
          sql`${activitiesTable.date} < ${weekEndStr}`
        )
      );

    const month = weekStart.toLocaleString("en-US", { month: "short" });
    const day = weekStart.getDate();
    trendPoints.push({
      week: weekStartStr,
      label: `${month} ${day}`,
      co2Kg: Math.round(Number(result?.total ?? 0) * 10) / 10,
    });
  }

  res.json(trendPoints);
});

router.get("/insights/recommendations", async (_req, res) => {
  const categoryTotals = await db
    .select({
      category: activitiesTable.category,
      total: sum(activitiesTable.co2Kg),
    })
    .from(activitiesTable)
    .groupBy(activitiesTable.category);

  const sorted = [...categoryTotals].sort((a, b) => Number(b.total ?? 0) - Number(a.total ?? 0));

  const recommendationMap: Record<string, { title: string; description: string; potentialSavingKg: number }[]> = {
    transport: [
      { title: "Switch to public transit", description: "Using buses or trains instead of driving can save up to 2.4 tonnes of CO2 annually.", potentialSavingKg: 2400 },
      { title: "Carpool to work", description: "Sharing rides with colleagues cuts your transport emissions in half.", potentialSavingKg: 1200 },
      { title: "Try cycling for short trips", description: "Replacing car trips under 5km with cycling eliminates those transport emissions entirely.", potentialSavingKg: 600 },
    ],
    energy: [
      { title: "Switch to LED lighting", description: "LED bulbs use 75% less energy than incandescent lights and last longer too.", potentialSavingKg: 150 },
      { title: "Lower your thermostat by 2°C", description: "Reducing heating by just 2 degrees can cut heating emissions by around 10%.", potentialSavingKg: 300 },
      { title: "Enable green energy tariff", description: "Switch to a renewable energy supplier to dramatically reduce your electricity footprint.", potentialSavingKg: 840 },
    ],
    food: [
      { title: "Reduce beef consumption", description: "Swapping one beef meal per week for plant-based saves over 300 kg CO2 annually.", potentialSavingKg: 320 },
      { title: "Eat seasonally and locally", description: "Local, in-season produce has far lower transport and storage emissions.", potentialSavingKg: 200 },
      { title: "Cut food waste by half", description: "About 8% of global emissions come from food waste — plan meals to reduce waste.", potentialSavingKg: 180 },
    ],
    shopping: [
      { title: "Buy second-hand clothing", description: "Choosing pre-owned clothing eliminates manufacturing emissions entirely.", potentialSavingKg: 400 },
      { title: "Repair before replacing", description: "Repairing electronics and appliances avoids the high emissions of new manufacturing.", potentialSavingKg: 300 },
      { title: "Buy less, choose well", description: "Reducing overall consumption by 20% across categories significantly lowers your footprint.", potentialSavingKg: 250 },
    ],
  };

  const defaultRecs = [
    { category: "lifestyle", title: "Track your footprint daily", description: "Awareness is the first step. Consistent tracking helps you spot patterns and opportunities to reduce.", potentialSavingKg: 500 },
    { category: "food", title: "Try one plant-based day per week", description: "A weekly plant-based day reduces food emissions by up to 15%.", potentialSavingKg: 220 },
    { category: "energy", title: "Unplug devices on standby", description: "Standby power accounts for roughly 10% of household electricity use.", potentialSavingKg: 100 },
  ];

  const recommendations = [];

  for (let i = 0; i < Math.min(3, sorted.length); i++) {
    const category = sorted[i].category;
    const recs = recommendationMap[category] ?? [];
    if (recs.length > 0) {
      recommendations.push({
        category,
        ...recs[0],
        priority: i + 1,
      });
    }
  }

  while (recommendations.length < 3 && defaultRecs.length > 0) {
    const rec = defaultRecs.shift()!;
    recommendations.push({ ...rec, priority: recommendations.length + 1 });
  }

  res.json(recommendations.slice(0, 3));
});

export default router;
