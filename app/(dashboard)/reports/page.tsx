"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MonthlySpendingChart } from "@/components/reports/MonthlySpendingChart";
import { CategoryPieChart } from "@/components/reports/CategoryPieChart";
import { CashFlowChart } from "@/components/reports/CashFlowChart";
import { InstallmentTimeline } from "@/components/reports/InstallmentTimeline";
import { PageHeader } from "@/components/shared/PageHeader";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <Tabs defaultValue="cashflow">
          <TabsList className="mb-5 bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
            {["cashflow", "spending", "categories", "timeline"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-xl text-sm capitalize data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                {tab === "cashflow" ? "Cash Flow" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="cashflow">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-5">Income vs Expenses (Last 6 Months)</h2>
              {data?.monthlyData && <CashFlowChart data={data.monthlyData} />}
            </div>
          </TabsContent>

          <TabsContent value="spending">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-5">Monthly Spending (Last 6 Months)</h2>
              {data?.monthlyData && <MonthlySpendingChart data={data.monthlyData} />}
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900">Spending by Category</h2>
                <Select value={selectedMonth} onValueChange={(v) => v && setSelectedMonth(v)}>
                  <SelectTrigger className="w-36 h-9 text-xs rounded-xl border-gray-200">
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
              {selectedMonthData && data?.categories && (
                <CategoryPieChart data={selectedMonthData.byCategory} categories={data.categories} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-5">Installment Plan Timeline</h2>
              {data?.installmentPlans && <InstallmentTimeline plans={data.installmentPlans} />}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
