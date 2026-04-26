"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, CreditCard, ListChecks, Wallet } from "lucide-react";
import { useInstallments, useCreateInstallment } from "@/lib/hooks/useInstallments";
import { useCreditCards, useCreateCreditCard } from "@/lib/hooks/useCreditCards";
import { InstallmentForm } from "@/components/installments/InstallmentForm";
import { CreditCardForm } from "@/components/credit-cards/CreditCardForm";
import { CreditCardGrid } from "@/components/credit-cards/CreditCardGrid";
import { ProgressRing } from "@/components/installments/ProgressRing";
import { TypeBadge, StatusBadge } from "@/components/installments/TypeBadge";
import { TrueCostBadge } from "@/components/shared/TrueCostBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { cn } from "@/lib/utils";
import type { InstallmentInput } from "@/lib/validations/installments";
import type { CreditCardInput } from "@/lib/validations/credit-cards";

type ActiveTab = "installments" | "credit-cards";

export default function MyDebtPage() {
  const [tab, setTab] = useState<ActiveTab>("installments");
  const [installmentOpen, setInstallmentOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);

  const { data: plans, isLoading: plansLoading } = useInstallments();
  const { data: cards, isLoading: cardsLoading } = useCreditCards();
  const createPlan = useCreateInstallment();
  const createCard = useCreateCreditCard();

  async function handleCreatePlan(data: InstallmentInput) {
    await createPlan.mutateAsync(data);
    setInstallmentOpen(false);
  }

  async function handleCreateCard(data: CreditCardInput) {
    await createCard.mutateAsync(data);
    setCardOpen(false);
  }

  const activePlans = (plans ?? []).filter((p) => p.status === "ACTIVE");
  const totalInstallmentDebt = activePlans.reduce(
    (sum, p) =>
      sum + (Number(p.totalAmount) - Number(p.monthlyAmount) * p.paidMonths),
    0
  );
  const totalCardDebt = (cards ?? []).reduce(
    (sum, c) => sum + Number(c.currentBalance),
    0
  );
  const totalDebt = totalInstallmentDebt + totalCardDebt;

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Debt"
        description="All your installment plans and credit cards in one place"
        action={
          <div className="flex gap-2">
            <Button
              onClick={() => setInstallmentOpen(true)}
              size="sm"
              className="rounded-full bg-[#b4f03a] text-[#0c0c10] hover:bg-[#ccff52] shadow-[0_8px_24px_rgba(180,240,58,0.25)]"
            >
              <Plus size={14} className="mr-1" /> New Plan
            </Button>
            <Button
              onClick={() => setCardOpen(true)}
              size="sm"
              variant="outline"
              className="rounded-full border-[#b4f03a]/20 bg-[#111118] text-white hover:bg-[#b4f03a]/10 hover:border-[#b4f03a]/40 hover:text-[#b4f03a] transition-colors"
            >
              <CreditCard size={14} className="mr-1" /> Add Card
            </Button>
          </div>
        }
      />

      {/* Summary header */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-4">
          <p className="text-xs text-white/50 mb-1">Total Owed</p>
          <p className="text-xl font-bold text-white">{formatCurrency(totalDebt)}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-4">
          <p className="text-xs text-white/50 mb-1">Installment Plans</p>
          <p className="text-xl font-bold text-amber-300">{formatCurrency(totalInstallmentDebt)}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-4">
          <p className="text-xs text-white/50 mb-1">Card Balances</p>
          <p className="text-xl font-bold text-blue-300">{formatCurrency(totalCardDebt)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-[#111118] p-1 w-fit">
        <button
          onClick={() => setTab("installments")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
            tab === "installments"
              ? "bg-[#b4f03a]/15 text-[#b4f03a]"
              : "text-white/50 hover:text-white"
          )}
        >
          <ListChecks size={15} />
          Plans ({activePlans.length})
        </button>
        <button
          onClick={() => setTab("credit-cards")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
            tab === "credit-cards"
              ? "bg-[#b4f03a]/15 text-[#b4f03a]"
              : "text-white/50 hover:text-white"
          )}
        >
          <CreditCard size={15} />
          Cards ({(cards ?? []).length})
        </button>
      </div>

      {/* Tab content */}
      {tab === "installments" ? (
        plansLoading ? (
          <FullPageSpinner />
        ) : activePlans.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No installment plans"
            description="Add your first installment plan to start tracking"
            action={
              <Button
                onClick={() => setInstallmentOpen(true)}
                className="rounded-full bg-[#b4f03a] text-[#0c0c10] hover:bg-[#ccff52]"
              >
                New Plan
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {plans?.map((plan) => {
              const remaining =
                Number(plan.totalAmount) -
                Number(plan.monthlyAmount) * plan.paidMonths;
              const totalCost = Number(plan.monthlyAmount) * plan.totalMonths;
              return (
                <Link key={plan.id} href={`/installments/${plan.id}`}>
                  <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-4 transition-all cursor-pointer hover:border-[#b4f03a]/30 hover:bg-white/[0.04]">
                    <div className="flex items-center gap-4">
                      <ProgressRing paid={plan.paidMonths} total={plan.totalMonths} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-white text-sm truncate">
                            {plan.name}
                          </span>
                          <TypeBadge type={plan.type} />
                          <StatusBadge status={plan.status} />
                          <TrueCostBadge
                            originalAmount={Number(plan.totalAmount)}
                            totalPayments={totalCost}
                            processingFee={plan.processingFee != null ? Number(plan.processingFee) : null}
                          />
                        </div>
                        {plan.creditCard && (
                          <p className="flex items-center gap-1.5 text-xs text-white/30">
                            <BrandLogo
                              name={`${plan.creditCard.bankName} ${plan.creditCard.cardName}`}
                              size={14}
                              className="bg-white/10 text-white/70"
                            />
                            {plan.creditCard.bankName} — {plan.creditCard.cardName}
                          </p>
                        )}
                        {plan.lenderName && (
                          <p className="flex items-center gap-1.5 text-xs text-white/30">
                            <BrandLogo
                              name={plan.lenderName}
                              size={14}
                              className="bg-white/10 text-white/70"
                            />
                            {plan.lenderName}
                          </p>
                        )}
                        {plan.nextDueDate && (
                          <p className="text-xs text-white/30">
                            Next due: {formatDate(plan.nextDueDate)}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-white text-sm">
                          {formatCurrency(plan.monthlyAmount)}
                          <span className="text-xs font-normal text-white/30">/mo</span>
                        </p>
                        <p className="text-xs text-white/30 mt-0.5">
                          {formatCurrency(remaining)} left
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )
      ) : cardsLoading ? (
        <FullPageSpinner />
      ) : !cards?.length ? (
        <EmptyState
          icon={CreditCard}
          title="No credit cards yet"
          description="Add your credit cards to track balances and installments"
          action={
            <Button
              onClick={() => setCardOpen(true)}
              className="rounded-full bg-[#b4f03a] text-[#0c0c10] hover:bg-[#ccff52]"
            >
              Add Card
            </Button>
          }
        />
      ) : (
        <CreditCardGrid cards={cards} />
      )}

      {/* Dialogs */}
      <Dialog open={installmentOpen} onOpenChange={setInstallmentOpen}>
        <DialogContent className="max-w-lg rounded-3xl border-white/[0.07] bg-[#111118] text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              New Installment Plan
            </DialogTitle>
          </DialogHeader>
          <InstallmentForm
            creditCards={cards ?? []}
            onSubmit={handleCreatePlan}
            isLoading={createPlan.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={cardOpen} onOpenChange={setCardOpen}>
        <DialogContent className="rounded-2xl border-white/[0.07] bg-[#111118] text-white">
          <DialogHeader>
            <DialogTitle className="font-bold text-white">Add Credit Card</DialogTitle>
          </DialogHeader>
          <CreditCardForm onSubmit={handleCreateCard} isLoading={createCard.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
