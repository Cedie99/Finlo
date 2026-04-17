import { useQuery } from "@tanstack/react-query";
import { getMonthYear } from "@/lib/utils/dates";

export interface DashboardData {
  monthYear: string;
  totalIncome: string;
  totalExpenses: string;
  upcomingPayments: {
    id: string;
    name: string;
    amount: string;
    nextDueDate: string;
    kind: "installment" | "recurring";
    meta: { color: string; label: string } | null;
  }[];
  budgetSummary: {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    limitAmount: string;
    spent: string;
  }[];
}

export function useDashboard(monthYear?: string) {
  const month = monthYear || getMonthYear();
  return useQuery({
    queryKey: ["dashboard", month],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?monthYear=${month}`);
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json() as Promise<DashboardData>;
    },
    refetchInterval: 30 * 1000,
  });
}
