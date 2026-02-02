import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle, Clock, PlayCircle, FolderOpen, ThumbsUp } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { CategoryReviewProgress, Category, ReviewCycle, CatalogItem } from "@shared/schema";

type ProgressWithDetails = CategoryReviewProgress & { 
  category: Category | null; 
  cycle: ReviewCycle | null;
};

export default function MyReviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmApproveId, setConfirmApproveId] = useState<number | null>(null);

  const { data: myProgress, isLoading } = useQuery<ProgressWithDetails[]>({
    queryKey: ['/api/my-reviews'],
  });

  const { data: activeCycle } = useQuery<ReviewCycle | null>({
    queryKey: ['/api/review-cycles/active'],
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/category-progress/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update progress');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/catalog'] });
      toast({ title: "Progress updated" });
    },
  });

  const approveAllMutation = useMutation({
    mutationFn: async (progressId: number) => {
      const res = await fetch(`/api/category-progress/${progressId}/approve-all`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to approve items');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/catalog'] });
      toast({ title: "All items approved", description: "All items in this category have been approved." });
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

  const activeProgress = myProgress?.filter(p => p.cycle?.status === 'active') || [];
  const completedProgress = myProgress?.filter(p => p.cycle?.status === 'completed') || [];

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'not_started': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getProgressPercent = (reviewed: number | null, total: number | null) => {
    if (!total || total === 0) return 0;
    return Math.round(((reviewed || 0) / total) * 100);
  };

  return (
    <LayoutShell>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900">My Reviews</h1>
        <p className="text-slate-500 mt-1">
          Track your quarterly review progress for assigned categories.
        </p>
      </div>

      {activeCycle && (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">{activeCycle.name}</h3>
                <p className="text-blue-700 text-sm">
                  {activeCycle.quarter} {activeCycle.year} - Due: {new Date(activeCycle.endDate).toLocaleDateString()}
                </p>
              </div>
              <Badge className="bg-blue-600 text-white">Active Cycle</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {activeProgress.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center">
            <FolderOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-600">No Active Reviews</h3>
            <p className="text-slate-400 mt-2">
              You don't have any categories assigned for review, or there's no active review cycle.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-800">Current Cycle Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeProgress.map((progress) => (
              <Card key={progress.id} className="border-slate-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{progress.category?.name || 'Unknown Category'}</CardTitle>
                    <Badge className={getStatusColor(progress.status)}>
                      {progress.status === 'completed' ? 'Completed' : 
                       progress.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {progress.totalItems || 0} items to review
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-medium">
                        {progress.reviewedItems || 0} / {progress.totalItems || 0}
                      </span>
                    </div>
                    <Progress 
                      value={getProgressPercent(progress.reviewedItems, progress.totalItems)} 
                      className="h-2"
                    />
                  </div>

                  <div className="flex gap-2">
                    {progress.status === 'not_started' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateProgressMutation.mutate({ id: progress.id, status: 'in_progress' })}
                        disabled={updateProgressMutation.isPending}
                        data-testid={`button-start-review-${progress.id}`}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Start Review
                      </Button>
                    )}
                    
                    {progress.status === 'in_progress' && (
                      <>
                        <Link href={`/catalog?categoryId=${progress.categoryId}`}>
                          <Button size="sm" variant="outline" data-testid={`button-view-items-${progress.id}`}>
                            <FolderOpen className="w-4 h-4 mr-2" />
                            View Items
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => setConfirmApproveId(progress.id)}
                          disabled={approveAllMutation.isPending}
                          data-testid={`button-approve-all-${progress.id}`}
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Approve All
                        </Button>
                      </>
                    )}

                    {progress.status === 'completed' && (
                      <div className="flex items-center text-emerald-600 text-sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed on {progress.completedAt ? new Date(progress.completedAt).toLocaleDateString() : 'N/A'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completedProgress.length > 0 && (
        <div className="mt-12 space-y-6">
          <h2 className="text-xl font-semibold text-slate-800">Past Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {completedProgress.map((progress) => (
              <Card key={progress.id} className="border-slate-200 bg-slate-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-700">{progress.category?.name}</span>
                    <Badge variant="outline">{progress.cycle?.quarter} {progress.cycle?.year}</Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    Reviewed {progress.reviewedItems || 0} of {progress.totalItems || 0} items
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={confirmApproveId !== null} onOpenChange={(open) => !open && setConfirmApproveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Approval</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you have finished reviewing all items in this category? 
              This will mark all items as approved and complete your review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-approve">Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-approve"
              onClick={() => {
                if (confirmApproveId) {
                  approveAllMutation.mutate(confirmApproveId);
                  setConfirmApproveId(null);
                }
              }}
            >
              Yes, Approve All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LayoutShell>
  );
}
