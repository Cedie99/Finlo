import { useQuery } from "@tanstack/react-query";
import { getMonthYear } from "@/lib/utils/dates";

export interface CashFlowPlanData {
  monthYear: string;
  income: {
    total: string;
    entries: { id: string; source: string; amount: string; receivedAt: string | null }[];
  };
  obligations: {
    totalInstallments: string;
    totalBudgetLimits: string;
    freeAfterObligations: string;
  };
  dtiRatio: number;
  calendar: {
    paydays: { date: string; amount: string; source: string }[];
    dueDates: { date: string; amount: string; name: string; kind: "installment" | "recurring" }[];
  };
}

export function useCashFlowPlan(monthYear?: string) {
  const month = monthYear ?? getMonthYear(new Date());
  return useQuery({
    queryKey: ["cash-flow-plan", month],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/cash-flow-plan?monthYear=${month}`);
      if (!res.ok) throw new Error("Failed to fetch cash flow plan");
      return res.json() as Promise<CashFlowPlanData>;
    },
    refetchInterval: 30 * 1000,
  });
}
