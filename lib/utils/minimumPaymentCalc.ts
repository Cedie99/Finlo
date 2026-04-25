export interface PayoffScenario {
  label: string;
  monthlyPayment: number;
  monthsToPayoff: number;
  totalInterestPaid: number;
  totalPaid: number;
}

/**
 * Calculate how long it takes to pay off a credit card balance under a given monthly payment.
 * Uses standard compound interest formula.
 */
export function calcPayoffScenario(
  balance: number,
  apr: number,
  monthlyPayment: number,
  label: string
): PayoffScenario {
  if (balance <= 0 || monthlyPayment <= 0) {
    return { label, monthlyPayment, monthsToPayoff: 0, totalInterestPaid: 0, totalPaid: 0 };
  }

  const monthlyRate = apr / 100 / 12;

  // If payment doesn't cover interest, debt never clears
  if (monthlyRate > 0 && monthlyPayment <= balance * monthlyRate) {
    return {
      label,
      monthlyPayment,
      monthsToPayoff: 999,
      totalInterestPaid: Infinity,
      totalPaid: Infinity,
    };
  }

  let remaining = balance;
  let months = 0;
  let totalInterest = 0;

  while (remaining > 0.01 && months < 1200) {
    const interest = remaining * monthlyRate;
    totalInterest += interest;
    remaining = remaining + interest - monthlyPayment;
    months++;
    if (remaining < 0) remaining = 0;
  }

  return {
    label,
    monthlyPayment,
    monthsToPayoff: months,
    totalInterestPaid: totalInterest,
    totalPaid: balance + totalInterest,
  };
}

/**
 * Generate the 3 standard comparison scenarios for a credit card.
 */
export function getMinimumPaymentScenarios(
  balance: number,
  apr: number,
  minimumPaymentPercent = 2
): PayoffScenario[] {
  const minimumPayment = Math.max(25, balance * (minimumPaymentPercent / 100));
  const doubleMinimum = minimumPayment * 2;

  return [
    calcPayoffScenario(balance, apr, minimumPayment, "Minimum only"),
    calcPayoffScenario(balance, apr, doubleMinimum, "2× minimum"),
    calcPayoffScenario(balance, apr, balance, "Pay in full"),
  ];
}
