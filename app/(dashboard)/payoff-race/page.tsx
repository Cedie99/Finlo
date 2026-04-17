"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { DebtPayoffRace } from "@/components/dashboard/DebtPayoffRace";

export default function PayoffRacePage() {
  return (
    <div>
      <PageHeader
        title="Debt Payoff Race"
        description="See which installment finishes first and simulate early payoff savings"
      />
      <DebtPayoffRace />
    </div>
  );
}
