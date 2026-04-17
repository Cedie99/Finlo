"use client";

import { useState } from "react";
import { Zap, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/dates";
import { useOverlapDetector } from "@/lib/hooks/useOverlapDetector";

export function OverlapDetector() {
  const { data } = useOverlapDetector();
  const [expanded, setExpanded] = useState(false);

  if (!data || data.crunchMonths.length === 0) return null;

  const worst = data.crunchMonths.reduce((a, b) =>
    b.installments.length > a.installments.length ? b : a
  );

  return (
    <div
      className={`rounded-2xl border p-4 ${
        worst.severity === "CRITICAL"
          ? "bg-red-50 border-red-200"
          : "bg-amber-50 border-amber-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 ${
            worst.severity === "CRITICAL" ? "bg-red-100" : "bg-amber-100"
          }`}
        >
          <Zap
            size={15}
            className={worst.severity === "CRITICAL" ? "text-red-600" : "text-amber-600"}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm font-semibold ${
                  worst.severity === "CRITICAL" ? "text-red-800" : "text-amber-800"
                }`}
              >
                {data.crunchMonths.length} crunch month
                {data.crunchMonths.length > 1 ? "s" : ""} detected
              </p>
              <p
                className={`text-xs mt-0.5 ${
                  worst.severity === "CRITICAL" ? "text-red-600" : "text-amber-600"
                }`}
              >
                {worst.installments.length} installments collide in {worst.label} —{" "}
                {formatCurrency(worst.totalAmount)} due
              </p>
            </div>
            <button
              onClick={() => setExpanded((s) => !s)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                worst.severity === "CRITICAL"
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-amber-100 text-amber-700 hover:bg-amber-200"
              }`}
            >
              {expanded ? "Hide" : "Details"}
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {expanded && (
            <div className="mt-3 space-y-3">
              {data.crunchMonths.map((cm) => (
                <div key={cm.monthYear} className="rounded-xl bg-white/70 p-3 border border-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-800">{cm.label}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        cm.severity === "CRITICAL"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {cm.installments.length} plans · {formatCurrency(cm.totalAmount)}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {cm.installments.map((inst, i) => (
                      <li key={i} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 truncate max-w-[60%]">{inst.name}</span>
                        <span className="font-medium text-gray-800">
                          {formatCurrency(inst.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {data.safestMonth && (
                <p className="text-xs text-emerald-700 font-medium">
                  Safest upcoming month: {formatMonthYear(data.safestMonth)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
