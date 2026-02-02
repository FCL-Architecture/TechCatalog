import { useCategories, useUpdateCategory } from "@/hooks/use-categories";
import { LayoutShell } from "@/components/layout-shell";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Edit2, UserX } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import type { User } from "@shared/schema";

export default function Categories() {
  const { data: categories, isLoading } = useCategories();

  return (
    <LayoutShell>
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Categories & Teams</h1>
        <p className="text-slate-500 mt-1">Assign team leaders to technology categories for approval workflows.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Assigned Team Leader</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" data-testid="loader-categories" />
                </TableCell>
              </TableRow>
            ) : (
              categories?.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))
            )}
            {categories?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                  No categories found. Import data to create categories automatically.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </LayoutShell>
  );
}

function CategoryRow({ category }: { category: any }) {
  const updateMutation = useUpdateCategory();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>(
    category.teamLeaderId || ""
  );

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const handleSave = () => {
    updateMutation.mutate({
      id: category.id,
      teamLeaderId: selectedUserId === "none" ? null : selectedUserId || null 
    }, {
      onSuccess: () => {
        setIsOpen(false);
      }
    });
  };

  const getDisplayName = (user: User) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email || `User ${user.id}`;
  };

  return (
    <TableRow data-testid={`row-category-${category.id}`}>
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell>
        {category.teamLeader ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={category.teamLeader.profileImageUrl} />
              <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                {category.teamLeader.firstName?.[0]}{category.teamLeader.lastName?.[0] || category.teamLeader.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{getDisplayName(category.teamLeader)}</span>
          </div>
        ) : (
          <span className="text-slate-400 italic text-sm">Unassigned</span>
        )}
      </TableCell>
      <TableCell>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" data-testid={`button-edit-category-${category.id}`}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Team Leader</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-slate-500 mb-4">
                Select a team leader for <strong>{category.name}</strong>.
              </p>
              
              <Label htmlFor="team-leader">Team Leader</Label>
              {usersLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : users && users.length > 0 ? (
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="mt-2" data-testid="select-team-leader">
                    <SelectValue placeholder="Select a team leader" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <UserX className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">No team leader</span>
                      </div>
                    </SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id} data-testid={`option-user-${user.id}`}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={user.profileImageUrl || undefined} />
                            <AvatarFallback className="text-[8px] bg-blue-100 text-blue-700">
                              {user.firstName?.[0]}{user.lastName?.[0] || user.email?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{getDisplayName(user)}</span>
                          {user.email && (
                            <span className="text-slate-400 text-xs">({user.email})</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-4 border border-dashed rounded-lg text-center text-slate-400 bg-slate-50 mt-2">
                  <p>No users available yet.</p>
                  <p className="text-xs mt-1">Users will appear here once they log in to the application.</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)} data-testid="button-cancel">
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={updateMutation.isPending}
                data-testid="button-save-team-leader"
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}
