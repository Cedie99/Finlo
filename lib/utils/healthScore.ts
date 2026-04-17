import Decimal from "decimal.js";
import { prisma } from "@/lib/prisma";
import { getMonthYear, getMonthRange } from "@/lib/utils/dates";

export type HealthScoreBreakdown = {
  dtiScore: number;
  bufferScore: number;
  paymentScore: number;
  loadScore: number;
};

export type HealthScoreResult = {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  breakdown: HealthScoreBreakdown;
  insights: string[];
};

function getGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

export async function getHealthScoreForUser(userId: string): Promise<HealthScoreResult> {
  const monthYear = getMonthYear();
  const { start, end } = getMonthRange(monthYear);
  const threeMonthsAgo = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 3,
    1
  );

  const [
    incomeAgg,
    activeInstallments,
    recentPayments,
    userPreferences,
    expenseAgg,
  ] = await Promise.all([
    prisma.income.aggregate({
      where: { userId, monthYear },
      _sum: { amount: true },
    }),
    prisma.installmentPlan.findMany({
      where: { userId, status: "ACTIVE" },
      select: { monthlyAmount: true },
    }),
    prisma.installmentPayment.findMany({
      where: {
        installmentPlan: { userId },
        dueDate: { gte: threeMonthsAgo, lte: new Date() },
      },
      select: { isPaid: true, dueDate: true },
    }),
    prisma.userPreference.findUnique({
      where: { userId },
      select: { minimumCashBuffer: true, bufferPercentage: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
  ]);

  const totalMonthlyIncome = new Decimal(incomeAgg._sum.amount?.toString() ?? "0");
  const totalMonthlyExpenses = new Decimal(expenseAgg._sum.amount?.toString() ?? "0");
  const totalInstallmentMonthly = activeInstallments.reduce(
    (sum, p) => sum.plus(new Decimal(p.monthlyAmount.toString())),
    new Decimal(0)
  );

  const insights: string[] = [];

  // 1. DTI Score (0-25)
  let dtiScore = 25;
  if (totalMonthlyIncome.gt(0)) {
    const dtiRatio = totalInstallmentMonthly.div(totalMonthlyIncome).toNumber();
    if (dtiRatio <= 0.2) dtiScore = 25;
    else if (dtiRatio <= 0.36) dtiScore = 20;
    else if (dtiRatio <= 0.5) dtiScore = 12;
    else if (dtiRatio <= 0.7) dtiScore = 5;
    else dtiScore = 0;

    if (dtiRatio > 0.36) {
      insights.push(
        `Debt-to-income ratio is ${(dtiRatio * 100).toFixed(0)}% — ideally stay below 36%.`
      );
    }
  }

  // 2. Buffer Score (0-25)
  const availableBalance = totalMonthlyIncome.minus(totalMonthlyExpenses);
  const bufferAmount = userPreferences?.minimumCashBuffer
    ? new Decimal(userPreferences.minimumCashBuffer.toString())
    : totalMonthlyIncome
        .times(new Decimal(userPreferences?.bufferPercentage?.toString() ?? "10"))
        .div(100);

  let bufferScore = 15;
  if (bufferAmount.gt(0)) {
    const coverage = availableBalance.div(bufferAmount).toNumber();
    if (coverage >= 2) bufferScore = 25;
    else if (coverage >= 1) bufferScore = 18;
    else if (coverage >= 0.5) bufferScore = 8;
    else bufferScore = 0;

    if (coverage < 1) {
      insights.push("Balance is below your minimum cash buffer — you're in the danger zone.");
    }
  }

  // 3. Payment Consistency Score (0-25)
  let paymentScore = 25;
  const pastDue = recentPayments.filter((p) => p.dueDate <= new Date());
  if (pastDue.length > 0) {
    const paidCount = pastDue.filter((p) => p.isPaid).length;
    paymentScore = Math.round((paidCount / pastDue.length) * 25);
    const missed = pastDue.length - paidCount;
    if (missed > 0) {
      insights.push(
        `${missed} missed payment${missed > 1 ? "s" : ""} detected in the past 3 months.`
      );
    }
  }

  // 4. Installment Load Score (0-25)
  let loadScore = 25;
  if (totalMonthlyIncome.gt(0)) {
    const loadRatio = totalInstallmentMonthly.div(totalMonthlyIncome).toNumber();
    if (loadRatio <= 0.15) loadScore = 25;
    else if (loadRatio <= 0.25) loadScore = 18;
    else if (loadRatio <= 0.4) loadScore = 10;
    else loadScore = 3;

    if (loadRatio > 0.4) {
      insights.push(
        `${(loadRatio * 100).toFixed(0)}% of income locked in installments — consider early payoff.`
      );
    }
  }

  if (insights.length === 0) {
    insights.push("Your finances are in great shape. Keep it up!");
  }

  const score = dtiScore + bufferScore + paymentScore + loadScore;

  return {
    score,
    grade: getGrade(score),
    breakdown: { dtiScore, bufferScore, paymentScore, loadScore },
    insights,
  };
}
