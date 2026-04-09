"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils/currency";

interface CategoryData {
  categoryId: string | null;
  amount: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryPieChartProps {
  data: CategoryData[];
  categories: Category[];
}

export function CategoryPieChart({ data, categories }: CategoryPieChartProps) {
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const chartData = data
    .filter((d) => d.categoryId && parseFloat(d.amount) > 0)
    .map((d) => ({
      name: catMap[d.categoryId!]?.name ?? "Unknown",
      value: parseFloat(d.amount),
      color: catMap[d.categoryId!]?.color ?? "#6b7280",
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No expense data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="45%" outerRadius={90} dataKey="value" nameKey="name">
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(val) => formatCurrency(val as number)} />
        <Legend iconType="circle" iconSize={10} formatter={(val) => <span className="text-xs">{val}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
