import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { differenceInDays, addDays } from "date-fns";

export type NotificationUrgency = "OVERDUE" | "DUE_TODAY" | "DUE_THIS_WEEK" | "UPCOMING";

export interface PaymentNotification {
  id: string;
  planId: string;
  name: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  urgency: NotificationUrgency;
  type: string;
}

export interface NotificationsResponse {
  groups: {
    urgency: NotificationUrgency;
    label: string;
    items: PaymentNotification[];
  }[];
  totalCount: number;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in14Days = addDays(today, 14);

  const plans = await prisma.installmentPlan.findMany({
    where: {
      userId,
      status: "ACTIVE",
      nextDueDate: { lte: in14Days },
    },
    select: {
      id: true,
      name: true,
      monthlyAmount: true,
      nextDueDate: true,
      type: true,
    },
    orderBy: { nextDueDate: "asc" },
  });

  const notifications: PaymentNotification[] = plans.flatMap((p) => {
      let dueDate: Date | null = null;
      if (p.nextDueDate instanceof Date) {
        dueDate = p.nextDueDate;
      } else if (typeof p.nextDueDate === "string") {
        const parsed = new Date(p.nextDueDate);
        dueDate = Number.isNaN(parsed.getTime()) ? null : parsed;
      }

      if (!dueDate) return [];

      const daysUntilDue = differenceInDays(dueDate, today);
      let urgency: NotificationUrgency;
      if (daysUntilDue < 0) urgency = "OVERDUE";
      else if (daysUntilDue === 0) urgency = "DUE_TODAY";
      else if (daysUntilDue <= 7) urgency = "DUE_THIS_WEEK";
      else urgency = "UPCOMING";

      return {
        id: p.id,
        planId: p.id,
        name: p.name,
        amount: Number(p.monthlyAmount),
        dueDate: dueDate.toISOString(),
        daysUntilDue,
        urgency,
        type: p.type,
      };
    });

  const urgencyOrder: NotificationUrgency[] = ["OVERDUE", "DUE_TODAY", "DUE_THIS_WEEK", "UPCOMING"];
  const urgencyLabels: Record<NotificationUrgency, string> = {
    OVERDUE: "Overdue",
    DUE_TODAY: "Due Today",
    DUE_THIS_WEEK: "Due This Week",
    UPCOMING: "Upcoming (14 days)",
  };

  const groups = urgencyOrder
    .map((urgency) => ({
      urgency,
      label: urgencyLabels[urgency],
      items: notifications.filter((n) => n.urgency === urgency),
    }))
    .filter((g) => g.items.length > 0);

  return NextResponse.json({ groups, totalCount: notifications.length } satisfies NotificationsResponse);
}
