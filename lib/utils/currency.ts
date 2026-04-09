export function formatCurrency(
  amount: number | string,
  currency = "PHP",
  locale = "en-PH"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]/g, "")) || 0;
}

export function toDecimalString(value: number): string {
  return value.toFixed(2);
}
