import { useQuery } from "@tanstack/react-query";
import { getMonthYear } from "@/lib/utils/dates";

export interface SafeToSpendData {
  monthYear: string;
  targetDate: string;
  horizonDays: number;
  availableBalance: string;
  bufferAmount: string;
  safeToSpendToday: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  forecast: {
    lowestProjectedBalance: string;
    timeline: {
      date: string;
      inflow: string;
      outflow: string;
      projectedBalance: string;
    }[];
  };
  risks: {
    type: "INSUFFICIENT_BUFFER" | "AUTOPAY_CONFLICT";
    date: string;
    message: string;
    projectedBalance?: string;
    shortfall?: string;
    totalDue?: string;
  }[];
}

export function useSafeToSpend(monthYear?: string, targetDate?: string) {
  const month = monthYear ?? getMonthYear();

  return useQuery({
    queryKey: ["safe-to-spend", month, targetDate ?? null],
    queryFn: async () => {
      const params = new URLSearchParams({ monthYear: month });
      if (targetDate) {
        params.set("targetDate", targetDate);
      }
      const res = await fetch(`/api/dashboard/safe-to-spend?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch safe-to-spend");
      return res.json() as Promise<SafeToSpendData>;
    },
    refetchInterval: 30 * 1000,
  });
}
