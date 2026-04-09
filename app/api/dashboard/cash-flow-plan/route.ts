import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMonthYear } from "@/lib/utils/dates";
import { endOfMonth, getDaysInMonth, getDay, addDays, format } from "date-fns";
import Decimal from "decimal.js";

/** Compute which dates within [monthStart, monthEnd] a recurring transaction falls on. */
function getRecurringDatesInMonth(
  r: { frequency: string; startDate: Date; endDate: Date | null; dayOfMonth: number | null },
  monthStart: Date,
  monthEnd: Date
): Date[] {
  // Not started yet for this month
  if (r.startDate > monthEnd) return [];
  // Already ended before this month
  if (r.endDate && r.endDate < monthStart) return [];

  const dates: Date[] = [];

  if (r.frequency === "MONTHLY") {
    const day = r.dayOfMonth ?? r.startDate.getDate();
    const clamped = Math.min(day, getDaysInMonth(monthStart));
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), clamped);
    if (date >= monthStart && date <= monthEnd) dates.push(date);

  } else if (r.frequency === "WEEKLY") {
    const targetDow = getDay(r.startDate);
    let cur = new Date(monthStart);
    // Advance to the first matching day-of-week in the month
    while (getDay(cur) !== targetDow) cur = addDays(cur, 1);
    while (cur <= monthEnd) {
      dates.push(new Date(cur));
      cur = addDays(cur, 7);
    }

  } else if (r.frequency === "YEARLY") {
    const date = new Date(
      monthStart.getFullYear(),
      r.startDate.getMonth(),
      r.startDate.getDate()
    );
    if (date >= monthStart && date <= monthEnd) dates.push(date);
  }

  return dates;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const monthYear = searchParams.get("monthYear") || getMonthYear();
  const userId = session.user.id;

  const monthStart = new Date(`${monthYear}-01`);
  const monthEnd = endOfMonth(monthStart);

  const [incomeEntries, incomeTemplates, activePlans, dueDates, allRecurring, budgetLimitsAgg] = await Promise.all([
    prisma.income.findMany({
      where: { userId, monthYear },
      orderBy: { receivedAt: "asc" },
    }),
    prisma.incomeTemplate.findMany({
      where: { userId },
      select: { source: true, amount: true, dayOfMonth: true },
    }),
    prisma.installmentPlan.findMany({
      where: { userId, status: "ACTIVE" },
      select: { id: true, name: true, type: true, monthlyAmount: true, nextDueDate: true },
    }),
    prisma.installmentPayment.findMany({
      where: {
        isPaid: false,
        dueDate: { gte: monthStart, lte: monthEnd },
        installmentPlan: { userId, status: "ACTIVE" },
      },
      include: {
        installmentPlan: { select: { name: true, type: true, monthlyAmount: true } },
      },
    }),
    // Fetch all active recurring that started on or before month end
    prisma.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
        startDate: { lte: monthEnd },
      },
      select: {
        id: true,
        description: true,
        amount: true,
        frequency: true,
        startDate: true,
        endDate: true,
        dayOfMonth: true,
        type: true,
      },
    }),
    prisma.budgetLimit.aggregate({
      where: { userId, monthYear },
      _sum: { limitAmount: true },
    }),
  ]);

  const totalIncome = incomeEntries.reduce(
    (sum, e) => sum.plus(new Decimal(e.amount.toString())),
    new Decimal(0)
  );

  const totalInstallments = activePlans.reduce(
    (sum, p) => sum.plus(new Decimal(p.monthlyAmount.toString())),
    new Decimal(0)
  );

  const totalBudgetLimits = new Decimal(
    budgetLimitsAgg._sum.limitAmount?.toString() ?? "0"
  );

  const freeAfterObligations = totalIncome.minus(totalInstallments).minus(totalBudgetLimits);

  const dtiRatio = totalIncome.gt(0)
    ? totalInstallments.div(totalIncome).times(100).toNumber()
    : 0;

  const [year, month] = monthYear.split("-").map(Number);
  const selectedMonth = new Date(year, month - 1, 1);
  const maxDayInMonth = getDaysInMonth(selectedMonth);

  function dateInSelectedMonth(day: number) {
    const safeDay = Math.min(Math.max(day, 1), maxDayInMonth);
    return new Date(year, month - 1, safeDay);
  }

  const templateBySource = new Map(
    incomeTemplates.map((t) => [t.source, t])
  );

  const paydays = incomeEntries.length > 0
    ? incomeEntries.map((e) => {
        const template = templateBySource.get(e.source);
        const day = e.receivedAt?.getDate() ?? template?.dayOfMonth ?? 1;
        return {
          date: format(dateInSelectedMonth(day), "yyyy-MM-dd"),
          amount: e.amount.toString(),
          source: e.source,
        };
      })
    : incomeTemplates.map((t) => ({
        date: format(dateInSelectedMonth(t.dayOfMonth ?? 1), "yyyy-MM-dd"),
        amount: t.amount.toString(),
        source: t.source,
      }));

  // Compute recurring calendar entries for this month
  const recurringEntries = allRecurring.flatMap((r) =>
    getRecurringDatesInMonth(r, monthStart, monthEnd).map((date) => ({
      date: format(date, "yyyy-MM-dd"),
      amount: r.amount.toString(),
      name: r.description,
      kind: "recurring" as const,
    }))
  );

  return NextResponse.json({
    monthYear,
    income: {
      total: totalIncome.toString(),
      entries: incomeEntries.map((e) => ({
        id: e.id,
        source: e.source,
        amount: e.amount.toString(),
        receivedAt: e.receivedAt?.toISOString() ?? null,
      })),
    },
    obligations: {
      totalInstallments: totalInstallments.toString(),
      totalBudgetLimits: totalBudgetLimits.toString(),
      freeAfterObligations: freeAfterObligations.toString(),
    },
    dtiRatio: Math.round(dtiRatio * 10) / 10,
    calendar: {
      paydays,
      dueDates: [
        ...dueDates.map((d) => ({
          date: format(d.dueDate, "yyyy-MM-dd"),
          amount: d.installmentPlan.monthlyAmount.toString(),
          name: d.installmentPlan.name,
          kind: "installment" as const,
        })),
        ...recurringEntries,
      ].sort((a, b) => a.date.localeCompare(b.date)),
    },
  });
}
