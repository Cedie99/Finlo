import Decimal from "decimal.js";
import { addDays, endOfMonth, format, getDay, getDaysInMonth, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getMonthYear } from "@/lib/utils/dates";

type RecurringLike = {
  frequency: "WEEKLY" | "MONTHLY" | "YEARLY";
  startDate: Date;
  endDate: Date | null;
  dayOfMonth: number | null;
};

export type SafeToSpendRisk = {
  type: "INSUFFICIENT_BUFFER" | "AUTOPAY_CONFLICT";
  date: string;
  message: string;
  projectedBalance?: string;
  shortfall?: string;
  totalDue?: string;
};

export type SafeToSpendTimelineDay = {
  date: string;
  inflow: string;
  outflow: string;
  projectedBalance: string;
};

export type SafeToSpendResult = {
  monthYear: string;
  targetDate: string;
  horizonDays: number;
  availableBalance: string;
  bufferAmount: string;
  safeToSpendToday: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  forecast: {
    lowestProjectedBalance: string;
    timeline: SafeToSpendTimelineDay[];
  };
  risks: SafeToSpendRisk[];
};

function getRecurringDatesInRange(
  item: RecurringLike,
  start: Date,
  end: Date
): Date[] {
  if (item.startDate > end) return [];
  if (item.endDate && item.endDate < start) return [];

  const dates: Date[] = [];

  if (item.frequency === "MONTHLY") {
    const day = item.dayOfMonth ?? item.startDate.getDate();
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

    while (cursor <= end) {
      const clamped = Math.min(day, getDaysInMonth(cursor));
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), clamped);
      if (date >= start && date <= end) dates.push(date);
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return dates;
  }

  if (item.frequency === "WEEKLY") {
    const targetDow = getDay(item.startDate);
    let cursor = new Date(start);
    while (getDay(cursor) !== targetDow) {
      cursor = addDays(cursor, 1);
    }

    while (cursor <= end) {
      dates.push(new Date(cursor));
      cursor = addDays(cursor, 7);
    }

    return dates;
  }

  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= end) {
    const date = new Date(cursor.getFullYear(), item.startDate.getMonth(), item.startDate.getDate());
    if (date >= start && date <= end) dates.push(date);
    cursor.setFullYear(cursor.getFullYear() + 1);
  }

  return dates;
}

