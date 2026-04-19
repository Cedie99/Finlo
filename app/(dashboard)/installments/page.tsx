"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ListChecks } from "lucide-react";
import { useInstallments, useCreateInstallment } from "@/lib/hooks/useInstallments";
import { useCreditCards } from "@/lib/hooks/useCreditCards";
import { InstallmentForm } from "@/components/installments/InstallmentForm";
import { ProgressRing } from "@/components/installments/ProgressRing";
import { TypeBadge, StatusBadge } from "@/components/installments/TypeBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import type { InstallmentInput } from "@/lib/validations/installments";

export default function InstallmentsPage() {
  const [open, setOpen] = useState(false);
  const { data: plans, isLoading } = useInstallments();
  const { data: creditCards = [] } = useCreditCards();
  const createPlan = useCreateInstallment();

  async function handleCreate(data: InstallmentInput) {
    await createPlan.mutateAsync(data);
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Installment Plans"
        description="Track all your installment payments"
        action={
          <Button
            onClick={() => setOpen(true)}
            className="rounded-full bg-[#2f7f76] hover:bg-[#266a63] shadow-[0_10px_24px_rgba(47,127,118,0.2)]"
          >
            <Plus size={15} className="mr-1" /> New Plan
          </Button>
        }
      />

      {isLoading ? (
        <FullPageSpinner />
      ) : !plans?.length ? (
        <EmptyState
          icon={ListChecks}
          title="No installment plans"
          description="Add your first installment plan to start tracking"
          action={
            <Button onClick={() => setOpen(true)} className="rounded-full bg-[#2f7f76] hover:bg-[#266a63]">
              New Plan
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <Link key={plan.id} href={`/installments/${plan.id}`}>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-[#d1e3df] transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <ProgressRing paid={plan.paidMonths} total={plan.totalMonths} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900 text-sm truncate">{plan.name}</span>
                      <TypeBadge type={plan.type} />
                      <StatusBadge status={plan.status} />
                    </div>
                    {plan.creditCard && (
                      <p className="text-xs text-gray-400">{plan.creditCard.bankName} — {plan.creditCard.cardName}</p>
                    )}
                    {plan.lenderName && (
                      <p className="text-xs text-gray-400">{plan.lenderName}</p>
                    )}
                    {plan.nextDueDate && (
                      <p className="text-xs text-gray-400">Next due: {formatDate(plan.nextDueDate)}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900 text-sm">
                      {formatCurrency(plan.monthlyAmount)}
                      <span className="text-xs font-normal text-gray-400">/mo</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{plan.paidMonths}/{plan.totalMonths} months</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">New Installment Plan</DialogTitle>
          </DialogHeader>
          <InstallmentForm creditCards={creditCards} onSubmit={handleCreate} isLoading={createPlan.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
