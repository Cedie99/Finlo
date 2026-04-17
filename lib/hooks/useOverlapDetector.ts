import { useQuery } from "@tanstack/react-query";

export interface CrunchMonth {
  monthYear: string;
  label: string;
  installments: { name: string; amount: string; dueDate: string }[];
  totalAmount: string;
  severity: "WARNING" | "CRITICAL";
}

export interface OverlapDetectorData {
  crunchMonths: CrunchMonth[];
  safestMonth: string | null;
}

export function useOverlapDetector() {
  return useQuery({
    queryKey: ["overlap-detector"],
    queryFn: async (): Promise<OverlapDetectorData> => {
      const res = await fetch("/api/dashboard/overlap-detector");
      if (!res.ok) throw new Error("Failed to fetch overlap data");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
