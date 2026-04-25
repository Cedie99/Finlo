"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Bell,
  AlertCircle,
  AlertTriangle,
  Clock,
  CalendarClock,
  X,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { cn } from "@/lib/utils";
import type { NotificationsResponse, NotificationUrgency } from "@/app/api/notifications/route";

const urgencyConfig: Record<
  NotificationUrgency,
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  OVERDUE: {
    icon: AlertCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  DUE_TODAY: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  DUE_THIS_WEEK: {
    icon: Clock,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  UPCOMING: {
    icon: CalendarClock,
    color: "text-white/50",
    bg: "bg-[#111118]",
    border: "border-white/[0.07]",
  },
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const totalCount = data?.totalCount ?? 0;
  const overdueCount =
    data?.groups.find((g) => g.urgency === "OVERDUE")?.items.length ?? 0;
  const urgentCount =
    (data?.groups.find((g) => g.urgency === "OVERDUE")?.items.length ?? 0) +
    (data?.groups.find((g) => g.urgency === "DUE_TODAY")?.items.length ?? 0);

  return (
    <>
      {/* Bell button */}
      <button
        onClick={() => setOpen(true)}
        className="relative rounded-xl p-2 text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white"
        aria-label="Payment notifications"
      >
        <Bell size={18} />
        {urgentCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
            {urgentCount > 9 ? "9+" : urgentCount}
          </span>
        )}
      </button>

      {/* Slide-out panel */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-white/[0.07] bg-[#0a0a0f] shadow-[−20px_0_40px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-white/[0.07] px-5">
              <div>
                <h2 className="font-semibold text-white">Payment Notifications</h2>
                <p className="text-xs text-white/50">
                  {totalCount} upcoming in the next 14 days
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={20} className="animate-spin text-white/50" />
                </div>
              ) : !data || data.groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111118]">
                    <Bell size={24} className="text-white/30" />
                  </div>
                  <p className="text-sm font-medium text-white/50">All clear!</p>
                  <p className="text-xs text-white/30">No payments due in the next 14 days.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {data.groups.map((group) => {
                    const cfg = urgencyConfig[group.urgency];
                    const Icon = cfg.icon;
                    return (
                      <div key={group.urgency}>
                        <div className="mb-2 flex items-center gap-2">
                          <Icon size={13} className={cfg.color} />
                          <span className="text-xs font-semibold uppercase tracking-wide text-white/50">
                            {group.label}
                          </span>
                          <span className="ml-auto rounded-full bg-[#111118] px-2 py-0.5 text-[10px] font-bold text-white/50">
                            {group.items.length}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {group.items.map((item) => (
                            <Link
                              key={item.id}
                              href={`/installments/${item.planId}`}
                              onClick={() => setOpen(false)}
                            >
                              <div
                                className={cn(
                                  "rounded-xl border px-4 py-3 transition-all hover:border-[#b4f03a]/30",
                                  cfg.bg,
                                  cfg.border
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-white truncate">
                                    {item.name}
                                  </span>
                                  <span className="ml-2 shrink-0 font-bold text-sm text-white">
                                    {formatCurrency(item.amount)}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center justify-between">
                                  <span className="text-xs text-white/50">
                                    {formatDate(item.dueDate)}
                                  </span>
                                  <span
                                    className={cn("text-xs font-medium", cfg.color)}
                                  >
                                    {item.daysUntilDue < 0
                                      ? `${Math.abs(item.daysUntilDue)}d overdue`
                                      : item.daysUntilDue === 0
                                      ? "Due today"
                                      : `${item.daysUntilDue}d left`}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.07] p-4">
              <Link href="/calendar" onClick={() => setOpen(false)}>
                <div className="flex items-center justify-center gap-2 rounded-xl bg-[#b4f03a]/10 px-4 py-3 text-sm font-semibold text-[#b4f03a] transition-colors hover:bg-[#b4f03a]/20">
                  <CalendarClock size={15} />
                  View Payment Calendar
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
