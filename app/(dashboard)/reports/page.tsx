"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MonthlySpendingChart } from "@/components/reports/MonthlySpendingChart";
import { CategoryPieChart } from "@/components/reports/CategoryPieChart";
import { CashFlowChart } from "@/components/reports/CashFlowChart";
import { InstallmentTimeline } from "@/components/reports/InstallmentTimeline";
import { PageHeader } from "@/components/shared/PageHeader";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { getMonthYear, formatMonthYear } from "@/lib/utils/dates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(getMonthYear());

  const { data, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const res = await fetch("/api/reports");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const selectedMonthData = data?.monthlyData?.find(
    (d: { monthYear: string }) => d.monthYear === selectedMonth
  );

  return (
    <div>
      <PageHeader title="Reports" description="Financial insights and trends" />

      {isLoading ? (
        <FullPageSpinner />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Row 1 — Income vs Expenses (2/3) + By Category (1/3) */}
          <div className="flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
            <h2 className="font-bold text-gray-900 mb-1">Income vs Expenses</h2>
            <p className="text-xs text-gray-400 mb-5">Last 6 months</p>
            <div className="min-h-[260px]">
              {data?.monthlyData && <CashFlowChart data={data.monthlyData} />}
            </div>
          </div>

          <div className="flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:col-span-1">
            <div className="flex items-start justify-between mb-1">
              <h2 className="font-bold text-gray-900">By Category</h2>
              <Select value={selectedMonth} onValueChange={(v) => v && setSelectedMonth(v)}>
                <SelectTrigger className="w-32 h-8 text-xs rounded-xl border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data?.monthlyData?.map((d: { monthYear: string }) => (
                    <SelectItem key={d.monthYear} value={d.monthYear}>
                      {formatMonthYear(d.monthYear)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-400 mb-5">Spending breakdown</p>
            {selectedMonthData && data?.categories && (
              <CategoryPieChart data={selectedMonthData.byCategory} categories={data.categories} />
            )}
          </div>

          {/* Row 2 — Monthly Spending (1/3) + Installment Timeline (2/3) */}
          <div className="flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:col-span-1">
            <h2 className="font-bold text-gray-900 mb-1">Monthly Spending</h2>
            <p className="text-xs text-gray-400 mb-5">Last 6 months</p>
            <div className="min-h-[260px]">
              {data?.monthlyData && <MonthlySpendingChart data={data.monthlyData} />}
            </div>
          </div>

          <div className="flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
            <h2 className="font-bold text-gray-900 mb-1">Installment Timeline</h2>
            <p className="text-xs text-gray-400 mb-5">All active plans</p>
            {data?.installmentPlans && <InstallmentTimeline plans={data.installmentPlans} />}
          </div>
        </div>
      )}
    </div>
  );
}
