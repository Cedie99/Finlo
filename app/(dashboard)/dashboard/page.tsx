"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { useCashFlowPlan } from "@/lib/hooks/useCashFlowPlan";
import { CashFlowCard } from "@/components/dashboard/CashFlowCard";
import { CashFlowPlanner } from "@/components/dashboard/CashFlowPlanner";
import { PaydayCalendar } from "@/components/dashboard/PaydayCalendar";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { BudgetSummaryRow } from "@/components/dashboard/BudgetSummaryRow";
import { SafeToSpendHero } from "@/components/dashboard/SafeToSpendHero";
import { WhatIfSimulator } from "@/components/dashboard/WhatIfSimulator";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDailyCashDigest, usePaymentNotifications } from "@/lib/hooks/usePaymentNotifications";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { getMonthYear, formatMonthYear, getMonthYear as getMonth } from "@/lib/utils/dates";
import { addMonths, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSafeToSpend } from "@/lib/hooks/useSafeToSpend";
import { useUserPreferences } from "@/lib/hooks/useUserPreferences";

export default function DashboardPage() {
  const [monthYear, setMonthYear] = useState(getMonthYear());
  const safeToSpendTargetDate = monthYear === getMonthYear() ? undefined : `${monthYear}-01`;
  const { data, isLoading } = useDashboard(monthYear);
  const { data: cashFlow, isLoading: cashFlowLoading } = useCashFlowPlan(monthYear);
  const { data: safeToSpend } = useSafeToSpend(monthYear, safeToSpendTargetDate);
  const { data: preferences } = useUserPreferences();
  usePaymentNotifications(data);
  const dueTodayCount = data?.upcomingPayments.filter((p) => {
    const due = new Date(p.nextDueDate);
    const now = new Date();
    return (
      due.getFullYear() === now.getFullYear() &&
      due.getMonth() === now.getMonth() &&
      due.getDate() === now.getDate()
    );
  }).length ?? 0;
  useDailyCashDigest(safeToSpend, dueTodayCount, preferences?.enableDailyDigest ?? true);

  function prevMonth() {
    const d = new Date(monthYear + "-01");
    setMonthYear(getMonth(subMonths(d, 1)));
  }

  function nextMonth() {
    const d = new Date(monthYear + "-01");
    setMonthYear(getMonth(addMonths(d, 1)));
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your financial overview"
        action={
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft size={14} /></Button>
            {cashFlow ? (
              <PaydayCalendar
                inline
                monthYear={monthYear}
                paydays={cashFlow.calendar.paydays}
                dueDates={cashFlow.calendar.dueDates}
              />
            ) : (
              <span className="text-sm font-medium px-2">{formatMonthYear(monthYear)}</span>
            )}
            <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight size={14} /></Button>
          </div>
        }
      />

      {isLoading ? (
        <FullPageSpinner />
      ) : data ? (
        <div className="space-y-6">
          {safeToSpend ? <SafeToSpendHero data={safeToSpend} /> : null}
          <WhatIfSimulator monthYear={monthYear} targetDate={safeToSpendTargetDate} />

          <CashFlowCard income={data.totalIncome} expenses={data.totalExpenses} />

          {cashFlowLoading ? (
            <FullPageSpinner />
          ) : cashFlow ? (
            <>
              <CashFlowPlanner
                obligations={cashFlow.obligations}
                income={cashFlow.income}
                dtiRatio={cashFlow.dtiRatio}
              />
            </>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UpcomingPayments
              monthYear={monthYear}
              paydays={cashFlow?.calendar.paydays ?? []}
              dueDates={cashFlow?.calendar.dueDates ?? []}
            />
            <BudgetSummaryRow items={data.budgetSummary} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
