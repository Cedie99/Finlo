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
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Wallet size={15} className="text-[#2b7d74]" />
          14-day cash outlook
        </div>
        <button
          onClick={() => setShowTimeline((s) => !s)}
          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-200"
          type="button"
        >
          {showTimeline ? "Hide" : "Show"}
          {showTimeline ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {showTimeline && (
        <div className="mt-4 max-h-64 space-y-2 overflow-auto pr-1">
          {data.forecast.timeline.map((day) => (
            <div
              key={day.date}
              className="grid grid-cols-[110px_1fr] items-center gap-2 rounded-xl border border-gray-100 px-3 py-2 text-xs"
            >
              <div className="font-medium text-gray-600">{formatDate(day.date)}</div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-emerald-600">+{formatCurrency(day.inflow)}</span>
                <span className="text-red-500">-{formatCurrency(day.outflow)}</span>
                <span className="font-semibold text-[#2f7f76]">
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
