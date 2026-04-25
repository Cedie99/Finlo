"use client";

import { useState } from "react";
import { Zap, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/dates";
import { useOverlapDetector } from "@/lib/hooks/useOverlapDetector";
import { cn } from "@/lib/utils";

export function OverlapDetector() {
  const { data } = useOverlapDetector();
  const [expanded, setExpanded] = useState(false);

  if (!data || data.crunchMonths.length === 0) return null;

  const worst = data.crunchMonths.reduce((a, b) =>
    b.installments.length > a.installments.length ? b : a
  );

  const isCritical = worst.severity === "CRITICAL";
  const accent = isCritical ? "#ef4444" : "#f59e0b";
  const accentBg = isCritical ? "bg-[#ef4444]/8 border-[#ef4444]/20" : "bg-[#f59e0b]/8 border-[#f59e0b]/20";
  const accentIconBg = isCritical ? "bg-[#ef4444]/12 text-[#ef4444]" : "bg-[#f59e0b]/12 text-[#f59e0b]";
  const accentText = isCritical ? "text-[#ef4444]" : "text-[#f59e0b]";
  const accentMuted = isCritical ? "text-[#f47a7a]" : "text-[#d4a853]";
  const accentBtn = isCritical
    ? "border-[#ef4444]/25 bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20"
    : "border-[#f59e0b]/25 bg-[#f59e0b]/10 text-[#f59e0b] hover:bg-[#f59e0b]/20";

  return (
    <div className={cn("rounded-2xl border p-5", accentBg)}>
      <div className="flex items-start gap-4">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", accentIconBg)}>
          <Zap size={17} style={{ color: accent }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={cn("text-sm font-semibold", accentText)}>
                {data.crunchMonths.length} crunch month
                {data.crunchMonths.length > 1 ? "s" : ""} detected
              </p>
              <p className={cn("mt-0.5 text-xs", accentMuted)}>
                {worst.installments.length} installments collide in {worst.label} —{" "}
                {formatCurrency(worst.totalAmount)} due
              </p>
            </div>
            <button
              onClick={() => setExpanded((s) => !s)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                accentBtn
              )}
            >
              {expanded ? "Hide" : "Details"}
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {expanded && (
            <div className="mt-4 space-y-3">
              {data.crunchMonths.map((cm) => (
                <div key={cm.monthYear} className="rounded-xl border border-white/[0.07] bg-[#0c0c10] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-white">{cm.label}</p>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        cm.severity === "CRITICAL"
                          ? "bg-[#ef4444]/15 text-[#ef4444]"
                          : "bg-[#f59e0b]/15 text-[#f59e0b]"
                      )}
                    >
                      {cm.installments.length} plans · {formatCurrency(cm.totalAmount)}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {cm.installments.map((inst, i) => (
                      <li key={i} className="flex items-center justify-between text-xs">
                        <span className="max-w-[60%] truncate text-white/50">{inst.name}</span>
                        <span className="font-medium text-white">{formatCurrency(inst.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {data.safestMonth && (
                <p className="text-xs font-medium text-[#34d399]">
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
