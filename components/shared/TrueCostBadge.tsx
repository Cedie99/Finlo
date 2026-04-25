"use client";

import { Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TrueCostBadgeProps {
  originalAmount: number;
  totalPayments: number;
}

export function TrueCostBadge({ originalAmount, totalPayments }: TrueCostBadgeProps) {
  const extra = totalPayments - originalAmount;
  if (extra <= 0.01) return null;

  const pct = ((extra / originalAmount) * 100).toFixed(1);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<span />} className="inline-flex cursor-help items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
          <Info size={10} />
          +{pct}% cost
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="rounded-xl border-white/[0.07] bg-[#111118] p-3 text-xs text-white shadow-xl"
        >
          <p className="font-semibold mb-1">True Cost Breakdown</p>
          <div className="space-y-1 text-white/50">
            <div className="flex justify-between gap-4">
              <span>Item price</span>
              <span className="font-medium text-white">{formatCurrency(originalAmount)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Total payments</span>
              <span className="font-medium text-white">{formatCurrency(totalPayments)}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-white/[0.07] pt-1">
              <span>Extra paid</span>
              <span className="font-bold text-amber-300">+{formatCurrency(extra)}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
