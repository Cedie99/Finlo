"use client";

import { RefreshCw, Pause, Play, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import type { RecurringTransaction } from "@/lib/hooks/useRecurringTransactions";

interface Props {
  item: RecurringTransaction;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

const FREQ_LABEL: Record<string, string> = { WEEKLY: "Weekly", MONTHLY: "Monthly", YEARLY: "Yearly" };

export function RecurringTransactionRow({ item, onToggle, onDelete }: Props) {
  const isIncome = item.type === "INCOME";

  return (
    <div className={`flex items-center gap-4 px-4 py-3.5 transition-colors group ${!item.isActive ? "opacity-50" : "hover:bg-white/[0.02]"}`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isIncome ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
        <RefreshCw size={14} className={isIncome ? "text-emerald-400" : "text-red-400"} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white truncate">{item.description}</p>
          {!item.isActive && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/8 text-white/40 font-medium">Paused</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-white/45">
          <span>{FREQ_LABEL[item.frequency]}</span>
          <span className="text-white/20">·</span>
          <span>Next: {formatDate(item.nextDueDate)}</span>
          {item.budgetCategory && (
            <>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.budgetCategory.color }} />
                {item.budgetCategory.name}
              </span>
            </>
          )}
        </div>
      </div>

      <p className={`text-sm font-bold shrink-0 ${isIncome ? "text-emerald-400" : "text-white"}`}>
        {isIncome ? "+" : "-"}{formatCurrency(Number(item.amount))}
      </p>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onToggle(item.id, !item.isActive)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:bg-white/[0.06] hover:text-white/70 transition-colors">
          {item.isActive ? <Pause size={13} /> : <Play size={13} />}
        </button>
        <button onClick={() => onDelete(item.id)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
