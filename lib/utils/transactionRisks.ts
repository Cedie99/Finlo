import Decimal from "decimal.js";
import { getMonthYear } from "@/lib/utils/dates";
import { getSafeToSpendForUser } from "@/lib/utils/safeToSpend";

type TransactionRisk = {
  code: "EXCEEDS_SAFE_TO_SPEND" | "BUFFER_RISK";
  message: string;
  shortfall?: string;
};

export async function assessTransactionRisks(userId: string, input: {
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: string;
}): Promise<{ hasRisk: boolean; risks: TransactionRisk[] }> {
  if (input.type !== "EXPENSE") {
    return { hasRisk: false, risks: [] };
  }

  const targetDate = new Date(input.date);
  const snapshot = await getSafeToSpendForUser(userId, {
    monthYear: getMonthYear(targetDate),
    targetDate,
    horizonDays: 14,
  });

  const amount = new Decimal(input.amount);
  const safeToSpend = new Decimal(snapshot.safeToSpendToday);
  const risks: TransactionRisk[] = [];

  if (amount.gt(safeToSpend)) {
    risks.push({
      code: "EXCEEDS_SAFE_TO_SPEND",
      message: "This expense exceeds your safe-to-spend amount for today.",
      shortfall: amount.minus(safeToSpend).toString(),
    });
  }

  const hasBufferRisk = snapshot.risks.some((risk) => risk.type === "INSUFFICIENT_BUFFER");
  if (hasBufferRisk) {
    risks.push({
      code: "BUFFER_RISK",
      message: "Your projected balance is already near or below your buffer in the next 14 days.",
    });
  }

  return { hasRisk: risks.length > 0, risks };
}
