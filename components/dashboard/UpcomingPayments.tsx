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

  const kindDot: Record<string, string> = {
    payday: "#34d399",
    installment: "#ef4444",
    recurring: "#f59e0b",
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b4f03a]/10 text-[#b4f03a]">
          <Calendar size={16} />
        </div>
        <h2 className="font-semibold text-white">Upcoming Events</h2>
      </div>

      {events.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-white/30">No events this month</p>
        </div>
      ) : (
        <div className="space-y-1">
          {events.map((e, idx) => {
            const daysUntil = differenceInDays(parseISO(e.date), new Date());
            const isUrgent = daysUntil >= 0 && daysUntil <= 3;
            const isWarning = daysUntil > 3 && daysUntil <= 7;
            const dueTxt =
              daysUntil === 0
                ? "Today!"
                : daysUntil < 0
                ? "Overdue"
                : `${daysUntil}d left`;
            const href = e.kind === "installment" ? "/installments" : "/transactions";

            return (
              <Link key={`${e.kind}-${e.date}-${idx}`} href={href}>
                <div className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.05]">
                  <div className="flex items-center gap-3">
                    {e.kind === "recurring" ? (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f59e0b]/10 text-[#f59e0b]">
                        <RefreshCw size={13} />
                      </div>
                    ) : (
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: kindDot[e.kind] }}
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white">{e.label}</p>
                      <p className="mt-0.5 text-xs text-white/30">
                        {formatDate(e.date)} ·{" "}
                        {e.kind === "payday"
                          ? "Payday"
                          : e.kind === "installment"
                          ? "Installment"
                          : "Recurring"}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn("text-sm font-bold", e.kind === "payday" ? "text-[#34d399]" : "text-white")}>
                      {e.kind === "payday" ? "+" : "-"}
                      {formatCurrency(e.amount)}
                    </p>
                    <span
                      className={cn(
                        "mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        isUrgent
                          ? "bg-[#ef4444]/15 text-[#ef4444]"
                          : isWarning
                          ? "bg-[#f59e0b]/15 text-[#f59e0b]"
                          : "bg-white/[0.07] text-white/50"
                      )}
                    >
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
