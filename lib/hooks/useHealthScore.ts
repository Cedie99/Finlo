import { useQuery } from "@tanstack/react-query";

export interface HealthScoreData {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  breakdown: {
    dtiScore: number;
    bufferScore: number;
    paymentScore: number;
    loadScore: number;
  };
  insights: string[];
}

export function useHealthScore() {
  return useQuery({
    queryKey: ["health-score"],
    queryFn: async (): Promise<HealthScoreData> => {
      const res = await fetch("/api/dashboard/health-score");
      if (!res.ok) throw new Error("Failed to fetch health score");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
