import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validations/transactions";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
  const type = searchParams.get("type") as "INCOME" | "EXPENSE" | null;
  const categoryId = searchParams.get("categoryId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = { userId: session.user.id };
  if (type) where.type = type;
  if (categoryId) where.budgetCategoryId = categoryId;
  if (search) where.description = { contains: search, mode: "insensitive" };
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom);
    if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo + "T23:59:59Z");
  }

  const items = await prisma.transaction.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: { budgetCategory: { select: { id: true, name: true, color: true, icon: true } } },
  });

  const hasMore = items.length > limit;
  const page = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? page[page.length - 1].id : null;
  const total = await prisma.transaction.count({ where });

  return NextResponse.json({ items: page, nextCursor, total });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });

    const { date, budgetCategoryId, installmentPlanId, ignoreRisks, ...rest } = parsed.data as typeof parsed.data & { budgetCategoryId?: string | null; ignoreRisks?: boolean };

    // Cash flow risk check for expenses
    if (rest.type === "EXPENSE" && !ignoreRisks) {
      const prefs = await prisma.userPreference.findUnique({ where: { userId: session.user.id } });
      if (prefs) {
        const monthYear = date.slice(0, 7);
        const [incomes, expenses, plans] = await Promise.all([
          prisma.income.aggregate({ where: { userId: session.user.id, monthYear }, _sum: { amount: true } }),
          prisma.transaction.aggregate({ where: { userId: session.user.id, type: "EXPENSE", date: { gte: new Date(monthYear + "-01"), lte: new Date(monthYear + "-31") } }, _sum: { amount: true } }),
          prisma.installmentPlan.aggregate({ where: { userId: session.user.id, status: "ACTIVE" }, _sum: { monthlyAmount: true } }),
        ]);
        const income = Number(incomes._sum.amount ?? 0);
        const spent = Number(expenses._sum.amount ?? 0);
        const fixed = Number(plans._sum.monthlyAmount ?? 0);
        const buffer = Math.max(Number(prefs.minimumCashBuffer ?? 0), income * Number(prefs.bufferPercentage) / 100);
        const safeToSpend = income - fixed - buffer - spent;
        if (safeToSpend - rest.amount < 0 && income > 0) {
          return NextResponse.json({
            error: "Cash flow risk",
            requiresConfirmation: true,
            risks: [{ message: "This expense may push you below your cash buffer.", shortfall: `₱${Math.abs(safeToSpend - rest.amount).toFixed(2)}` }],
          }, { status: 409 });
        }
      }
    }

    const tx = await prisma.transaction.create({
      data: {
        ...rest,
        userId: session.user.id,
        amount: rest.amount.toString(),
        date: new Date(date),
        budgetCategoryId: budgetCategoryId || null,
        installmentPlanId: installmentPlanId || null,
      },
      include: { budgetCategory: { select: { id: true, name: true, color: true } } },
    });

    return NextResponse.json(tx, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
