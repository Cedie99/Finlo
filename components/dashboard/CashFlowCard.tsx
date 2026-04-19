"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import Decimal from "decimal.js";

interface CashFlowCardProps {
  income: string;
  expenses: string;
}

export function CashFlowCard({ income, expenses }: CashFlowCardProps) {
  const net = new Decimal(income).minus(new Decimal(expenses));
  const isPositive = net.gte(0);

  const cards = [
    {
      label: "Income",
      value: formatCurrency(income),
      icon: TrendingUp,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      valuColor: "text-emerald-600",
      bg: "bg-white",
    },
    {
      label: "Expenses",
      value: formatCurrency(expenses),
      icon: TrendingDown,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      valuColor: "text-red-500",
      bg: "bg-white",
    },
    {
      label: "Net Cash Flow",
      value: `${formatCurrency(net.abs().toString())}`,
      badge: isPositive ? "surplus" : "deficit",
      icon: isPositive ? TrendingUp : TrendingDown,
      iconBg: isPositive ? "bg-[#e3f0ed]" : "bg-orange-100",
      iconColor: isPositive ? "text-[#2f7f76]" : "text-orange-500",
      valuColor: isPositive ? "text-[#2f7f76]" : "text-orange-500",
      bg: isPositive
        ? "bg-gradient-to-br from-[#2f7f76] to-[#45a79d] text-white"
        : "bg-white",
      light: isPositive,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ label, value, badge, icon: Icon, iconBg, iconColor, valuColor, bg, light }) => (
        <Link
          key={label}
          href="/transactions"
          className={`${bg} rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
        >
          <div className="flex items-center justify-between mb-4">
            <p className={`text-sm font-medium ${light ? "text-white/80" : "text-gray-500"}`}>
              {label}
            </p>
            <div className={`w-9 h-9 rounded-2xl ${light ? "bg-white/20" : iconBg} flex items-center justify-center`}>
              <Icon size={17} className={light ? "text-white" : iconColor} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${light ? "text-white" : valuColor}`}>
            {value}
          </p>
          {badge && (
            <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${light ? "bg-white/20 text-white" : isPositive ? "bg-[#edf5f2] text-[#2f7f76]" : "bg-orange-50 text-orange-500"}`}>
              {badge}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
