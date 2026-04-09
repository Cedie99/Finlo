"use client";

import Decimal from "decimal.js";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";

interface CashFlowPlannerProps {
  obligations: {
    totalInstallments: string;
    totalBudgetLimits: string;
    freeAfterObligations: string;
  };
  income: { total: string };
  dtiRatio: number;
}

export function CashFlowPlanner({ obligations, income, dtiRatio }: CashFlowPlannerProps) {
  const totalIncome = new Decimal(income.total);
  const totalInstallments = new Decimal(obligations.totalInstallments);
  const totalBudgetLimits = new Decimal(obligations.totalBudgetLimits);
  const freeCash = new Decimal(obligations.freeAfterObligations);
  const freeCashPositive = freeCash.gte(0);

  const barWidth = (amount: Decimal) => {
    if (totalIncome.lte(0)) return 0;
    return Math.min(amount.abs().div(totalIncome.abs()).times(100).toNumber(), 100);
  };

  let dtiBarColor = "bg-emerald-500";
  let dtiTextColor = "text-emerald-600";
  let dtiLabel = "Healthy";
  if (dtiRatio > 43) {
    dtiBarColor = "bg-red-500";
    dtiTextColor = "text-red-600";
    dtiLabel = "Critical";
  } else if (dtiRatio >= 30) {
    dtiBarColor = "bg-amber-500";
    dtiTextColor = "text-amber-600";
    dtiLabel = "Watch Out";
  }

  const rows = [
    {
      label: "Income",
      amount: totalIncome,
      prefix: "+",
      barColor: "bg-emerald-500",
      textColor: "text-emerald-600",
      width: 100,
    },
    {
      label: "Installments",
      amount: totalInstallments,
      prefix: "-",
      barColor: "bg-red-500",
      textColor: "text-red-500",
      width: barWidth(totalInstallments),
    },
    {
      label: "Budget Allocations",
      amount: totalBudgetLimits,
      prefix: "-",
      barColor: "bg-amber-500",
      textColor: "text-amber-500",
      width: barWidth(totalBudgetLimits),
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Cash Flow Breakdown</h3>

      <div className="space-y-3">
        {rows.map(({ label, amount, prefix, barColor, textColor, width }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-36 shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-300", barColor)}
                style={{ width: `${width}%` }}
              />
            </div>
            <span className={cn("text-sm font-medium tabular-nums w-32 text-right", textColor)}>
              {prefix}{formatCurrency(amount.toString())}
            </span>
          </div>
        ))}

        <hr className="border-gray-200" />

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700 w-36 shrink-0">Free Cash</span>
          <div className="flex-1" />
          <span
            className={cn(
              "text-sm font-bold tabular-nums w-32 text-right",
              freeCashPositive ? "text-emerald-600" : "text-red-500"
            )}
          >
            {formatCurrency(freeCash.toString())}
          </span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Debt-to-Income Ratio</span>
          <span className={cn("text-sm font-semibold", dtiTextColor)}>
            {dtiRatio.toFixed(1)}% — {dtiLabel}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-300", dtiBarColor)}
            style={{ width: `${Math.min(dtiRatio, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {dtiRatio < 30
            ? "Your debt load is manageable."
            : dtiRatio <= 43
            ? "Consider reducing new debt obligations."
            : "Debt obligations are very high — review your budget."}
        </p>
      </div>
    </div>
  );
}
