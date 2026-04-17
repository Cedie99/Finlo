import Decimal from "decimal.js";
import { addMonths, format } from "date-fns";

export type EarlyPayoffResult = {
  planId: string;
  originalMonthsRemaining: number;
  newMonthsRemaining: number;
  monthsSaved: number;
  originalTotalRemaining: string;
  newTotalPaid: string;
  interestSaved: string;
  newCompletionDate: string;
};

export function calculateEarlyPayoff(input: {
  planId: string;
  remainingAmount: number;
  monthlyAmount: number;
  extraMonthlyAmount: number;
  interestRate?: number; // annual decimal, e.g. 0.12 for 12%
  referenceDate?: Date;
}): EarlyPayoffResult {
  const { planId, remainingAmount, monthlyAmount, extraMonthlyAmount, interestRate } = input;
  const ref = input.referenceDate ?? new Date();

  const remaining = new Decimal(remainingAmount);
  const monthly = new Decimal(monthlyAmount);
  const extra = new Decimal(Math.max(0, extraMonthlyAmount));
  const newMonthly = monthly.plus(extra);

  if (remaining.lte(0)) {
    return {
      planId,
      originalMonthsRemaining: 0,
      newMonthsRemaining: 0,
      monthsSaved: 0,
      originalTotalRemaining: "0",
      newTotalPaid: "0",
      interestSaved: "0",
      newCompletionDate: format(ref, "yyyy-MM-dd"),
    };
  }

  if (interestRate && interestRate > 0) {
    const monthlyRate = new Decimal(interestRate).div(12);

    // Original schedule
    let balance = remaining;
    let origMonths = 0;
    let totalPaidOrig = new Decimal(0);
    let totalInterestOrig = new Decimal(0);
    while (balance.gt(0) && origMonths < 1200) {
      const interest = balance.times(monthlyRate);
      totalInterestOrig = totalInterestOrig.plus(interest);
      const payment = Decimal.min(monthly, balance.plus(interest));
      totalPaidOrig = totalPaidOrig.plus(payment);
      balance = balance.plus(interest).minus(monthly);
      if (balance.lt(0)) balance = new Decimal(0);
      origMonths++;
    }

    // New schedule with extra
    balance = remaining;
    let newMonths = 0;
    let totalPaidNew = new Decimal(0);
    let totalInterestNew = new Decimal(0);
    while (balance.gt(0) && newMonths < 1200) {
      const interest = balance.times(monthlyRate);
      totalInterestNew = totalInterestNew.plus(interest);
      const payment = Decimal.min(newMonthly, balance.plus(interest));
      totalPaidNew = totalPaidNew.plus(payment);
      balance = balance.plus(interest).minus(newMonthly);
      if (balance.lt(0)) balance = new Decimal(0);
      newMonths++;
    }

    return {
      planId,
      originalMonthsRemaining: origMonths,
      newMonthsRemaining: newMonths,
      monthsSaved: Math.max(0, origMonths - newMonths),
      originalTotalRemaining: totalPaidOrig.toDecimalPlaces(2).toString(),
      newTotalPaid: totalPaidNew.toDecimalPlaces(2).toString(),
      interestSaved: totalInterestOrig
        .minus(totalInterestNew)
        .toDecimalPlaces(2)
        .toString(),
      newCompletionDate: format(addMonths(ref, newMonths), "yyyy-MM-dd"),
    };
  }

  // No interest — simple division
  const origMonths = remaining.div(monthly).ceil().toNumber();
  const newMonths = remaining.div(newMonthly).ceil().toNumber();

  return {
    planId,
    originalMonthsRemaining: origMonths,
    newMonthsRemaining: newMonths,
    monthsSaved: Math.max(0, origMonths - newMonths),
    originalTotalRemaining: monthly.times(origMonths).toDecimalPlaces(2).toString(),
    newTotalPaid: newMonthly.times(newMonths).toDecimalPlaces(2).toString(),
    interestSaved: "0",
    newCompletionDate: format(addMonths(ref, newMonths), "yyyy-MM-dd"),
  };
}
