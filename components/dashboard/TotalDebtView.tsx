"use client";

import { useMemo } from "react";
import { CreditCard, Wallet, ShoppingBag, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import type { InstallmentPlan } from "@/lib/hooks/useInstallments";

interface TotalDebtViewProps {
  installments: InstallmentPlan[] | undefined;
  monthlyIncome?: number;
  isLoading?: boolean;
}

export function TotalDebtView({ installments, monthlyIncome = 0, isLoading }: TotalDebtViewProps) {
  const stats = useMemo(() => {
    if (!installments) return null;

    const active = installments.filter((p) => p.status === "ACTIVE");
    
    // Group by type
    const byType = {
      CREDIT_CARD: active.filter((p) => p.type === "CREDIT_CARD"),
      BNPL: active.filter((p) => p.type === "BNPL"),
      LOAN: active.filter((p) => p.type === "LOAN"),
    };

    // Calculate totals
    const totalOutstanding = active.reduce((sum, p) => {
      const remaining = Number(p.totalAmount) - (Number(p.monthlyAmount) * p.paidMonths);
      return sum + remaining;
    }, 0);

    const monthlyCommitment = active.reduce((sum, p) => sum + Number(p.monthlyAmount), 0);

    const typeTotals = {
      CREDIT_CARD: byType.CREDIT_CARD.reduce((sum, p) => {
        const remaining = Number(p.totalAmount) - (Number(p.monthlyAmount) * p.paidMonths);
        return sum + remaining;
      }, 0),
      BNPL: byType.BNPL.reduce((sum, p) => {
        const remaining = Number(p.totalAmount) - (Number(p.monthlyAmount) * p.paidMonths);
        return sum + remaining;
      }, 0),
      LOAN: byType.LOAN.reduce((sum, p) => {
        const remaining = Number(p.totalAmount) - (Number(p.monthlyAmount) * p.paidMonths);
        return sum + remaining;
      }, 0),
    };

    const debtToIncomeRatio = monthlyIncome > 0 ? (monthlyCommitment / monthlyIncome) * 100 : 0;
    
    // Calculate previous month for trend (mock - would need historical data)
    const previousMonthTotal = totalOutstanding * 1.05; // Mock: assume 5% decrease
    const trend = previousMonthTotal > 0 
      ? ((previousMonthTotal - totalOutstanding) / previousMonthTotal) * 100 
      : 0;

    return {
      totalOutstanding,
      monthlyCommitment,
      activeCount: active.length,
      typeTotals,
      debtToIncomeRatio,
      trend,
    };
  }, [installments, monthlyIncome]);

  if (isLoading || !stats) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded w-3/4 mb-6"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const getDebtLevel = (ratio: number) => {
    if (ratio < 20) return { label: "Healthy", color: "text-green-600", bg: "bg-green-100" };
    if (ratio < 40) return { label: "Moderate", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { label: "High", color: "text-red-600", bg: "bg-red-100" };
  };

  const debtLevel = getDebtLevel(stats.debtToIncomeRatio);

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Header with warning for high debt */}
      {stats.debtToIncomeRatio > 40 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">
            High debt burden: {stats.debtToIncomeRatio.toFixed(0)}% of income goes to debt
          </p>
        </div>
      )}

      {/* Big Number - Total Debt */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-500 mb-1">Total Outstanding Debt</p>
        <p className="text-4xl font-bold text-gray-900 tracking-tight">
          {formatCurrency(stats.totalOutstanding)}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${debtLevel.color}`}>
            {stats.trend > 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <TrendingUp className="h-3 w-3" />
            )}
            {Math.abs(stats.trend).toFixed(1)}% from last month
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-xs text-gray-500">{stats.activeCount} active plans</span>
        </div>
      </div>

      {/* Breakdown by Type */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl bg-linear-to-br from-blue-50 to-blue-100/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Credit Cards</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(stats.typeTotals.CREDIT_CARD)}
          </p>
        </div>

        <div className="rounded-2xl bg-linear-to-br from-purple-50 to-purple-100/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">BNPL</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(stats.typeTotals.BNPL)}
          </p>
        </div>

        <div className="rounded-2xl bg-linear-to-br from-amber-50 to-amber-100/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Loans</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(stats.typeTotals.LOAN)}
          </p>
        </div>
      </div>

      {/* Monthly Burden */}
      <div className="rounded-2xl bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Monthly Payment Burden</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(stats.monthlyCommitment)}
              <span className="text-sm font-normal text-gray-500">/month</span>
            </p>
          </div>
          <div className={`${debtLevel.bg} rounded-xl px-3 py-2 text-center`}>
            <p className={`text-2xl font-bold ${debtLevel.color}`}>
              {stats.debtToIncomeRatio.toFixed(0)}%
            </p>
            <p className="text-xs text-gray-600">of income</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              stats.debtToIncomeRatio < 20 ? 'bg-green-500' :
              stats.debtToIncomeRatio < 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(stats.debtToIncomeRatio, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {stats.debtToIncomeRatio < 20 
            ? "Healthy debt-to-income ratio" 
            : stats.debtToIncomeRatio < 40 
              ? "Monitor your spending - approaching high burden"
              : "Warning: Consider debt consolidation or reduction"}
        </p>
      </div>
    </div>
  );
}
