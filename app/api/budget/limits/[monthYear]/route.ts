import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ monthYear: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { monthYear } = await params;
  const body = await request.json();
  if (!body.budgetCategoryId || body.limitAmount == null) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const limit = await prisma.budgetLimit.upsert({
    where: { userId_budgetCategoryId_monthYear: { userId: session.user.id, budgetCategoryId: body.budgetCategoryId, monthYear } },
    create: { userId: session.user.id, budgetCategoryId: body.budgetCategoryId, monthYear, limitAmount: body.limitAmount.toString() },
    update: { limitAmount: body.limitAmount.toString() },
  });

  return NextResponse.json(limit);
}
