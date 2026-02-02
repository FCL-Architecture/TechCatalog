import { useState, useRef } from "react";
import { useParseImport, useCommitImport } from "@/hooks/use-import";
import { LayoutShell } from "@/components/layout-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Loader2, UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Import() {
  const [items, setItems] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const parseMutation = useParseImport();
  const commitMutation = useCommitImport();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const data = await parseMutation.mutateAsync(file);
      setItems(data);
    }
  };

  const handleCommit = () => {
    if (items) {
      commitMutation.mutate(items, {
        onSuccess: () => {
          setItems(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      });
    }
  };

  return (
    <LayoutShell>
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Import Data</h1>
        <p className="text-slate-500 mt-1">Migrate legacy data from SharePoint Excel exports.</p>
      </div>

      {!items ? (
        <Card className="border-dashed border-2 border-slate-300 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Excel File</h3>
            <p className="text-slate-500 max-w-sm mb-8">
              Drag and drop your .xlsx file here, or click to browse. 
              The file should contain columns for Name, Description, Category, and Owner.
            </p>
            
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <Button 
              size="lg" 
              onClick={() => fileInputRef.current?.click()}
              disabled={parseMutation.isPending}
            >
              {parseMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Select File
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Ready to Import</h3>
                <p className="text-sm text-slate-500">{items.length} items parsed successfully</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setItems(null)}>Cancel</Button>
              <Button onClick={handleCommit} disabled={commitMutation.isPending}>
                {commitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Commit Import
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-10">OK</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Deployment</TableHead>
                  <TableHead>Lifecycle</TableHead>
                  <TableHead>Strategic</TableHead>
                  <TableHead>Governance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {item.isValid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <div className="flex items-center gap-2 text-rose-500" title={item.validationError}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-slate-500">{item.technologyDomain || item.categoryName || "—"}</TableCell>
                    <TableCell className="text-slate-500">{item.vendorName || "—"}</TableCell>
                    <TableCell className="text-slate-500">{item.deploymentModel || "—"}</TableCell>
                    <TableCell className="text-slate-500">{item.operationalLifecycle || "—"}</TableCell>
                    <TableCell className="text-slate-500">{item.strategicDirection || "—"}</TableCell>
                    <TableCell className="text-slate-500">{item.governanceGroup || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </LayoutShell>
  );
}
