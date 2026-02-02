import { useRoute } from "wouter";
import { useCatalogItem, useUpdateCatalogItem } from "@/hooks/use-catalog";
import { useCategories } from "@/hooks/use-categories";
import { Input } from "@/components/ui/input";
import { CatalogItem } from "@shared/schema";
import { useCreateReview } from "@/hooks/use-reviews";
import { LayoutShell } from "@/components/layout-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Loader2, ArrowLeft, Send, Check, X, History, Pencil } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReviewSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

export default function ItemDetail() {
  const [, params] = useRoute("/catalog/:id");
  const id = parseInt(params?.id || "0");
  const { data: item, isLoading } = useCatalogItem(id);
  const updateMutation = useUpdateCatalogItem();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <LayoutShell>
        <div className="flex justify-center pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </LayoutShell>
    );
  }

  if (!item) {
    return (
      <LayoutShell>
        <div className="text-center pt-20">
          <h2 className="text-xl font-bold text-slate-900">Item Not Found</h2>
          <Button variant="link" asChild className="mt-4">
            <Link href="/catalog">Back to Catalog</Link>
          </Button>
        </div>
      </LayoutShell>
    );
  }

  // Check if user is team leader for this category and item is in review
  const isTeamLeader = user && item.category?.teamLeaderId === user.id;
  const canReview = isTeamLeader && item.status === "in_review";

  const handleStatusChange = (status: "draft" | "approved" | "archived") => {
    updateMutation.mutate({ id: item.id, status });
  };

  return (
    <LayoutShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600">
            <Link href="/catalog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Catalog
            </Link>
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900">{item.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <StatusBadge status={item.status as any} />
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">{item.category?.name || "Uncategorized"}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <EditItemDialog item={item} />
              {item.status === 'draft' && (
                <Button onClick={() => handleStatusChange("approved")}>
                  Submit
                </Button>
              )}
              {canReview && (
                <ReviewDialog itemId={item.id} />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {item.description || "No description provided."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-400" />
                  Review History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {item.reviews?.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No reviews yet.</p>
                ) : (
                  item.reviews?.map((review) => (
                    <div key={review.id} className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={review.verdict === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}>
                            {review.verdict === 'approved' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900">
                            {review.reviewer?.firstName} {review.reviewer?.lastName}
                          </p>
                          <span className="text-xs text-slate-400">
                            {review.createdAt ? format(new Date(review.createdAt), 'MMM d, yyyy') : ''}
                          </span>
                        </div>
                        <div className={`text-xs font-semibold uppercase tracking-wider ${
                          review.verdict === 'approved' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {review.verdict}
                        </div>
                        <p className="text-sm text-slate-600">{review.comments}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Technology Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Vendor</Label>
                  <p className="text-slate-900 font-medium">{item.vendorName || "—"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Version / Model</Label>
                  <p className="text-slate-900">{item.versionModel || "—"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Deployment Model</Label>
                  <p className="text-slate-900">{item.deploymentModel || "—"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Operational Lifecycle</Label>
                  <p className="text-slate-900">{item.operationalLifecycle || "—"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Strategic Direction</Label>
                  <p className="text-slate-900">{item.strategicDirection || "—"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Technology Domain</Label>
                  <p className="text-slate-900">{item.technologyDomain || "—"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Subcategories</Label>
                  <p className="text-slate-900">{item.technologySubcategories || "—"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Service Category</Label>
                  <p className="text-slate-900">{item.serviceCategory || "—"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Service Component</Label>
                  <p className="text-slate-900">{item.serviceComponent || "—"}</p>
                </div>
              </CardContent>
            </Card>

            {(item.aiCapabilityType || item.aiProviders) && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Capabilities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-slate-400 uppercase tracking-wider">AI Capability Type</Label>
                    <p className="text-slate-900">{item.aiCapabilityType || "—"}</p>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-xs text-slate-400 uppercase tracking-wider">AI Providers</Label>
                    <p className="text-slate-900">{item.aiProviders || "—"}</p>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-xs text-slate-400 uppercase tracking-wider">Can Switch AI Provider</Label>
                    <p className="text-slate-900">{item.canAiProviderBeSwitched || "—"}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Governance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Governance Group</Label>
                  <p className="text-slate-900 font-medium">{item.governanceGroup || "—"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Standards Reviewer</Label>
                  <p className="text-slate-900">{item.standardsReviewer || "—"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Standard Approver</Label>
                  <p className="text-slate-900">{item.standardApprover || "—"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Business Reviewer</Label>
                  <p className="text-slate-900">{item.businessReviewer || "—"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Compliance Asset ID</Label>
                  <p className="text-slate-900">{item.complianceAssetId || "—"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Owner</Label>
                  <p className="text-slate-900 font-medium">{item.owner || "Unassigned"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Source</Label>
                  <p className="text-slate-900">{item.source || "—"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Last Catalog Update</Label>
                  <p className="text-slate-900">{item.lastCatalogUpdate ? format(new Date(item.lastCatalogUpdate), 'MMM d, yyyy') : '-'}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Created</Label>
                  <p className="text-slate-900">{item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : '-'}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-slate-400 uppercase tracking-wider">Last Updated</Label>
                  <p className="text-slate-900">{item.updatedAt ? format(new Date(item.updatedAt), 'MMM d, yyyy') : '-'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

function ReviewDialog({ itemId }: { itemId: number }) {
  const [open, setOpen] = useState(false);
  const createReview = useCreateReview();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof insertReviewSchema>>({
    resolver: zodResolver(insertReviewSchema),
    defaultValues: {
      catalogItemId: itemId,
      reviewerId: user?.id, // This might be null initially, handled by ensuring user is logged in
      verdict: "approved",
      comments: "",
    },
  });

  // Ensure reviewerId is set when dialog opens or user loads
  if (user && !form.getValues().reviewerId) {
    form.setValue("reviewerId", user.id);
  }

  const onSubmit = (data: z.infer<typeof insertReviewSchema>) => {
    createReview.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Send className="w-4 h-4 mr-2" />
          Review Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review Decision</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="verdict"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verdict</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select verdict" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="approved">Approve</SelectItem>
                      <SelectItem value="rejected">Reject</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Reason for your decision..." 
                      className="min-h-[100px]"
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={createReview.isPending}>
                {createReview.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Review
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function EditItemDialog({ item }: { item: CatalogItem }) {
  const [open, setOpen] = useState(false);
  const updateMutation = useUpdateCatalogItem();
  const { data: categories } = useCategories();

  const form = useForm({
    defaultValues: {
      name: item.name || "",
      description: item.description || "",
      categoryId: item.categoryId?.toString() || "",
      vendorName: item.vendorName || "",
      versionModel: item.versionModel || "",
      deploymentModel: item.deploymentModel || "",
      operationalLifecycle: item.operationalLifecycle || "",
      strategicDirection: item.strategicDirection || "",
      technologyDomain: item.technologyDomain || "",
      technologySubcategories: item.technologySubcategories || "",
      serviceCategory: item.serviceCategory || "",
      serviceComponent: item.serviceComponent || "",
      owner: item.owner || "",
      comments: item.comments || "",
    },
  });

  const onSubmit = (data: any) => {
    updateMutation.mutate({
      id: item.id,
      ...data,
      categoryId: data.categoryId ? parseInt(data.categoryId) : null,
    }, {
      onSuccess: () => {
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-edit-item">
          <Pencil className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...form.register("name")} data-testid="input-name" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={form.watch("categoryId")} 
                onValueChange={(v) => form.setValue("categoryId", v)}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...form.register("description")} className="min-h-[80px]" data-testid="input-description" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Input {...form.register("vendorName")} data-testid="input-vendor" />
            </div>
            <div className="space-y-2">
              <Label>Version/Model</Label>
              <Input {...form.register("versionModel")} data-testid="input-version" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Deployment Model</Label>
              <Select 
                value={form.watch("deploymentModel")} 
                onValueChange={(v) => form.setValue("deploymentModel", v)}
              >
                <SelectTrigger data-testid="select-deployment">
                  <SelectValue placeholder="Select deployment model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="On-Prem">On-Prem</SelectItem>
                  <SelectItem value="Cloud">Cloud</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="SaaS">SaaS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Operational Lifecycle</Label>
              <Select 
                value={form.watch("operationalLifecycle")} 
                onValueChange={(v) => form.setValue("operationalLifecycle", v)}
              >
                <SelectTrigger data-testid="select-lifecycle">
                  <SelectValue placeholder="Select lifecycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard (Current)">Standard (Current)</SelectItem>
                  <SelectItem value="Emerging">Emerging</SelectItem>
                  <SelectItem value="Retiring">Retiring</SelectItem>
                  <SelectItem value="Retired">Retired</SelectItem>
                  <SelectItem value="Exception">Exception</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Strategic Direction</Label>
              <Select 
                value={form.watch("strategicDirection")} 
                onValueChange={(v) => form.setValue("strategicDirection", v)}
              >
                <SelectTrigger data-testid="select-strategic">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Invest">Invest</SelectItem>
                  <SelectItem value="Maintain">Maintain</SelectItem>
                  <SelectItem value="Migrate">Migrate</SelectItem>
                  <SelectItem value="Retire">Retire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Owner</Label>
              <Input {...form.register("owner")} data-testid="input-owner" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Technology Domain</Label>
              <Input {...form.register("technologyDomain")} data-testid="input-domain" />
            </div>
            <div className="space-y-2">
              <Label>Subcategories</Label>
              <Input {...form.register("technologySubcategories")} data-testid="input-subcategories" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Service Category</Label>
              <Input {...form.register("serviceCategory")} data-testid="input-service-category" />
            </div>
            <div className="space-y-2">
              <Label>Service Component</Label>
              <Input {...form.register("serviceComponent")} data-testid="input-service-component" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Comments</Label>
            <Textarea {...form.register("comments")} className="min-h-[60px]" data-testid="input-comments" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-item">
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
