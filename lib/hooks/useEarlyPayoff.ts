import { useMutation } from "@tanstack/react-query";

export interface EarlyPayoffResult {
  planId: string;
  originalMonthsRemaining: number;
  newMonthsRemaining: number;
  monthsSaved: number;
  originalTotalRemaining: string;
  newTotalPaid: string;
  interestSaved: string;
  newCompletionDate: string;
}

export function useEarlyPayoff() {
  return useMutation({
    mutationFn: async (input: {
      planId: string;
      extraMonthlyAmount: number;
    }): Promise<EarlyPayoffResult> => {
      const res = await fetch("/api/installments/early-payoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to calculate early payoff");
      return res.json();
    },
  });
}
