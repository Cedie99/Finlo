import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recurringTransactionSchema } from "@/lib/validations/transactions";
import { addWeeks, addMonths, addYears, setDate, startOfDay } from "date-fns";

function computeNextDueDate(frequency: string, from: Date, dayOfMonth?: number | null): Date {
  let next: Date;
  if (frequency === "WEEKLY") {
    next = addWeeks(from, 1);
  } else if (frequency === "MONTHLY") {
    next = addMonths(from, 1);
    if (dayOfMonth) next = setDate(next, Math.min(dayOfMonth, 28));
  } else {
    next = addYears(from, 1);
    if (dayOfMonth) next = setDate(next, Math.min(dayOfMonth, 28));
  }
  return startOfDay(next);
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

  const body = await request.json();
  const parsed = recurringTransactionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { type, amount, description, frequency, dayOfMonth, startDate, endDate, budgetCategoryId } = parsed.data;

  try {
    const start = startOfDay(new Date(startDate));
    const nextDueDate = dayOfMonth
      ? setDate(start, Math.min(dayOfMonth, 28))
      : start;

    const item = await prisma.recurringTransaction.create({
      data: {
        userId: session.user.id,
        type,
        amount,
        description,
        frequency,
        dayOfMonth: dayOfMonth ?? null,
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
        nextDueDate,
        budgetCategoryId: budgetCategoryId ?? null,
      },
      include: { budgetCategory: { select: { id: true, name: true, color: true, icon: true } } },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[recurring-transactions POST]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
