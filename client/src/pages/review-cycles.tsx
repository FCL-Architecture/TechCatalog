import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutShell } from "@/components/layout-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Send, CheckCircle, Calendar, Users, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ReviewCycle, CategoryReviewProgress, Category, User } from "@shared/schema";

type CycleWithProgress = ReviewCycle & { 
  progress: (CategoryReviewProgress & { category: Category | null; teamLeader: User | null })[];
};

export default function ReviewCycles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);

  const currentYear = new Date().getFullYear();
  const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;

  const [formData, setFormData] = useState({
    name: `${currentQuarter} ${currentYear} Review`,
    quarter: currentQuarter,
    year: currentYear,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const { data: cycles, isLoading } = useQuery<ReviewCycle[]>({
    queryKey: ['/api/review-cycles'],
  });

  const { data: selectedCycle } = useQuery<CycleWithProgress>({
    queryKey: ['/api/review-cycles', selectedCycleId],
    queryFn: async () => {
      const res = await fetch(`/api/review-cycles/${selectedCycleId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch cycle');
      return res.json();
    },
    enabled: !!selectedCycleId,
  });

  const createCycleMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/review-cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create cycle');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/review-cycles'] });
      setIsCreateOpen(false);
      toast({ title: "Review cycle created", description: "All catalog items set to pending review." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const sendRemindersMutation = useMutation({
    mutationFn: async (cycleId: number) => {
      const res = await fetch(`/api/review-cycles/${cycleId}/send-reminders`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to send reminders');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/review-cycles'] });
      toast({ 
        title: "Reminders sent", 
        description: `${data.sent} email(s) sent to team leaders.` 
      });
    },
  });

  const completeCycleMutation = useMutation({
    mutationFn: async (cycleId: number) => {
      const res = await fetch(`/api/review-cycles/${cycleId}/complete`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to complete cycle');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/review-cycles'] });
      toast({ title: "Review cycle completed" });
    },
  });

  if (isLoading) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </LayoutShell>
    );
  }

  const activeCycle = cycles?.find(c => c.status === 'active');
  const completedCycles = cycles?.filter(c => c.status === 'completed') || [];

  const getProgressStats = (progress: CycleWithProgress['progress']) => {
    const total = progress.length;
    const completed = progress.filter(p => p.status === 'completed').length;
    const inProgress = progress.filter(p => p.status === 'in_progress').length;
    return { total, completed, inProgress, notStarted: total - completed - inProgress };
  };

  return (
    <LayoutShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Review Cycles</h1>
          <p className="text-slate-500 mt-1">
            Manage quarterly review cycles and track team progress.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button disabled={!!activeCycle} data-testid="button-create-cycle">
              <Plus className="w-4 h-4 mr-2" />
              Start New Cycle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Review Cycle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Cycle Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-cycle-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quarter</Label>
                  <Select value={formData.quarter} onValueChange={(v) => setFormData({ ...formData, quarter: v })}>
                    <SelectTrigger data-testid="select-quarter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1</SelectItem>
                      <SelectItem value="Q2">Q2</SelectItem>
                      <SelectItem value="Q3">Q3</SelectItem>
                      <SelectItem value="Q4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={String(formData.year)} onValueChange={(v) => setFormData({ ...formData, year: Number(v) })}>
                    <SelectTrigger data-testid="select-year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={String(currentYear - 1)}>{currentYear - 1}</SelectItem>
                      <SelectItem value={String(currentYear)}>{currentYear}</SelectItem>
                      <SelectItem value={String(currentYear + 1)}>{currentYear + 1}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    data-testid="input-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    data-testid="input-end-date"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => createCycleMutation.mutate(formData)}
                disabled={createCycleMutation.isPending}
                data-testid="button-submit-create-cycle"
              >
                {createCycleMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Cycle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {activeCycle ? (
        <Card className="mb-8 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{activeCycle.name}</CardTitle>
                <CardDescription>
                  {new Date(activeCycle.startDate).toLocaleDateString()} - {new Date(activeCycle.endDate).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge className="bg-blue-600 text-white">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => sendRemindersMutation.mutate(activeCycle.id)}
                disabled={sendRemindersMutation.isPending}
                data-testid="button-send-reminders"
              >
                {sendRemindersMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Reminders
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedCycleId(activeCycle.id)}
                data-testid="button-view-progress"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Progress
              </Button>
              <Button
                variant="default"
                onClick={() => completeCycleMutation.mutate(activeCycle.id)}
                disabled={completeCycleMutation.isPending}
                data-testid="button-complete-cycle"
              >
                {completeCycleMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Complete Cycle
              </Button>
            </div>

            {activeCycle.remindersSent && (
              <div className="flex items-center text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 mr-2" />
                Reminders have been sent to team leaders
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 border-dashed border-2 border-slate-200 bg-slate-50">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-600">No Active Review Cycle</h3>
            <p className="text-slate-400 mt-2 mb-4">
              Start a new quarterly review cycle to begin the review process.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-start-cycle-empty">
              <Plus className="w-4 h-4 mr-2" />
              Start New Cycle
            </Button>
          </CardContent>
        </Card>
      )}

      {selectedCycle && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Progress Details: {selectedCycle.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {(() => {
                const stats = getProgressStats(selectedCycle.progress);
                return (
                  <>
                    <div className="bg-slate-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                      <div className="text-sm text-slate-500">Total Categories</div>
                    </div>
                    <div className="bg-emerald-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-emerald-700">{stats.completed}</div>
                      <div className="text-sm text-emerald-600">Completed</div>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-700">{stats.inProgress}</div>
                      <div className="text-sm text-blue-600">In Progress</div>
                    </div>
                    <div className="bg-slate-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-slate-700">{stats.notStarted}</div>
                      <div className="text-sm text-slate-500">Not Started</div>
                    </div>
                  </>
                );
              })()}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Team Leader</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedCycle.progress.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.category?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      {p.teamLeader ? (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          {p.teamLeader.firstName || p.teamLeader.email}
                        </div>
                      ) : (
                        <span className="text-slate-400">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>{p.totalItems || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={p.totalItems ? ((p.reviewedItems || 0) / p.totalItems) * 100 : 0} 
                          className="w-24 h-2"
                        />
                        <span className="text-sm text-slate-500">
                          {p.reviewedItems || 0}/{p.totalItems || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        p.status === 'completed' ? 'default' : 
                        p.status === 'in_progress' ? 'secondary' : 
                        'outline'
                      }>
                        {p.status === 'completed' ? 'Completed' : 
                         p.status === 'in_progress' ? 'In Progress' : 
                         'Not Started'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {completedCycles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">Past Cycles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {completedCycles.map((cycle) => (
              <Card key={cycle.id} className="border-slate-200 bg-slate-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">{cycle.name}</span>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setSelectedCycleId(cycle.id)}
                    data-testid={`button-view-cycle-${cycle.id}`}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </LayoutShell>
  );
}
