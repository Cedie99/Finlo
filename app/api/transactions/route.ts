import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validations/transactions";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const type = searchParams.get("type") as "INCOME" | "EXPENSE" | null;
  const categoryId = searchParams.get("categoryId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const search = searchParams.get("search");
  const PAGE_SIZE = 20;

  const where: Parameters<typeof prisma.transaction.findMany>[0]["where"] = {
    userId: session.user.id,
    ...(type && { type }),
    ...(categoryId && { budgetCategoryId: categoryId }),
    ...(dateFrom || dateTo
      ? {
          date: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }
      : {}),
    ...(search && {
      description: { contains: search, mode: "insensitive" as const },
    }),
  };

  const transactions = await prisma.transaction.findMany({
    where,
    include: { budgetCategory: { select: { name: true, color: true, icon: true } } },
    orderBy: { date: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
  });

  const hasMore = transactions.length > PAGE_SIZE;
  const items = hasMore ? transactions.slice(0, PAGE_SIZE) : transactions;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ items, nextCursor });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });

    const { amount, date, budgetCategoryId, installmentPlanId, ...rest } = parsed.data;

    const tx = await prisma.transaction.create({
      data: {
        ...rest,
        userId: session.user.id,
        amount: amount.toString(),
        date: new Date(date),
        budgetCategoryId: budgetCategoryId || null,
        installmentPlanId: installmentPlanId || null,
      },
    });

    return NextResponse.json(tx, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
