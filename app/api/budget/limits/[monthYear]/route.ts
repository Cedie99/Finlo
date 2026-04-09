import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMonthRange } from "@/lib/utils/dates";

export async function GET(_req: Request, { params }: { params: Promise<{ monthYear: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { monthYear } = await params;

  const { start, end } = getMonthRange(monthYear);

  const [categories, limits, spending] = await Promise.all([
    prisma.budgetCategory.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    }),
    prisma.budgetLimit.findMany({
      where: { userId: session.user.id, monthYear },
    }),
    prisma.transaction.groupBy({
      by: ["budgetCategoryId"],
      where: {
        userId: session.user.id,
        type: "EXPENSE",
        date: { gte: start, lte: end },
        budgetCategoryId: { not: null },
      },
      _sum: { amount: true },
    }),
  ]);

  const spendingMap = Object.fromEntries(
    spending.map((s: { budgetCategoryId: string | null; _sum: { amount: unknown } }) => [
      s.budgetCategoryId,
      s._sum.amount?.toString() ?? "0",
    ])
  );
  const limitMap = Object.fromEntries(
    limits.map((l: { budgetCategoryId: string; id: string; limitAmount: { toString: () => string } }) => [
      l.budgetCategoryId,
      l,
    ])
  );

  type LimitEntry = { budgetCategoryId: string; id: string; limitAmount: { toString: () => string } };
  type CategoryRow = { id: string; name: string; [key: string]: unknown };
  const result = (categories as CategoryRow[]).map((cat) => ({
    ...cat,
    spent: spendingMap[cat.id] ?? "0",
    limit: (limitMap[cat.id] as LimitEntry | undefined)?.limitAmount?.toString() ?? null,
    limitId: (limitMap[cat.id] as LimitEntry | undefined)?.id ?? null,
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request, { params }: { params: Promise<{ monthYear: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { monthYear } = await params;

  try {
    const { budgetCategoryId, limitAmount } = await request.json();

    const limit = await prisma.budgetLimit.upsert({
      where: {
        userId_budgetCategoryId_monthYear: {
          userId: session.user.id,
          budgetCategoryId,
          monthYear,
        },
      },
      update: { limitAmount: limitAmount.toString() },
      create: {
        userId: session.user.id,
        budgetCategoryId,
        monthYear,
        limitAmount: limitAmount.toString(),
      },
    });

    return NextResponse.json(limit);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
