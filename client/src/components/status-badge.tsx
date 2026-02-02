import { cn } from "@/lib/utils";

type Status = "draft" | "pending_review" | "in_review" | "review" | "reviewed" | "approved" | "rejected" | "archived";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string; dotColor: string }> = {
  draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    dotColor: "bg-slate-400",
  },
  pending_review: {
    label: "Pending Review",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    dotColor: "bg-orange-500",
  },
  in_review: {
    label: "In Review",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
  },
  review: {
    label: "In Review",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
  },
  reviewed: {
    label: "Reviewed",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    dotColor: "bg-rose-500",
  },
  archived: {
    label: "Archived",
    className: "bg-slate-50 text-slate-400 border-slate-100",
    dotColor: "bg-slate-300",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      config.className,
      className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", config.dotColor)} />
      {config.label}
    </span>
  );
}
