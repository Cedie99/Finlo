import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { differenceInDays } from "date-fns";

export interface PriorityItem {
  id: string;
  name: string;
  type: "INSTALLMENT" | "CREDIT_CARD";
  planType?: string;
  amount: number;
  balance: number;
  interestRate: number | null;
  daysUntilDue: number | null;
  isOverdue: boolean;
  reason: string;
  rank: number;
  href: string;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const plans = await prisma.installmentPlan.findMany({
    where: { userId, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      type: true,
      monthlyAmount: true,
      totalAmount: true,
      paidMonths: true,
      totalMonths: true,
      nextDueDate: true,
      interestRate: true,
    },
  });

  const items: PriorityItem[] = [];

  for (const plan of plans) {
    const balance =
      Number(plan.totalAmount) - Number(plan.monthlyAmount) * plan.paidMonths;
    if (balance <= 0) continue;

    let dueDate: Date | null = null;
    if (plan.nextDueDate instanceof Date) {
      dueDate = plan.nextDueDate;
    } else if (typeof plan.nextDueDate === "string") {
      const parsed = new Date(plan.nextDueDate);
      dueDate = Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    const daysUntilDue = dueDate ? differenceInDays(dueDate, today) : null;
    const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
    const interestRate = plan.interestRate ? Number(plan.interestRate) : null;

    let reason = "";
    let score = 0;

    if (isOverdue) {
      reason = `Overdue by ${Math.abs(daysUntilDue!)} day${Math.abs(daysUntilDue!) !== 1 ? "s" : ""}`;
      score = 10000 + Math.abs(daysUntilDue!);
    } else if (interestRate && interestRate > 0) {
      reason = `${interestRate}% interest rate — paying first saves the most`;
      score = interestRate * 100;
    } else if (daysUntilDue !== null && daysUntilDue <= 7) {
      reason = `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}`;
      score = 500 - daysUntilDue;
    } else if (daysUntilDue !== null) {
      reason = `Due ${daysUntilDue > 0 ? `in ${daysUntilDue} days` : "today"}`;
      score = Math.max(0, 200 - daysUntilDue);
    } else {
      reason = "Active plan — stay on schedule";
      score = 10;
    }

    items.push({
      id: plan.id,
      name: plan.name,
      type: "INSTALLMENT",
      planType: plan.type,
      amount: Number(plan.monthlyAmount),
      balance,
      interestRate,
      daysUntilDue,
      isOverdue,
      reason,
      rank: 0,
      href: `/installments/${plan.id}`,
    });

    // Attach score temporarily for sorting
    (items[items.length - 1] as PriorityItem & { _score: number })._score = score;
  }

  // Sort descending by score, then assign rank
  items.sort(
    (a, b) =>
      ((b as PriorityItem & { _score: number })._score ?? 0) -
      ((a as PriorityItem & { _score: number })._score ?? 0)
  );

  items.forEach((item, i) => {
    item.rank = i + 1;
    delete (item as PriorityItem & { _score?: number })._score;
  });

  return NextResponse.json({ items });
}
