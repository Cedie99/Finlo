import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/utils/toast";

export interface BudgetCategory {
  id: string;
  name: string;
  color: string;
  icon: string | null;
}

export interface BudgetLimit {
  id: string;
  budgetCategoryId: string;
  monthYear: string;
  limitAmount: string;
  category: BudgetCategory;
}

export interface BudgetSummary {
  category: BudgetCategory;
  limit: number | null;
  spent: number;
  remaining: number | null;
  pct: number | null;
}

export function useBudgetCategories() {
  return useQuery({
    queryKey: ["budget-categories"],
    queryFn: async () => {
      const res = await fetch("/api/budget/categories");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<BudgetCategory[]>;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBudgetSummary(monthYear: string) {
  return useQuery({
    queryKey: ["budget-summary", monthYear],
    queryFn: async () => {
      const res = await fetch(`/api/budget/summary?monthYear=${monthYear}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<BudgetSummary[]>;
    },
  });
}

export function useCreateBudgetCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; color: string; icon?: string }) => {
      const res = await fetch("/api/budget/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Category created");
      qc.invalidateQueries({ queryKey: ["budget-categories"] });
    },
    onError: () => toast.error("Failed to create category"),
  });
}

export function useSetBudgetLimit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { budgetCategoryId: string; monthYear: string; limitAmount: number }) => {
      const res = await fetch(`/api/budget/limits/${data.monthYear}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budgetCategoryId: data.budgetCategoryId, limitAmount: data.limitAmount }),
      });
      if (!res.ok) throw new Error("Failed to set limit");
      return res.json();
    },
    onSuccess: (_, vars) => {
      toast.success("Budget limit saved");
      qc.invalidateQueries({ queryKey: ["budget-summary", vars.monthYear] });
    },
    onError: () => toast.error("Failed to save limit"),
  });
}
