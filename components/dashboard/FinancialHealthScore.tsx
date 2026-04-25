"use client";

import { useState } from "react";
import { Heart, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useHealthScore } from "@/lib/hooks/useHealthScore";
import { cn } from "@/lib/utils";

const gradeConfig = {
  A: { color: "text-[#34d399]", ring: "border-[#34d399]/40", bg: "bg-[#34d399]/10", bar: "bg-[#34d399]", badge: "bg-[#34d399]/15 text-[#34d399]" },
  B: { color: "text-[#b4f03a]", ring: "border-[#b4f03a]/40", bg: "bg-[#b4f03a]/10", bar: "bg-[#b4f03a]", badge: "bg-[#b4f03a]/15 text-[#b4f03a]" },
  C: { color: "text-[#f59e0b]", ring: "border-[#f59e0b]/40", bg: "bg-[#f59e0b]/10", bar: "bg-[#f59e0b]", badge: "bg-[#f59e0b]/15 text-[#f59e0b]" },
  D: { color: "text-[#f97316]", ring: "border-[#f97316]/40", bg: "bg-[#f97316]/10", bar: "bg-[#f97316]", badge: "bg-[#f97316]/15 text-[#f97316]" },
  F: { color: "text-[#ef4444]", ring: "border-[#ef4444]/40", bg: "bg-[#ef4444]/10", bar: "bg-[#ef4444]", badge: "bg-[#ef4444]/15 text-[#ef4444]" },
};

const breakdownLabels = {
  dtiScore: "Debt-to-Income",
  bufferScore: "Cash Buffer",
  paymentScore: "Payment Consistency",
  loadScore: "Installment Load",
};

export function FinancialHealthScore() {
  const { data } = useHealthScore();
  const [expanded, setExpanded] = useState(false);

  if (!data) return null;

  const cfg = gradeConfig[data.grade];

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
            <Heart size={16} />
          </div>
          <span className="text-sm font-semibold text-white">Financial Health Score</span>
        </div>
        <button
          onClick={() => setExpanded((s) => !s)}
          className="inline-flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/50 transition hover:border-[#b4f03a]/30 hover:text-white"
        >
          {expanded ? "Hide" : "Details"}
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Score ring + bar */}
      <div className="mt-4 flex items-center gap-4">
        <div
          className={cn(
            "relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4",
            cfg.ring,
            cfg.bg
          )}
        >
          <div className="text-center">
            <p className={cn("text-xl font-black leading-none", cfg.color)}>{data.score}</p>
            <p className={cn("text-xs font-bold", cfg.color)}>{data.grade}</p>
          </div>
        </div>
        <div className="flex-1">
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className={cn("h-full rounded-full transition-all duration-700", cfg.bar)}
              style={{ width: `${data.score}%` }}
            />
          </div>
          <p className="text-xs leading-relaxed text-white/50">{data.insights[0]}</p>
        </div>
      </div>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(data.breakdown) as [keyof typeof breakdownLabels, number][]).map(
              ([key, value]) => (
                <div key={key} className="rounded-xl border border-white/[0.07] bg-[#0c0c10] px-3 py-2.5">
                  <p className="mb-1.5 text-[10px] text-white/30">{breakdownLabels[key]}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className={cn("h-full rounded-full", cfg.bar)}
                        style={{ width: `${(value / 25) * 100}%` }}
                      />
                    </div>
                    <span className={cn("text-xs font-bold", cfg.color)}>{value}/25</span>
                  </div>
                </div>
              )
            )}
          </div>

          {data.insights.length > 1 && (
            <div className="rounded-xl border border-white/[0.07] bg-[#0c0c10] p-3 space-y-2">
              {data.insights.slice(1).map((insight, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Info size={12} className="mt-0.5 shrink-0 text-[#b4f03a]" />
                  <p className="text-xs text-white/50">{insight}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
