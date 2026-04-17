"use client";

import { useState } from "react";
import { Trophy, Zap, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { useInstallments } from "@/lib/hooks/useInstallments";
import { useEarlyPayoff } from "@/lib/hooks/useEarlyPayoff";
import type { EarlyPayoffResult } from "@/lib/hooks/useEarlyPayoff";

function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg width="68" height="68" viewBox="0 0 68 68" className="shrink-0">
      <circle cx="34" cy="34" r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
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

  const colors = [
    "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4",
  ];
  const color = colors[rank % colors.length];

  const rankEmoji = rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `#${rank + 1}`;

  function handleCalc() {
    const extra = parseFloat(extraAmount);
    if (!extra || extra <= 0) return;
    mutate({ planId: plan.id, extraMonthlyAmount: extra }, {
      onSuccess: (data) => setResult(data),
    });
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <ProgressRing pct={pct} color={color} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{rankEmoji}</span>
            <p className="font-semibold text-gray-800 text-sm truncate">{plan.name}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
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
            <p className="text-xs text-gray-400">
              {formatCurrency(plan.monthlyAmount)}/mo
            </p>
            <button
              onClick={() => {
                setShowCalc((s) => !s);
                setResult(null);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              <Zap size={11} />
              Early payoff
              {showCalc ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          </div>
        </div>
      </div>

      {/* Finish line bar */}
      <div className="mt-3 h-2 rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>

      {/* Early payoff calculator */}
      {showCalc && (
        <div className="mt-3 rounded-xl bg-gray-50 border border-gray-100 p-3">
          <p className="text-xs font-semibold text-gray-600 mb-2">Extra monthly payment</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₱</span>
              <input
                type="number"
                min="1"
                value={extraAmount}
                onChange={(e) => { setExtraAmount(e.target.value); setResult(null); }}
                placeholder="500"
                className="w-full rounded-xl border border-gray-200 pl-6 pr-3 py-2 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
              />
            </div>
            <button
              onClick={handleCalc}
              disabled={isPending || !extraAmount}
              className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1 transition"
            >
              {isPending ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
              {isPending ? "" : "Calculate"}
            </button>
          </div>

          {result && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white border border-gray-100 px-2 py-1.5 text-center">
                <p className="text-xs text-gray-400">Saved</p>
                <p className="text-sm font-bold text-emerald-600">
                  {result.monthsSaved}mo
                </p>
              </div>
              <div className="rounded-xl bg-white border border-gray-100 px-2 py-1.5 text-center">
                <p className="text-xs text-gray-400">Done by</p>
                <p className="text-xs font-bold text-indigo-600">
                  {formatDate(result.newCompletionDate)}
                </p>
              </div>
              <div className="rounded-xl bg-white border border-gray-100 px-2 py-1.5 text-center">
                <p className="text-xs text-gray-400">Interest saved</p>
                <p className="text-sm font-bold text-amber-600">
                  {Number(result.interestSaved) > 0
                    ? formatCurrency(result.interestSaved)
                    : "—"}
                </p>
              </div>
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
    .sort((a, b) => {
      const aRem = a.totalMonths - a.paidMonths;
      const bRem = b.totalMonths - b.paidMonths;
      return aRem - bRem;
    });

  if (activePlans.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <Trophy size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-400">No active installment plans</p>
      </div>
    );
  }

  const finishingSoonest = activePlans[0];
  const remaining = finishingSoonest.totalMonths - finishingSoonest.paidMonths;

  return (
    <div className="space-y-4">
      {/* Header callout */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={16} className="text-yellow-300" />
          <p className="font-bold text-sm">Finishing soonest</p>
        </div>
        <p className="text-lg font-black">{finishingSoonest.name}</p>
        <p className="text-indigo-200 text-sm mt-0.5">
          {remaining} payment{remaining !== 1 ? "s" : ""} left ·{" "}
          {formatCurrency(finishingSoonest.monthlyAmount)}/mo
        </p>
      </div>

      {/* All plans */}
      <div className="space-y-3">
        {activePlans.map((plan, i) => (
          <PlanCard key={plan.id} plan={plan} rank={i} />
        ))}
      </div>
    </div>
  );
}
