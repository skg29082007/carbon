import { useListActions, useCompleteAction, getListActionsQueryKey, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCO2 } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle } from "lucide-react";

export default function Actions() {
  const { data: actions, isLoading } = useListActions();
  const toggleMutation = useCompleteAction();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleToggle = (id: number, currentStatus: boolean) => {
    toggleMutation.mutate(
      { id, data: { completed: !currentStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListActionsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        },
        onError: () => {
          toast({ title: "Failed to update action", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  }

  const pendingActions = actions?.filter(a => !a.completed) || [];
  const completedActions = actions?.filter(a => a.completed) || [];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reduction Actions</h1>
        <p className="text-muted-foreground mt-2">Commit to lifestyle changes to reduce your footprint.</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Available Actions</h2>
        {pendingActions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingActions.map(action => (
              <Card key={action.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="capitalize">{action.category}</Badge>
                    <Badge variant={action.difficulty === 'hard' ? 'destructive' : action.difficulty === 'medium' ? 'default' : 'secondary'} className="capitalize">
                      {action.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{action.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="text-2xl font-bold text-primary">-{formatCO2(action.co2SavedKgPerYear)}</div>
                  <div className="text-xs text-muted-foreground">potential saving per year</div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => handleToggle(action.id, action.completed)}
                    disabled={toggleMutation.isPending}
                  >
                    <Circle className="w-4 h-4" /> Commit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
           <p className="text-muted-foreground border p-8 rounded-lg text-center bg-card">You've committed to all available actions!</p>
        )}
      </div>

      {completedActions.length > 0 && (
        <div className="space-y-6 pt-8 border-t">
          <h2 className="text-2xl font-semibold">Your Commitments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedActions.map(action => (
              <Card key={action.id} className="flex flex-col bg-muted/50 border-muted">
                <CardHeader>
                  <CardTitle className="text-lg text-muted-foreground line-through">{action.title}</CardTitle>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="text-xl font-bold text-muted-foreground">-{formatCO2(action.co2SavedKgPerYear)}/yr</div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline"
                    className="w-full gap-2 text-muted-foreground" 
                    onClick={() => handleToggle(action.id, action.completed)}
                    disabled={toggleMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Uncommit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
