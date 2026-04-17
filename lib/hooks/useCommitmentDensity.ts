import { useQuery } from "@tanstack/react-query";

export interface CommitmentMonth {
  monthYear: string;
  label: string;
  totalIncome: string;
  totalObligations: string;
  commitmentRatio: number;
  density: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  details: {
    installmentTotal: string;
    recurringTotal: string;
    installmentCount: number;
  };
}

export interface CommitmentDensityData {
  months: CommitmentMonth[];
}

export function useCommitmentDensity() {
  return useQuery({
    queryKey: ["commitment-density"],
    queryFn: async (): Promise<CommitmentDensityData> => {
      const res = await fetch("/api/dashboard/commitment-density");
      if (!res.ok) throw new Error("Failed to fetch commitment density");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
