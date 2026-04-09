"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CreditCardForm } from "@/components/credit-cards/CreditCardForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { FullPageSpinner } from "@/components/shared/LoadingSpinner";
import { formatCurrency } from "@/lib/utils/currency";
import {
  useUpdateCreditCard,
  useDeleteCreditCard,
} from "@/lib/hooks/useCreditCards";
import type { CreditCardInput } from "@/lib/validations/credit-cards";
import { Badge } from "@/components/ui/badge";

export default function CreditCardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: card, isLoading } = useQuery({
    queryKey: ["credit-cards", id],
    queryFn: async () => {
      const res = await fetch(`/api/credit-cards/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const updateCard = useUpdateCreditCard(id);
  const deleteCard = useDeleteCreditCard();

  async function handleUpdate(data: CreditCardInput) {
    await updateCard.mutateAsync(data);
    setEditOpen(false);
  }

  async function handleDelete() {
    await deleteCard.mutateAsync(id);
    router.push("/credit-cards");
  }

  if (isLoading) return <FullPageSpinner />;
  if (!card) return <div>Card not found</div>;

  const available =
    parseFloat(card.creditLimit) - parseFloat(card.currentBalance);

  return (
    <div>
      <Link
        href="/credit-cards"
        className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground"
      >
        <ArrowLeft size={14} /> Back to Credit Cards
      </Link>

      <PageHeader
        title={`${card.bankName} — ${card.cardName}`}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Edit2 size={14} className="mr-1" /> Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={14} className="mr-1" /> Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Credit Limit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(card.creditLimit)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(card.currentBalance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Credit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(available)}
            </div>
          </CardContent>
        </Card>
      </div>

      {card.installmentPlans?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Installment Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {card.installmentPlans.map(
                (plan: {
                  id: string;
                  name: string;
                  monthlyAmount: string;
                  paidMonths: number;
                  totalMonths: number;
                  type: string;
                }) => (
                  <Link
                    key={plan.id}
                    href={`/installments/${plan.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div>
                      <div className="font-medium text-sm">{plan.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {plan.paidMonths}/{plan.totalMonths} months paid
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">
                        {formatCurrency(plan.monthlyAmount)}/mo
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {plan.type}
                      </Badge>
                    </div>
                  </Link>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Credit Card</DialogTitle>
          </DialogHeader>
          <CreditCardForm
            defaultValues={{
              ...card,
              creditLimit: parseFloat(card.creditLimit),
              currentBalance: parseFloat(card.currentBalance),
            }}
            onSubmit={handleUpdate}
            isLoading={updateCard.isPending}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Credit Card"
        description="This will delete the card and unlink all installment plans. Cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
