import { addMonths, setDate } from "date-fns";
import Decimal from "decimal.js";

export interface PaymentScheduleItem {
  monthNumber: number;
  dueDate: Date;
  amount: string; // decimal string
}

/**
 * Generates the full payment schedule for an installment plan.
 * The last payment absorbs any rounding remainder.
 */
export function generatePaymentSchedule(
  startDate: Date,
  totalAmount: number | string,
  monthlyAmount: number | string,
  totalMonths: number,
  dueDayOfMonth?: number
): PaymentScheduleItem[] {
  const total = new Decimal(totalAmount.toString());
  const monthly = new Decimal(monthlyAmount.toString());
  const schedule: PaymentScheduleItem[] = [];

  let accumulated = new Decimal(0);

  for (let i = 0; i < totalMonths; i++) {
    let paymentDate = addMonths(startDate, i);
    if (dueDayOfMonth) {
      const daysInMonth = new Date(
        paymentDate.getFullYear(),
        paymentDate.getMonth() + 1,
        0
      ).getDate();
      paymentDate = setDate(paymentDate, Math.min(dueDayOfMonth, daysInMonth));
    }

    let amount: Decimal;
    if (i === totalMonths - 1) {
      // Last payment: remainder
      amount = total.minus(accumulated);
    } else {
      amount = monthly;
    }

    accumulated = accumulated.plus(amount);

    schedule.push({
      monthNumber: i + 1,
      dueDate: paymentDate,
      amount: amount.toFixed(2),
    });
  }

  return schedule;
}

/**
 * Returns the next unpaid due date from a list of payments.
 */
export function getNextDueDate(
  payments: { dueDate: Date; isPaid: boolean }[]
): Date | null {
  const unpaid = payments
    .filter((p) => !p.isPaid)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  return unpaid[0]?.dueDate ?? null;
}

/**
 * Calculates total remaining amount.
 */
export function getRemainingAmount(
  payments: { amount: string | number; isPaid: boolean }[]
): string {
  const remaining = payments
    .filter((p) => !p.isPaid)
    .reduce((sum, p) => sum.plus(new Decimal(p.amount.toString())), new Decimal(0));
  return remaining.toFixed(2);
}
