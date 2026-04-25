"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Calculator, ChevronDown, ChevronUp, Info, Clock, DollarSign, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";

interface MinimumPaymentWarningProps {
  totalBalance: number;
  minimumPayment: number;
  interestRate: number; // Annual interest rate %
  className?: string;
}

export function MinimumPaymentWarning({
  totalBalance,
  minimumPayment,
  interestRate,
  className = ""
}: MinimumPaymentWarningProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [higherPayment, setHigherPayment] = useState(minimumPayment * 2);

  const calculations = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;

    const calculatePayoff = (payment: number) => {
      if (payment <= totalBalance * monthlyRate) return { months: Infinity, totalInterest: Infinity };

      let balance = totalBalance;
      let months = 0;
      let totalInterest = 0;

      while (balance > 0 && months < 600) {
        const interest = balance * monthlyRate;
        totalInterest += interest;
        balance = balance + interest - payment;
        if (balance < 0) balance = 0;
        months++;
      }

      return { months, totalInterest };
    };

    const minimumResult = calculatePayoff(minimumPayment);
    const higherResult = calculatePayoff(higherPayment);

    const savings = minimumResult.totalInterest - higherResult.totalInterest;
    const monthsSaved = minimumResult.months - higherResult.months;

    return {
      minimum: minimumResult,
      higher: higherResult,
      savings,
      monthsSaved,
      yearsMinimum: Math.floor(minimumResult.months / 12),
      yearsHigher: Math.floor(higherResult.months / 12),
    };
  }, [totalBalance, minimumPayment, interestRate, higherPayment]);

  if (totalBalance < 1000 || minimumPayment >= totalBalance) return null;

  const formatDuration = (months: number) => {
    if (months === Infinity) return "Never";
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} months`;
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} mo`;
  };

  return (
    <div className={`rounded-2xl border border-amber-500/30 bg-amber-500/8 p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-amber-300">
            Minimum Payment Trap
          </h3>
          <p className="text-sm text-amber-400/80 mt-1">
            Paying only the minimum ({formatCurrency(minimumPayment)}/month) on your {formatCurrency(totalBalance)} balance will cost you significantly more.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Quick Stats Row */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#0a0a0f] p-3 text-center border border-white/[0.07]">
          <Clock className="h-4 w-4 text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{formatDuration(calculations.minimum.months)}</p>
          <p className="text-xs text-white/50">to pay off</p>
        </div>
        <div className="rounded-xl bg-[#0a0a0f] p-3 text-center border border-white/[0.07]">
          <DollarSign className="h-4 w-4 text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-red-400">{formatCurrency(calculations.minimum.totalInterest)}</p>
          <p className="text-xs text-white/50">total interest</p>
        </div>
        <div className="rounded-xl bg-[#0a0a0f] p-3 text-center border border-white/[0.07]">
          <TrendingUp className="h-4 w-4 text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">
            {((calculations.minimum.totalInterest / totalBalance) * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-white/50">interest added</p>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 space-y-4 pt-4 border-t border-white/[0.07]">
          {/* Comparison Calculator */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4 text-amber-400" />
              <p className="text-sm font-semibold text-white">Compare payment options</p>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-white/50 whitespace-nowrap">If I pay:</span>
              <input
                type="range"
                min={minimumPayment}
                max={totalBalance * 0.2}
                step={100}
                value={higherPayment}
                onChange={(e) => setHigherPayment(Number(e.target.value))}
                className="flex-1 accent-[#b4f03a]"
              />
              <span className="text-sm font-semibold text-white w-28 text-right">
                {formatCurrency(higherPayment)}
              </span>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#0a0a0f] p-3 border border-red-500/30">
                <p className="text-xs font-medium text-red-400 mb-2">Current Minimum</p>
                <p className="text-lg font-bold text-white">{formatCurrency(minimumPayment)}</p>
                <div className="mt-2 space-y-1 text-xs">
                  <p className="text-white/50">Debt-free in: <span className="text-red-400 font-medium">{formatDuration(calculations.minimum.months)}</span></p>
                  <p className="text-white/50">Interest paid: <span className="text-red-400 font-medium">{formatCurrency(calculations.minimum.totalInterest)}</span></p>
                </div>
              </div>

              <div className="rounded-xl bg-[#0a0a0f] p-3 border border-emerald-500/30">
                <p className="text-xs font-medium text-emerald-400 mb-2">Higher Payment</p>
                <p className="text-lg font-bold text-white">{formatCurrency(higherPayment)}</p>
                <div className="mt-2 space-y-1 text-xs">
                  <p className="text-white/50">Debt-free in: <span className="text-emerald-400 font-medium">{formatDuration(calculations.higher.months)}</span></p>
                  <p className="text-white/50">Interest paid: <span className="text-emerald-400 font-medium">{formatCurrency(calculations.higher.totalInterest)}</span></p>
                </div>
              </div>
            </div>

            {/* Savings Highlight */}
            {calculations.savings > 0 && (
              <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                <p className="text-sm text-emerald-300">
                  Paying {formatCurrency(higherPayment)} saves you{" "}
                  <span className="font-bold text-emerald-200">{formatCurrency(calculations.savings)}</span>
                  {" "}in interest and gets you debt-free{" "}
                  <span className="font-bold text-emerald-200">{calculations.monthsSaved} months sooner</span>
                </p>
              </div>
            )}
          </div>

          {/* Educational Note */}
          <div className="flex items-start gap-2 rounded-lg bg-amber-500/8 border border-amber-500/20 p-3">
            <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/80">
              <strong className="text-amber-300">How the minimum payment trap works:</strong> When you pay only the minimum,
              most of your payment goes to interest, not principal. Your balance barely decreases,
              and you end up paying {((calculations.minimum.totalInterest / totalBalance) * 100).toFixed(0)}%
              more than you originally borrowed.
            </p>
          </div>
        </div>
      )}

      {/* Action Hint */}
      {!isExpanded && (
        <p className="mt-3 text-xs text-amber-400/70 text-center">
          Tap to see how much you could save by paying more
        </p>
      )}
    </div>
  );
}
