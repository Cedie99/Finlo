"use client";

import { formatDate } from "@/lib/utils/dates";
import { addMonths } from "date-fns";

interface PlanItem {
  id: string;
  name: string;
  type: string;
  startDate: string;
  totalMonths: number;
  monthlyAmount: string;
}

const TYPE_COLORS: Record<string, string> = {
  CREDIT_CARD: "#6366f1",
  LOAN: "#f59e0b",
  BNPL: "#ec4899",
};

export function InstallmentTimeline({ plans }: { plans: PlanItem[] }) {
  if (!plans.length) {
    return <div className="text-sm text-muted-foreground py-4">No installment plans to display</div>;
  }

  const allDates = plans.flatMap((p) => [
    new Date(p.startDate),
    addMonths(new Date(p.startDate), p.totalMonths),
  ]);
  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
  const totalRange = maxDate.getTime() - minDate.getTime();

  return (
    <div className="space-y-3 overflow-x-auto">
      <div className="flex justify-between text-xs text-muted-foreground mb-2 px-[120px]">
        <span>{formatDate(minDate)}</span>
        <span>{formatDate(maxDate)}</span>
      </div>
      {plans.map((plan) => {
        const start = new Date(plan.startDate);
        const end = addMonths(start, plan.totalMonths);
        const left = totalRange > 0 ? ((start.getTime() - minDate.getTime()) / totalRange) * 100 : 0;
        const width = totalRange > 0 ? ((end.getTime() - start.getTime()) / totalRange) * 100 : 100;
        const color = TYPE_COLORS[plan.type] ?? "#6b7280";

        return (
          <div key={plan.id} className="flex items-center gap-3 min-w-[600px]">
            <div className="w-[110px] shrink-0 text-xs text-right text-muted-foreground truncate">{plan.name}</div>
            <div className="flex-1 h-6 relative bg-gray-100 dark:bg-gray-800 rounded">
              <div
                className="absolute h-full rounded flex items-center px-2 text-white text-xs font-medium overflow-hidden"
                style={{ left: `${left}%`, width: `${Math.max(width, 2)}%`, backgroundColor: color }}
                title={`${formatDate(start)} → ${formatDate(end)} (${plan.totalMonths}mo)`}
              >
                {width > 15 && `${plan.totalMonths}mo`}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