function getTemplateIncomeDatesInRange(dayOfMonth: number, start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  while (cursor <= end) {
    const clamped = Math.min(dayOfMonth, getDaysInMonth(cursor));
    const date = new Date(cursor.getFullYear(), cursor.getMonth(), clamped);
    if (date >= start && date <= end) dates.push(date);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return dates;
}

export async function getSafeToSpendForUser(userId: string, options?: {
  monthYear?: string;
  targetDate?: Date;
  horizonDays?: number;
}): Promise<SafeToSpendResult> {
  const horizonDays = options?.horizonDays ?? 14;
  const monthYear = options?.monthYear ?? getMonthYear(options?.targetDate ?? new Date());
  const targetDate = startOfDay(options?.targetDate ?? new Date());
  const monthStart = new Date(`${monthYear}-01T00:00:00`);
  const monthEnd = endOfMonth(monthStart);
  const horizonEnd = startOfDay(addDays(targetDate, horizonDays - 1));

  const [
    incomeAgg,
    expensesToDateAgg,
    incomeEntries,
    incomeTemplates,
    unpaidInstallments,
    activeRecurring,
    userPreferences,
  ] = await Promise.all([
    prisma.income.aggregate({
      where: { userId, monthYear },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: monthStart, lte: targetDate },
      },
      _sum: { amount: true },
    }),
    prisma.income.findMany({
      where: {
        userId,
        monthYear,
        receivedAt: { gte: targetDate, lte: horizonEnd },
      },
      select: { source: true, amount: true, receivedAt: true },
    }),
    prisma.incomeTemplate.findMany({
      where: { userId },
      select: { source: true, amount: true, dayOfMonth: true },
    }),
    prisma.installmentPayment.findMany({
      where: {
        isPaid: false,
        dueDate: { gte: targetDate, lte: horizonEnd },
        installmentPlan: { userId, status: "ACTIVE" },
      },
      include: {
        installmentPlan: { select: { name: true } },
      },
    }),
    prisma.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
        type: "EXPENSE",
        startDate: { lte: horizonEnd },
      },
      select: {
        description: true,
        amount: true,
        frequency: true,
        startDate: true,
        endDate: true,
        dayOfMonth: true,
      },
    }),
    prisma.userPreference.findUnique({
      where: { userId },
      select: {
        minimumCashBuffer: true,
        bufferPercentage: true,
        paydayDaysOfMonth: true,
      },
    }),
  ]);

  const totalIncome = new Decimal(incomeAgg._sum.amount?.toString() ?? "0");
  const spentToDate = new Decimal(expensesToDateAgg._sum.amount?.toString() ?? "0");
  const availableBalance = totalIncome.minus(spentToDate);
  const preferredFixedBuffer = userPreferences?.minimumCashBuffer
    ? new Decimal(userPreferences.minimumCashBuffer.toString())
    : null;
  const preferredPercent = userPreferences?.bufferPercentage
    ? new Decimal(userPreferences.bufferPercentage.toString())
    : new Decimal(10);
  const bufferAmount = preferredFixedBuffer ?? totalIncome.times(preferredPercent).div(100);

  const incomeEvents = incomeEntries.map((entry) => ({
    date: format(entry.receivedAt ?? targetDate, "yyyy-MM-dd"),
    amount: new Decimal(entry.amount.toString()),
  }));

  const projectedIncomeEventsFromTemplates = incomeTemplates.flatMap((template) => {
    if (!template.dayOfMonth) return [] as { date: string; amount: Decimal }[];
    return getTemplateIncomeDatesInRange(template.dayOfMonth, targetDate, horizonEnd).map((date) => ({
      date: format(date, "yyyy-MM-dd"),
      amount: new Decimal(template.amount.toString()),
    }));
  });

  const projectedIncomeEvents = incomeEvents.length > 0
    ? incomeEvents
    : projectedIncomeEventsFromTemplates.length > 0
    ? projectedIncomeEventsFromTemplates
    : [];

  const installmentEvents = unpaidInstallments.map((item) => ({
    date: format(item.dueDate, "yyyy-MM-dd"),
    amount: new Decimal(item.amount.toString()),
    name: item.installmentPlan.name,
  }));

  const recurringEvents = activeRecurring.flatMap((item) =>
    getRecurringDatesInRange(item, targetDate, horizonEnd).map((date) => ({
      date: format(date, "yyyy-MM-dd"),
      amount: new Decimal(item.amount.toString()),
      name: item.description,
    }))
  );

  const outflowByDate = new Map<string, { total: Decimal; count: number }>();
  for (const item of [...installmentEvents, ...recurringEvents]) {
    const existing = outflowByDate.get(item.date) ?? { total: new Decimal(0), count: 0 };
    outflowByDate.set(item.date, {
      total: existing.total.plus(item.amount),
      count: existing.count + 1,
    });
  }

  const incomeByDate = new Map<string, Decimal>();
  for (const item of projectedIncomeEvents) {
    incomeByDate.set(item.date, (incomeByDate.get(item.date) ?? new Decimal(0)).plus(item.amount));
  }

  const timeline: SafeToSpendTimelineDay[] = [];
  let runningBalance = availableBalance;
  let lowestProjected = runningBalance;

  for (let i = 0; i < horizonDays; i++) {
    const day = addDays(targetDate, i);
    const dateKey = format(day, "yyyy-MM-dd");
    const inflow = incomeByDate.get(dateKey) ?? new Decimal(0);
    const outflow = outflowByDate.get(dateKey)?.total ?? new Decimal(0);

    runningBalance = runningBalance.plus(inflow).minus(outflow);
    if (runningBalance.lt(lowestProjected)) {
      lowestProjected = runningBalance;
    }

    timeline.push({
      date: dateKey,
      inflow: inflow.toString(),
      outflow: outflow.toString(),
      projectedBalance: runningBalance.toString(),
    });
  }

  const bufferShortfall = Decimal.max(new Decimal(0), bufferAmount.minus(lowestProjected));
  const safeToSpendToday = Decimal.max(new Decimal(0), availableBalance.minus(bufferShortfall));

  const risks: SafeToSpendRisk[] = [];

  if (lowestProjected.lt(bufferAmount)) {
    risks.push({
      type: "INSUFFICIENT_BUFFER",
      date: timeline.find((t) => new Decimal(t.projectedBalance).lt(bufferAmount))?.date ?? format(targetDate, "yyyy-MM-dd"),
      message: "Projected balance drops below your minimum buffer.",
      projectedBalance: lowestProjected.toString(),
      shortfall: bufferAmount.minus(lowestProjected).toString(),
    });
  }

  for (const [date, info] of outflowByDate.entries()) {
    if (info.count > 1) {
      risks.push({
        type: "AUTOPAY_CONFLICT",
        date,
        message: "Multiple payments are due on the same day.",
        totalDue: info.total.toString(),
      });
    }
  }

  let confidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  if (incomeEvents.length > 0) {
    confidence = "HIGH";
  } else if (incomeTemplates.length > 0) {
    confidence = "MEDIUM";
  }

  return {
    monthYear,
    targetDate: format(targetDate, "yyyy-MM-dd"),
    horizonDays,
    availableBalance: availableBalance.toString(),
    bufferAmount: bufferAmount.toString(),
    safeToSpendToday: safeToSpendToday.toString(),
    confidence,
    forecast: {
      lowestProjectedBalance: lowestProjected.toString(),
      timeline,
    },
    risks,
  };
}
