import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Decimal from "decimal.js";
import { calculateEarlyPayoff } from "@/lib/utils/earlyPayoff";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { planId, extraMonthlyAmount } = body;

  if (!planId || extraMonthlyAmount === undefined) {
    return NextResponse.json({ error: "planId and extraMonthlyAmount are required" }, { status: 400 });
  }

  const plan = await prisma.installmentPlan.findFirst({
    where: { id: planId, userId: session.user.id, status: "ACTIVE" },
    include: {
      payments: {
        where: { isPaid: false },
        orderBy: { dueDate: "asc" },
      },
    },
  });

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const remainingAmount = plan.payments.reduce(
    (sum, p) => sum.plus(new Decimal(p.amount.toString())),
    new Decimal(0)
  );

  const result = calculateEarlyPayoff({
    planId,
    remainingAmount: remainingAmount.toNumber(),
    monthlyAmount: new Decimal(plan.monthlyAmount.toString()).toNumber(),
    extraMonthlyAmount: Number(extraMonthlyAmount),
    interestRate: plan.interestRate
      ? new Decimal(plan.interestRate.toString()).toNumber()
      : undefined,
    referenceDate: new Date(),
  });

  return NextResponse.json(result);
}
