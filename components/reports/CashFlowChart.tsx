"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils/currency";

interface MonthData {
  month: string;
  income: number;
  expenses: number;
}

interface Props {
  data: MonthData[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#16161f] p-3 shadow-xl text-xs">
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-6 mb-1">
          <span style={{ color: p.fill }}>{p.name}</span>
          <span className="font-bold text-white">{formatCurrency(p.value)}</span>
        </div>
      ))}
      <div className="flex justify-between gap-6 border-t border-white/10 pt-1 mt-1">
        <span className="text-white/50">Net</span>
        <span className={`font-bold ${(payload[0]?.value ?? 0) - (payload[1]?.value ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {formatCurrency((payload[0]?.value ?? 0) - (payload[1]?.value ?? 0))}
        </span>
      </div>
    </div>
  );
}

export function CashFlowChart({ data }: Props) {
  if (!data.length) return (
    <div className="flex h-[260px] items-center justify-center text-white/30 text-sm">No data yet</div>
  );

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={4} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false}
          tickFormatter={(v) => `₱${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} width={48} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Legend formatter={(value) => <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>{value}</span>} />
        <Bar dataKey="income" name="Income" fill="#b4f03a" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
