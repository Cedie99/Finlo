"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { useCommitmentDensity } from "@/lib/hooks/useCommitmentDensity";
import type { CommitmentMonth } from "@/lib/hooks/useCommitmentDensity";
import { cn } from "@/lib/utils";

const densityConfig = {
  LOW: {
    cell: "bg-[#34d399]/12 border-[#34d399]/20",
    bar: "bg-[#34d399]",
    badge: "bg-[#34d399]/15 text-[#34d399]",
    text: "text-[#34d399]",
    label: "Low",
  },
  MEDIUM: {
    cell: "bg-[#f59e0b]/12 border-[#f59e0b]/20",
    bar: "bg-[#f59e0b]",
    badge: "bg-[#f59e0b]/15 text-[#f59e0b]",
    text: "text-[#f59e0b]",
    label: "Medium",
  },
  HIGH: {
    cell: "bg-[#f97316]/12 border-[#f97316]/20",
    bar: "bg-[#f97316]",
    badge: "bg-[#f97316]/15 text-[#f97316]",
    text: "text-[#f97316]",
    label: "High",
  },
  CRITICAL: {
    cell: "bg-[#ef4444]/12 border-[#ef4444]/20",
    bar: "bg-[#ef4444]",
    badge: "bg-[#ef4444]/15 text-[#ef4444]",
    text: "text-[#ef4444]",
    label: "Critical",
  },
};

function MonthCell({ month }: { month: CommitmentMonth }) {
  const cfg = densityConfig[month.density];
  const pct = Math.round(month.commitmentRatio * 100);

  return (
    <div
      className={cn("rounded-xl border p-2 transition-all", cfg.cell)}
      title={`${month.label}: ${pct}% committed`}
    >
      <p className="truncate text-[10px] font-semibold text-white">
        {month.label.split(" ")[0]}
      </p>
      <p className="text-[9px] text-white/30">{month.label.split(" ")[1]}</p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className={cn("h-full rounded-full transition-all", cfg.bar)}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <p className={cn("mt-1 text-[10px] font-bold", cfg.text)}>{pct}%</p>
    </div>
  );
}

export function CommitmentDensityCalendar() {
  const { data, isLoading } = useCommitmentDensity();
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<CommitmentMonth | null>(null);

  if (isLoading || !data) return null;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b4f03a]/10 text-[#b4f03a]">
            <CalendarDays size={16} />
          </div>
          <span className="text-sm font-semibold text-white">
            Commitment Density — 12 Months
          </span>
        </div>
        <button
          onClick={() => setExpanded((s) => !s)}
          className="inline-flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.07] px-3 py-1.5 text-xs font-semibold text-white/50 transition hover:border-[#b4f03a]/30 hover:text-white"
        >
          {expanded ? "Collapse" : "Expand"}
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4">
          {/* Legend */}
          <div className="mb-3 flex flex-wrap items-center gap-3">
            {Object.entries(densityConfig).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={cn("h-2 w-2 rounded-full", cfg.bar)} />
                <span className="text-[10px] text-white/50">{cfg.label}</span>
              </div>
            ))}
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-12">
            {data.months.map((month) => (
              <button
                key={month.monthYear}
                onClick={() =>
                  setSelected(selected?.monthYear === month.monthYear ? null : month)
                }
                className="text-left"
              >
                <MonthCell month={month} />
              </button>
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="mt-4 rounded-xl border border-white/[0.07] bg-[#0c0c10] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{selected.label}</p>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-bold",
                    densityConfig[selected.density].badge
                  )}
                >
                  {densityConfig[selected.density].label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "Projected Income", value: formatCurrency(selected.totalIncome), color: "text-[#34d399]" },
                  { label: "Total Obligations", value: formatCurrency(selected.totalObligations), color: "text-white" },
                  {
                    label: "Installments",
                    value: `${formatCurrency(selected.details.installmentTotal)} (${selected.details.installmentCount} plans)`,
                    color: "text-[#b4f03a]",
                  },
                  { label: "Recurring Bills", value: formatCurrency(selected.details.recurringTotal), color: "text-[#f59e0b]" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/[0.07] bg-[#111118] px-3 py-2">
                    <p className="mb-0.5 text-white/30">{item.label}</p>
                    <p className={cn("font-bold", item.color)}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
