import { useEffect } from "react";
import { differenceInCalendarDays } from "date-fns";
import { notificationStore } from "@/lib/stores/notificationStore";
import type { DashboardData } from "./useDashboard";
import type { SafeToSpendData } from "./useSafeToSpend";
import { formatCurrency } from "@/lib/utils/currency";

let pageCheckDone = false;

export function usePaymentNotifications(data: DashboardData | undefined) {
  useEffect(() => {
    if (!data || pageCheckDone) return;
    pageCheckDone = true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue: typeof data.upcomingPayments = [];
    const dueToday: typeof data.upcomingPayments = [];
    const dueSoon: typeof data.upcomingPayments = [];
    const dueThisWeek: typeof data.upcomingPayments = [];

    for (const p of data.upcomingPayments) {
      if (!p.nextDueDate) continue;
      const due = new Date(p.nextDueDate);
      due.setHours(0, 0, 0, 0);
      const diff = differenceInCalendarDays(due, today);

      if (diff < 0) overdue.push(p);
      else if (diff === 0) dueToday.push(p);
      else if (diff <= 3) dueSoon.push(p);
      else if (diff <= 7) dueThisWeek.push(p);
    }

    if (overdue.length > 0) {
      notificationStore.add({
        type: "error",
        title: `${overdue.length} overdue payment${overdue.length > 1 ? "s" : ""}`,
        description:
          overdue.length === 1
            ? `${overdue[0].name} is past its due date.`
            : overdue.map((p) => p.name).join(", "),
      });
    }

    if (dueToday.length > 0) {
      notificationStore.add({
        type: "warning",
        title: `${dueToday.length} payment${dueToday.length > 1 ? "s" : ""} due today`,
        description:
          dueToday.length === 1
            ? `${dueToday[0].name} is due today.`
            : dueToday.map((p) => p.name).join(", "),
      });
    }

    if (dueSoon.length > 0) {
      notificationStore.add({
        type: "warning",
        title: `${dueSoon.length} payment${dueSoon.length > 1 ? "s" : ""} due in the next 3 days`,
        description: dueSoon.map((p) => p.name).join(", "),
      });
    }

    if (dueThisWeek.length > 0) {
      notificationStore.add({
        type: "info",
        title: `${dueThisWeek.length} payment${dueThisWeek.length > 1 ? "s" : ""} due this week`,
        description: dueThisWeek.map((p) => p.name).join(", "),
      });
    }
  }, [data]);
}

export function useDailyCashDigest(
  safeToSpend: SafeToSpendData | undefined,
  dueTodayCount: number,
  enabled: boolean
) {
  useEffect(() => {
    if (!safeToSpend || !enabled) return;

    const key = `daily-digest:${safeToSpend.targetDate}`;
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(key)) return;

    notificationStore.add({
      type: "info",
      title: `Safe to spend today: ${formatCurrency(safeToSpend.safeToSpendToday)}`,
      description:
        dueTodayCount > 0
          ? `${dueTodayCount} payment${dueTodayCount > 1 ? "s" : ""} due today.`
          : "No payments due today.",
    });

    window.localStorage.setItem(key, "1");
  }, [safeToSpend, dueTodayCount, enabled]);
}
