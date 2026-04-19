"use client";

import { useState } from "react";
import { Heart, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useHealthScore } from "@/lib/hooks/useHealthScore";

const gradeConfig = {
  A: { color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-300", bar: "bg-emerald-500" },
  B: { color: "text-[#2f7f76]", bg: "bg-[#edf5f2]", ring: "ring-[#9bc7c0]", bar: "bg-[#edf5f2]0" },
  C: { color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-300", bar: "bg-amber-500" },
  D: { color: "text-orange-600", bg: "bg-orange-50", ring: "ring-orange-300", bar: "bg-orange-500" },
  F: { color: "text-red-600", bg: "bg-red-50", ring: "ring-red-300", bar: "bg-red-500" },
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

  const config = gradeConfig[data.grade];

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Heart size={15} className="text-rose-500" />
          Financial Health Score
        </div>
        <button
          onClick={() => setExpanded((s) => !s)}
          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition"
        >
          {expanded ? "Hide" : "Details"}
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Score ring + number */}
      <div className="flex items-center gap-5">
        <div
          className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full ring-4 ${config.ring} ${config.bg}`}
        >
          <div className="text-center">
            <p className={`text-2xl font-black ${config.color}`}>{data.score}</p>
            <p className={`text-xs font-bold ${config.color}`}>{data.grade}</p>
          </div>
        </div>

        <div className="flex-1">
          {/* Score bar */}
          <div className="h-2 rounded-full bg-gray-100 mb-3">
            <div
              className={`h-2 rounded-full ${config.bar} transition-all duration-700`}
              style={{ width: `${data.score}%` }}
            />
          </div>
          {/* Top insight */}
          <p className="text-xs text-gray-500 leading-relaxed">{data.insights[0]}</p>
        </div>
      </div>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {(
              Object.entries(data.breakdown) as [
                keyof typeof breakdownLabels,
                number,
              ][]
            ).map(([key, value]) => (
              <div
                key={key}
                className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
              >
                <p className="text-xs text-gray-400 mb-1">{breakdownLabels[key]}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-200">
                    <div
                      className={`h-1.5 rounded-full ${config.bar}`}
                      style={{ width: `${(value / 25) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{value}/25</span>
                </div>
              </div>
            ))}
          </div>

          {/* All insights */}
          {data.insights.length > 1 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
              {data.insights.slice(1).map((insight, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Info size={12} className="text-[#66a99f] shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600">{insight}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
