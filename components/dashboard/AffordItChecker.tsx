"use client";

import { useState } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { DollarSign, X, CheckCircle, AlertCircle, XCircle, Loader2 } from "lucide-react";
import { formatCurrency, parseCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/dates";
import { useAffordIt } from "@/lib/hooks/useAffordIt";
import type { AffordItResult } from "@/lib/hooks/useAffordIt";

export function AffordItChecker() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AffordItResult | null>(null);
  const { mutate, isPending } = useAffordIt();

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleCheck() {
    const amount = parseCurrency(input);
    if (!amount || amount <= 0) return;
    setResult(null);
    mutate(amount, {
      onSuccess: (data) => setResult(data),
    });
  }

  function handleClose() {
    setOpen(false);
    setResult(null);
    setInput("");
  }

  const verdictConfig = result
    ? {
        YES: {
          icon: CheckCircle,
          color: "text-emerald-600",
          bg: "bg-emerald-50 border-emerald-200",
          pill: "bg-emerald-100 text-emerald-700",
        },
        TIGHT: {
          icon: AlertCircle,
          color: "text-amber-600",
          bg: "bg-amber-50 border-amber-200",
          pill: "bg-amber-100 text-amber-700",
        },
        NO: {
          icon: XCircle,
          color: "text-red-500",
          bg: "bg-red-50 border-red-200",
          pill: "bg-red-100 text-red-600",
        },
      }[result.verdict]
    : null;

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 lg:bottom-6 lg:right-6 z-30 flex items-center gap-2 rounded-full bg-[#2f7f76] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(47,127,118,0.28)] hover:bg-[#266a63] transition-all active:scale-95"
        type="button"
      >
        <DollarSign size={16} />
        Can I afford it?
      </button>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-220 bg-black/40 flex items-end sm:items-center justify-center p-4"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-[#d1e3df] bg-white p-6 shadow-[0_30px_70px_rgba(15,36,36,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-bold text-gray-900 text-base">Can I afford it?</p>
                <p className="text-xs text-gray-400 mt-0.5">Enter any price for an instant check</p>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Input */}
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                ₱
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setResult(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                placeholder="0.00"
                className="w-full rounded-2xl border border-[#d3e0dc] pl-8 pr-4 py-3 text-lg font-bold text-gray-900 outline-none focus:border-[#3d9187] focus:ring-2 focus:ring-[#d3e6e2]"
              />
            </div>

            <button
              onClick={handleCheck}
              disabled={isPending || !input}
              className="w-full rounded-2xl bg-[#2f7f76] py-3 text-sm font-semibold text-white hover:bg-[#266a63] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
            >
              {isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Checking…
                </>
              ) : (
                "Check Now"
              )}
            </button>

            {/* Result */}
            {result && verdictConfig && (
              <div
                className={`mt-4 rounded-2xl border p-4 ${verdictConfig.bg}`}
              >
                <div className="flex items-start gap-3">
                  <verdictConfig.icon
                    size={20}
                    className={`${verdictConfig.color} shrink-0 mt-0.5`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${verdictConfig.pill}`}
                      >
                        {result.verdict}
                      </span>
                      <span className="text-xs text-gray-500">
                        Uses {result.impactPercent}% of safe-to-spend
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{result.message}</p>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl bg-white/60 px-3 py-2">
                        <p className="text-gray-400">Safe to Spend</p>
                        <p className="font-bold text-gray-800">
                          {formatCurrency(result.safeToSpendToday)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white/60 px-3 py-2">
                        <p className="text-gray-400">After Purchase</p>
                        <p
                          className={`font-bold ${
                            Number(result.afterAmount) >= 0
                              ? "text-emerald-600"
                              : "text-red-500"
                          }`}
                        >
                          {formatCurrency(result.afterAmount)}
                        </p>
                      </div>
                    </div>

                    {result.suggestedMonth && result.verdict !== "YES" && (
                      <p className="mt-3 text-xs text-[#2f7f76] font-medium">
                        Comfortably affordable in {formatMonthYear(result.suggestedMonth)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
