"use client";

import { Trash2, Pause, Play, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import type { RecurringTransaction } from "@/lib/hooks/useRecurringTransactions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  item: RecurringTransaction;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

const frequencyLabel: Record<string, string> = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export function RecurringTransactionRow({ item, onToggle, onDelete }: Props) {
  const isIncome = item.type === "INCOME";

  return (
    <div className={cn(
      "flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-2xl group transition-colors",
      !item.isActive && "opacity-50"
    )}>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={
            item.budgetCategory
              ? { backgroundColor: item.budgetCategory.color + "20", color: item.budgetCategory.color }
              : { backgroundColor: isIncome ? "#d1fae5" : "#f3f4f6", color: isIncome ? "#059669" : "#6b7280" }
          }
        >
          <RefreshCw size={14} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-800">{item.description}</p>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {frequencyLabel[item.frequency]}
            </Badge>
            {!item.isActive && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-gray-100 text-gray-400">
                Paused
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-400">
            Next: {formatDate(item.nextDueDate)}
            {item.budgetCategory && <span> · {item.budgetCategory.name}</span>}
            {item.endDate && <span> · Ends {formatDate(item.endDate)}</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${isIncome ? "text-emerald-600" : "text-gray-800"}`}>
          {isIncome ? "+" : "−"}{formatCurrency(item.amount)}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={() => onToggle(item.id, !item.isActive)}
            className="w-7 h-7 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600"
            title={item.isActive ? "Pause" : "Resume"}
          >
            {item.isActive ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="w-7 h-7 rounded-xl hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
