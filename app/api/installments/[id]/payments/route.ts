import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const { paymentId, isPaid, paidDate } = await request.json();

    const plan = await prisma.installmentPlan.findFirst({
      where: { id, userId: session.user.id },
      include: { payments: { orderBy: { dueDate: "asc" } } },
    });

    if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.installmentPayment.update({
      where: { id: paymentId, installmentPlanId: id },
      data: {
        isPaid,
        paidDate: isPaid
          ? paidDate
            ? new Date(paidDate)
            : new Date()
          : null,
      },
    });

    type PaymentRow = { id: string; isPaid: boolean; dueDate: Date };
    const payments = plan.payments as PaymentRow[];

    // Recount paid months
    const paidCount = payments.filter((p: PaymentRow) =>
      p.id === paymentId ? isPaid : p.isPaid
    ).length;

    // Find next unpaid payment
    const updatedPayments = payments.map((p: PaymentRow) =>
      p.id === paymentId ? { ...p, isPaid } : p
    );
    const nextUnpaid = updatedPayments
      .filter((p: PaymentRow) => !p.isPaid)
      .sort((a: PaymentRow, b: PaymentRow) => a.dueDate.getTime() - b.dueDate.getTime())[0];

    const isCompleted = paidCount >= plan.totalMonths;

    await prisma.installmentPlan.update({
      where: { id },
      data: {
        paidMonths: paidCount,
        nextDueDate: nextUnpaid?.dueDate ?? null,
        status: isCompleted
          ? "COMPLETED"
          : plan.status === "COMPLETED"
          ? "ACTIVE"
          : plan.status,
      },
    });

    return NextResponse.json({ success: true, paidMonths: paidCount });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
