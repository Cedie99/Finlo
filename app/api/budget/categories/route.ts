import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", color: "#f59e0b", icon: "🍔" },
  { name: "Transport", color: "#3b82f6", icon: "🚗" },
  { name: "Shopping", color: "#ec4899", icon: "🛍️" },
  { name: "Bills & Utilities", color: "#8b5cf6", icon: "⚡" },
  { name: "Health", color: "#10b981", icon: "💊" },
  { name: "Entertainment", color: "#f43f5e", icon: "🎬" },
  { name: "Education", color: "#06b6d4", icon: "📚" },
  { name: "Savings", color: "#b4f03a", icon: "💰" },
  { name: "Other", color: "#6b7280", icon: "📦" },
];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let categories = await prisma.budgetCategory.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  // Seed defaults if none exist
  if (categories.length === 0) {
    await prisma.budgetCategory.createMany({
      data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: session.user!.id! })),
    });
    categories = await prisma.budgetCategory.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    });
  }

  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const category = await prisma.budgetCategory.create({
    data: { name: body.name.trim(), color: body.color ?? "#6b7280", icon: body.icon ?? null, userId: session.user.id },
  });

  return NextResponse.json(category, { status: 201 });
}
