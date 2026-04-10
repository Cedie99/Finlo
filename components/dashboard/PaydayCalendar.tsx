"use client";

import { getDaysInMonth, getDay, startOfMonth, isSameDay, format, parse, isToday } from "date-fns";
import { ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface PaydayCalendarProps {
  monthYear: string;
  paydays: { date: string; amount: string; source: string }[];
  dueDates: { date: string; amount: string; name: string; kind: "installment" | "recurring" }[];
  inline?: boolean;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function PaydayCalendar({ monthYear, paydays, dueDates, inline = false }: PaydayCalendarProps) {
  const firstDay = parse(monthYear, "yyyy-MM", new Date());
  const startDow = getDay(startOfMonth(firstDay));
  const daysInMonth = getDaysInMonth(firstDay);

  const cells: (number | null)[] = [
    ...Array<null>(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function getPaydaysForDay(day: number) {
    const d = new Date(firstDay.getFullYear(), firstDay.getMonth(), day);
    return paydays.filter((p) => p.date && isSameDay(new Date(p.date + "T00:00:00"), d));
  }

  function getDuesForDay(day: number) {
    const d = new Date(firstDay.getFullYear(), firstDay.getMonth(), day);
    return dueDates.filter((p) => p.date && isSameDay(new Date(p.date + "T00:00:00"), d));
  }

  const calendarPopover = (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
        {format(firstDay, "MMMM yyyy")}
        <ChevronDown size={14} />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-[min(96vw,980px)] max-h-250 overflow-y-auto rounded-2xl p-4"
      >
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="min-h-16" />;
            }

            const pays = getPaydaysForDay(day);
            const dues = getDuesForDay(day);
            const hasEvents = pays.length > 0 || dues.length > 0;
            const today = new Date(firstDay.getFullYear(), firstDay.getMonth(), day);
            const isCurrentDay = isToday(today);

            return (
              <div
                key={day}
                className={`min-h-16 flex flex-col rounded-lg p-1 ${hasEvents ? "bg-gray-50" : ""}`}
              >
                <span className="flex items-center gap-1 mb-1 leading-none">
                  <span
                    className={`text-xs font-medium ${isCurrentDay ? "bg-indigo-600 text-white w-4 h-4 rounded-full flex items-center justify-center" : "text-gray-500"}`}
                  >
                    {day}
                  </span>
                </span>
                <div className="flex flex-col gap-0.5">
                  {pays.map((p, idx) => (
                    <div
                      key={idx}
                      className="rounded px-1 py-0.5 bg-emerald-50 border border-emerald-100"
                    >
                      <p className="text-[10px] font-medium text-emerald-700 truncate leading-tight">
                        {p.source}
                      </p>
                      <p className="text-[10px] text-emerald-600 tabular-nums leading-tight">
                        +{formatCurrency(p.amount)}
                      </p>
                    </div>
                  ))}
                  {dues.map((d, idx) => (
                    <div
                      key={idx}
                      className={d.kind === "recurring"
                        ? "rounded px-1 py-0.5 bg-amber-50 border border-amber-100"
                        : "rounded px-1 py-0.5 bg-red-50 border border-red-100"}
                    >
                      <p className={`text-[10px] font-medium truncate leading-tight ${d.kind === "recurring" ? "text-amber-700" : "text-red-700"}`}>
                        {d.name}
                      </p>
                      <p className={`text-[10px] tabular-nums leading-tight ${d.kind === "recurring" ? "text-amber-600" : "text-red-600"}`}>
                        -{formatCurrency(d.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs text-gray-500">Payday</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            <span className="text-xs text-gray-500">Installment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span className="text-xs text-gray-500">Recurring</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  if (inline) {
    return calendarPopover;
  }

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Payday Calendar</h3>
        {calendarPopover}
      </div>

      <p className="pt-2 text-xs text-gray-400">Click the month to open the calendar dropdown.</p>
    </div>
  );
}
