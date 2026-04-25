"use client";

import { useState } from "react";
import { Plus, CreditCard } from "lucide-react";
import { useCreditCards, useCreateCreditCard } from "@/lib/hooks/useCreditCards";
import { CreditCardGrid } from "@/components/credit-cards/CreditCardGrid";
import { CreditCardForm } from "@/components/credit-cards/CreditCardForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CreditCardInput } from "@/lib/validations/credit-cards";

export default function CreditCardsPage() {
  const [open, setOpen] = useState(false);
  const { data: cards, isLoading } = useCreditCards();
  const createCard = useCreateCreditCard();

  async function handleCreate(data: CreditCardInput) {
    await createCard.mutateAsync(data);
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Credit Cards"
        description="Manage your credit cards"
        action={
          <Button
            onClick={() => setOpen(true)}
            className="rounded-full bg-[#b4f03a] text-[#0c0c10] hover:bg-[#ccff52] shadow-[0_8px_24px_rgba(180,240,58,0.25)]"
          >
            <Plus size={15} className="mr-1" /> Add Card
          </Button>
        }
      />

      {isLoading ? (
        <FullPageSpinner />
      ) : !cards?.length ? (
        <EmptyState
          icon={CreditCard}
          title="No credit cards yet"
          description="Add your first credit card to track installment plans"
          action={
            <Button onClick={() => setOpen(true)} className="rounded-full bg-[#b4f03a] text-[#0c0c10] hover:bg-[#ccff52]">
              Add Card
            </Button>
          }
        />
      ) : (
        <CreditCardGrid cards={cards} />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl border-white/[0.07] bg-[#111118] text-white">
          <DialogHeader>
            <DialogTitle className="font-bold text-white">Add Credit Card</DialogTitle>
          </DialogHeader>
          <CreditCardForm onSubmit={handleCreate} isLoading={createCard.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
