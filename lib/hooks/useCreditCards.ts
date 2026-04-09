import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/utils/toast";

export interface CreditCard {
  id: string;
  bankName: string;
  cardName: string;
  lastFourDigits: string | null;
  creditLimit: string;
  currentBalance: string;
  billingCycleDay: number;
  dueDayOffset: number;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

async function fetchCreditCards(): Promise<CreditCard[]> {
  const res = await fetch("/api/credit-cards");
  if (!res.ok) throw new Error("Failed to fetch credit cards");
  return res.json();
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["credit-cards"] });
  qc.invalidateQueries({ queryKey: ["installments"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
  qc.invalidateQueries({ queryKey: ["cash-flow-plan"] });
}

export function useCreditCards() {
  return useQuery({
    queryKey: ["credit-cards"],
    queryFn: fetchCreditCards,
    refetchInterval: 30 * 1000,
  });
}

export function useCreateCreditCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await fetch("/api/credit-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Credit card added", "Your new card is ready to use for installment tracking.");
      invalidateAll(qc);
    },
    onError: (err: Error) => toast.error("Failed to add credit card", err.message),
  });
}

export function useUpdateCreditCard(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await fetch(`/api/credit-cards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Credit card updated", "Your card details have been saved.");
      invalidateAll(qc);
    },
    onError: (err: Error) => toast.error("Failed to update credit card", err.message),
  });
}

export function useDeleteCreditCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/credit-cards/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Credit card removed", "The card and its linked installments have been updated.");
      invalidateAll(qc);
    },
    onError: (err: Error) => toast.error("Failed to remove credit card", err.message),
  });
}
