"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import type { SafeToSpendData } from "@/lib/hooks/useSafeToSpend";
import { formatDate } from "@/lib/utils/dates";

interface CashOutlookCardProps {
  data: SafeToSpendData;
}

export function CashOutlookCard({ data }: CashOutlookCardProps) {
  const [showTimeline, setShowTimeline] = useState(false);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b4f03a]/10 text-[#b4f03a]">
            <Wallet size={16} />
          </div>
          <span className="text-sm font-semibold text-white">14-day cash outlook</span>
        </div>
        <button
          onClick={() => setShowTimeline((s) => !s)}
          className="inline-flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/50 transition-colors hover:border-[#b4f03a]/30 hover:text-white"
          type="button"
        >
          {showTimeline ? "Hide" : "Show"}
          {showTimeline ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {showTimeline && (
        <div className="mt-4 max-h-64 space-y-1.5 overflow-auto pr-1">
          {data.forecast.timeline.map((day) => (
            <div
              key={day.date}
              className="grid grid-cols-[110px_1fr] items-center gap-2 rounded-xl border border-white/[0.07] px-3 py-2 text-xs"
            >
              <div className="font-medium text-white/50">{formatDate(day.date)}</div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[#34d399]">+{formatCurrency(day.inflow)}</span>
                <span className="text-[#ef4444]">-{formatCurrency(day.outflow)}</span>
                <span className="font-semibold text-[#b4f03a]">
                  {formatCurrency(day.projectedBalance)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
