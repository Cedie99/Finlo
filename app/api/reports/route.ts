import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLastNMonths, getMonthRange } from "@/lib/utils/dates";
import { format } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const months = getLastNMonths(6);
  const userId = session.user.id;

  const monthlyData = await Promise.all(
    months.map(async (monthYear) => {
      const { start, end } = getMonthRange(monthYear);

      const [incomeAgg, expenseAgg, expenseByCategory] = await Promise.all([
        prisma.income.aggregate({
          where: { userId, monthYear },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId, type: "EXPENSE", date: { gte: start, lte: end } },
          _sum: { amount: true },
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
      ]);

      return {
        monthYear,
        income: incomeAgg._sum.amount?.toString() ?? "0",
        expenses: expenseAgg._sum.amount?.toString() ?? "0",
        byCategory: expenseByCategory.map((e: { budgetCategoryId: string | null; _sum: { amount: unknown } }) => ({
          categoryId: e.budgetCategoryId,
          amount: e._sum.amount?.toString() ?? "0",
        })),
      };
    })
  );

  // Get category names
  const categories = await prisma.budgetCategory.findMany({
    where: { userId },
    select: { id: true, name: true, color: true },
  });

  // Get all active installment plans for timeline
  const installmentPlans = await prisma.installmentPlan.findMany({
    where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
    select: {
      id: true,
      name: true,
      type: true,
      startDate: true,
      totalMonths: true,
      monthlyAmount: true,
    },
  });

  return NextResponse.json({
    monthlyData,
    categories,
    installmentPlans: installmentPlans.map((p: {
      id: string;
      name: string;
      type: string;
      startDate: Date;
      totalMonths: number;
      monthlyAmount: { toString: () => string };
    }) => ({
      ...p,
      startDate: p.startDate.toISOString(),
      monthlyAmount: p.monthlyAmount.toString(),
    })),
  });
}
