"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { InstallmentPayment } from "@/lib/hooks/useInstallments";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaymentScheduleProps {
  payments: InstallmentPayment[];
  planId: string;
  onMarkPaid?: (paymentId: string, isPaid: boolean) => Promise<void>;
  readonly?: boolean;
}

export function PaymentSchedule({
  payments,
  onMarkPaid,
  readonly,
}: PaymentScheduleProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleToggle(payment: InstallmentPayment) {
    if (!onMarkPaid) return;
    setLoading(payment.id);
    try {
      await onMarkPaid(payment.id, !payment.isPaid);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {payments.map((payment, idx) => (
        <div
          key={payment.id}
          className={cn(
            "flex items-center justify-between py-3 px-1",
            payment.isPaid && "opacity-60"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                payment.isPaid
                  ? "bg-green-500 border-green-500"
                  : "border-gray-300 dark:border-gray-600"
              )}
            >
              {payment.isPaid && <Check size={12} className="text-white" />}
            </div>
            <div>
              <div className="text-sm font-medium">Month {idx + 1}</div>
              <div className="text-xs text-muted-foreground">
                Due: {formatDate(payment.dueDate)}
              </div>
              {payment.paidDate && (
                <div className="text-xs text-green-600">
                  Paid: {formatDate(payment.paidDate)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">
              {formatCurrency(payment.amount)}
            </div>
            {!readonly && onMarkPaid && (
              <Button
                variant={payment.isPaid ? "outline" : "default"}
                size="sm"
                onClick={() => handleToggle(payment)}
                disabled={loading === payment.id}
                className="text-xs h-7 min-w-[80px]"
              >
                {loading === payment.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : payment.isPaid ? (
                  "Unmark"
                ) : (
                  "Mark Paid"
                )}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
