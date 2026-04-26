import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const item = await prisma.recurringTransaction.findUnique({ where: { id } });
  if (!item || item.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.recurringTransaction.update({ where: { id }, data: { isActive: body.isActive } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await prisma.recurringTransaction.findUnique({ where: { id } });
  if (!item || item.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.recurringTransaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
