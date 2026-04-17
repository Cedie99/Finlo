"use client";

import { useState } from "react";
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
        className="flex items-center gap-2 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition w-full"
      >
        <Coins size={15} />
        Paycheck Allocation Wizard
        <span className="ml-auto text-xs text-indigo-400 font-normal">
          {formatMonthYear(monthYear)}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-bold text-gray-900">Paycheck Allocation</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatMonthYear(monthYear)}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X size={16} />
              </button>
            </div>

            {isLoading ? (
              <div className="h-32 flex items-center justify-center text-sm text-gray-400">
                Loading…
              </div>
            ) : data ? (
              <>
                {/* Income summary */}
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 mb-4">
                  <p className="text-xs text-emerald-600 font-medium mb-1">Total Income</p>
                  <p className="text-2xl font-black text-emerald-700">
                    {formatCurrency(data.totalIncome)}
                  </p>
                  {Number(data.alreadySpent) > 0 && (
                    <p className="text-xs text-emerald-500 mt-1">
                      {formatCurrency(data.alreadySpent)} already spent this month
                    </p>
                  )}
                </div>

                {/* Allocation list */}
                <div className="space-y-2 mb-4">
                  {data.allocations.map((alloc, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-2xl border border-gray-100 px-3 py-2.5"
                    >
                      <span className="text-base shrink-0">
                        {categoryIcon[alloc.category] ?? "📌"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-gray-700 truncate">
                            {alloc.label}
                          </p>
                          <p className="text-xs font-bold text-gray-800 ml-2">
                            {formatCurrency(alloc.amount)}
                          </p>
                        </div>
                        <div className="h-1 rounded-full bg-gray-100">
                          <div
                            className="h-1 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, alloc.percentage)}%`,
                              backgroundColor: alloc.color,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {alloc.percentage}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Unallocated */}
                <div
                  className={`rounded-2xl border p-3 flex items-center gap-3 ${
                    Number(data.unallocated) > 0
                      ? "bg-emerald-50 border-emerald-100"
                      : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <CheckCircle
                    size={16}
                    className={
                      Number(data.unallocated) > 0 ? "text-emerald-500" : "text-gray-300"
                    }
                  />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Unallocated (Free)</p>
                    <p
                      className={`text-sm font-bold ${
                        Number(data.unallocated) > 0 ? "text-emerald-600" : "text-gray-400"
                      }`}
                    >
                      {formatCurrency(data.unallocated)}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center mt-4">
                  Allocations are based on your active obligations and budget limits.
                </p>
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
