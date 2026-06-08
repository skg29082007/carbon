import { 
  useGetDashboard, 
  useGetBreakdown, 
  useGetTrends, 
  useGetRecommendations 
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatCO2 } from "@/lib/formatters";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Dashboard() {
  const { data: dashboard, isLoading: loadingDash } = useGetDashboard();
  const { data: breakdown, isLoading: loadingBreakdown } = useGetBreakdown({ period: 'month' });
  const { data: trends, isLoading: loadingTrends } = useGetTrends({ weeks: 4 });
  const { data: recommendations, isLoading: loadingRecs } = useGetRecommendations();

  if (loadingDash || loadingBreakdown || loadingTrends || loadingRecs) {
    return <div className="p-8 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Your environmental impact at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCO2(dashboard?.totalCo2ThisMonth ?? 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">% of Global Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard?.percentageVsAverage ?? 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">vs {formatCO2(dashboard?.averagePersonCo2Monthly ?? 333)} avg</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard?.streak ?? 0} days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Actions Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard?.actionsCompleted ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{formatCO2(dashboard?.co2SavedByActions ?? 0)} saved/yr</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>CO2 emissions by category this month</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {breakdown && breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="co2Kg"
                    nameKey="category"
                  >
                    {breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => formatCO2(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4-Week Trend</CardTitle>
            <CardDescription>Your emissions over the last 4 weeks</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             {trends && trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: number) => formatCO2(value)} />
                  <Line type="monotone" dataKey="co2Kg" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
             )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Top ways to reduce your footprint</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations && recommendations.length > 0 ? recommendations.slice(0, 3).map((rec, i) => (
              <div key={i} className="flex items-start justify-between p-4 border rounded-lg bg-card">
                <div>
                  <h3 className="font-semibold">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <div className="font-medium text-primary">-{formatCO2(rec.potentialSavingKg)}</div>
                  <div className="text-xs text-muted-foreground">per year</div>
                </div>
              </div>
            )) : (
              <div className="text-center p-4 text-muted-foreground border rounded-lg">No recommendations available yet. Log more activities!</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
