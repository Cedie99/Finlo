import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { budgetCategorySchema } from "@/lib/validations/budget";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = budgetCategorySchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

    const result = await prisma.budgetCategory.updateMany({
      where: { id, userId: session.user.id },
      data: parsed.data,
    });

    if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const result = await prisma.budgetCategory.deleteMany({
    where: { id, userId: session.user.id, isDefault: false },
  });

  if (result.count === 0) return NextResponse.json({ error: "Not found or cannot delete default" }, { status: 404 });
  return NextResponse.json({ success: true });
}
