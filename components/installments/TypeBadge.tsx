const TYPE_LABELS: Record<string, string> = {
  CREDIT_CARD: "Credit Card",
  LOAN: "Loan",
  BNPL: "BNPL",
};

const TYPE_COLORS: Record<string, string> = {
  CREDIT_CARD: "bg-indigo-100 text-indigo-600",
  LOAN: "bg-orange-100 text-orange-600",
  BNPL: "bg-pink-100 text-pink-600",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-600",
  COMPLETED: "bg-gray-100 text-gray-500",
  CANCELLED: "bg-red-100 text-red-500",
  PAUSED: "bg-amber-100 text-amber-600",
};

export function TypeBadge({ type }: { type: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[type] ?? "bg-gray-100 text-gray-500"}`}>
      {TYPE_LABELS[type] ?? type}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
