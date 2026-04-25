"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CommitmentDensityCalendar } from "@/components/dashboard/CommitmentDensityCalendar";
import { InstallmentTimeline } from "@/components/reports/InstallmentTimeline";
import { CashFlowChart } from "@/components/reports/CashFlowChart";
import { PageHeader } from "@/components/shared/PageHeader";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { TrendingUp } from "lucide-react";

export default function ForecastPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const res = await fetch("/api/reports");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forecast"
        description="See your financial commitments and cash flow ahead"
      />

      {isLoading ? (
        <FullPageSpinner />
      ) : (
        <>
          {/* Commitment Density — 12-month heatmap */}
          <CommitmentDensityCalendar />

          {/* Cash flow projection chart */}
          {data?.monthlyData && (
            <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b4f03a]/10">
                  <TrendingUp size={16} className="text-[#b4f03a]" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Income vs Expenses</h2>
                  <p className="text-xs text-white/50">Last 6 months</p>
                </div>
              </div>
              <div className="min-h-[260px]">
                <CashFlowChart data={data.monthlyData} />
              </div>
            </div>
          )}

          {/* Installment timeline */}
          {data?.installmentPlans && (
            <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-5">
              <div className="mb-4">
                <h2 className="font-semibold text-white">Installment Timeline</h2>
                <p className="text-xs text-white/50">All active plans across time</p>
              </div>
              <InstallmentTimeline plans={data.installmentPlans} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
