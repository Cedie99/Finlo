"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";
import type { CreditCard } from "@/lib/hooks/useCreditCards";

function CreditCardDisplay({ card }: { card: CreditCard }) {
  const utilization =
    (parseFloat(card.currentBalance) / parseFloat(card.creditLimit)) * 100;

  return (
    <Link href={`/credit-cards/${card.id}`}>
      <div
        className="relative rounded-2xl p-5 text-white cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${card.color}, ${card.color}bb)`,
        }}
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
          style={{ background: "white", transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10"
          style={{ background: "white", transform: "translate(-30%, 30%)" }}
        />
        <div className="text-xs opacity-75 mb-3">{card.bankName}</div>
        <div className="text-lg font-semibold">{card.cardName}</div>
        {card.lastFourDigits && (
          <div className="text-sm opacity-75 mt-1 font-mono">
            •••• •••• •••• {card.lastFourDigits}
          </div>
        )}
        <div className="mt-5">
          <div className="text-xs opacity-75">Balance</div>
          <div className="text-2xl font-bold">
            {formatCurrency(card.currentBalance)}
          </div>
          <div className="text-xs opacity-75 mt-0.5">
            of {formatCurrency(card.creditLimit)} limit
          </div>
          <div className="mt-2 bg-white/20 rounded-full h-1.5">
            <div
              className="bg-white rounded-full h-1.5 transition-all"
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
          <div className="text-xs opacity-75 mt-1">
            {utilization.toFixed(0)}% used
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CreditCardGrid({ cards }: { cards: CreditCard[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <CreditCardDisplay key={card.id} card={card} />
      ))}
    </div>
  );
}
