import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSafeToSpendForUser } from "@/lib/utils/safeToSpend";
import Decimal from "decimal.js";
import { addMonths, format, startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getMonthYear } from "@/lib/utils/dates";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const amount = new Decimal(body.amount ?? 0);

  if (amount.lte(0)) {
    return NextResponse.json({ error: "Amount must be positive" }, { status: 400 });
  }

  const userId = session.user.id;
  const safeToSpend = await getSafeToSpendForUser(userId);
  const safe = new Decimal(safeToSpend.safeToSpendToday);
  const afterAmount = safe.minus(amount);
  const impactPercent = safe.gt(0) ? amount.div(safe).times(100).toDecimalPlaces(1).toNumber() : 100;

  let verdict: "YES" | "TIGHT" | "NO";
  let message: string;

  if (afterAmount.gte(0) && impactPercent <= 50) {
    verdict = "YES";
    message = "You can comfortably afford this without stressing your budget.";
  } else if (afterAmount.gte(0)) {
    verdict = "TIGHT";
    message = "You can technically afford this, but it will use a large portion of your safe-to-spend.";
  } else {
    verdict = "NO";
    message = "This would put your balance below safe levels right now.";
  }

  // Find the first future month where they could comfortably afford it
  let suggestedMonth: string | null = null;
  if (verdict !== "YES") {
    const incomeTemplates = await prisma.incomeTemplate.findMany({
      where: { userId },
      select: { amount: true },
    });
    const monthlyIncome = incomeTemplates.reduce(
      (sum, t) => sum.plus(new Decimal(t.amount.toString())),
      new Decimal(0)
    );

    for (let i = 1; i <= 6; i++) {
      const futureMonth = format(startOfMonth(addMonths(new Date(), i)), "yyyy-MM");
      const futureS2S = await getSafeToSpendForUser(userId, {
        monthYear: futureMonth,
        targetDate: startOfMonth(addMonths(new Date(), i)),
      });
      const futureSafe = new Decimal(futureS2S.safeToSpendToday);
      const futureAfter = futureSafe.minus(amount);
      const futureImpact = futureSafe.gt(0)
        ? amount.div(futureSafe).times(100).toNumber()
        : 100;
      if (futureAfter.gte(0) && futureImpact <= 50) {
        suggestedMonth = futureMonth;
        break;
      }
    }
  }

  return NextResponse.json({
    canAfford: verdict !== "NO",
    safeToSpendToday: safe.toString(),
    afterAmount: afterAmount.toString(),
    impactPercent,
    verdict,
    message,
    suggestedMonth,
  });
}
