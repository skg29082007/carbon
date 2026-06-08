import { useState } from "react";
import { useListActivities, getListActivitiesQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCO2, formatDate } from "@/lib/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function History() {
  const [category, setCategory] = useState<string>("all");
  
  // Need to cast to any to pass dynamic params that might not match exact type, but valid for our usage
  const params = category !== "all" ? { category: category as any } : {};
  const { data: activities, isLoading } = useListActivities(params);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground mt-2">Review all your logged activities.</p>
        </div>
        <div className="w-full md:w-64">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="energy">Energy</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">CO2 Impact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32">
                  <div className="flex justify-center"><div className="w-6 h-6 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
                </TableCell>
              </TableRow>
            ) : activities && activities.length > 0 ? (
              activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="whitespace-nowrap">{formatDate(activity.date)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">{activity.category}</Badge>
                  </TableCell>
                  <TableCell className="capitalize">{activity.activityType.replace('_', ' ')}</TableCell>
                  <TableCell>{activity.amount} {activity.unit}</TableCell>
                  <TableCell className="text-right font-medium text-primary">
                    {formatCO2(activity.co2Kg)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                  No activities found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
