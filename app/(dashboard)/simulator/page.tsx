"use client";

import { useState } from "react";
import { WhatIfSimulator } from "@/components/dashboard/WhatIfSimulator";
import { PageHeader } from "@/components/shared/PageHeader";
import { getMonthYear, formatMonthYear } from "@/lib/utils/dates";
import { addMonths, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SimulatorPage() {
  const [monthYear, setMonthYear] = useState(getMonthYear());
  const safeToSpendTargetDate =
    monthYear === getMonthYear() ? undefined : `${monthYear}-01`;

  function prevMonth() {
    const d = new Date(monthYear + "-01");
    setMonthYear(getMonthYear(subMonths(d, 1)));
  }

  function nextMonth() {
    const d = new Date(monthYear + "-01");
    setMonthYear(getMonthYear(addMonths(d, 1)));
  }

  return (
    <div>
      <PageHeader
        title="Cashflow Simulator"
        description="Stress test your finances before they happen"
        action={
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft size={14} />
            </Button>
            <span className="text-sm font-medium px-2">
              {formatMonthYear(monthYear)}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight size={14} />
            </Button>
          </div>
        }
      />
      <WhatIfSimulator monthYear={monthYear} targetDate={safeToSpendTargetDate} />
    </div>
  );
}
