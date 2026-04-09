"use client";

import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import type { Transaction } from "@/lib/hooks/useTransactions";

interface TransactionRowProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export function TransactionRow({ transaction, onDelete }: TransactionRowProps) {
  const isIncome = transaction.type === "INCOME";

  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-2xl group transition-colors">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={
            transaction.budgetCategory
              ? { backgroundColor: transaction.budgetCategory.color + "20", color: transaction.budgetCategory.color }
              : { backgroundColor: isIncome ? "#d1fae5" : "#f3f4f6", color: isIncome ? "#059669" : "#6b7280" }
          }
        >
          {transaction.budgetCategory
            ? transaction.budgetCategory.name.slice(0, 2).toUpperCase()
            : isIncome ? "+" : "−"}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{transaction.description}</p>
          <p className="text-xs text-gray-400">
            {formatDate(transaction.date)}
            {transaction.budgetCategory && <span> · {transaction.budgetCategory.name}</span>}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-bold ${isIncome ? "text-emerald-600" : "text-gray-800"}`}>
          {isIncome ? "+" : "−"}{formatCurrency(transaction.amount)}
        </span>
        <button
          onClick={() => onDelete(transaction.id)}
          className="w-7 h-7 rounded-xl hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
