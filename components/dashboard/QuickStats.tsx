"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

interface QuickStatsProps {
  safeToSpendToday: string;
  availableBalance: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  totalIncome: string;
  totalExpenses: string;
  urgentPaymentsCount: number;
  monthYear: string;
}

export function QuickStats({
  safeToSpendToday,
  availableBalance,
  confidence,
  totalIncome,
  totalExpenses,
  urgentPaymentsCount,
}: QuickStatsProps) {
  const confidenceBg =
    confidence === "HIGH"
      ? "bg-emerald-100 text-emerald-700"
      : confidence === "MEDIUM"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Safe to Spend */}
      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-600 via-indigo-600 to-sky-600 p-5 text-white shadow-sm shadow-indigo-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-indigo-100">Safe to Spend</p>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${confidenceBg}`}>
            {confidence}
          </span>
        </div>
        <p className="text-2xl font-bold">{formatCurrency(safeToSpendToday)}</p>
        <p className="mt-1 text-xs text-indigo-100">Available {formatCurrency(availableBalance)}</p>
      </div>

      {/* Monthly Income */}
      <Link
        href="/transactions"
        className="block group rounded-3xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-500">Monthly Income</p>
          <div className="w-8 h-8 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <TrendingUp size={15} className="text-emerald-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
        <p className="mt-1 text-xs text-gray-400 group-hover:text-emerald-500 transition-colors">
          View transactions →
        </p>
      </Link>

      {/* Monthly Expenses */}
      <Link
        href="/transactions"
        className="block group rounded-3xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-500">Monthly Expenses</p>
          <div className="w-8 h-8 rounded-2xl bg-red-100 flex items-center justify-center">
            <TrendingDown size={15} className="text-red-500" />
          </div>
        </div>
        <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExpenses)}</p>
        <p className="mt-1 text-xs text-gray-400 group-hover:text-red-400 transition-colors">
          View transactions →
        </p>
      </Link>

      {/* Due Soon */}
      <Link
        href="/installments"
        className="block group rounded-3xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-500">Due Soon</p>
          <div
            className={`w-8 h-8 rounded-2xl flex items-center justify-center ${
              urgentPaymentsCount > 0 ? "bg-amber-100" : "bg-gray-100"
            }`}
          >
            <Calendar
              size={15}
              className={urgentPaymentsCount > 0 ? "text-amber-600" : "text-gray-400"}
            />
          </div>
        </div>
        <p
          className={`text-2xl font-bold ${
            urgentPaymentsCount > 0 ? "text-amber-600" : "text-gray-400"
          }`}
        >
          {urgentPaymentsCount}
        </p>
        <p className="mt-1 text-xs text-gray-400 group-hover:text-amber-500 transition-colors">
          {urgentPaymentsCount > 0
            ? `${urgentPaymentsCount} payment${urgentPaymentsCount > 1 ? "s" : ""} due in 7 days`
            : "No urgent payments"}{" "}
          →
        </p>
      </Link>
    </div>
  );
}
