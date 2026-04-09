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

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center">
          <PiggyBank size={16} className="text-violet-600" />
        </div>
        <h2 className="font-bold text-gray-900 text-base">Budget Overview</h2>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const pct = new Decimal(item.limitAmount).gt(0)
            ? new Decimal(item.spent).div(item.limitAmount).times(100).toNumber()
            : 0;
          const capped = Math.min(pct, 100);
          const barColor =
            pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#6366f1";

          return (
            <div key={item.categoryId}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.categoryColor }}
                  />
                  <span className="text-sm font-semibold text-gray-800">{item.categoryName}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">
                    {formatCurrency(item.spent)} / {formatCurrency(item.limitAmount)}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${capped}%`, backgroundColor: barColor }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{pct.toFixed(0)}% used</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
