import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/utils/toast";

export interface InstallmentPlan {
  id: string;
  name: string;
  description: string | null;
  type: "CREDIT_CARD" | "LOAN" | "BNPL";
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "PAUSED";
  totalAmount: string;
  monthlyAmount: string;
  totalMonths: number;
  paidMonths: number;
  startDate: string;
  nextDueDate: string | null;
  interestRate: string | null;
  lenderName: string | null;
  notes: string | null;
  creditCard?: { bankName: string; cardName: string; color: string } | null;
  payments?: InstallmentPayment[];
  createdAt: string;
}

export interface InstallmentPayment {
  id: string;
  installmentPlanId: string;
  amount: string;
  dueDate: string;
  paidDate: string | null;
  isPaid: boolean;
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["installments"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
  qc.invalidateQueries({ queryKey: ["cash-flow-plan"] });
  qc.invalidateQueries({ queryKey: ["reports"] });
}

export function useInstallments() {
  return useQuery({
    queryKey: ["installments"],
    queryFn: async () => {
      const res = await fetch("/api/installments");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<InstallmentPlan[]>;
    },
    refetchInterval: 30 * 1000,
  });
}

export function useInstallment(id: string) {
  return useQuery({
    queryKey: ["installments", id],
    queryFn: async () => {
      const res = await fetch(`/api/installments/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json() as Promise<InstallmentPlan>;
    },
    refetchInterval: 30 * 1000,
  });
}

export function useCreateInstallment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await fetch("/api/installments", {
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
      toast.success("Installment created", "Your new installment plan has been added.");
      invalidateAll(qc);
    },
    onError: (err: Error) => toast.error("Failed to create installment", err.message),
  });
}

export function useMarkPayment(planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      paymentId,
      isPaid,
      paidDate,
    }: {
      paymentId: string;
      isPaid: boolean;
      paidDate?: string;
    }) => {
      const res = await fetch(`/api/installments/${planId}/payments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, isPaid, paidDate }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update");
      }
      return res.json();
    },
    onSuccess: (_, vars) => {
      if (vars.isPaid) {
        toast.success("Payment marked as paid", "This month's payment has been recorded successfully.");
      } else {
        toast.info("Payment marked as unpaid", "The payment has been reverted to pending.");
      }
      qc.invalidateQueries({ queryKey: ["installments", planId] });
      invalidateAll(qc);
    },
    onError: (err: Error) => toast.error("Failed to update payment", err.message),
  });
}

export function useDeleteInstallment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/installments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        let message = "Failed to delete";
        try {
          const err = (await res.json()) as { error?: string };
          if (err?.error) message = err.error;
        } catch {
          // ignore malformed json; keep fallback message
        }
        throw new Error(message);
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Installment deleted", "The installment plan has been removed from your account.");
      invalidateAll(qc);
    },
    onError: (err: Error) => toast.error("Failed to delete installment", err.message),
  });
}
