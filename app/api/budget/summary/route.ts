import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const monthYear = searchParams.get("monthYear") ?? new Date().toISOString().slice(0, 7);

  const [start, end] = [new Date(monthYear + "-01"), new Date(monthYear + "-31")];

  const [categories, limits, transactions] = await Promise.all([
    prisma.budgetCategory.findMany({ where: { userId: session.user.id }, orderBy: { name: "asc" } }),
    prisma.budgetLimit.findMany({ where: { userId: session.user.id, monthYear } }),
    prisma.transaction.findMany({
      where: { userId: session.user.id, type: "EXPENSE", date: { gte: start, lte: end }, budgetCategoryId: { not: null } },
      select: { budgetCategoryId: true, amount: true },
    }),
  ]);

  const spentByCategory: Record<string, number> = {};
  for (const tx of transactions) {
    if (tx.budgetCategoryId) {
      spentByCategory[tx.budgetCategoryId] = (spentByCategory[tx.budgetCategoryId] ?? 0) + Number(tx.amount);
    }
  }

  const summary = categories.map((cat) => {
    const limit = limits.find((l) => l.budgetCategoryId === cat.id);
    const spent = spentByCategory[cat.id] ?? 0;
    const limitAmount = limit ? Number(limit.limitAmount) : null;
    return {
      category: cat,
      limit: limitAmount,
      spent,
      remaining: limitAmount !== null ? limitAmount - spent : null,
      pct: limitAmount && limitAmount > 0 ? Math.min(100, (spent / limitAmount) * 100) : null,
    };
  });

  return NextResponse.json(summary);
}
