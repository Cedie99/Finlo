import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMonthRange, getMonthYear } from "@/lib/utils/dates";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const monthYear = searchParams.get("monthYear") || getMonthYear();
  const { start, end } = getMonthRange(monthYear);
  const userId = session.user.id;

  const [
    incomeAgg,
    expenseAgg,
    upcomingPlans,
    upcomingRecurring,
    budgetSpending,
    budgetLimits,
  ] = await Promise.all([
    prisma.income.aggregate({
      where: { userId, monthYear },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    prisma.installmentPlan.findMany({
      where: {
        userId,
        status: "ACTIVE",
        nextDueDate: { gte: start, lte: end },
      },
      select: {
        id: true,
        name: true,
        monthlyAmount: true,
        nextDueDate: true,
        type: true,
        creditCard: { select: { bankName: true, color: true } },
      },
      orderBy: { nextDueDate: "asc" },
      take: 10,
    }),
    prisma.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
        nextDueDate: { gte: start, lte: end },
      },
      select: {
        id: true,
        description: true,
        amount: true,
        nextDueDate: true,
        frequency: true,
        type: true,
        budgetCategory: { select: { name: true, color: true } },
      },
      orderBy: { nextDueDate: "asc" },
      take: 10,
    }),
    prisma.transaction.groupBy({
      by: ["budgetCategoryId"],
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: start, lte: end },
        budgetCategoryId: { not: null },
      },
      _sum: { amount: true },
    }),
    prisma.budgetLimit.findMany({
      where: { userId, monthYear },
      include: { budgetCategory: { select: { name: true, color: true } } },
    }),
  ]);

  const spendingMap = Object.fromEntries(
    budgetSpending.map((s: { budgetCategoryId: string | null; _sum: { amount: unknown } }) => [
      s.budgetCategoryId,
      s._sum.amount?.toString() ?? "0",
    ])
  );

  const budgetSummary = budgetLimits.map((l: {
    budgetCategoryId: string;
    limitAmount: { toString: () => string };
    budgetCategory: { name: string; color: string };
  }) => ({
    categoryId: l.budgetCategoryId,
    categoryName: l.budgetCategory.name,
    categoryColor: l.budgetCategory.color,
    limitAmount: l.limitAmount.toString(),
    spent: spendingMap[l.budgetCategoryId] ?? "0",
  }));

  const upcomingPayments = [
    ...upcomingPlans.map((p) => ({
      id: p.id,
      name: p.name,
      amount: p.monthlyAmount.toString(),
      nextDueDate: p.nextDueDate!.toISOString(),
      kind: "installment" as const,
      meta: p.creditCard ? { color: p.creditCard.color, label: p.creditCard.bankName } : null,
    })),
    ...upcomingRecurring.map((r) => ({
      id: r.id,
      name: r.description,
      amount: r.amount.toString(),
      nextDueDate: r.nextDueDate.toISOString(),
      kind: "recurring" as const,
      meta: r.budgetCategory ? { color: r.budgetCategory.color, label: r.budgetCategory.name } : null,
    })),
  ].sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

  return NextResponse.json({
    monthYear,
    totalIncome: incomeAgg._sum.amount?.toString() ?? "0",
    totalExpenses: expenseAgg._sum.amount?.toString() ?? "0",
    upcomingPayments,
    budgetSummary,
  });
}
