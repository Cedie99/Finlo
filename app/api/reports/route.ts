import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();

  // Last 6 months of income vs expenses
  const monthlyData = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const month = subMonths(now, 5 - i);
      const monthYear = format(month, "yyyy-MM");
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      return Promise.all([
        prisma.income.aggregate({ where: { userId: session.user!.id!, monthYear }, _sum: { amount: true } }),
        prisma.transaction.aggregate({ where: { userId: session.user!.id!, type: "EXPENSE", date: { gte: start, lte: end } }, _sum: { amount: true } }),
      ]).then(([inc, exp]) => ({
        month: format(month, "MMM yyyy"),
        monthYear,
        income: Number(inc._sum.amount ?? 0),
        expenses: Number(exp._sum.amount ?? 0),
      }));
    })
  );

  // Active installment plans for timeline
  const installmentPlans = await prisma.installmentPlan.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    select: {
      id: true, name: true, type: true, totalAmount: true, monthlyAmount: true,
      totalMonths: true, paidMonths: true, startDate: true, lenderName: true,
      creditCard: { select: { bankName: true, cardName: true, color: true } },
    },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json({ monthlyData, installmentPlans });
}
