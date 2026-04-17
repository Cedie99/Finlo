import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Decimal from "decimal.js";
import { getMonthYear, getMonthRange } from "@/lib/utils/dates";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const monthYear = searchParams.get("monthYear") || getMonthYear();
  const userId = session.user.id;
  const { start, end } = getMonthRange(monthYear);

  const [incomeAgg, activeInstallments, budgetLimits, activeRecurring, expenseAgg] =
    await Promise.all([
      prisma.income.aggregate({
        where: { userId, monthYear },
        _sum: { amount: true },
      }),
      prisma.installmentPlan.findMany({
        where: { userId, status: "ACTIVE", nextDueDate: { gte: start, lte: end } },
        select: { name: true, monthlyAmount: true },
      }),
      prisma.budgetLimit.findMany({
        where: { userId, monthYear },
        select: {
          limitAmount: true,
          budgetCategory: { select: { name: true, color: true } },
        },
        orderBy: { limitAmount: "desc" },
      }),
      prisma.recurringTransaction.findMany({
        where: { userId, isActive: true, type: "EXPENSE", nextDueDate: { gte: start, lte: end } },
        select: { description: true, amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: "EXPENSE", date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
    ]);

  const totalIncome = new Decimal(incomeAgg._sum.amount?.toString() ?? "0");
  const alreadySpent = new Decimal(expenseAgg._sum.amount?.toString() ?? "0");
  let remaining = totalIncome.minus(alreadySpent);

  type Allocation = {
    category: string;
    label: string;
    amount: string;
    percentage: number;
    priority: number;
    color: string;
  };

  const allocations: Allocation[] = [];
  let priority = 1;

  // 1. Installments (highest priority)
  for (const inst of activeInstallments) {
    const amt = new Decimal(inst.monthlyAmount.toString());
    allocations.push({
      category: "installment",
      label: inst.name,
      amount: amt.toString(),
      percentage: totalIncome.gt(0) ? amt.div(totalIncome).times(100).toDecimalPlaces(1).toNumber() : 0,
      priority: priority++,
      color: "#6366f1",
    });
    remaining = remaining.minus(amt);
  }

  // 2. Recurring bills
  for (const rec of activeRecurring) {
    const amt = new Decimal(rec.amount.toString());
    allocations.push({
      category: "recurring",
      label: rec.description,
      amount: amt.toString(),
      percentage: totalIncome.gt(0) ? amt.div(totalIncome).times(100).toDecimalPlaces(1).toNumber() : 0,
      priority: priority++,
      color: "#f59e0b",
    });
    remaining = remaining.minus(amt);
  }

  // 3. Budget categories
  for (const limit of budgetLimits) {
    const amt = new Decimal(limit.limitAmount.toString());
    allocations.push({
      category: "budget",
      label: limit.budgetCategory.name,
      amount: amt.toString(),
      percentage: totalIncome.gt(0) ? amt.div(totalIncome).times(100).toDecimalPlaces(1).toNumber() : 0,
      priority: priority++,
      color: limit.budgetCategory.color,
    });
    remaining = remaining.minus(amt);
  }

  // 4. Savings suggestion (10% of income)
  const savingsTarget = totalIncome.times(0.1);
  if (savingsTarget.gt(0)) {
    allocations.push({
      category: "savings",
      label: "Savings (10%)",
      amount: savingsTarget.toString(),
      percentage: 10,
      priority: priority++,
      color: "#10b981",
    });
    remaining = remaining.minus(savingsTarget);
  }

  return NextResponse.json({
    monthYear,
    totalIncome: totalIncome.toString(),
    alreadySpent: alreadySpent.toString(),
    allocations,
    unallocated: Decimal.max(new Decimal(0), remaining).toString(),
  });
}
