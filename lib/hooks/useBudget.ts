import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/utils/toast";

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  spent?: string;
  limit?: string | null;
  limitId?: string | null;
}

export function useBudgetCategories() {
  return useQuery({
    queryKey: ["budget-categories"],
    queryFn: async () => {
      const res = await fetch("/api/budget/categories");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<BudgetCategory[]>;
    },
    refetchInterval: 30 * 1000,
  });
}

export function useBudgetByMonth(monthYear: string) {
  return useQuery({
    queryKey: ["budget", monthYear],
    queryFn: async () => {
      const res = await fetch(`/api/budget/limits/${monthYear}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<BudgetCategory[]>;
    },
    refetchInterval: 30 * 1000,
  });
}

export function useSetBudgetLimit(monthYear: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { budgetCategoryId: string; limitAmount: number }) => {
      const res = await fetch(`/api/budget/limits/${monthYear}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to set limit");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Budget limit saved", "Your spending limit for this category has been updated.");
      qc.invalidateQueries({ queryKey: ["budget", monthYear] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["cash-flow-plan"] });
    },
    onError: (err: Error) => toast.error("Failed to save budget limit", err.message),
  });
}

export function useCreateBudgetCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await fetch("/api/budget/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Category created", "You can now assign transactions and set a budget limit for it.");
      qc.invalidateQueries({ queryKey: ["budget-categories"] });
    },
    onError: (err: Error) => toast.error("Failed to create category", err.message),
  });
}

export function useDeleteBudgetCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/budget/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Cannot delete");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Category deleted", "The category and its budget limits have been removed.");
      qc.invalidateQueries({ queryKey: ["budget-categories"] });
      qc.invalidateQueries({ queryKey: ["budget"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: Error) => toast.error("Failed to delete category", err.message),
  });
}
