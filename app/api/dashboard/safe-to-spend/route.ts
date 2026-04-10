import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMonthYear } from "@/lib/utils/dates";
import { getSafeToSpendForUser } from "@/lib/utils/safeToSpend";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const monthYear = searchParams.get("monthYear") || getMonthYear();
  const targetDate = searchParams.get("targetDate")
    ? new Date(searchParams.get("targetDate") as string)
    : new Date();

  const result = await getSafeToSpendForUser(session.user.id, {
    monthYear,
    targetDate,
    horizonDays: 14,
  });

  return NextResponse.json(result);
}
