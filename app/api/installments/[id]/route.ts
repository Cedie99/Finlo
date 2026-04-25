import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const plan = await prisma.installmentPlan.findFirst({
    where: { id, userId: session.user.id },
    include: {
      creditCard: { select: { bankName: true, cardName: true, color: true } },
      payments: { orderBy: { dueDate: "asc" } },
    },
  });

  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(plan);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const body = await request.json();
    const { status, notes, name, description } = body;

    const result = await prisma.installmentPlan.updateMany({
      where: { id, userId: session.user.id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const existing = await prisma.installmentPlan.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.$transaction([
      prisma.transaction.updateMany({
        where: { installmentPlanId: id, userId: session.user.id },
        data: { installmentPlanId: null },
      }),
      prisma.installmentPayment.deleteMany({
        where: { installmentPlanId: id },
      }),
      prisma.installmentPlan.deleteMany({
        where: { id, userId: session.user.id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete installment failed", error);
    return NextResponse.json(
      { error: "Failed to delete installment. Please try again." },
      { status: 500 }
    );
  }
}
