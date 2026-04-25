"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit2, Trash2, CreditCard as CreditCardIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CreditCardForm } from "@/components/credit-cards/CreditCardForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { TrueCostBreakdown } from "@/components/dashboard/TrueCostBreakdown";
import { MinimumPaymentCalculator } from "@/components/dashboard/MinimumPaymentCalculator";
import { formatCurrency } from "@/lib/utils/currency";
import {
  useUpdateCreditCard,
  useDeleteCreditCard,
} from "@/lib/hooks/useCreditCards";
import type { CreditCardInput } from "@/lib/validations/credit-cards";
import { TypeBadge } from "@/components/installments/TypeBadge";

export default function CreditCardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: card, isLoading } = useQuery({
    queryKey: ["credit-cards", id],
    queryFn: async () => {
      const res = await fetch(`/api/credit-cards/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const updateCard = useUpdateCreditCard(id);
  const deleteCard = useDeleteCreditCard();

  async function handleUpdate(data: CreditCardInput) {
    await updateCard.mutateAsync(data);
    setEditOpen(false);
  }

  async function handleDelete() {
    await deleteCard.mutateAsync(id);
    router.push("/credit-cards");
  }

  if (isLoading) return <FullPageSpinner />;
  if (!card) return <div className="p-4 text-white/50">Card not found</div>;

  const balance = parseFloat(card.currentBalance);
  const limit = parseFloat(card.creditLimit);
  const available = limit - balance;
  const utilization = limit > 0 ? (balance / limit) * 100 : 0;

  // Aggregate installment plans on this card
  const plans: {
    id: string;
    name: string;
    monthlyAmount: string;
    totalAmount: string;
    paidMonths: number;
    totalMonths: number;
    type: string;
    interestRate?: string | null;
  }[] = card.installmentPlans ?? [];
  const totalInstallmentsBalance = plans.reduce(
    (sum, p) =>
      sum + (parseFloat(p.totalAmount) - parseFloat(p.monthlyAmount) * p.paidMonths),
    0
  );
  const totalInstallmentsMonthly = plans.reduce(
    (sum, p) => sum + parseFloat(p.monthlyAmount),
    0
  );
  const totalInstallmentsMonths = plans.length > 0 ? Math.max(...plans.map((p) => p.totalMonths)) : 0;

  return (
    <div className="space-y-5">
      <Link
        href="/credit-cards"
        className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft size={14} /> Back to Credit Cards
      </Link>

      <PageHeader
        title={`${card.bankName} — ${card.cardName}`}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="rounded-full border-white/[0.07] bg-[#111118] text-white hover:bg-white/[0.05]"
            >
              <Edit2 size={14} className="mr-1" /> Edit
            </Button>
            <Button
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
            >
              <Trash2 size={14} className="mr-1" /> Delete
            </Button>
          </div>
        }
      />

      <div className="-mt-3 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-[#111118] px-3 py-2 w-fit">
        <BrandLogo
          name={`${card.bankName} ${card.cardName}`}
          size={18}
          className="bg-white/10 text-white/70"
        />
        <span className="text-xs text-white/60">{card.bankName} — {card.cardName}</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Credit Limit", value: formatCurrency(limit), color: "text-white" },
          {
            label: "Current Balance",
            value: formatCurrency(balance),
            color: balance > limit * 0.7 ? "text-red-400" : "text-amber-300",
          },
          { label: "Available", value: formatCurrency(available), color: "text-emerald-300" },
          {
            label: "Utilization",
            value: `${utilization.toFixed(1)}%`,
            color:
              utilization > 70 ? "text-red-400" : utilization > 30 ? "text-amber-300" : "text-emerald-300",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.07] bg-[#111118] p-4"
          >
            <p className="text-xs text-white/50 mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Minimum payment calculator — only if there's a balance */}
      {balance > 0 && (
        <MinimumPaymentCalculator
          balance={balance}
          apr={card.interestRate ? parseFloat(card.interestRate) : 24}
          cardName={`${card.bankName} ${card.cardName}`}
        />
      )}

      {/* True cost for installment plans on this card */}
      {plans.length > 0 && totalInstallmentsBalance > 0 && (
        <TrueCostBreakdown
          originalAmount={totalInstallmentsBalance}
          monthlyAmount={totalInstallmentsMonthly}
          totalMonths={totalInstallmentsMonths}
        />
      )}

      {/* Installment plans on this card */}
      {plans.length > 0 && (
        <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-5">
          <h3 className="mb-4 font-semibold text-white">Active Installment Plans</h3>
          <div className="space-y-2">
            {plans.map((plan) => {
              const remaining =
                parseFloat(plan.totalAmount) -
                parseFloat(plan.monthlyAmount) * plan.paidMonths;
              return (
                <Link
                  key={plan.id}
                  href={`/installments/${plan.id}`}
                  className="flex items-center justify-between rounded-xl border border-white/[0.07] px-4 py-3 transition-all hover:border-[#b4f03a]/30 hover:bg-white/[0.05]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-sm text-white">{plan.name}</p>
                      <TypeBadge type={plan.type as "CREDIT_CARD" | "LOAN" | "BNPL"} />
                    </div>
                    <p className="text-xs text-white/50 mt-0.5">
                      {plan.paidMonths}/{plan.totalMonths} months paid
                    </p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className="font-bold text-sm text-white">
                      {formatCurrency(plan.monthlyAmount)}
                      <span className="text-xs font-normal text-white/30">/mo</span>
                    </p>
                    <p className="text-xs text-white/50">
                      {formatCurrency(remaining)} left
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl border-white/[0.07] bg-[#111118] text-white">
          <DialogHeader>
            <DialogTitle className="font-bold text-white">Edit Credit Card</DialogTitle>
          </DialogHeader>
          <CreditCardForm
            defaultValues={{
              ...card,
              creditLimit: parseFloat(card.creditLimit),
              currentBalance: parseFloat(card.currentBalance),
            }}
            onSubmit={handleUpdate}
            isLoading={updateCard.isPending}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Credit Card"
        description="This will delete the card and unlink all installment plans. Cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
