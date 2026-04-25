"use client";

import { useState } from "react";
import { AlertTriangle, TrendingDown, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { getMinimumPaymentScenarios } from "@/lib/utils/minimumPaymentCalc";
import { cn } from "@/lib/utils";

interface MinimumPaymentCalculatorProps {
  balance: number;
  apr?: number;
  cardName?: string;
}

export function MinimumPaymentCalculator({
  balance,
  apr: defaultApr = 24,
  cardName,
}: MinimumPaymentCalculatorProps) {
  const [apr, setApr] = useState(defaultApr);
  const scenarios = getMinimumPaymentScenarios(balance, apr);

  const minimumScenario = scenarios[0];
  const doubleScenario = scenarios[1];
  const interestSaved =
    minimumScenario.totalInterestPaid === Infinity
      ? null
      : minimumScenario.totalInterestPaid - doubleScenario.totalInterestPaid;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
          <Calculator size={16} className="text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Minimum Payment Trap</h3>
          <p className="text-xs text-white/50">
            {cardName ? `See the true cost for ${cardName}` : "See what only paying the minimum costs you"}
          </p>
        </div>
      </div>

      {/* APR input */}
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#0a0a0f] px-4 py-2.5">
        <span className="text-xs text-white/50">Interest rate (APR)</span>
        <input
          type="number"
          value={apr}
          onChange={(e) => setApr(Math.max(0, Math.min(100, Number(e.target.value))))}
          className="ml-auto w-16 bg-transparent text-right text-sm font-bold text-white outline-none"
          step="0.5"
          min="0"
          max="100"
        />
        <span className="text-sm text-white/50">%</span>
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {scenarios.map((scenario, i) => {
          const isWorst = i === 0;
          const isBest = i === 2;
          return (
            <div
              key={scenario.label}
              className={cn(
                "rounded-xl border p-3",
                isWorst
                  ? "border-red-500/30 bg-red-500/5"
                  : isBest
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-amber-500/30 bg-amber-500/5"
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{scenario.label}</span>
                {isWorst && <AlertTriangle size={12} className="text-red-400" />}
                {isBest && <TrendingDown size={12} className="text-emerald-400" />}
              </div>
              <p className="text-lg font-bold text-white">
                {formatCurrency(scenario.monthlyPayment)}
                <span className="text-xs font-normal text-white/50">/mo</span>
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Payoff time</span>
                  <span
                    className={cn(
                      "font-medium",
                      scenario.monthsToPayoff >= 999
                        ? "text-red-400"
                        : isWorst
                        ? "text-amber-300"
                        : "text-white"
                    )}
                  >
                    {scenario.monthsToPayoff >= 999
                      ? "Never"
                      : scenario.monthsToPayoff === 0
                      ? "Instant"
                      : `${scenario.monthsToPayoff} mo`}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Total interest</span>
                  <span
                    className={cn(
                      "font-medium",
                      scenario.totalInterestPaid === Infinity
                        ? "text-red-400"
                        : isWorst
                        ? "text-red-300"
                        : "text-emerald-300"
                    )}
                  >
                    {scenario.totalInterestPaid === Infinity
                      ? "∞"
                      : formatCurrency(scenario.totalInterestPaid)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {interestSaved !== null && interestSaved > 0 && (
        <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-xs text-emerald-300">
          Doubling your minimum payment saves{" "}
          <span className="font-bold">{formatCurrency(interestSaved)}</span> in interest
          {minimumScenario.monthsToPayoff < 999 && (
            <>
              {" "}
              and{" "}
              <span className="font-bold">
                {minimumScenario.monthsToPayoff - doubleScenario.monthsToPayoff} months
              </span>{" "}
              of debt
            </>
          )}
          .
        </div>
      )}
    </div>
  );
}
