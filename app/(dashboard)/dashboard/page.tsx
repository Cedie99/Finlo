"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { useCashFlowPlan } from "@/lib/hooks/useCashFlowPlan";
import { CashFlowPlanner } from "@/components/dashboard/CashFlowPlanner";
import { PaydayCalendar } from "@/components/dashboard/PaydayCalendar";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { BudgetSummaryRow } from "@/components/dashboard/BudgetSummaryRow";
import { CashOutlookCard } from "@/components/dashboard/SafeToSpendHero";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDailyCashDigest, usePaymentNotifications } from "@/lib/hooks/usePaymentNotifications";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { getMonthYear, formatMonthYear } from "@/lib/utils/dates";
import { addMonths, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useSafeToSpend } from "@/lib/hooks/useSafeToSpend";
import { useUserPreferences } from "@/lib/hooks/useUserPreferences";
import { AffordItChecker } from "@/components/dashboard/AffordItChecker";
import { OverlapDetector } from "@/components/dashboard/OverlapDetector";
import { FinancialHealthScore } from "@/components/dashboard/FinancialHealthScore";
import { CommitmentDensityCalendar } from "@/components/dashboard/CommitmentDensityCalendar";
import { PaycheckAllocationWizard } from "@/components/dashboard/PaycheckAllocationWizard";

export default function DashboardPage() {
  const [monthYear, setMonthYear] = useState(getMonthYear());
  const safeToSpendTargetDate = monthYear === getMonthYear() ? undefined : `${monthYear}-01`;
  const { data, isLoading } = useDashboard(monthYear);
  const { data: cashFlow, isLoading: cashFlowLoading } = useCashFlowPlan(monthYear);
  const { data: safeToSpend } = useSafeToSpend(monthYear, safeToSpendTargetDate);
  const { data: preferences } = useUserPreferences();
  usePaymentNotifications(data);

  const dueTodayCount =
    data?.upcomingPayments.filter((p) => {
      const due = new Date(p.nextDueDate);
      const now = new Date();
      return (
        due.getFullYear() === now.getFullYear() &&
        due.getMonth() === now.getMonth() &&
        due.getDate() === now.getDate()
      );
    }).length ?? 0;
  useDailyCashDigest(safeToSpend, dueTodayCount, preferences?.enableDailyDigest ?? true);

  const urgentPaymentsCount =
    data?.upcomingPayments.filter((p) => {
      const due = new Date(p.nextDueDate);
      const now = new Date();
      const diffMs = due.getTime() - now.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }).length ?? 0;

  function prevMonth() {
    const d = new Date(monthYear + "-01");
    setMonthYear(getMonthYear(subMonths(d, 1)));
  }

  function nextMonth() {
    const d = new Date(monthYear + "-01");
    setMonthYear(getMonthYear(addMonths(d, 1)));
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your financial overview"
        action={
          <div className="flex items-center gap-2">
            <Link href="/transactions">
              <Button variant="outline" size="sm" className="rounded-full gap-1.5 border-[#d7def4] bg-white/80 hover:bg-[#eff3ff] text-[#274887]">
                <Plus size={13} />
                Add Transaction
              </Button>
            </Link>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={prevMonth} className="border-[#d7def4] bg-white/80 hover:bg-[#eff3ff] text-[#274887]">
                <ChevronLeft size={14} />
              </Button>
              {cashFlow ? (
                <PaydayCalendar
                  inline
                  monthYear={monthYear}
                  paydays={cashFlow.calendar.paydays}
                  dueDates={cashFlow.calendar.dueDates}
                />
              ) : (
                <span className="text-sm font-medium px-2 text-[#41557f]">{formatMonthYear(monthYear)}</span>
              )}
              <Button variant="outline" size="icon" onClick={nextMonth} className="border-[#d7def4] bg-white/80 hover:bg-[#eff3ff] text-[#274887]">
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        }
      />

      {isLoading ? (
        <FullPageSpinner />
      ) : data ? (
        <div className="space-y-6">
          {/* QuickStats row */}
          <QuickStats
            safeToSpendToday={safeToSpend?.safeToSpendToday ?? "0"}
            availableBalance={safeToSpend?.availableBalance ?? "0"}
            confidence={safeToSpend?.confidence ?? "LOW"}
            totalIncome={data.totalIncome}
            totalExpenses={data.totalExpenses}
            urgentPaymentsCount={urgentPaymentsCount}
            monthYear={monthYear}
          />

          {/* Installment Overlap Detector */}
          <OverlapDetector />

          {/* Risk Banner */}
          {safeToSpend && safeToSpend.risks.length > 0 && (
            <div className="rounded-xl bg-amber-50/90 border border-amber-200 px-4 py-3 flex items-start gap-3">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {safeToSpend.risks.length} financial conflict
                  {safeToSpend.risks.length > 1 ? "s" : ""} detected
                </p>
                <ul className="mt-1 space-y-0.5">
                  {safeToSpend.risks.map((r, i) => (
                    <li key={i} className="text-xs text-amber-700">
                      {r.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 2-col grid: Upcoming Payments + Budget Overview */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
            <UpcomingPayments
              monthYear={monthYear}
              paydays={cashFlow?.calendar.paydays ?? []}
              dueDates={cashFlow?.calendar.dueDates ?? []}
            />
            <BudgetSummaryRow items={data.budgetSummary} />
          </div>

          {/* CashFlow Planner */}
          {cashFlowLoading ? (
            <FullPageSpinner />
          ) : cashFlow ? (
            <CashFlowPlanner
              obligations={cashFlow.obligations}
              income={cashFlow.income}
              dtiRatio={cashFlow.dtiRatio}
            />
          ) : null}

          {/* 14-day Cash Outlook */}
          {safeToSpend ? <CashOutlookCard data={safeToSpend} /> : null}

          {/* Financial Health Score */}
          <FinancialHealthScore />

          {/* Commitment Density Calendar */}
          <CommitmentDensityCalendar />

          {/* Paycheck Allocation Wizard */}
          <PaycheckAllocationWizard monthYear={monthYear} />

          {/* Simulator CTA */}
          <Link
            href="/simulator"
            className="block rounded-2xl border border-dashed border-[#a8bdfb] bg-linear-to-r from-[#edf2ff] to-[#f4f8ff] p-5 hover:from-[#e6eeff] hover:to-[#eef4ff] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#1e3570]">Stress test your finances</p>
                <p className="text-sm text-[#4863a0] mt-0.5">
                  See how salary delays, unexpected expenses, or income drops affect your cash flow.
                </p>
              </div>
              <ChevronRight className="text-[#4b68ad] shrink-0" />
            </div>
          </Link>
        </div>
      ) : null}

      {/* Afford It floating checker — always visible */}
      <AffordItChecker />
    </div>
  );
}
