"use client";

import { addMonths, format, differenceInMonths } from "date-fns";
import { formatCurrency } from "@/lib/utils/currency";

interface Plan {
  id: string;
  name: string;
  type: string;
  totalAmount: string | number;
  monthlyAmount: string | number;
  totalMonths: number;
  paidMonths: number;
  startDate: string;
  lenderName?: string | null;
  creditCard?: { bankName: string; cardName: string; color: string } | null;
}

interface Props {
  plans: Plan[];
}

const TYPE_COLORS: Record<string, string> = {
  CREDIT_CARD: "#6366f1",
  LOAN: "#10b981",
  BNPL: "#f59e0b",
};

export function InstallmentTimeline({ plans }: Props) {
  if (!plans.length) return (
    <p className="text-white/40 text-sm py-4">No active installment plans.</p>
  );

  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => addMonths(now, i));

  return (
    <div className="space-y-3 overflow-x-auto">
      {/* Month headers */}
      <div className="flex gap-1 min-w-max">
        <div className="w-36 shrink-0" />
        {months.map((m) => (
          <div key={m.toISOString()} className="w-10 shrink-0 text-center text-[10px] text-white/40 font-medium">
            {format(m, "MMM")}
          </div>
        ))}
      </div>

      {/* Plan rows */}
      {plans.map((plan) => {
        const start = new Date(plan.startDate);
        const endMonth = addMonths(start, plan.totalMonths - 1);
        const color = TYPE_COLORS[plan.type] ?? "#6366f1";
        const label = plan.lenderName ?? plan.creditCard?.bankName ?? plan.name;

        return (
          <div key={plan.id} className="flex items-center gap-1 min-w-max">
            {/* Plan label */}
            <div className="w-36 shrink-0 pr-3">
              <p className="text-xs font-medium text-white truncate">{plan.name}</p>
              <p className="text-[10px] text-white/40 truncate">{label} · {formatCurrency(Number(plan.monthlyAmount))}/mo</p>
            </div>

            {/* Month cells */}
            {months.map((m, i) => {
              const isActive = m >= start && m <= endMonth;
              const isPaid = differenceInMonths(m, start) < plan.paidMonths;
              const isFirst = i === 0 || (i > 0 && months[i - 1] < start);
              const isLast = m.toDateString() === endMonth.toDateString() || (i < months.length - 1 && months[i + 1] > endMonth);

              return (
                <div key={m.toISOString()} className="w-10 h-6 shrink-0">
                  {isActive ? (
                    <div
                      className={`h-full flex items-center justify-center text-[9px] font-bold transition-all ${
                        isFirst ? "rounded-l-full" : ""
                      } ${isLast ? "rounded-r-full" : ""}`}
                      style={{
                        background: isPaid ? `${color}40` : `${color}90`,
                        border: isPaid ? `1px solid ${color}30` : `1px solid ${color}60`,
                      }}
                      title={`${plan.name} — ${format(m, "MMM yyyy")}${isPaid ? " (paid)" : ""}`}
                    >
                      {isPaid && <span style={{ color }}>✓</span>}
                    </div>
                  ) : (
                    <div className="h-full" />
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      <div className="flex gap-4 mt-2 text-[10px] text-white/35">
        <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-white/20" />Active</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-white/10 border border-white/20" />Paid</span>
      </div>
    </div>
  );
}
