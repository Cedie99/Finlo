"use client";

import { DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";

interface TrueCostBreakdownProps {
  originalAmount: number;
  monthlyAmount: number;
  totalMonths: number;
  paidMonths?: number;
  interestRate?: number | null;
}

export function TrueCostBreakdown({
  originalAmount,
  monthlyAmount,
  totalMonths,
  paidMonths = 0,
  interestRate,
}: TrueCostBreakdownProps) {
  const totalPayments = monthlyAmount * totalMonths;
  const totalPaid = monthlyAmount * paidMonths;
  const remaining = totalPayments - totalPaid;
  const extra = totalPayments - originalAmount;
  const extraPct = originalAmount > 0 ? (extra / originalAmount) * 100 : 0;
  const isFree = extra <= 0.01;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10">
          <DollarSign size={16} className="text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">True Cost Breakdown</h3>
          <p className="text-xs text-white/50">What you actually pay in total</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-xl bg-[#0a0a0f] px-4 py-3">
          <span className="text-sm text-white/50">Original price</span>
          <span className="font-bold text-white">{formatCurrency(originalAmount)}</span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-[#0a0a0f] px-4 py-3">
          <span className="text-sm text-white/50">
            {totalMonths} × {formatCurrency(monthlyAmount)}/mo
          </span>
          <span className="font-bold text-white">{formatCurrency(totalPayments)}</span>
        </div>

        {paidMonths > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-emerald-300">Already paid</span>
              <span className="text-xs text-white/30">({paidMonths} months)</span>
            </div>
            <span className="font-bold text-emerald-300">{formatCurrency(totalPaid)}</span>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl bg-blue-500/5 border border-blue-500/20 px-4 py-3">
          <span className="text-sm text-blue-300">Remaining balance</span>
          <span className="font-bold text-blue-300">{formatCurrency(remaining)}</span>
        </div>

        {/* Extra cost */}
        {isFree ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3">
            <TrendingUp size={14} className="text-emerald-400 shrink-0" />
            <span className="text-sm text-emerald-300 font-medium">
              0% interest — you pay exactly what you borrowed
            </span>
          </div>
        ) : (
          <div
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3",
              extraPct > 10 ? "border-red-500/30 bg-red-500/5" : "border-amber-500/30 bg-amber-500/5"
            )}
          >
            <div className="flex items-center gap-2">
              <AlertCircle
                size={14}
                className={cn("shrink-0", extraPct > 10 ? "text-red-400" : "text-amber-400")}
              />
              <div>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    extraPct > 10 ? "text-red-300" : "text-amber-300"
                  )}
                >
                  Extra paid in fees/interest
                </span>
                {interestRate && interestRate > 0 && (
                  <p className="text-xs text-white/50">{interestRate}% effective rate</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "font-bold",
                  extraPct > 10 ? "text-red-300" : "text-amber-300"
                )}
              >
                +{formatCurrency(extra)}
              </p>
              <p className="text-xs text-white/50">+{extraPct.toFixed(1)}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
