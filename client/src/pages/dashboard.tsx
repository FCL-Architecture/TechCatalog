import { useCatalogItems } from "@/hooks/use-catalog";
import { LayoutShell } from "@/components/layout-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from "recharts";
import { Loader2, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { data: items, isLoading } = useCatalogItems();

  if (isLoading) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </LayoutShell>
    );
  }

  const stats = {
    total: items?.length || 0,
    draft: items?.filter(i => i.status === 'draft').length || 0,
    pendingReview: items?.filter(i => i.status === 'pending_review').length || 0,
    inReview: items?.filter(i => i.status === 'in_review' || i.status === 'review').length || 0,
    approved: items?.filter(i => i.status === 'approved').length || 0,
    rejected: items?.filter(i => i.status === 'rejected').length || 0,
  };

  const chartData = [
    { name: 'Draft', value: stats.draft, color: '#94a3b8' },
    { name: 'Pending Review', value: stats.pendingReview, color: '#f97316' },
    { name: 'In Review', value: stats.inReview, color: '#f59e0b' },
    { name: 'Approved', value: stats.approved, color: '#10b981' },
    { name: 'Rejected', value: stats.rejected, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  // Recent items needing attention
  const pendingReviews = items
    ?.filter(i => i.status === 'pending_review' || i.status === 'in_review' || i.status === 'review')
    .slice(0, 5) || [];

  return (
    <LayoutShell>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your technology catalog migration and approvals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={FileText} label="Total Items" value={stats.total} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={Clock} label="Pending Review" value={stats.pendingReview + stats.inReview} color="text-amber-600" bg="bg-amber-50" />
        <StatCard icon={CheckCircle} label="Approved" value={stats.approved} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={AlertCircle} label="Rejected" value={stats.rejected} color="text-rose-600" bg="bg-rose-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Catalog Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
                <CheckCircle className="w-12 h-12 mb-3 opacity-20" />
                <p>All caught up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReviews.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500 truncate">{item.category?.name || 'Uncategorized'}</p>
                    </div>
                    <StatusBadge status={item.status as any} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LayoutShell>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
