"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Coins, X, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/dates";
import { usePaycheckAllocation } from "@/lib/hooks/usePaycheckAllocation";

interface PaycheckAllocationWizardProps {
  monthYear: string;
}

const categoryIcon: Record<string, string> = {
  installment: "💳",
  recurring: "🔁",
  budget: "📦",
  savings: "🏦",
};

export function PaycheckAllocationWizard({ monthYear }: PaycheckAllocationWizardProps) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = usePaycheckAllocation(monthYear);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2.5 rounded-2xl border border-dashed border-white/[0.07] bg-[#111118] px-4 py-3.5 text-sm font-semibold text-[#b4f03a] transition hover:border-[#b4f03a]/40 hover:bg-white/[0.04]"
      >
        <Coins size={15} />
        Paycheck Allocation Wizard
        <span className="ml-auto text-xs font-normal text-white/30">
          {formatMonthYear(monthYear)}
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => setOpen(false)}
          >
            <div
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/[0.07] bg-[#111118] p-6 shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Paycheck Allocation</p>
                  <p className="mt-0.5 text-xs text-white/30">{formatMonthYear(monthYear)}</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1.5 text-white/50 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {isLoading ? (
                <div className="flex h-32 items-center justify-center text-sm text-white/30">
                  Loading…
                </div>
              ) : data ? (
                <>
                  {/* Income summary */}
                  <div className="mb-4 rounded-xl border border-[#34d399]/20 bg-[#34d399]/8 p-4">
                    <p className="mb-1 text-xs font-medium text-[#34d399]">Total Income</p>
                    <p className="font-heading text-2xl font-black text-[#34d399]">
                      {formatCurrency(data.totalIncome)}
                    </p>
                    {Number(data.alreadySpent) > 0 && (
                      <p className="mt-1 text-xs text-[#2aab7a]">
                        {formatCurrency(data.alreadySpent)} already spent this month
                      </p>
                    )}
                  </div>

                  {/* Allocation rows */}
                  <div className="mb-4 space-y-2">
                    {data.allocations.map((alloc, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.07] px-3 py-3"
                      >
                        <span className="shrink-0 text-base">
                          {categoryIcon[alloc.category] ?? "📌"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1.5 flex items-center justify-between">
                            <p className="truncate text-xs font-semibold text-white">
                              {alloc.label}
                            </p>
                            <p className="ml-2 text-xs font-bold text-white">
                              {formatCurrency(alloc.amount)}
                            </p>
                          </div>
                          <div className="h-1 overflow-hidden rounded-full bg-white/[0.07]">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, alloc.percentage)}%`,
                                backgroundColor: alloc.color,
                              }}
                            />
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-white/30">
                          {alloc.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Unallocated */}
                  <div
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      Number(data.unallocated) > 0
                        ? "border-[#34d399]/20 bg-[#34d399]/8"
                        : "border-white/[0.07] bg-[#0c0c10]"
                    }`}
                  >
                    <CheckCircle
                      size={16}
                      className={
                        Number(data.unallocated) > 0 ? "text-[#34d399]" : "text-white/20"
                      }
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">Unallocated (Free)</p>
                      <p
                        className={`text-sm font-bold ${
                          Number(data.unallocated) > 0 ? "text-[#34d399]" : "text-white/30"
                        }`}
                      >
                        {formatCurrency(data.unallocated)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-center text-xs text-white/30">
                    Allocations based on your active obligations and budget limits.
                  </p>
                </>
              ) : null}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
