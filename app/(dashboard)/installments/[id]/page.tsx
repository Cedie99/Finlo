"use client";

import { use, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  useInstallment,
  useMarkPayment,
  useDeleteInstallment,
} from "@/lib/hooks/useInstallments";
import { ProgressRing } from "@/components/installments/ProgressRing";
import { TypeBadge, StatusBadge } from "@/components/installments/TypeBadge";
import { PaymentSchedule } from "@/components/installments/PaymentSchedule";
import { CelebrationModal } from "@/components/dashboard/CelebrationModal";
import { TrueCostBreakdown } from "@/components/dashboard/TrueCostBreakdown";
import { PageHeader } from "@/components/shared/PageHeader";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import Decimal from "decimal.js";

export default function InstallmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const { data: plan, isLoading } = useInstallment(id);
  const markPayment = useMarkPayment(id);
  const deletePlan = useDeleteInstallment();

  // Check if plan is fully paid after marking a payment
  const handleMarkPaid = useCallback(async (paymentId: string, isPaid: boolean) => {
    // Count unpaid payments before marking
    const unpaidBefore = plan?.payments?.filter((p) => !p.isPaid).length || 0;
    
    await markPayment.mutateAsync({ paymentId, isPaid, paidDate: isPaid ? new Date().toISOString() : undefined });
    
    // If this was the last unpaid payment and we're marking it as paid, show celebration
    if (isPaid && unpaidBefore === 1) {
      setShowCelebration(true);
    }
  }, [markPayment, plan?.payments]);

  if (isLoading) return <FullPageSpinner />;
  if (!plan) return <div className="p-4">Plan not found</div>;

  const remaining = plan.payments
    ? plan.payments
        .filter((p) => !p.isPaid)
        .reduce(
          (s, p) => s.plus(new Decimal(p.amount)),
          new Decimal(0)
        )
        .toFixed(2)
    : new Decimal(plan.totalAmount)
        .minus(new Decimal(plan.monthlyAmount).times(plan.paidMonths))
        .toFixed(2);

  return (
    <div>
      <Link
        href="/installments"
        className="mb-4 inline-flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white"
      >
        <ArrowLeft size={14} /> Back to Installments
      </Link>

      <PageHeader
        title={plan.name}
        action={
          <Button
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          >
            <Trash2 size={14} className="mr-1" /> Delete
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <TypeBadge type={plan.type} />
        <StatusBadge status={plan.status} />
        {plan.creditCard && (
          <span className="inline-flex items-center gap-1.5 text-sm text-white/45">
            <BrandLogo
              name={`${plan.creditCard.bankName} ${plan.creditCard.cardName}`}
              size={16}
              className="bg-white/10 text-white/70"
            />
            {plan.creditCard.bankName} — {plan.creditCard.cardName}
          </span>
        )}
        {plan.lenderName && (
          <span className="inline-flex items-center gap-1.5 text-sm text-white/45">
            <BrandLogo
              name={plan.lenderName}
              size={16}
              className="bg-white/10 text-white/70"
            />
            {plan.lenderName}
          </span>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="dashboard-surface p-4">
          <p className="mb-1 text-xs font-medium text-white/45">Total Amount</p>
          <p className="text-xl font-bold text-white">{formatCurrency(plan.totalAmount)}</p>
        </div>
        <div className="dashboard-surface p-4">
          <p className="mb-1 text-xs font-medium text-white/45">Monthly</p>
          <p className="text-xl font-bold text-white">{formatCurrency(plan.monthlyAmount)}</p>
        </div>
        <div className="dashboard-surface p-4">
          <p className="mb-1 text-xs font-medium text-white/45">Remaining</p>
          <p className="text-xl font-bold text-amber-300">{formatCurrency(remaining)}</p>
        </div>
        <div className="dashboard-surface p-4">
          <p className="mb-2 text-xs font-medium text-white/45">Progress</p>
          <div className="flex items-center gap-2">
            <ProgressRing
              paid={plan.paidMonths}
              total={plan.totalMonths}
              size={48}
            />
            <span className="text-sm text-white/70">
              {plan.paidMonths}/{plan.totalMonths} mo
            </span>
          </div>
        </div>
      </div>

      {plan.nextDueDate && (
        <div className="mb-6 rounded-xl border border-amber-500/35 bg-amber-500/10 p-3 text-sm text-amber-300">
          Next payment due:{" "}
          <strong>{formatDate(plan.nextDueDate)}</strong> —{" "}
          {formatCurrency(plan.monthlyAmount)}
        </div>
      )}

      {plan.notes && (
        <div className="dashboard-surface-muted mb-6 p-3 text-sm text-white/60">
          {plan.notes}
        </div>
      )}

      {/* True Cost Breakdown */}
      <TrueCostBreakdown
        originalAmount={Number(plan.totalAmount)}
        monthlyAmount={Number(plan.monthlyAmount)}
        totalMonths={plan.totalMonths}
        paidMonths={plan.paidMonths}
        interestRate={plan.interestRate ? Number(plan.interestRate) : null}
      />

      {plan.payments && plan.payments.length > 0 && (
        <div className="dashboard-surface p-5">
          <h3 className="mb-4 font-semibold text-white">Payment Schedule</h3>
          <div>
            <PaymentSchedule
              payments={plan.payments}
              planId={plan.id}
              onMarkPaid={handleMarkPaid}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Installment Plan"
        description="This will permanently delete this plan and all its payment records."
        confirmLabel="Delete"
        onConfirm={async () => {
          await deletePlan.mutateAsync(id);
          router.push("/installments");
        }}
        destructive
      />

      {/* Celebration Modal when plan is paid off */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        type="PLAN_PAID_OFF"
        planName={plan.name}
        amountPaid={Number(plan.totalAmount)}
        monthsPaid={plan.totalMonths}
        totalDebtReduced={Number(plan.totalAmount)}
      />
    </div>
  );
}
