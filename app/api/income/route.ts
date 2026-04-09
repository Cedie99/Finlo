import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { incomeSchema } from "@/lib/validations/transactions";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const monthYear = searchParams.get("monthYear");

  const incomes = await prisma.income.findMany({
    where: {
      userId: session.user.id,
      ...(monthYear && { monthYear }),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(incomes);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = incomeSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

    const { amount, receivedAt, ...rest } = parsed.data;

    const income = await prisma.income.create({
      data: {
        ...rest,
        userId: session.user.id,
        amount: amount.toString(),
        receivedAt: receivedAt ? new Date(receivedAt) : null,
      },
    });

    return NextResponse.json(income, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
