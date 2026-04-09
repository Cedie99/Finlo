import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/utils/toast";
import type { RecurringTransactionInput } from "@/lib/validations/transactions";

export interface RecurringTransaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: string;
  description: string;
  frequency: "WEEKLY" | "MONTHLY" | "YEARLY";
  dayOfMonth: number | null;
  startDate: string;
  endDate: string | null;
  nextDueDate: string;
  isActive: boolean;
  budgetCategoryId: string | null;
  budgetCategory?: { id: string; name: string; color: string; icon: string } | null;
  createdAt: string;
}

function invalidateRelated(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["recurring-transactions"] });
  qc.invalidateQueries({ queryKey: ["transactions"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
  qc.invalidateQueries({ queryKey: ["budget"] });
  qc.invalidateQueries({ queryKey: ["cash-flow-plan"] });
}

export function useRecurringTransactions() {
  return useQuery({
    queryKey: ["recurring-transactions"],
    queryFn: async () => {
      const res = await fetch("/api/recurring-transactions");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<RecurringTransaction[]>;
    },
    refetchInterval: 30 * 1000,
  });
}

export function useProcessRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/recurring-transactions/process", { method: "POST" });
      if (!res.ok) throw new Error("Failed to process");
      return res.json() as Promise<{ generated: number }>;
    },
    onSuccess: ({ generated }) => {
      if (generated > 0) {
        toast.info(
          `${generated} recurring transaction${generated > 1 ? "s" : ""} generated`,
          "Your scheduled transactions have been recorded automatically."
        );
        invalidateRelated(qc);
      }
    },
  });
}

export function useCreateRecurringTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: RecurringTransactionInput) => {
      const res = await fetch("/api/recurring-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        let msg = `Failed to create (${res.status})`;
        try { msg = (await res.json()).error || msg; } catch {}
        throw new Error(msg);
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Recurring transaction created", "It will be automatically recorded on schedule.");
      invalidateRelated(qc);
    },
    onError: (err: Error) => toast.error("Failed to create", err.message),
  });
}

export function useToggleRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/recurring-transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: (_, { isActive }) => {
      toast.success(isActive ? "Recurring transaction resumed" : "Recurring transaction paused");
      invalidateRelated(qc);
    },
    onError: (err: Error) => toast.error("Failed to update", err.message),
  });
}

export function useDeleteRecurringTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/recurring-transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Recurring transaction deleted", "No future transactions will be generated.");
      invalidateRelated(qc);
    },
    onError: (err: Error) => toast.error("Failed to delete", err.message),
  });
}
