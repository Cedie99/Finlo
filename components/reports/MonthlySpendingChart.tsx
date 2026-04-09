"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatMonthYear } from "@/lib/utils/dates";

interface ChartDataPoint {
  monthYear: string;
  income: string;
  expenses: string;
}

export function MonthlySpendingChart({ data }: { data: ChartDataPoint[] }) {
  const chartData = data.map((d) => ({
    month: formatMonthYear(d.monthYear).slice(0, 3) + " " + d.monthYear.slice(0, 4),
    Income: parseFloat(d.income),
    Expenses: parseFloat(d.expenses),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(val) => `₱${Number(val).toLocaleString()}`} />
        <Legend />
        <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
