"use client";

import { ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import type { Transaction } from "@/lib/hooks/useTransactions";

interface Props {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export function TransactionRow({ transaction, onDelete }: Props) {
  const isIncome = transaction.type === "INCOME";
  const category = transaction.budgetCategory;

  return (
    <div className="flex items-center gap-4 px-4 py-3.5 hover:bg-white/[0.02] transition-colors group">
      {/* Icon */}
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
        isIncome ? "bg-emerald-500/10" : "bg-red-500/10"
      }`}>
        {isIncome
          ? <ArrowUpRight size={16} className="text-emerald-400" />
          : <ArrowDownLeft size={16} className="text-red-400" />}
      </div>

      {/* Description + category */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{transaction.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-white/45">{formatDate(transaction.date)}</span>
          {category && (
            <>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1 text-xs text-white/45">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: category.color }} />
                {category.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <p className={`text-sm font-bold shrink-0 ${isIncome ? "text-emerald-400" : "text-white"}`}>
        {isIncome ? "+" : "-"}{formatCurrency(Number(transaction.amount))}
      </p>

      {/* Delete */}
      <button
        onClick={() => onDelete(transaction.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-white/25 hover:text-red-400 ml-1"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
