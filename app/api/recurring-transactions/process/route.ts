import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addWeeks, addMonths, addYears, setDate, startOfDay } from "date-fns";

function advance(frequency: string, from: Date, dayOfMonth?: number | null): Date {
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

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = startOfDay(new Date());
  const userId = session.user.id;

  const due = await prisma.recurringTransaction.findMany({
    where: {
      userId,
      isActive: true,
      nextDueDate: { lte: today },
    },
  });

  if (due.length === 0) return NextResponse.json({ generated: 0 });

  const generated: string[] = [];

  for (const r of due) {
    // Generate one transaction per due cycle (catch up if multiple periods missed)
    let cursor = startOfDay(new Date(r.nextDueDate));

    while (cursor <= today) {
      await prisma.transaction.create({
        data: {
          userId,
          type: r.type,
          amount: r.amount,
          description: r.description,
          date: cursor,
          budgetCategoryId: r.budgetCategoryId,
          recurringTransactionId: r.id,
        },
      });
      generated.push(r.id);
      cursor = advance(r.frequency, cursor, r.dayOfMonth);
    }

    const shouldDeactivate = r.endDate && cursor > new Date(r.endDate);

    await prisma.recurringTransaction.update({
      where: { id: r.id },
      data: {
        nextDueDate: cursor,
        isActive: shouldDeactivate ? false : true,
      },
    });
  }

  return NextResponse.json({ generated: generated.length });
}
