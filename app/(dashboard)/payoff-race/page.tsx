"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { DebtPayoffRace } from "@/components/dashboard/DebtPayoffRace";
import { DebtPriorityAdvisor } from "@/components/dashboard/DebtPriorityAdvisor";
import { MinimumPaymentCalculator } from "@/components/dashboard/MinimumPaymentCalculator";
import { useInstallments } from "@/lib/hooks/useInstallments";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";

export default function PayoffStrategyPage() {
  const { data: plans } = useInstallments();
  const creditCardPlans = (plans ?? []).filter(
    (p) => p.type === "CREDIT_CARD" && p.status === "ACTIVE"
  );

  const totalCreditCardBalance = creditCardPlans.reduce(
    (sum, p) =>
      sum + (Number(p.totalAmount) - Number(p.monthlyAmount) * p.paidMonths),
    0
  );

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const selectedCard = creditCardPlans.find((p) => p.id === selectedCardId);
  const selectedBalance = selectedCard
    ? Number(selectedCard.totalAmount) -
      Number(selectedCard.monthlyAmount) * selectedCard.paidMonths
    : totalCreditCardBalance;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payoff Strategy"
        description="Know what to pay first and escape debt faster"
      />

      {/* Priority Advisor — top priority */}
      <DebtPriorityAdvisor />

      {/* Debt Payoff Race */}
      <DebtPayoffRace />

      {/* Minimum Payment Calculator — only if credit cards exist */}
      {creditCardPlans.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
              Minimum Payment Trap
            </h2>
          </div>

          {/* Card selector */}
          {creditCardPlans.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCardId(null)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                  selectedCardId === null
                    ? "border-[#b4f03a]/50 bg-[#b4f03a]/10 text-[#b4f03a]"
                    : "border-white/[0.07] text-white/50 hover:border-[#b4f03a]/30"
                )}
              >
                All cards ({formatCurrency(totalCreditCardBalance)})
              </button>
              {creditCardPlans.map((p) => {
                const bal =
                  Number(p.totalAmount) - Number(p.monthlyAmount) * p.paidMonths;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedCardId(p.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                      selectedCardId === p.id
                        ? "border-[#b4f03a]/50 bg-[#b4f03a]/10 text-[#b4f03a]"
                        : "border-white/[0.07] text-white/50 hover:border-[#b4f03a]/30"
                    )}
                  >
                    {p.name} ({formatCurrency(bal)})
                  </button>
                );
              })}
            </div>
          )}

          <MinimumPaymentCalculator
            balance={selectedBalance}
            apr={
              selectedCard?.interestRate
                ? Number(selectedCard.interestRate)
                : 24
            }
            cardName={selectedCard?.name}
          />
        </div>
      )}
    </div>
  );
}
