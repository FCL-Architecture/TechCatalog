import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateReviewRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateReviewRequest) => {
      const res = await fetch(api.reviews.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit review");
      }
      return api.reviews.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      // Invalidate the item detail to show new review and potentially updated status
      queryClient.invalidateQueries({ queryKey: ["/api/catalog", data.catalogItemId] });
      queryClient.invalidateQueries({ queryKey: ["/api/catalog"] });
      toast({
        title: "Review Submitted",
        description: `Your verdict: ${data.verdict}`,
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
