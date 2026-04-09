"use client";

import { use, useState } from "react";
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
import { PageHeader } from "@/components/shared/PageHeader";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const { data: plan, isLoading } = useInstallment(id);
  const markPayment = useMarkPayment(id);
  const deletePlan = useDeleteInstallment();

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
        className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground"
      >
        <ArrowLeft size={14} /> Back to Installments
      </Link>

      <PageHeader
        title={plan.name}
        action={
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={14} className="mr-1" /> Delete
          </Button>
        }
      />

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <TypeBadge type={plan.type} />
        <StatusBadge status={plan.status} />
        {plan.creditCard && (
          <span className="text-sm text-muted-foreground">
            {plan.creditCard.bankName} — {plan.creditCard.cardName}
          </span>
        )}
        {plan.lenderName && (
          <span className="text-sm text-muted-foreground">{plan.lenderName}</span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatCurrency(plan.totalAmount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Monthly
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatCurrency(plan.monthlyAmount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600">
              {formatCurrency(remaining)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <ProgressRing
              paid={plan.paidMonths}
              total={plan.totalMonths}
              size={48}
            />
            <span className="text-sm">
              {plan.paidMonths}/{plan.totalMonths} mo
            </span>
          </CardContent>
        </Card>
      </div>

      {plan.nextDueDate && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-6 text-sm text-amber-800 dark:text-amber-200">
          Next payment due:{" "}
          <strong>{formatDate(plan.nextDueDate)}</strong> —{" "}
          {formatCurrency(plan.monthlyAmount)}
        </div>
      )}

      {plan.notes && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-6 text-sm text-muted-foreground">
          {plan.notes}
        </div>
      )}

      {plan.payments && plan.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentSchedule
              payments={plan.payments}
              planId={plan.id}
              onMarkPaid={async (paymentId, isPaid) => {
                await markPayment.mutateAsync({ paymentId, isPaid });
              }}
            />
          </CardContent>
        </Card>
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
    </div>
  );
}
