"use client";

import { useState } from "react";
import { Trophy, Zap, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { useInstallments } from "@/lib/hooks/useInstallments";
import { useEarlyPayoff } from "@/lib/hooks/useEarlyPayoff";
import type { EarlyPayoffResult } from "@/lib/hooks/useEarlyPayoff";
import { cn } from "@/lib/utils";

const rankColors = ["#b4f03a", "#f59e0b", "#34d399", "#ef4444", "#8b5cf6", "#06b6d4"];

function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg width="68" height="68" viewBox="0 0 68 68" className="shrink-0">
      <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
      <circle
        cx="34"
        cy="34"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 34 34)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text
        x="34"
        y="34"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontWeight="bold"
        fill={color}
      >
        {pct}%
      </text>
    </svg>
  );
}

function PlanCard({
  plan,
  rank,
}: {
  plan: {
    id: string;
    name: string;
    monthlyAmount: string;
    totalAmount: string;
    paidMonths: number;
    totalMonths: number;
    nextDueDate: string | null;
    type: string;
  };
  rank: number;
}) {
  const { mutate, isPending } = useEarlyPayoff();
  const [extraAmount, setExtraAmount] = useState("");
  const [result, setResult] = useState<EarlyPayoffResult | null>(null);
  const [showCalc, setShowCalc] = useState(false);

  const pct = Math.round((plan.paidMonths / plan.totalMonths) * 100);
  const remaining = plan.totalMonths - plan.paidMonths;
  const color = rankColors[rank % rankColors.length];
  const rankLabel = rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `#${rank + 1}`;

  function handleCalc() {
    const extra = parseFloat(extraAmount);
    if (!extra || extra <= 0) return;
    mutate({ planId: plan.id, extraMonthlyAmount: extra }, {
      onSuccess: (data) => setResult(data),
    });
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-4">
      <div className="flex items-start gap-3">
        <ProgressRing pct={pct} color={color} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-base">{rankLabel}</span>
            <p className="truncate text-sm font-semibold text-white">{plan.name}</p>
          </div>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-white/30">
            <span>{plan.paidMonths}/{plan.totalMonths} months</span>
            <span>·</span>
            <span>{remaining} left</span>
            {plan.nextDueDate && (
              <>
                <span>·</span>
                <span>Due {formatDate(plan.nextDueDate)}</span>
              </>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30">{formatCurrency(plan.monthlyAmount)}/mo</p>
            <button
              onClick={() => { setShowCalc((s) => !s); setResult(null); }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#b4f03a] transition hover:text-[#ccff52]"
            >
              <Zap size={11} />
              Early payoff
              {showCalc ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>

      {/* Early payoff calc */}
      {showCalc && (
        <div className="mt-3 rounded-xl border border-white/[0.07] bg-[#0c0c10] p-3">
          <p className="mb-2 text-xs font-semibold text-white/50">Extra monthly payment</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/30">₱</span>
              <input
                type="number"
                min="1"
                value={extraAmount}
                onChange={(e) => { setExtraAmount(e.target.value); setResult(null); }}
                placeholder="500"
                className="w-full rounded-xl border border-white/[0.07] bg-[#0a0a0f] py-2 pl-6 pr-3 text-sm font-medium text-white outline-none placeholder:text-white/20 focus:border-[#b4f03a] focus:ring-1 focus:ring-[#b4f03a]/20"
              />
            </div>
            <button
              onClick={handleCalc}
              disabled={isPending || !extraAmount}
              className="flex items-center gap-1 rounded-xl bg-[#b4f03a] px-3 py-2 text-xs font-bold text-[#0c0c10] transition hover:bg-[#ccff52] disabled:opacity-50"
            >
              {isPending ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
              {isPending ? "" : "Calc"}
            </button>
          </div>

          {result && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "Saved", value: `${result.monthsSaved}mo`, color: "text-[#34d399]" },
                { label: "Done by", value: formatDate(result.newCompletionDate), color: "text-[#b4f03a]" },
                {
                  label: "Interest",
                  value: Number(result.interestSaved) > 0 ? formatCurrency(result.interestSaved) : "—",
                  color: "text-[#f59e0b]",
                },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/[0.07] px-2 py-1.5 text-center">
                  <p className="text-[10px] text-white/30">{item.label}</p>
                  <p className={cn("text-xs font-bold", item.color)}>{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DebtPayoffRace() {
  const { data, isLoading } = useInstallments();

  if (isLoading) return null;

  const activePlans = (data ?? [])
    .filter((p) => p.status === "ACTIVE")
    .sort((a, b) => (a.totalMonths - a.paidMonths) - (b.totalMonths - b.paidMonths));

  if (activePlans.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-10 text-center">
        <Trophy size={28} className="mx-auto mb-3 text-white/[0.07]" />
        <p className="text-sm text-white/30">No active installment plans</p>
      </div>
    );
  }

  const finishingSoonest = activePlans[0];
  const remaining = finishingSoonest.totalMonths - finishingSoonest.paidMonths;

  return (
    <div className="space-y-4">
      {/* Header callout */}
      <div className="rounded-2xl border border-[#b4f03a]/20 bg-[#b4f03a]/8 p-4">
        <div className="mb-1 flex items-center gap-2">
          <Trophy size={15} className="text-[#b4f03a]" />
          <p className="text-xs font-bold uppercase tracking-wider text-[#b4f03a]">
            Finishing soonest
          </p>
        </div>
        <p className="font-heading text-lg font-black text-white">{finishingSoonest.name}</p>
        <p className="mt-0.5 text-sm text-white/50">
          {remaining} payment{remaining !== 1 ? "s" : ""} left ·{" "}
          {formatCurrency(finishingSoonest.monthlyAmount)}/mo
        </p>
      </div>

      {/* Plan cards */}
      <div className="space-y-3">
        {activePlans.map((plan, i) => (
          <PlanCard key={plan.id} plan={plan} rank={i} />
        ))}
      </div>
    </div>
  );
}
