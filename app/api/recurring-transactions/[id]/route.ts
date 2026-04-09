import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.recurringTransaction.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.recurringTransaction.update({
    where: { id },
    data: {
      ...(typeof body.isActive === "boolean" && { isActive: body.isActive }),
      ...(body.description && { description: body.description }),
      ...(body.amount && { amount: body.amount }),
      ...(body.budgetCategoryId !== undefined && { budgetCategoryId: body.budgetCategoryId }),
    },
    include: { budgetCategory: { select: { id: true, name: true, color: true, icon: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.recurringTransaction.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.recurringTransaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
