import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().optional(),
  monthlyGoalKg: z.number().min(1, "Goal must be greater than 0"),
  onboardingCompleted: z.boolean(),
});

export default function Settings() {
  const { data: profile, isLoading } = useGetProfile();
  const updateMutation = useUpdateProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      location: "",
      monthlyGoalKg: 300,
      onboardingCompleted: true,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        location: profile.location || "",
        monthlyGoalKg: profile.monthlyGoalKg,
        onboardingCompleted: profile.onboardingCompleted,
      });
    }
  }, [profile, form]);

  const onSubmit = (data: any) => {
    updateMutation.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: "Profile updated successfully" });
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        },
        onError: () => {
          toast({ title: "Failed to update profile", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-2xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and goals.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your personal information and carbon goals.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="City, Country" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthlyGoalKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Carbon Goal (kg CO2)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormDescription>Global average is around 333kg/month.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="onboardingCompleted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Onboarding Completed</FormLabel>
                      <FormDescription>
                        Toggle to reset the onboarding flow next time you log in.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
