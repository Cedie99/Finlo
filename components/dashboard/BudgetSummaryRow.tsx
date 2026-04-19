import Link from "next/link";
import { PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import Decimal from "decimal.js";

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
    <div className="h-fit bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#edf5f2] rounded-xl flex items-center justify-center">
            <PiggyBank size={16} className="text-[#216f67]" />
          </div>
          <h2 className="font-bold text-gray-900 text-base">Budget Overview</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">Total Used</p>
            <p className="text-sm font-bold text-gray-800">{totalPct.toFixed(0)}%</p>
          </div>
          <Link
            href="/budget"
            className="text-xs font-semibold text-[#2f7f76] hover:text-[#266a63] transition-colors"
          >
            Manage →
          </Link>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2.5">
        <p className="text-xs text-gray-500">Spent vs budget</p>
        <p className="text-sm font-semibold text-gray-800">
          {formatCurrency(totals.spent.toString())} / {formatCurrency(totals.limit.toString())}
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const pct = new Decimal(item.limitAmount || "0").gt(0)
            ? new Decimal(item.spent || "0").div(item.limitAmount || "0").times(100).toNumber()
            : 0;
          const capped = Math.min(pct, 100);
          const remaining = new Decimal(item.limitAmount || "0").minus(item.spent || "0");
          const isOver = remaining.lt(0);
          const barColor =
            pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#2f7f76";

          return (
            <Link key={item.categoryId} href="/budget" className="block rounded-2xl border border-gray-100 p-3.5 hover:border-[#d1e3df] hover:bg-[#edf5f2]/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.categoryColor }}
                  />
                  <span className="text-sm font-semibold text-gray-800">{item.categoryName}</span>
                </div>
                <div className="text-right leading-tight">
                  <span className="text-xs text-gray-500">
                    {formatCurrency(item.spent)} / {formatCurrency(item.limitAmount)}
                  </span>
                </div>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${capped}%`, backgroundColor: barColor }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-gray-500">{pct.toFixed(0)}% used</p>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isOver
                      ? "bg-red-100 text-red-600"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {isOver
                    ? `${formatCurrency(remaining.abs().toString())} over`
                    : `${formatCurrency(remaining.toString())} left`}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
