"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DollarSign, CheckCircle, AlertCircle, XCircle, Loader2, X } from "lucide-react";
import { formatCurrency, parseCurrency } from "@/lib/utils/currency";
import { formatMonthYear } from "@/lib/utils/dates";
import { useAffordIt } from "@/lib/hooks/useAffordIt";
import type { AffordItResult } from "@/lib/hooks/useAffordIt";
import { cn } from "@/lib/utils";

export function AffordItChecker({ collapsed }: { collapsed?: boolean }) {
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
    mutate(amount, { onSuccess: (data) => setResult(data) });
  }

  const verdictConfig = result
    ? {
        YES: {
          icon: CheckCircle,
          color: "text-[#34d399]",
          bg: "border-[#34d399]/20 bg-[#34d399]/8",
          pill: "bg-[#34d399]/15 text-[#34d399]",
        },
        TIGHT: {
          icon: AlertCircle,
          color: "text-[#f59e0b]",
          bg: "border-[#f59e0b]/20 bg-[#f59e0b]/8",
          pill: "bg-[#f59e0b]/15 text-[#f59e0b]",
        },
        NO: {
          icon: XCircle,
          color: "text-[#ef4444]",
          bg: "border-[#ef4444]/20 bg-[#ef4444]/8",
          pill: "bg-[#ef4444]/15 text-[#ef4444]",
        },
      }[result.verdict]
    : null;

  const triggerButton = (
    <button
      onClick={() => setOpen(true)}
      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-white/[0.05]"
    >
      <span className="flex-1 text-left text-white/45 group-hover:text-white">Can I afford it?</span>
    </button>
  );

  if (!mounted) return triggerButton;

  return createPortal(
    <>
      {triggerButton}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/8 bg-[#111118] shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b4f03a]/15">
                  <DollarSign size={18} className="text-[#b4f03a]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Can I afford it?</h2>
                  <p className="text-xs text-white/40">Check if a purchase fits your budget</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="relative">
                <label className="block text-xs font-semibold uppercase tracking-wide text-white/40 mb-2">
                  Enter amount
                </label>
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-white/40">
                  ₱
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={input}
                  onChange={(e) => { setInput(e.target.value); setResult(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-white/[0.06] bg-[#0a0a0f] py-3 pl-10 pr-4 text-base font-bold text-white outline-none placeholder:text-white/20 focus:border-[#b4f03a] focus:ring-2 focus:ring-[#b4f03a]/20 transition"
                />
              </div>

              <button
                onClick={handleCheck}
                disabled={isPending || !input}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#b4f03a] py-3 text-sm font-bold text-[#0c0c10] transition hover:bg-[#ccff52] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <><Loader2 size={16} className="animate-spin" /> Checking…</>
                ) : (
                  "Check affordability"
                )}
              </button>

              {result && verdictConfig && (
                <div className={cn("rounded-xl border p-4", verdictConfig.bg)}>
                  <div className="flex items-start gap-3">
                    <verdictConfig.icon
                      size={20}
                      className={cn("mt-0.5 shrink-0", verdictConfig.color)}
                    />
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", verdictConfig.pill)}>
                          {result.verdict}
                        </span>
                        <span className="text-xs text-white/30">
                          {result.impactPercent}% impact
                        </span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">{result.message}</p>

                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg border border-white/[0.06] bg-[#0c0c10] px-3 py-3">
                          <p className="text-xs text-white/40">Safe to spend</p>
                          <p className="mt-1 text-lg font-bold text-white">
                            {formatCurrency(result.safeToSpendToday)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-white/[0.06] bg-[#0c0c10] px-3 py-3">
                          <p className="text-xs text-white/40">Remaining after</p>
                          <p
                            className={cn(
                              "mt-1 text-lg font-bold",
                              Number(result.afterAmount) >= 0 ? "text-[#34d399]" : "text-[#ef4444]"
                            )}
                          >
                            {formatCurrency(result.afterAmount)}
                          </p>
                        </div>
                      </div>

                      {result.suggestedMonth && result.verdict !== "YES" && (
                        <p className="mt-3 text-sm font-medium text-[#b4f03a]">
                          💡 Try {formatMonthYear(result.suggestedMonth)} instead
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
