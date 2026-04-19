"use client";

import { getDaysInMonth, getDay, startOfMonth, isSameDay, format, parse, isToday } from "date-fns";
import { CalendarDays, ChevronDown } from "lucide-react";
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

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  function getPaydaysForDay(day: number) {
    const d = new Date(firstDay.getFullYear(), firstDay.getMonth(), day);
    return paydays.filter((p) => p.date && isSameDay(new Date(p.date + "T00:00:00"), d));
  }

  function getDuesForDay(day: number) {
    const d = new Date(firstDay.getFullYear(), firstDay.getMonth(), day);
    return dueDates.filter((p) => p.date && isSameDay(new Date(p.date + "T00:00:00"), d));
  }

  const calendarGrid = (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200">
      {/* Day-of-week header row */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {DAY_LABELS.map((d, i) => (
          <div
            key={d}
            className={`py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider ${
              i === 0 || i === 6 ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Week rows */}
      <div className="divide-y divide-gray-200">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 divide-x divide-gray-200">
            {week.map((day, di) => {
              const isWeekend = di === 0 || di === 6;

              if (day === null) {
                return (
                  <div
                    key={`empty-${wi}-${di}`}
                    className={`min-h-[90px] ${isWeekend ? "bg-gray-50/70" : "bg-white"}`}
                  />
                );
              }

              const pays = getPaydaysForDay(day);
              const dues = getDuesForDay(day);
              const todayDate = new Date(firstDay.getFullYear(), firstDay.getMonth(), day);
              const isCurrentDay = isToday(todayDate);

              return (
                <div
                  key={day}
                  className={`min-h-[90px] p-1.5 flex flex-col gap-1 ${
                    isCurrentDay
                      ? "bg-[#edf5f2]/50"
                      : isWeekend
                      ? "bg-gray-50/70"
                      : "bg-white hover:bg-slate-50/60"
                  } transition-colors`}
                >
                  {/* Day number */}
                  <div className="flex justify-end">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isCurrentDay
                          ? "bg-[#2f7f76] text-white shadow-sm"
                          : isWeekend
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  {/* Events */}
                  <div className="flex flex-col gap-0.5">
                    {pays.map((p, idx) => (
                      <div
                        key={idx}
                        className="rounded-md bg-emerald-50 px-1.5 py-1"
                      >
                        <p className="text-[10px] font-semibold text-emerald-800 truncate leading-tight">
                          {p.source}
                        </p>
                        <p className="text-[10px] font-medium text-emerald-600 tabular-nums leading-tight">
                          +{formatCurrency(p.amount)}
                        </p>
                      </div>
                    ))}
                    {dues.map((d, idx) => (
                      <div
                        key={idx}
                        className={`rounded-md px-1.5 py-1 ${
                          d.kind === "recurring" ? "bg-amber-50" : "bg-red-50"
                        }`}
                      >
                        <p
                          className={`text-[10px] font-semibold truncate leading-tight ${
                            d.kind === "recurring" ? "text-amber-800" : "text-red-800"
                          }`}
                        >
                          {d.name}
                        </p>
                        <p
                          className={`text-[10px] font-medium tabular-nums leading-tight ${
                            d.kind === "recurring" ? "text-amber-600" : "text-red-600"
                          }`}
                        >
                          -{formatCurrency(d.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const legend = (
    <div className="flex items-center gap-5 pt-3">
      {[
        { label: "Payday", dot: "bg-emerald-400" },
        { label: "Installment", dot: "bg-red-400" },
        { label: "Recurring", dot: "bg-amber-400" },
      ].map(({ label, dot }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
          <span className="text-xs font-medium text-gray-500">{label}</span>
        </div>
      ))}
    </div>
  );

  const calendarPopover = (
    <Popover>
      <PopoverTrigger className="group inline-flex items-center gap-2 rounded-full border border-[#d1e3df] bg-[#edf5f2] px-3.5 py-2 text-sm font-semibold text-[#266a63] shadow-sm transition-all hover:bg-[#e3f0ed] hover:border-[#c1d8d2] hover:shadow-md active:scale-95">
        <CalendarDays size={14} className="text-[#2b7d74] shrink-0" />
        {format(firstDay, "MMMM yyyy")}
        <ChevronDown size={13} className="text-[#66a99f] transition-transform group-hover:translate-y-0.5" />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-[min(96vw,980px)] max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-0 shadow-2xl"
      >
        {/* Popover header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {format(firstDay, "MMMM yyyy")}
            </h3>
            <p className="mt-0.5 text-xs text-gray-400">Payment &amp; income schedule</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2f7f76] text-[10px] font-bold text-white">
                {new Date().getDate()}
              </span>
              Today
            </span>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="p-4">
          {calendarGrid}
          {legend}
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
      <p className="pt-2 text-xs text-gray-400">Click to see your payment schedule.</p>
    </div>
  );
}
