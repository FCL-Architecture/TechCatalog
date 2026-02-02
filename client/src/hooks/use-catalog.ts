import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateItemRequest, type UpdateItemRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCatalogItems(params?: { status?: string; categoryId?: number; search?: string }) {
  // Convert params for URL compatibility
  const queryParams: Record<string, string | number> = {};
  if (params?.status) queryParams.status = params.status;
  if (params?.categoryId) queryParams.categoryId = params.categoryId;
  if (params?.search) queryParams.search = params.search;

  const queryString = new URLSearchParams(queryParams as Record<string, string>).toString();
  const queryKey = [api.catalog.list.path, queryString];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = `${api.catalog.list.path}?${queryString}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch catalog items");
      return api.catalog.list.responses[200].parse(await res.json());
    },
  });
}

export function useCatalogItem(id: number) {
  return useQuery({
    queryKey: [api.catalog.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.catalog.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch item");
      return api.catalog.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateCatalogItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateItemRequest) => {
      // Zod coerce happens on server, but good to be safe with types
      const res = await fetch(api.catalog.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create item");
      }
      return api.catalog.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.catalog.list.path] });
      toast({
        title: "Success",
        description: "Catalog item created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCatalogItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateItemRequest) => {
      const url = buildUrl(api.catalog.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update item");
      }
      return api.catalog.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.catalog.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.catalog.get.path, variables.id] });
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCatalogItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.catalog.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.catalog.list.path] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
