"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, ShieldCheck, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";
import type { SafeToSpendData } from "@/lib/hooks/useSafeToSpend";
import { formatDate } from "@/lib/utils/dates";

interface SafeToSpendHeroProps {
  data: SafeToSpendData;
}

export function SafeToSpendHero({ data }: SafeToSpendHeroProps) {
  const [showTimeline, setShowTimeline] = useState(false);

  const confidenceTone =
    data.confidence === "HIGH"
      ? "bg-emerald-100 text-emerald-700"
      : data.confidence === "MEDIUM"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  return (
    <section className="rounded-3xl border border-indigo-100 bg-linear-to-br from-indigo-600 via-indigo-600 to-sky-600 p-6 text-white shadow-lg shadow-indigo-200">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-indigo-100">Safe to Spend Today</p>
          <h2 className="mt-1 text-3xl font-bold">{formatCurrency(data.safeToSpendToday)}</h2>
          <p className="mt-1 text-sm text-indigo-100">
            Available {formatCurrency(data.availableBalance)} • Buffer {formatCurrency(data.bufferAmount)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className={confidenceTone}>Confidence: {data.confidence}</Badge>
          <button
            onClick={() => setShowTimeline((s) => !s)}
            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25"
            type="button"
          >
            {showTimeline ? "Hide 14-day view" : "View 14-day outlook"}
            {showTimeline ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {data.risks.length > 0 ? (
        <div className="mt-4 rounded-2xl bg-white/15 p-3 text-sm">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <AlertTriangle size={14} />
            Heads up
          </div>
          <p className="text-indigo-50">{data.risks[0].message}</p>
        </div>
      ) : (
        <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 text-sm font-medium">
          <ShieldCheck size={14} /> No immediate payment conflicts detected
        </div>
      )}

      {showTimeline ? (
        <div className="mt-5 rounded-2xl bg-white p-3 text-gray-900">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Wallet size={15} />
            14-day cash outlook
          </div>
          <div className="max-h-56 space-y-2 overflow-auto pr-1">
            {data.forecast.timeline.map((day) => (
              <div key={day.date} className="grid grid-cols-[110px_1fr] items-center gap-2 rounded-xl border border-gray-100 px-3 py-2 text-xs">
                <div className="font-medium text-gray-600">{formatDate(day.date)}</div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-emerald-600">+{formatCurrency(day.inflow)}</span>
                  <span className="text-red-500">-{formatCurrency(day.outflow)}</span>
                  <span className="font-semibold text-indigo-600">{formatCurrency(day.projectedBalance)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
