"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatMonthYear } from "@/lib/utils/dates";

interface ChartDataPoint {
  monthYear: string;
  income: string;
  expenses: string;
}

export function CashFlowChart({ data }: { data: ChartDataPoint[] }) {
  const chartData = data.map((d) => ({
    month: formatMonthYear(d.monthYear).slice(0, 3),
    Income: parseFloat(d.income),
    Expenses: parseFloat(d.expenses),
    Net: parseFloat(d.income) - parseFloat(d.expenses),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(val) => `₱${Number(val).toLocaleString()}`} />
        <Legend />
        <Area type="monotone" dataKey="Income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} />
        <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
