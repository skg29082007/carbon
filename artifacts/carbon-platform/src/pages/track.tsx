import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useCreateActivity, useListActivities, useDeleteActivity, getListActivitiesQueryKey, getGetDashboardQueryKey, getGetBreakdownQueryKey } from "@workspace/api-client-react";
import { activitySchema, calculateCO2, emissionFactors } from "@/lib/carbonCalculations";
import { formatCO2, formatDate } from "@/lib/formatters";
import { useQueryClient } from "@tanstack/react-query";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

export default function Track() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      category: "transport" as "transport" | "energy" | "food" | "shopping",
      activityType: "car_gasoline",
      amount: 0,
      unit: "km",
      date: format(new Date(), "yyyy-MM-dd"),
      notes: "",
    },
  });

  const category = form.watch("category");
  const activityType = form.watch("activityType");
  const amount = form.watch("amount");

  const calculatedCO2 = calculateCO2(category, activityType, amount);

  const createMutation = useCreateActivity();
  const deleteMutation = useDeleteActivity();
  const { data: recentLogs, isLoading } = useListActivities({ limit: 5 });

  const onSubmit = (data: any) => {
    createMutation.mutate(
      { data: { ...data, co2Kg: calculatedCO2 } },
      {
        onSuccess: () => {
          toast({ title: "Activity logged successfully" });
          form.reset();
          queryClient.invalidateQueries({ queryKey: getListActivitiesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetBreakdownQueryKey() });
        },
        onError: () => {
          toast({ title: "Failed to log activity", variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Activity deleted" });
          queryClient.invalidateQueries({ queryKey: getListActivitiesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetBreakdownQueryKey() });
        },
      }
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Track Activity</h1>
        <p className="text-muted-foreground mt-2">Log your daily activities to calculate emissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>New Entry</CardTitle>
            <CardDescription>Enter details to calculate CO2 impact</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={(val) => {
                        field.onChange(val);
                        // Reset activity type when category changes
                        const firstType = Object.keys(emissionFactors[val as keyof typeof emissionFactors])[0];
                        form.setValue("activityType", firstType);
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="transport">Transport</SelectItem>
                          <SelectItem value="energy">Energy</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="shopping">Shopping</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(emissionFactors[category as keyof typeof emissionFactors] || {}).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                  <span className="font-medium">Estimated Impact:</span>
                  <span className="text-xl font-bold text-primary">{formatCO2(calculatedCO2)}</span>
                </div>

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Logging..." : "Log Activity"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Logs</h2>
          {isLoading ? (
            <div className="flex justify-center p-4"><div className="w-6 h-6 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>
          ) : recentLogs && recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold capitalize">{log.activityType.replace('_', ' ')}</div>
                    <div className="text-sm text-muted-foreground">{formatDate(log.date)} • {log.amount} {log.unit}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-primary">{formatCO2(log.co2Kg)}</div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(log.id)} disabled={deleteMutation.isPending}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No recent activities.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
