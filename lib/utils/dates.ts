import { format, parse, startOfMonth, endOfMonth, addMonths } from "date-fns";

export function getMonthYear(date: Date = new Date()): string {
  return format(date, "yyyy-MM");
}

export function parseMonthYear(monthYear: string): Date {
  return parse(monthYear, "yyyy-MM", new Date());
}

export function getMonthRange(monthYear: string): { start: Date; end: Date } {
  const date = parseMonthYear(monthYear);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function formatMonthYear(monthYear: string): string {
  return format(parseMonthYear(monthYear), "MMMM yyyy");
}

export function getLastNMonths(n: number): string[] {
  const months: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    months.push(getMonthYear(addMonths(new Date(), -i)));
  }
  return months;
}

export function addMonthsToDate(date: Date, months: number): Date {
  return addMonths(date, months);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MM/dd/yyyy");
}
