import Link from "next/link";
import { PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import Decimal from "decimal.js";
import { cn } from "@/lib/utils";

interface BudgetItem {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  limitAmount: string;
  spent: string;
}

export function BudgetSummaryRow({ items }: { items: BudgetItem[] }) {
  if (items.length === 0) return null;

  const totals = items.reduce(
    (acc, item) => {
      acc.spent = acc.spent.plus(item.spent || "0");
      acc.limit = acc.limit.plus(item.limitAmount || "0");
      return acc;
    },
    { spent: new Decimal(0), limit: new Decimal(0) }
  );

  const totalPct = totals.limit.gt(0)
    ? totals.spent.div(totals.limit).times(100).toNumber()
    : 0;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b4f03a]/10 text-[#b4f03a]">
            <PiggyBank size={15} />
          </div>
          <h2 className="text-sm font-semibold text-white">Budget Overview</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-white/30">Total Used</p>
            <p className="text-sm font-bold text-white">{totalPct.toFixed(0)}%</p>
          </div>
          <Link
            href="/budget"
            className="text-xs font-semibold text-[#b4f03a] transition hover:text-[#ccff52]"
          >
            Manage →
          </Link>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-white/[0.07] bg-[#0c0c10] px-3 py-2.5">
        <p className="text-xs text-white/30">Spent vs budget</p>
        <p className="text-sm font-semibold text-white">
          {formatCurrency(totals.spent.toString())} / {formatCurrency(totals.limit.toString())}
        </p>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const pct = new Decimal(item.limitAmount || "0").gt(0)
            ? new Decimal(item.spent || "0")
                .div(item.limitAmount || "0")
                .times(100)
                .toNumber()
            : 0;
          const capped = Math.min(pct, 100);
          const remaining = new Decimal(item.limitAmount || "0").minus(item.spent || "0");
          const isOver = remaining.lt(0);
          const barColor =
            pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#b4f03a";

          return (
            <Link
              key={item.categoryId}
              href="/budget"
              className="block rounded-xl border border-white/[0.07] p-3 transition-colors hover:border-[#b4f03a]/30 hover:bg-white/[0.04]"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.categoryColor }}
                  />
                  <span className="text-xs font-semibold text-white">
                    {item.categoryName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30">
                    {formatCurrency(item.spent)} / {formatCurrency(item.limitAmount)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                      isOver
                        ? "bg-[#ef4444]/15 text-[#ef4444]"
                        : "bg-[#34d399]/15 text-[#34d399]"
                    )}
                  >
                    {isOver
                      ? `${formatCurrency(remaining.abs().toString())} over`
                      : `${formatCurrency(remaining.toString())} left`}
                  </span>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${capped}%`, backgroundColor: barColor }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
