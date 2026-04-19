"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { useCommitmentDensity } from "@/lib/hooks/useCommitmentDensity";
import type { CommitmentMonth } from "@/lib/hooks/useCommitmentDensity";

const densityConfig = {
  LOW: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    bar: "bg-emerald-400",
    border: "border-emerald-200",
    label: "Low",
  },
  MEDIUM: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    bar: "bg-amber-400",
    border: "border-amber-200",
    label: "Medium",
  },
  HIGH: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    bar: "bg-orange-400",
    border: "border-orange-200",
    label: "High",
  },
  CRITICAL: {
    bg: "bg-red-100",
    text: "text-red-700",
    bar: "bg-red-500",
    border: "border-red-200",
    label: "Critical",
  },
};

function MonthCell({ month }: { month: CommitmentMonth }) {
  const config = densityConfig[month.density];
  const pct = Math.round(month.commitmentRatio * 100);

  return (
    <div
      className={`rounded-2xl border p-3 ${config.border} ${config.bg} transition-all`}
      title={`${month.label}: ${pct}% committed`}
    >
      <p className="text-xs font-semibold text-gray-700 truncate">{month.label.split(" ")[0]}</p>
      <p className="text-xs text-gray-400">{month.label.split(" ")[1]}</p>
      <div className="mt-2 h-1.5 rounded-full bg-white/60">
        <div
          className={`h-1.5 rounded-full ${config.bar} transition-all`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <p className={`mt-1.5 text-xs font-bold ${config.text}`}>{pct}%</p>
      <p className={`text-xs font-medium ${config.text}`}>{config.label}</p>
    </div>
  );
}

export function CommitmentDensityCalendar() {
  const { data, isLoading } = useCommitmentDensity();
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<CommitmentMonth | null>(null);

  if (isLoading) return null;
  if (!data) return null;

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <CalendarDays size={15} className="text-[#2b7d74]" />
          Commitment Density — Next 12 Months
        </div>
        <button
          onClick={() => setExpanded((s) => !s)}
          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition"
        >
          {expanded ? "Collapse" : "Expand"}
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {Object.entries(densityConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${cfg.bar}`} />
            <span className="text-xs text-gray-500">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
        {data.months.map((month) => (
          <button
            key={month.monthYear}
            onClick={() => setSelected(selected?.monthYear === month.monthYear ? null : month)}
            className="text-left"
          >
            <MonthCell month={month} />
          </button>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-800 text-sm">{selected.label}</p>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                densityConfig[selected.density].bg
              } ${densityConfig[selected.density].text}`}
            >
              {densityConfig[selected.density].label}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-white px-3 py-2 border border-gray-100">
              <p className="text-gray-400 mb-0.5">Projected Income</p>
              <p className="font-bold text-emerald-600">{formatCurrency(selected.totalIncome)}</p>
            </div>
            <div className="rounded-xl bg-white px-3 py-2 border border-gray-100">
              <p className="text-gray-400 mb-0.5">Total Obligations</p>
              <p className="font-bold text-gray-800">{formatCurrency(selected.totalObligations)}</p>
            </div>
            <div className="rounded-xl bg-white px-3 py-2 border border-gray-100">
              <p className="text-gray-400 mb-0.5">Installments</p>
              <p className="font-bold text-[#2f7f76]">
                {formatCurrency(selected.details.installmentTotal)}
                <span className="font-normal text-gray-400 ml-1">
                  ({selected.details.installmentCount} plans)
                </span>
              </p>
            </div>
            <div className="rounded-xl bg-white px-3 py-2 border border-gray-100">
              <p className="text-gray-400 mb-0.5">Recurring Bills</p>
              <p className="font-bold text-amber-600">
                {formatCurrency(selected.details.recurringTotal)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
