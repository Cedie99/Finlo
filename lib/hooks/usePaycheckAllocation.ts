import { useQuery } from "@tanstack/react-query";
import { getMonthYear } from "@/lib/utils/dates";

export interface AllocationEntry {
  category: string;
  label: string;
  amount: string;
  percentage: number;
  priority: number;
  color: string;
}

export interface PaycheckAllocationData {
  monthYear: string;
  totalIncome: string;
  alreadySpent: string;
  allocations: AllocationEntry[];
  unallocated: string;
}

export function usePaycheckAllocation(monthYear?: string) {
  const month = monthYear ?? getMonthYear();
  return useQuery({
    queryKey: ["paycheck-allocation", month],
    queryFn: async (): Promise<PaycheckAllocationData> => {
      const res = await fetch(`/api/dashboard/paycheck-allocation?monthYear=${month}`);
      if (!res.ok) throw new Error("Failed to fetch paycheck allocation");
      return res.json();
    },
    staleTime: 60 * 1000,
  });
}
