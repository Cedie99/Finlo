"use client";

import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/currency";
import type { BudgetCategory } from "@/lib/hooks/useBudget";
import Decimal from "decimal.js";

interface CategoryCardProps {
  category: BudgetCategory;
  onSetLimit: (categoryId: string, current: string | null) => void;
  onDelete?: (id: string) => void;
}

export function CategoryCard({ category, onSetLimit, onDelete }: CategoryCardProps) {
  const spent = new Decimal(category.spent ?? 0);
  const limit = category.limit ? new Decimal(category.limit) : null;
  const pct = limit && limit.gt(0) ? spent.div(limit).times(100).toNumber() : 0;
  const barColor = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#6366f1";

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: category.color + "20" }}
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
          </div>
          <span className="font-semibold text-sm text-gray-800">{category.name}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onSetLimit(category.id, category.limit ?? null)}
            className="w-7 h-7 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            <Edit2 size={12} />
          </button>
          {!category.isDefault && onDelete && (
            <button
              onClick={() => onDelete(category.id)}
              className="w-7 h-7 rounded-xl hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="text-2xl font-bold text-gray-900 mb-1">
        {formatCurrency(category.spent ?? 0)}
      </div>

      {limit ? (
        <>
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>of {formatCurrency(category.limit!)}</span>
            <span className={`font-semibold ${pct >= 90 ? "text-red-500" : pct >= 70 ? "text-amber-500" : "text-indigo-600"}`}>
              {pct.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
            />
          </div>
        </>
      ) : (
        <button
          onClick={() => onSetLimit(category.id, null)}
          className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold transition-colors"
        >
          + Set budget limit
        </button>
      )}
    </div>
  );
}
