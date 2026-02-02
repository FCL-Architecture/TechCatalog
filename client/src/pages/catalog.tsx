import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { useCatalogItems, useCreateCatalogItem, useDeleteCatalogItem } from "@/hooks/use-catalog";
import { useCategories } from "@/hooks/use-categories";
import { LayoutShell } from "@/components/layout-shell";
import { StatusBadge } from "@/components/status-badge";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Loader2, Search, Plus, MoreHorizontal, Filter, X 
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCatalogItemSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function Catalog() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const urlCategoryId = urlParams.get("categoryId");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>(urlCategoryId || "all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Update filter when URL changes
  useEffect(() => {
    if (urlCategoryId) {
      setCategoryFilter(urlCategoryId);
    }
  }, [urlCategoryId]);

  const { data: items, isLoading } = useCatalogItems({
    search,
    status: statusFilter !== "all" ? statusFilter : undefined,
    categoryId: categoryFilter !== "all" ? parseInt(categoryFilter) : undefined,
  });

  const { data: categories } = useCategories();
  const deleteMutation = useDeleteCatalogItem();

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  const hasFilters = search || statusFilter !== "all" || categoryFilter !== "all";

  return (
    <LayoutShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Catalog</h1>
          <p className="text-slate-500 mt-1">Manage and review technology items.</p>
        </div>
        <div className="flex gap-2">
           <CreateItemDialog 
             open={isCreateOpen} 
             onOpenChange={setIsCreateOpen} 
             categories={categories || []} 
           />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search items..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Deployment</TableHead>
                <TableHead>Lifecycle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                    No items found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                items?.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium">
                      <Link href={`/catalog/${item.id}`} className="hover:underline text-blue-600">
                        {item.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-500">{item.technologyDomain || item.category?.name || "—"}</TableCell>
                    <TableCell className="text-slate-500">{item.vendorName || "—"}</TableCell>
                    <TableCell className="text-slate-500">{item.deploymentModel || "—"}</TableCell>
                    <TableCell className="text-slate-500">{item.operationalLifecycle || "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status as any} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/catalog/${item.id}`}>
                            <DropdownMenuItem className="cursor-pointer">View Details</DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this item?")) {
                                deleteMutation.mutate(item.id);
                              }
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </LayoutShell>
  );
}

// Dropdown options based on FCL Technology Catalog Guidance
const TECHNOLOGY_DOMAINS = [
  "Cloud & Infrastructure",
  "Data & Analytics",
  "Automation & Workflow",
  "Collaboration & Digital Workplace",
  "Development",
  "Security & Threat Intelligence",
  "Operational Technology (OT)",
  "Business Applications",
  "Retail Technology & Customer Engagement",
  "Agriculture & Agribusiness",
  "Content & Document Management"
];

const DEPLOYMENT_MODELS = [
  "On-Prem",
  "Cloud",
  "Hybrid",
  "SaaS"
];

const OPERATIONAL_LIFECYCLES = [
  "Evaluate",
  "Introduce",
  "Standard",
  "Maintain",
  "Contain",
  "Retire"
];

const STRATEGIC_DIRECTIONS = [
  "Tolerate",
  "Invest",
  "Migrate",
  "Eliminate"
];

const AI_CAPABILITY_TYPES = [
  "No AI Capabilities",
  "Native AI",
  "AI via API",
  "AI Configurable",
  "AI Embedded"
];

const AI_PROVIDERS = [
  "OpenAI (GPT-4)",
  "Google Gemini",
  "Microsoft Copilot",
  "AWS Bedrock",
  "IBM Watson",
  "Custom AI Models",
  "Other"
];

const CAN_SWITCH_AI_OPTIONS = ["Yes", "No"];

function CreateItemDialog({ open, onOpenChange, categories }: { open: boolean, onOpenChange: (v: boolean) => void, categories: any[] }) {
  const createMutation = useCreateCatalogItem();
  
  const form = useForm<z.infer<typeof insertCatalogItemSchema>>({
    resolver: zodResolver(insertCatalogItemSchema),
    defaultValues: {
      name: "",
      description: "",
      owner: "",
      status: "draft",
      technologyDomain: "",
      vendorName: "",
      deploymentModel: "",
      operationalLifecycle: "",
      strategicDirection: "",
      aiCapabilityType: "",
      aiProviders: "",
      canAiProviderBeSwitched: "",
      governanceGroup: "",
      standardsReviewer: "",
      standardApprover: "",
    },
  });

  const onSubmit = (data: z.infer<typeof insertCatalogItemSchema>) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button data-testid="button-new-item">
          <Plus className="w-4 h-4 mr-2" />
          New Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Technology Item</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technology Name *</FormLabel>
                    <FormControl>
                      <Input data-testid="input-name" placeholder="e.g. Azure SQL, VS Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(parseInt(val))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="technologyDomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technology Domain</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-domain">
                            <SelectValue placeholder="Select domain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TECHNOLOGY_DOMAINS.map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea data-testid="input-description" placeholder="Describe the technology..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">Technology Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vendorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Name</FormLabel>
                      <FormControl>
                        <Input data-testid="input-vendor" placeholder="e.g. Microsoft, AWS" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="versionModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version / Model</FormLabel>
                      <FormControl>
                        <Input data-testid="input-version" placeholder="e.g. v2.0, Enterprise" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deploymentModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deployment Model</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-deployment">
                            <SelectValue placeholder="Select deployment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEPLOYMENT_MODELS.map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operationalLifecycle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operational Lifecycle</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-lifecycle">
                            <SelectValue placeholder="Select lifecycle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {OPERATIONAL_LIFECYCLES.map(l => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="strategicDirection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strategic Direction (TIME)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-strategic">
                            <SelectValue placeholder="Select direction" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STRATEGIC_DIRECTIONS.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">AI Capabilities</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="aiCapabilityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Capability Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-ai-type">
                            <SelectValue placeholder="Select AI type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AI_CAPABILITY_TYPES.map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aiProviders"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Provider</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-ai-provider">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AI_PROVIDERS.map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="canAiProviderBeSwitched"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Can AI Provider Be Switched?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-ai-switch">
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CAN_SWITCH_AI_OPTIONS.map(o => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">Governance</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="governanceGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Governance Group</FormLabel>
                      <FormControl>
                        <Input data-testid="input-governance" placeholder="e.g. IT Network, Digital Commerce" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="owner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner</FormLabel>
                      <FormControl>
                        <Input data-testid="input-owner" placeholder="Team or person responsible" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="standardsReviewer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standards Reviewer</FormLabel>
                      <FormControl>
                        <Input data-testid="input-reviewer" placeholder="First Last" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="standardApprover"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard Approver</FormLabel>
                      <FormControl>
                        <Input data-testid="input-approver" placeholder="First Last" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-create-submit">
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
