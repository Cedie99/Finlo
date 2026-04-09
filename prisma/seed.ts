import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

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

async function createUserWithCategories(email: string, name: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash },
  });

  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.budgetCategory.upsert({
      where: {
        // We can't upsert on name+userId easily without a unique constraint
        // so we'll just create if not exists
        id: `seed-${user.id}-${cat.name.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {},
      create: {
        id: `seed-${user.id}-${cat.name.toLowerCase().replace(/\s+/g, "-")}`,
        userId: user.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      },
    });
  }

  return user;
}

async function main() {
  console.log("Seeding database...");
  await createUserWithCategories("demo@example.com", "Demo User", "password123");
  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
