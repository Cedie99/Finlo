import { useMutation } from "@tanstack/react-query";

export interface AffordItResult {
  canAfford: boolean;
  safeToSpendToday: string;
  afterAmount: string;
  impactPercent: number;
  verdict: "YES" | "TIGHT" | "NO";
  message: string;
  suggestedMonth: string | null;
}

export function useAffordIt() {
  return useMutation({
    mutationFn: async (amount: number): Promise<AffordItResult> => {
      const res = await fetch("/api/dashboard/afford-it", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error("Failed to check affordability");
      return res.json();
    },
  });
}
