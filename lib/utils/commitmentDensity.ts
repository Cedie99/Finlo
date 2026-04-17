import Decimal from "decimal.js";
import { addMonths, endOfMonth, format, getDaysInMonth, startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getMonthYear } from "@/lib/utils/dates";

export type DensityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type CommitmentMonth = {
  monthYear: string;
  label: string;
  totalIncome: string;
  totalObligations: string;
  commitmentRatio: number;
  density: DensityLevel;
  details: {
    installmentTotal: string;
    recurringTotal: string;
    installmentCount: number;
  };
};

export type CommitmentDensityResult = {
  months: CommitmentMonth[];
};

function getDensity(ratio: number): DensityLevel {
  if (ratio < 0.4) return "LOW";
  if (ratio < 0.6) return "MEDIUM";
  if (ratio < 0.8) return "HIGH";
  return "CRITICAL";
}

function getRecurringMonthlyOccurrences(
  item: {
    frequency: "WEEKLY" | "MONTHLY" | "YEARLY";
    startDate: Date;
    endDate: Date | null;
    dayOfMonth: number | null;
  },
  monthStart: Date,
  monthEnd: Date
): number {
  if (item.startDate > monthEnd) return 0;
  if (item.endDate && item.endDate < monthStart) return 0;

  if (item.frequency === "MONTHLY") return 1;

  if (item.frequency === "WEEKLY") {
    const days = getDaysInMonth(monthStart);
    return Math.floor(days / 7) + (days % 7 > 0 ? 1 : 0);
  }

  if (item.frequency === "YEARLY") {
    return item.startDate.getMonth() === monthStart.getMonth() ? 1 : 0;
  }

  return 0;
}

export async function getCommitmentDensityForUser(
  userId: string
): Promise<CommitmentDensityResult> {
  const today = new Date();

  const [activeInstallments, activeRecurring, incomeTemplates] = await Promise.all([
    prisma.installmentPlan.findMany({
      where: { userId, status: "ACTIVE" },
      select: {
        monthlyAmount: true,
        totalMonths: true,
        paidMonths: true,
        startDate: true,
      },
    }),
    prisma.recurringTransaction.findMany({
      where: { userId, isActive: true, type: "EXPENSE" },
      select: {
        amount: true,
        frequency: true,
        startDate: true,
        endDate: true,
        dayOfMonth: true,
      },
    }),
    prisma.incomeTemplate.findMany({
      where: { userId },
      select: { amount: true },
    }),
  ]);

  const projectedMonthlyIncome = incomeTemplates.reduce(
    (sum, t) => sum.plus(new Decimal(t.amount.toString())),
    new Decimal(0)
  );

  const months: CommitmentMonth[] = [];

  for (let i = 0; i < 12; i++) {
    const monthStart = startOfMonth(addMonths(today, i));
    const monthEnd = endOfMonth(monthStart);
    const monthYear = format(monthStart, "yyyy-MM");
    const label = format(monthStart, "MMMM yyyy");

    let installmentTotal = new Decimal(0);
    let installmentCount = 0;

    for (const plan of activeInstallments) {
      const planStart = new Date(getMonthYear(plan.startDate) + "-01T00:00:00");
      const monthsFromPlanStart =
        (monthStart.getFullYear() - planStart.getFullYear()) * 12 +
        (monthStart.getMonth() - planStart.getMonth());

      if (monthsFromPlanStart >= 0 && monthsFromPlanStart < plan.totalMonths) {
        installmentTotal = installmentTotal.plus(new Decimal(plan.monthlyAmount.toString()));
        installmentCount++;
      }
    }

    let recurringTotal = new Decimal(0);
    for (const item of activeRecurring) {
      const occurrences = getRecurringMonthlyOccurrences(item, monthStart, monthEnd);
      recurringTotal = recurringTotal.plus(
        new Decimal(item.amount.toString()).times(occurrences)
      );
    }

    const totalObligations = installmentTotal.plus(recurringTotal);
    const commitmentRatio = projectedMonthlyIncome.gt(0)
      ? Math.min(1, totalObligations.div(projectedMonthlyIncome).toNumber())
      : totalObligations.gt(0)
      ? 1
      : 0;

    months.push({
      monthYear,
      label,
      totalIncome: projectedMonthlyIncome.toString(),
      totalObligations: totalObligations.toString(),
      commitmentRatio,
      density: getDensity(commitmentRatio),
      details: {
        installmentTotal: installmentTotal.toString(),
        recurringTotal: recurringTotal.toString(),
        installmentCount,
      },
    });
  }

  return { months };
}
