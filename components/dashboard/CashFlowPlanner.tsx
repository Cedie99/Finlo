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

  let dtiBarColor = "bg-[#34d399]";
  let dtiTextColor = "text-[#34d399]";
  let dtiLabel = "Healthy";
  if (dtiRatio > 43) {
    dtiBarColor = "bg-[#ef4444]";
    dtiTextColor = "text-[#ef4444]";
    dtiLabel = "Critical";
  } else if (dtiRatio >= 30) {
    dtiBarColor = "bg-[#f59e0b]";
    dtiTextColor = "text-[#f59e0b]";
    dtiLabel = "Watch Out";
  }

  const rows = [
    {
      label: "Income",
      amount: totalIncome,
      prefix: "+",
      barColor: "bg-[#34d399]",
      textColor: "text-[#34d399]",
      width: 100,
    },
    {
      label: "Installments",
      amount: totalInstallments,
      prefix: "-",
      barColor: "bg-[#ef4444]",
      textColor: "text-[#ef4444]",
      width: barWidth(totalInstallments),
    },
    {
      label: "Budget Allocations",
      amount: totalBudgetLimits,
      prefix: "-",
      barColor: "bg-[#f59e0b]",
      textColor: "text-[#f59e0b]",
      width: barWidth(totalBudgetLimits),
    },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Monthly Cash Flow Breakdown</h3>

      <div className="space-y-3">
        {rows.map(({ label, amount, prefix, barColor, textColor, width }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-36 shrink-0 text-xs text-white/50">{label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className={cn("h-full rounded-full transition-all duration-500", barColor)}
                style={{ width: `${width}%` }}
              />
            </div>
            <span className={cn("w-32 text-right text-xs font-semibold tabular-nums", textColor)}>
              {prefix}{formatCurrency(amount.toString())}
            </span>
          </div>
        ))}

        <div className="my-1 border-t border-white/[0.07]" />

        <div className="flex items-center gap-3">
          <span className="w-36 shrink-0 text-xs font-semibold text-white">Free Cash</span>
          <div className="flex-1" />
          <span
            className={cn(
              "w-32 text-right text-sm font-bold tabular-nums",
              freeCashPositive ? "text-[#34d399]" : "text-[#ef4444]"
            )}
          >
            {formatCurrency(freeCash.toString())}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-white/[0.07] pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-white/50">Debt-to-Income Ratio</span>
          <span className={cn("text-xs font-semibold", dtiTextColor)}>
            {dtiRatio.toFixed(1)}% — {dtiLabel}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className={cn("h-full rounded-full transition-all duration-500", dtiBarColor)}
            style={{ width: `${Math.min(dtiRatio, 100)}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-white/30">
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
