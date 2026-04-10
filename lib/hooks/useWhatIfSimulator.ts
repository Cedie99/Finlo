import { useMutation } from "@tanstack/react-query";

export interface WhatIfResult {
  monthYear: string;
  targetDate: string;
  horizonDays: number;
  baseline: {
    safeToSpendToday: string;
    lowestProjectedBalance: string;
  };
  scenario: {
    safeToSpendToday: string;
    lowestProjectedBalance: string;
    timeline: {
      date: string;
      inflow: string;
      outflow: string;
      projectedBalance: string;
    }[];
  };
  delta: {
    safeToSpendChange: string;
    lowestBalanceChange: string;
  };
  rescuePlan: {
    title: string;
    description: string;
    impactAmount: string;
  }[];
}

export function useWhatIfSimulator() {
  return useMutation({
    mutationFn: async (input: {
      monthYear: string;
      targetDate?: string;
      horizonDays?: number;
      scenario: {
        salaryDelayDays: number;
        unexpectedExpenseAmount: number;
        unexpectedExpenseDate?: string;
        incomeDropPercent: number;
        addedDebtAmount: number;
      };
    }) => {
      const res = await fetch("/api/dashboard/what-if", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to run simulation");
      }

      return res.json() as Promise<WhatIfResult>;
    },
  });
}
