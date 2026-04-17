import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Decimal from "decimal.js";
import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import { getMonthYear, formatMonthYear } from "@/lib/utils/dates";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const today = new Date();

  const activeInstallments = await prisma.installmentPlan.findMany({
    where: { userId, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      monthlyAmount: true,
      totalMonths: true,
      paidMonths: true,
      startDate: true,
      nextDueDate: true,
    },
  });

  const crunchMonths: {
    monthYear: string;
    label: string;
    installments: { name: string; amount: string; dueDate: string }[];
    totalAmount: string;
    severity: "WARNING" | "CRITICAL";
  }[] = [];

  for (let i = 0; i < 12; i++) {
    const monthStart = startOfMonth(addMonths(today, i));
    const monthEnd = endOfMonth(monthStart);
    const monthYear = format(monthStart, "yyyy-MM");

    const activeThisMonth: { name: string; amount: string; dueDate: string }[] = [];
    let totalAmount = new Decimal(0);

    for (const plan of activeInstallments) {
      const planStart = new Date(getMonthYear(plan.startDate) + "-01T00:00:00");
      const monthsFromPlanStart =
        (monthStart.getFullYear() - planStart.getFullYear()) * 12 +
        (monthStart.getMonth() - planStart.getMonth());

      if (monthsFromPlanStart >= 0 && monthsFromPlanStart < plan.totalMonths) {
        // Approximate due date in this month based on nextDueDate day-of-month
        const dueDay = plan.nextDueDate
          ? plan.nextDueDate.getDate()
          : monthStart.getDate();
        const approxDue = new Date(
          monthStart.getFullYear(),
          monthStart.getMonth(),
          Math.min(dueDay, 28)
        );

        activeThisMonth.push({
          name: plan.name,
          amount: plan.monthlyAmount.toString(),
          dueDate: format(approxDue, "yyyy-MM-dd"),
        });
        totalAmount = totalAmount.plus(new Decimal(plan.monthlyAmount.toString()));
      }
    }

    // Only flag months with 3+ overlapping installments
    if (activeThisMonth.length >= 3) {
      crunchMonths.push({
        monthYear,
        label: formatMonthYear(monthYear),
        installments: activeThisMonth,
        totalAmount: totalAmount.toString(),
        severity: activeThisMonth.length >= 5 ? "CRITICAL" : "WARNING",
      });
    }
  }

  // Find the safest upcoming month (fewest installments)
  let safestMonth: string | null = null;
  let minCount = Infinity;
  for (let i = 0; i < 12; i++) {
    const monthStart = startOfMonth(addMonths(today, i));
    const monthYear = format(monthStart, "yyyy-MM");
    let count = 0;
    for (const plan of activeInstallments) {
      const planStart = new Date(getMonthYear(plan.startDate) + "-01T00:00:00");
      const monthsFromPlanStart =
        (monthStart.getFullYear() - planStart.getFullYear()) * 12 +
        (monthStart.getMonth() - planStart.getMonth());
      if (monthsFromPlanStart >= 0 && monthsFromPlanStart < plan.totalMonths) count++;
    }
    if (count < minCount) {
      minCount = count;
      safestMonth = monthYear;
    }
  }

  return NextResponse.json({ crunchMonths, safestMonth });
}
