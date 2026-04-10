import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/utils/toast";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: string;
  description: string;
  date: string;
  budgetCategoryId: string | null;
  installmentPlanId: string | null;
  budgetCategory?: { name: string; color: string; icon: string } | null;
}

interface TransactionFilters {
  type?: "INCOME" | "EXPENSE" | null;
  categoryId?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  search?: string | null;
}

export function useTransactions(filters: TransactionFilters = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.search) params.set("search", filters.search);

  return useInfiniteQuery({
    queryKey: ["transactions", filters],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const url = `/api/transactions?${params}${pageParam ? `&cursor=${pageParam}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{ items: Transaction[]; nextCursor: string | null }>;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    refetchInterval: 30 * 1000,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new ApiError(err.error || "Failed", res.status, err);
      }
      return res.json();
    },
    onSuccess: (_, vars: any) => {
      const type = vars?.type === "INCOME" ? "income" : "expense";
      toast.success(`${type === "income" ? "Income" : "Expense"} recorded`, vars?.description);
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["budget"] });
      qc.invalidateQueries({ queryKey: ["cash-flow-plan"] });
      qc.invalidateQueries({ queryKey: ["safe-to-spend"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (err: Error) => {
      if (err instanceof ApiError && err.status === 409) {
        return;
      }
      toast.error("Failed to record transaction", err.message);
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Transaction deleted", "The transaction has been removed from your records.");
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["budget"] });
      qc.invalidateQueries({ queryKey: ["cash-flow-plan"] });
      qc.invalidateQueries({ queryKey: ["safe-to-spend"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (err: Error) => toast.error("Failed to delete transaction", err.message),
  });
}
