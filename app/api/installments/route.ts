import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { installmentSchema } from "@/lib/validations/installments";
import { generatePaymentSchedule } from "@/lib/utils/installments";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plans = await prisma.installmentPlan.findMany({
    where: { userId: session.user.id },
    include: {
      creditCard: {
        select: { bankName: true, cardName: true, color: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(plans);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = installmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      startDate,
      totalAmount,
      monthlyAmount,
      totalMonths,
      creditCardId,
      interestRate,
      processingFee,
      ...rest
    } = parsed.data;

    const start = new Date(startDate);
    const schedule = generatePaymentSchedule(start, totalAmount, monthlyAmount, totalMonths);
    const nextDueDate = schedule[0]?.dueDate ?? null;

    const plan = await prisma.installmentPlan.create({
      data: {
        ...rest,
        userId: session.user!.id!,
        creditCardId: creditCardId || null,
        totalAmount: totalAmount.toString(),
        monthlyAmount: monthlyAmount.toString(),
        totalMonths,
        startDate: start,
        nextDueDate,
        interestRate: interestRate != null ? interestRate.toString() : null,
        processingFee: processingFee != null ? processingFee.toString() : null,
        payments: {
          create: schedule.map((s) => ({
            amount: s.amount,
            dueDate: s.dueDate,
            isPaid: false,
          })),
        },
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[POST /api/installments]", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? message : "Internal server error" },
      { status: 500 }
    );
  }
}
