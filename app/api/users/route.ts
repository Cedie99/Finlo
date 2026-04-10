import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", icon: "utensils", color: "#f59e0b" },
  { name: "Transportation", icon: "car", color: "#3b82f6" },
  { name: "Utilities", icon: "zap", color: "#8b5cf6" },
  { name: "Entertainment", icon: "tv", color: "#ec4899" },
  { name: "Shopping", icon: "shopping-bag", color: "#10b981" },
  { name: "Health & Fitness", icon: "heart", color: "#ef4444" },
  { name: "Education", icon: "book-open", color: "#6366f1" },
  { name: "Housing", icon: "home", color: "#f97316" },
  { name: "Personal Care", icon: "sparkles", color: "#14b8a6" },
  { name: "Travel", icon: "plane", color: "#0ea5e9" },
  { name: "Subscriptions", icon: "repeat", color: "#a855f7" },
  { name: "Other", icon: "tag", color: "#6b7280" },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        preferences: {
          create: {
            bufferPercentage: "10",
            paydayDaysOfMonth: [15],
            enableDailyDigest: true,
          },
        },
        budgetCategories: {
          create: DEFAULT_CATEGORIES.map((cat) => ({
            ...cat,
            isDefault: true,
          })),
        },
      },
    });

    return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
