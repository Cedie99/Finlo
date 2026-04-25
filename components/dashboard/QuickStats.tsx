"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";

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
  const confidenceColor =
    confidence === "HIGH"
      ? "bg-[#34d399]/15 text-[#34d399]"
      : confidence === "MEDIUM"
      ? "bg-[#f59e0b]/15 text-[#f59e0b]"
      : "bg-[#ef4444]/15 text-[#ef4444]";

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {/* Safe to Spend */}
      <div className="rounded-2xl border border-[#b4f03a]/20 bg-[#b4f03a]/8 p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium text-white/50">Safe to Spend</p>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", confidenceColor)}>
            {confidence}
          </span>
        </div>
        <p className="font-heading text-xl font-bold text-[#b4f03a]">
          {formatCurrency(safeToSpendToday)}
        </p>
        <p className="mt-1 text-xs text-white/30">
          Balance {formatCurrency(availableBalance)}
        </p>
      </div>

      {/* Monthly Income */}
      <Link
        href="/transactions"
        className="group block rounded-2xl border border-white/[0.07] bg-[#111118] p-5 transition-colors hover:border-[#34d399]/30"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium text-white/50">Monthly Income</p>
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#34d399]/10 text-[#34d399]">
            <TrendingUp size={13} />
          </div>
        </div>
        <p className="font-heading text-xl font-bold text-[#34d399]">
          {formatCurrency(totalIncome)}
        </p>
        <p className="mt-1 text-xs text-white/30 transition-colors group-hover:text-[#34d399]">
          View transactions →
        </p>
      </Link>

      {/* Monthly Expenses */}
      <Link
        href="/transactions"
        className="group block rounded-2xl border border-white/[0.07] bg-[#111118] p-5 transition-colors hover:border-[#ef4444]/30"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium text-white/50">Monthly Expenses</p>
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#ef4444]/10 text-[#ef4444]">
            <TrendingDown size={13} />
          </div>
        </div>
        <p className="font-heading text-xl font-bold text-[#ef4444]">
          {formatCurrency(totalExpenses)}
        </p>
        <p className="mt-1 text-xs text-white/30 transition-colors group-hover:text-[#ef4444]">
          View transactions →
        </p>
      </Link>

      {/* Due Soon */}
      <Link
        href="/installments"
        className="group block rounded-2xl border border-white/[0.07] bg-[#111118] p-5 transition-colors hover:border-[#f59e0b]/30"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium text-white/50">Due Soon</p>
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-xl",
              urgentPaymentsCount > 0
                ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                : "bg-white/[0.04] text-white/30"
            )}
          >
            <Calendar size={13} />
          </div>
        </div>
        <p
          className={cn(
            "font-heading text-xl font-bold",
            urgentPaymentsCount > 0 ? "text-[#f59e0b]" : "text-white/30"
          )}
        >
          {urgentPaymentsCount}
        </p>
        <p className="mt-1 text-xs text-white/30 transition-colors group-hover:text-[#f59e0b]">
          {urgentPaymentsCount > 0
            ? `${urgentPaymentsCount} payment${urgentPaymentsCount > 1 ? "s" : ""} due in 7d`
            : "No urgent payments"}{" "}
          →
        </p>
      </Link>
    </div>
  );
}
