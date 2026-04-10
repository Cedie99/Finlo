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

type CashEvent = {
  date: string;
  amount: Decimal;
};

type RescueAction = {
  title: string;
  description: string;
  impactAmount: string;
};

type TimelineDay = {
  date: string;
  inflow: string;
  outflow: string;
  projectedBalance: string;
};

export type WhatIfResult = {
  monthYear: string;
  targetDate: string;
  horizonDays: number;
  baseline: {
    safeToSpendToday: string;
    lowestProjectedBalance: string;
  };
  scenario: {
    safeToSpendToday: string;
    lowestProjectedBalance: string;
    timeline: TimelineDay[];
  };
  delta: {
    safeToSpendChange: string;
    lowestBalanceChange: string;
  };
  rescuePlan: RescueAction[];
};

function getRecurringDatesInRange(item: RecurringLike, start: Date, end: Date): Date[] {
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

function summarizeProjection(
  availableBalance: Decimal,
  bufferAmount: Decimal,
  incomeEvents: CashEvent[],
  outflowEvents: CashEvent[],
  targetDate: Date,
  horizonDays: number
) {
  const incomeByDate = new Map<string, Decimal>();
  for (const item of incomeEvents) {
    incomeByDate.set(item.date, (incomeByDate.get(item.date) ?? new Decimal(0)).plus(item.amount));
  }

  const outflowByDate = new Map<string, Decimal>();
  for (const item of outflowEvents) {
    outflowByDate.set(item.date, (outflowByDate.get(item.date) ?? new Decimal(0)).plus(item.amount));
  }

  const timeline: TimelineDay[] = [];
  let runningBalance = availableBalance;
  let lowestProjected = runningBalance;

  for (let i = 0; i < horizonDays; i++) {
    const day = addDays(targetDate, i);
    const dateKey = format(day, "yyyy-MM-dd");
    const inflow = incomeByDate.get(dateKey) ?? new Decimal(0);
    const outflow = outflowByDate.get(dateKey) ?? new Decimal(0);

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

  return {
    timeline,
    safeToSpendToday,
    lowestProjected,
  };
}

function buildRescuePlan(input: {
  shortfall: Decimal;
  unexpectedExpenseAmount: Decimal;
  salaryDelayDays: number;
  incomeInHorizon: Decimal;
  addedDebtAmount: Decimal;
  budgetTotal: Decimal;
  topBudgetCategoryNames: string[];
}): RescueAction[] {
  if (input.shortfall.lte(0)) {
    return [
      {
        title: "No rescue needed",
        description: "Scenario keeps your projected balance above your minimum buffer.",
        impactAmount: "0",
      },
    ];
  }

  const actions: RescueAction[] = [];
  let remaining = input.shortfall;

  if (input.unexpectedExpenseAmount.gt(0) && remaining.gt(0)) {
    const impact = Decimal.min(remaining, input.unexpectedExpenseAmount);
    actions.push({
      title: "Defer one-time shock expense",
      description: "Push the unexpected expense to next cycle or split it into installments.",
      impactAmount: impact.toString(),
    });
    remaining = remaining.minus(impact);
  }

  if (input.salaryDelayDays > 0 && input.incomeInHorizon.gt(0) && remaining.gt(0)) {
    const impact = Decimal.min(remaining, input.incomeInHorizon);
    actions.push({
      title: "Bridge delayed income",
      description: `Cover delayed salary for ${input.salaryDelayDays} day(s) with temporary bridge cash or short-term transfer.`,
      impactAmount: impact.toString(),
    });
    remaining = remaining.minus(impact);
  }

  if (input.budgetTotal.gt(0) && remaining.gt(0)) {
    const impact = Decimal.min(remaining, input.budgetTotal.times(0.3));
    const names = input.topBudgetCategoryNames.length > 0
      ? input.topBudgetCategoryNames.join(", ")
      : "discretionary categories";

    actions.push({
      title: "Temporary budget squeeze",
      description: `Trim this month's allocations for ${names}.`,
      impactAmount: impact.toString(),
    });
    remaining = remaining.minus(impact);
  }

  if (input.addedDebtAmount.gt(0) && remaining.gt(0)) {
    const impact = Decimal.min(remaining, input.addedDebtAmount);
    actions.push({
      title: "Delay new debt start date",
      description: "Start the added debt obligation next month to reduce immediate pressure.",
      impactAmount: impact.toString(),
    });
    remaining = remaining.minus(impact);
  }

  if (remaining.gt(0)) {
    actions.push({
      title: "Top up cash buffer",
      description: "Inject additional cash from savings to fully protect your floor.",
      impactAmount: remaining.toString(),
    });
  }

  return actions;
}

export async function runWhatIfScenario(
  userId: string,
  input: {
    monthYear: string;
    targetDate?: string;
    horizonDays?: number;
    scenario: {
      salaryDelayDays: number;
      unexpectedExpenseAmount: number;
      unexpectedExpenseDate?: string;
      incomeDropPercent: number;
      addedDebtAmount: number;
    };
  }
): Promise<WhatIfResult> {
  const horizonDays = input.horizonDays ?? 14;
  const targetDate = startOfDay(input.targetDate ? new Date(input.targetDate) : new Date());
  const monthYear = input.monthYear || getMonthYear(targetDate);
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
    budgetLimits,
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
      select: { amount: true, receivedAt: true },
    }),
    prisma.incomeTemplate.findMany({
      where: { userId },
      select: { amount: true, dayOfMonth: true },
    }),
    prisma.installmentPayment.findMany({
      where: {
        isPaid: false,
        dueDate: { gte: targetDate, lte: horizonEnd },
        installmentPlan: { userId, status: "ACTIVE" },
      },
      select: { amount: true, dueDate: true },
    }),
    prisma.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
        type: "EXPENSE",
        startDate: { lte: horizonEnd },
      },
      select: {
        amount: true,
        frequency: true,
        startDate: true,
        endDate: true,
        dayOfMonth: true,
      },
    }),
    prisma.userPreference.findUnique({
      where: { userId },
      select: { minimumCashBuffer: true, bufferPercentage: true },
    }),
    prisma.budgetLimit.findMany({
      where: { userId, monthYear },
      select: {
        limitAmount: true,
        budgetCategory: { select: { name: true } },
      },
      orderBy: { limitAmount: "desc" },
      take: 3,
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

  const directIncomeEvents: CashEvent[] = incomeEntries.map((entry) => ({
    date: format(entry.receivedAt ?? targetDate, "yyyy-MM-dd"),
    amount: new Decimal(entry.amount.toString()),
  }));

  const templateIncomeEvents: CashEvent[] = incomeTemplates.flatMap((template) => {
    if (!template.dayOfMonth) return [] as CashEvent[];
    return getTemplateIncomeDatesInRange(template.dayOfMonth, targetDate, horizonEnd).map((date) => ({
      date: format(date, "yyyy-MM-dd"),
      amount: new Decimal(template.amount.toString()),
    }));
  });

  const baselineIncomeEvents = directIncomeEvents.length > 0 ? directIncomeEvents : templateIncomeEvents;

  const installmentOutflows: CashEvent[] = unpaidInstallments.map((item) => ({
    date: format(item.dueDate, "yyyy-MM-dd"),
    amount: new Decimal(item.amount.toString()),
  }));

  const recurringOutflows: CashEvent[] = activeRecurring.flatMap((item) =>
    getRecurringDatesInRange(item, targetDate, horizonEnd).map((date) => ({
      date: format(date, "yyyy-MM-dd"),
      amount: new Decimal(item.amount.toString()),
    }))
  );

  const baselineOutflowEvents = [...installmentOutflows, ...recurringOutflows];

  const baselineProjection = summarizeProjection(
    availableBalance,
    bufferAmount,
    baselineIncomeEvents,
    baselineOutflowEvents,
    targetDate,
    horizonDays
  );

  const incomeDropFactor = new Decimal(1).minus(new Decimal(input.scenario.incomeDropPercent).div(100));
  const delayedIncomeEvents: CashEvent[] = baselineIncomeEvents
    .map((item) => {
      const delayedDate = addDays(new Date(`${item.date}T00:00:00`), input.scenario.salaryDelayDays);
      const dateKey = format(delayedDate, "yyyy-MM-dd");
      if (delayedDate > horizonEnd) return null;

      return {
        date: dateKey,
        amount: item.amount.times(incomeDropFactor),
      };
    })
    .filter((item): item is CashEvent => item !== null);

  const scenarioOutflows: CashEvent[] = [...baselineOutflowEvents];
  const unexpectedExpense = new Decimal(input.scenario.unexpectedExpenseAmount);
  if (unexpectedExpense.gt(0)) {
    const unexpectedDate = input.scenario.unexpectedExpenseDate
      ? startOfDay(new Date(input.scenario.unexpectedExpenseDate))
      : targetDate;
    if (unexpectedDate >= targetDate && unexpectedDate <= horizonEnd) {
      scenarioOutflows.push({
        date: format(unexpectedDate, "yyyy-MM-dd"),
        amount: unexpectedExpense,
      });
    }
  }

  const addedDebt = new Decimal(input.scenario.addedDebtAmount);
  if (addedDebt.gt(0)) {
    scenarioOutflows.push({
      date: format(targetDate, "yyyy-MM-dd"),
      amount: addedDebt,
    });
  }

  const scenarioProjection = summarizeProjection(
    availableBalance,
    bufferAmount,
    delayedIncomeEvents,
    scenarioOutflows,
    targetDate,
    horizonDays
  );

  const shortfall = Decimal.max(new Decimal(0), bufferAmount.minus(scenarioProjection.lowestProjected));
  const budgetTotal = budgetLimits.reduce(
    (sum, item) => sum.plus(new Decimal(item.limitAmount.toString())),
    new Decimal(0)
  );
  const incomeInHorizon = delayedIncomeEvents.reduce((sum, item) => sum.plus(item.amount), new Decimal(0));

  const rescuePlan = buildRescuePlan({
    shortfall,
    unexpectedExpenseAmount: unexpectedExpense,
    salaryDelayDays: input.scenario.salaryDelayDays,
    incomeInHorizon,
    addedDebtAmount: addedDebt,
    budgetTotal,
    topBudgetCategoryNames: budgetLimits.map((item) => item.budgetCategory.name),
  });

  return {
    monthYear,
    targetDate: format(targetDate, "yyyy-MM-dd"),
    horizonDays,
    baseline: {
      safeToSpendToday: baselineProjection.safeToSpendToday.toString(),
      lowestProjectedBalance: baselineProjection.lowestProjected.toString(),
    },
    scenario: {
      safeToSpendToday: scenarioProjection.safeToSpendToday.toString(),
      lowestProjectedBalance: scenarioProjection.lowestProjected.toString(),
      timeline: scenarioProjection.timeline,
    },
    delta: {
      safeToSpendChange: scenarioProjection.safeToSpendToday.minus(baselineProjection.safeToSpendToday).toString(),
      lowestBalanceChange: scenarioProjection.lowestProjected.minus(baselineProjection.lowestProjected).toString(),
    },
    rescuePlan,
  };
}
