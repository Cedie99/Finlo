import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function advanceDate(frequency: string, from: Date, dayOfMonth?: number | null): Date {
  const d = new Date(from);
  if (frequency === "WEEKLY") d.setDate(d.getDate() + 7);
  else if (frequency === "MONTHLY") {
    d.setMonth(d.getMonth() + 1);
    if (dayOfMonth) d.setDate(Math.min(dayOfMonth, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  } else if (frequency === "YEARLY") d.setFullYear(d.getFullYear() + 1);
  return d;
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const due = await prisma.recurringTransaction.findMany({
    where: { userId: session.user.id, isActive: true, nextDueDate: { lte: now } },
  });

  let generated = 0;
  for (const r of due) {
    if (r.endDate && r.nextDueDate > r.endDate) continue;
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: r.type,
        amount: r.amount,
        description: r.description,
        date: r.nextDueDate,
        budgetCategoryId: r.budgetCategoryId,
        recurringTransactionId: r.id,
      },
    });
    const next = advanceDate(r.frequency, r.nextDueDate, r.dayOfMonth);
    await prisma.recurringTransaction.update({ where: { id: r.id }, data: { nextDueDate: next } });
    generated++;
  }

  return NextResponse.json({ generated });
}
