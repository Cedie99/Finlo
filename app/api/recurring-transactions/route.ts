import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recurringTransactionSchema } from "@/lib/validations/transactions";

function getNextDueDate(frequency: string, fromDate: Date, dayOfMonth?: number | null): Date {
  const d = new Date(fromDate);
  if (frequency === "WEEKLY") d.setDate(d.getDate() + 7);
  else if (frequency === "MONTHLY") {
    d.setMonth(d.getMonth() + 1);
    if (dayOfMonth) d.setDate(Math.min(dayOfMonth, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  } else if (frequency === "YEARLY") d.setFullYear(d.getFullYear() + 1);
  return d;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.recurringTransaction.findMany({
    where: { userId: session.user.id },
    include: { budgetCategory: { select: { id: true, name: true, color: true, icon: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = recurringTransactionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });

    const { startDate, endDate, budgetCategoryId, dayOfMonth, ...rest } = parsed.data as typeof parsed.data & { budgetCategoryId?: string | null; dayOfMonth?: number | null; endDate?: string | null };
    const start = new Date(startDate);
    const nextDueDate = getNextDueDate(rest.frequency, start, dayOfMonth);

    const item = await prisma.recurringTransaction.create({
      data: {
        ...rest,
        userId: session.user.id,
        amount: rest.amount.toString(),
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
        nextDueDate,
        dayOfMonth: dayOfMonth ?? null,
        budgetCategoryId: budgetCategoryId || null,
      },
      include: { budgetCategory: { select: { id: true, name: true, color: true, icon: true } } },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
