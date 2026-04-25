"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  differenceInDays,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
  Clock,
  Banknote,
  AlertTriangle,
} from "lucide-react";
import { useCashFlowPlan } from "@/lib/hooks/useCashFlowPlan";
import { useOverlapDetector } from "@/lib/hooks/useOverlapDetector";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatCurrency } from "@/lib/utils/currency";
import { getMonthYear } from "@/lib/utils/dates";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DayType = "overdue" | "today" | "this-week" | "payday" | "normal" | "none";

interface DayEvent {
  type: "payment" | "payday";
  name: string;
  amount: number;
  urgency: DayType;
}

function getDayUrgency(date: Date, today: Date): DayType {
  const diff = differenceInDays(date, today);
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff <= 7) return "this-week";
  return "normal";
}

export default function CalendarPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentDate, setCurrentDate] = useState(startOfMonth(today));
  const monthYear = getMonthYear(currentDate);

  const { data: cashFlow } = useCashFlowPlan(monthYear);
  const { data: overlapData } = useOverlapDetector();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Build event map keyed by date string "yyyy-MM-dd"
  const eventMap = new Map<string, DayEvent[]>();

  cashFlow?.calendar.dueDates.forEach((d) => {
    const dateStr = format(parseISO(d.date), "yyyy-MM-dd");
    const date = parseISO(d.date);
    const urgency = getDayUrgency(date, today);
    const existing = eventMap.get(dateStr) ?? [];
    existing.push({ type: "payment", name: d.name, amount: Number(d.amount), urgency });
    eventMap.set(dateStr, existing);
  });

  cashFlow?.calendar.paydays.forEach((p) => {
    const dateStr = format(parseISO(p.date), "yyyy-MM-dd");
    const existing = eventMap.get(dateStr) ?? [];
    existing.push({ type: "payday", name: p.source, amount: Number(p.amount), urgency: "payday" });
    eventMap.set(dateStr, existing);
  });

  // Selected day detail
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const selectedEvents = selectedDay ? (eventMap.get(selectedDay) ?? []) : [];

  const overlapWarning = (overlapData?.crunchMonths?.length ?? 0) > 0;

  function prevMonth() {
    setCurrentDate((d) => subMonths(d, 1));
    setSelectedDay(null);
  }
  function nextMonth() {
    setCurrentDate((d) => addMonths(d, 1));
    setSelectedDay(null);
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Pad start
  const startPad = monthStart.getDay();

  return (
    <div>
      <PageHeader
        title="Payment Calendar"
        description="All your due dates and paydays in one view"
      />

      {overlapWarning && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3">
          <AlertTriangle size={16} className="shrink-0 text-amber-400" />
          <p className="text-sm text-amber-300">
            Multiple payments overlap this month — review your cash flow carefully.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
        {/* Calendar */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-5 lg:col-span-2">
          {/* Month navigation */}
          <div className="mb-5 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="h-9 w-9 rounded-full text-white/50 hover:bg-white/[0.05] hover:text-white"
            >
              <ChevronLeft size={16} />
            </Button>
            <h2 className="font-semibold text-white">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-9 w-9 rounded-full text-white/50 hover:bg-white/[0.05] hover:text-white"
            >
              <ChevronRight size={16} />
            </Button>
          </div>

          {/* Weekday headers */}
          <div className="mb-1 grid grid-cols-7 text-center">
            {weekDays.map((d) => (
              <div key={d} className="py-1 text-xs font-semibold text-white/30">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7">
            {/* Empty pads */}
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}

            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const events = eventMap.get(dateStr) ?? [];
              const isToday = isSameDay(day, today);
              const isSelected = selectedDay === dateStr;
              const payments = events.filter((e) => e.type === "payment");
              const hasPayday = events.some((e) => e.type === "payday");
              const hasOverdue = payments.some((e) => e.urgency === "overdue");
              const hasDueToday = payments.some((e) => e.urgency === "today");
              const hasDueSoon = payments.some((e) => e.urgency === "this-week");

              let dotColor = "";
              if (hasOverdue) dotColor = "bg-red-500";
              else if (hasDueToday) dotColor = "bg-amber-400";
              else if (hasDueSoon) dotColor = "bg-blue-400";
              else if (payments.length > 0) dotColor = "bg-white/50";

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                  className={cn(
                    "relative flex flex-col items-center rounded-xl py-2 text-sm transition-all",
                    isSelected
                      ? "bg-[#b4f03a]/15 ring-1 ring-[#b4f03a]/40"
                      : "hover:bg-white/[0.05]",
                    !isSameMonth(day, currentDate) && "opacity-20"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full font-medium",
                      isToday
                        ? "bg-[#b4f03a] text-[#0c0c10] font-bold"
                        : "text-white"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Indicator dots */}
                  <div className="mt-1 flex items-center gap-0.5">
                    {dotColor && (
                      <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
                    )}
                    {hasPayday && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3 border-t border-white/[0.07] pt-4">
            {[
              { dot: "bg-red-500", label: "Overdue" },
              { dot: "bg-amber-400", label: "Due today" },
              { dot: "bg-blue-400", label: "Due this week" },
              { dot: "bg-white/50", label: "Upcoming" },
              { dot: "bg-emerald-400", label: "Payday" },
            ].map(({ dot, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", dot)} />
                <span className="text-xs text-white/50">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Selected day detail */}
          {selectedDay && (
            <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-4">
              <p className="mb-3 text-sm font-semibold text-white">
                {format(parseISO(selectedDay), "EEEE, MMMM d")}
              </p>
              {selectedEvents.length === 0 ? (
                <p className="text-xs text-white/30">No events this day.</p>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((ev, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                        ev.type === "payday"
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : ev.urgency === "overdue"
                          ? "border-red-500/30 bg-red-500/5"
                          : ev.urgency === "today"
                          ? "border-amber-500/30 bg-amber-500/5"
                          : "border-white/[0.07] bg-[#0a0a0f]"
                      )}
                    >
                      {ev.type === "payday" ? (
                        <Banknote size={14} className="text-emerald-400 shrink-0" />
                      ) : ev.urgency === "overdue" ? (
                        <AlertCircle size={14} className="text-red-400 shrink-0" />
                      ) : (
                        <Clock size={14} className="text-white/50 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-white">
                          {ev.name}
                        </p>
                        <p className="text-xs text-white/50">
                          {ev.type === "payday" ? "Income" : "Payment due"}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-sm font-bold",
                          ev.type === "payday" ? "text-emerald-300" : "text-white"
                        )}
                      >
                        {formatCurrency(ev.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upcoming payments summary */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Calendar size={14} className="text-[#b4f03a]" />
              <p className="text-sm font-semibold text-white">This Month</p>
            </div>
            {cashFlow?.calendar.dueDates.length === 0 ? (
              <p className="text-xs text-white/30">No payments due this month.</p>
            ) : (
              <div className="space-y-2">
                {(cashFlow?.calendar.dueDates ?? []).map((d, i) => {
                  const date = parseISO(d.date);
                  const urgency = getDayUrgency(date, today);
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            urgency === "overdue"
                              ? "bg-red-500"
                              : urgency === "today"
                              ? "bg-amber-400"
                              : urgency === "this-week"
                              ? "bg-blue-400"
                              : "bg-white/30"
                          )}
                        />
                        <p className="truncate text-xs text-white">{d.name}</p>
                      </div>
                      <div className="ml-2 shrink-0 text-right">
                        <p className="text-xs font-bold text-white">
                          {formatCurrency(d.amount)}
                        </p>
                        <p className="text-[10px] text-white/30">
                          {format(date, "MMM d")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
