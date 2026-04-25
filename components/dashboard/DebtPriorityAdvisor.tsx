"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  AlertCircle,
  TrendingDown,
  Clock,
  Trophy,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import type { PriorityItem } from "@/app/api/dashboard/debt-priority/route";

function useDebtPriority() {
  return useQuery<{ items: PriorityItem[] }>({
    queryKey: ["debt-priority"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/debt-priority");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

function getRankIcon(item: PriorityItem) {
  if (item.isOverdue) return <AlertCircle size={14} className="text-red-400" />;
  if (item.interestRate && item.interestRate > 0) return <TrendingDown size={14} className="text-amber-400" />;
  return <Clock size={14} className="text-blue-400" />;
}

function getRankBg(item: PriorityItem, rank: number) {
  if (item.isOverdue) return "border-red-500/30 bg-red-500/5";
  if (rank === 1) return "border-[#b4f03a]/30 bg-[#b4f03a]/5";
  return "border-white/[0.07] bg-[#111118]";
}

export function DebtPriorityAdvisor() {
  const { data, isLoading } = useDebtPriority();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b4f03a]/10">
            <Trophy size={16} className="text-[#b4f03a]" />
          </div>
          <h2 className="font-semibold text-white">Debt Priority Advisor</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-white/50" />
        </div>
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b4f03a]/10">
          <Trophy size={16} className="text-[#b4f03a]" />
        </div>
        <div>
          <h2 className="font-semibold text-white">Debt Priority Advisor</h2>
          <p className="text-xs text-white/50">Pay these first to save the most</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-sm text-white/30">
          No active debts to prioritize.
        </div>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 6).map((item) => (
            <Link key={item.id} href={item.href}>
              <div
                className={cn(
                  "group flex items-center gap-3 rounded-xl border px-3 py-3 transition-all hover:border-[#b4f03a]/40",
                  getRankBg(item, item.rank)
                )}
              >
                {/* Rank badge */}
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    item.rank === 1
                      ? "bg-[#b4f03a]/20 text-[#b4f03a]"
                      : item.isOverdue
                      ? "bg-red-500/20 text-red-400"
                      : "bg-white/[0.04] text-white/50"
                  )}
                >
                  #{item.rank}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-white">
                      {item.name}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        item.planType === "CREDIT_CARD"
                          ? "bg-blue-500/20 text-blue-300"
                          : item.planType === "BNPL"
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      )}
                    >
                      {item.planType}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-white/50">
                    {getRankIcon(item)}
                    <span>{item.reason}</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-white">
                    {formatCurrency(item.amount)}
                    <span className="text-xs font-normal text-white/30">/mo</span>
                  </p>
                  <p className="text-xs text-white/30">
                    {formatCurrency(item.balance)} left
                  </p>
                </div>

                <ArrowRight
                  size={14}
                  className="shrink-0 text-white/30 transition-colors group-hover:text-[#b4f03a]"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
