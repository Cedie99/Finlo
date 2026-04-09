"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthYear } from "@/lib/utils/dates";
import { addMonths, subMonths, format } from "date-fns";

interface MonthPickerProps {
  value: string; // YYYY-MM
  onChange: (monthYear: string) => void;
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  function prev() {
    const d = new Date(value + "-01");
    onChange(format(subMonths(d, 1), "yyyy-MM"));
  }

  function next() {
    const d = new Date(value + "-01");
    onChange(format(addMonths(d, 1), "yyyy-MM"));
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon" onClick={prev}><ChevronLeft size={14} /></Button>
      <span className="text-sm font-medium px-2 min-w-[120px] text-center">{formatMonthYear(value)}</span>
      <Button variant="outline" size="icon" onClick={next}><ChevronRight size={14} /></Button>
    </div>
  );
}
