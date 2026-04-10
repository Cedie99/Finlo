import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { differenceInDays, parseISO } from "date-fns";
import { Calendar, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type PaydayEvent = { date: string; amount: string; source: string };
type DueEvent = { date: string; amount: string; name: string; kind: "installment" | "recurring" };

type CalendarEvent =
  | { date: string; amount: string; label: string; kind: "payday" }
  | { date: string; amount: string; label: string; kind: "installment" | "recurring" };

export function UpcomingPayments({
  monthYear,
  paydays,
  dueDates,
}: {
  monthYear: string;
  paydays: PaydayEvent[];
  dueDates: DueEvent[];
}) {
  const [year, month] = monthYear.split("-").map(Number);

  const events: CalendarEvent[] = [
    ...paydays.map((p) => ({
      date: p.date,
      amount: p.amount,
      label: p.source,
      kind: "payday" as const,
    })),
    ...dueDates.map((d) => ({
      date: d.date,
      amount: d.amount,
      label: d.name,
      kind: d.kind,
    })),
  ]
    .filter((e) => {
      const dt = parseISO(e.date);
      return dt.getFullYear() === year && dt.getMonth() === month - 1;
    })
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
          <Calendar size={16} className="text-indigo-600" />
        </div>
        <h2 className="font-bold text-gray-900 text-base">Upcoming Events</h2>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">No events this month</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((e, idx) => {
            const daysUntil = differenceInDays(parseISO(e.date), new Date());
            const isUrgent = daysUntil <= 3;
            const isWarning = daysUntil <= 7 && !isUrgent;
            const dueTxt = daysUntil === 0 ? "Today!" : daysUntil < 0 ? "Overdue" : `${daysUntil}d left`;
            const href = e.kind === "installment" ? "/installments" : "/transactions";

            return (
              <Link key={`${e.kind}-${e.date}-${idx}`} href={href}>
                <div className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    {e.kind === "recurring" ? (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "#6366f120", color: "#6366f1" }}
                      >
                        <RefreshCw size={11} />
                      </div>
                    ) : (
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            e.kind === "payday"
                              ? "#10b981"
                              : e.kind === "installment"
                              ? "#ef4444"
                              : "#f59e0b",
                        }}
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {e.label}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(e.date)}
                        <span> · {e.kind === "payday" ? "Payday" : e.kind === "installment" ? "Installment" : "Recurring"}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">
                      {e.kind === "payday" ? "+" : "-"}
                      {formatCurrency(e.amount)}
                    </p>
                    <span className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      isUrgent ? "bg-red-100 text-red-600" :
                      isWarning ? "bg-amber-100 text-amber-600" :
                      "bg-gray-100 text-gray-500"
                    )}>
                      {dueTxt}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
