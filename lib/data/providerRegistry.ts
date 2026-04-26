/**
 * Describes the behavioral mechanics of a PayLater / BNPL provider.
 *
 * PayLater services differ from traditional installment loans in key ways:
 * - They work off a revolving virtual credit limit (not a fixed loan amount).
 * - They offer a "pay-in-full" deferral window (e.g., 30 days, 0% interest).
 * - Installment splits are equal and auto-debited each billing cycle.
 * - A per-transaction service fee may apply on top of interest.
 * - Late fees are charged per missed billing cycle, not per day.
 */
export interface PayLaterDetails {
  /** Available installment split options in months (e.g. [1, 3, 6, 12]) */
  splitOptions: number[];
  /**
   * Days from purchase to pay the FULL balance with zero interest.
   * null means no deferred full-payment option; interest accrues from day 1.
   */
  deferralDays: number | null;
  /**
   * Per-transaction service fee as % of the purchase amount.
   * Applied once at checkout on installment plans (not on 0% deferral).
   */
  serviceFeePercent: number | null;
  /**
   * Whether the late fee is charged per missed billing cycle (true)
   * vs. a flat one-time penalty (false).
   */
  lateFeePerCycle: boolean;
  /** Short human-readable description of the repayment mechanic. */
  mechanicNote: string;
}

export interface ProviderEntry {
  id: string;
  name: string;
  type: "BNPL" | "LOAN" | "CREDIT_CARD" | "ALL";
  interestRate: number; // monthly %, 0 if none
  processingFeePercent: number | null; // % of total
  processingFeeFlat: number | null; // fixed ₱ amount
  lateFee: number | null; // ₱ per missed payment
  lastVerified: string; // "YYYY-MM"
  notes: string | null;
  /** Only populated for BNPL/PayLater providers */
  payLaterDetails?: PayLaterDetails;
}

export const PROVIDER_REGISTRY: ProviderEntry[] = [
  // ── BNPL ─────────────────────────────────────────────────────────────────
  {
    id: "atome",
    name: "Atome",
    type: "BNPL",
    interestRate: 0,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: 200,
    lastVerified: "2025-01",
    notes: "0% interest split into 3 months; late fee ~₱200",
    payLaterDetails: {
      splitOptions: [3],
      deferralDays: null,
      serviceFeePercent: null,
      lateFeePerCycle: true,
      mechanicNote:
        "Purchase is split into 3 equal payments billed every month. 0% interest — late fee of ₱200 charged if you miss a cycle.",
    },
  },
  {
    id: "billease",
    name: "BillEase",
    type: "BNPL",
    interestRate: 3.49,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: 300,
    lastVerified: "2025-01",
    notes: "Up to 3.49% monthly; 0% promos available — verify before use",
    payLaterDetails: {
      splitOptions: [1, 3, 6, 12],
      deferralDays: 30,
      serviceFeePercent: null,
      lateFeePerCycle: true,
      mechanicNote:
        "Pay in full within 30 days (0%), or choose installments up to 12 months. Interest up to 3.49%/mo applies on installment plans.",
    },
  },
  {
    id: "akulaku",
    name: "Akulaku",
    type: "BNPL",
    interestRate: 2.5,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: 200,
    lastVerified: "2025-01",
    notes: "Rate varies by tenure; check app for exact rate",
    payLaterDetails: {
      splitOptions: [3, 6, 9, 12],
      deferralDays: null,
      serviceFeePercent: null,
      lateFeePerCycle: true,
      mechanicNote:
        "Equal monthly installments drawn from a revolving credit limit. Rate depends on selected tenure — always confirm in-app.",
    },
  },
  {
    id: "tendopay",
    name: "TendoPay",
    type: "BNPL",
    interestRate: 0,
    processingFeePercent: 3,
    processingFeeFlat: null,
    lateFee: 150,
    lastVerified: "2025-01",
    notes: "0% interest; 3% one-time processing fee",
    payLaterDetails: {
      splitOptions: [3, 6, 12],
      deferralDays: null,
      serviceFeePercent: 3,
      lateFeePerCycle: true,
      mechanicNote:
        "0% interest installments with a one-time 3% processing fee charged at checkout. Equal monthly payments thereafter.",
    },
  },
  {
    id: "cashalo",
    name: "Cashalo",
    type: "BNPL",
    interestRate: 3.95,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: 500,
    lastVerified: "2025-01",
    notes: "High rate — verify current terms on app",
    payLaterDetails: {
      splitOptions: [3, 6],
      deferralDays: null,
      serviceFeePercent: null,
      lateFeePerCycle: true,
      mechanicNote:
        "Monthly installments at up to 3.95%/mo interest. High late fee (₱500) per missed cycle — prioritize on-time payment.",
    },
  },
  {
    id: "tala",
    name: "Tala",
    type: "BNPL",
    interestRate: 15,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: null,
    lastVerified: "2025-01",
    notes: "Short-term microloan; rate expressed per cycle, verify terms",
    payLaterDetails: {
      splitOptions: [1],
      deferralDays: null,
      serviceFeePercent: null,
      lateFeePerCycle: false,
      mechanicNote:
        "Short-term microloan repaid in a single lump sum. Rate is per loan cycle, not monthly — verify exact amount before borrowing.",
    },
  },
  {
    id: "tonik",
    name: "Tonik",
    type: "BNPL",
    interestRate: 1.88,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: null,
    lastVerified: "2025-01",
    notes: "Quick Loan product; verify current rate",
    payLaterDetails: {
      splitOptions: [3, 6, 12, 24],
      deferralDays: null,
      serviceFeePercent: null,
      lateFeePerCycle: false,
      mechanicNote:
        "Tonik Quick Loan disbursed to your Tonik account. Equal monthly amortization at ~1.88%/mo — verify rate on Tonik app.",
    },
  },
  {
    id: "spaylater",
    name: "SPayLater",
    type: "BNPL",
    interestRate: 0,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: 200,
    lastVerified: "2026-04",
    notes: "Shopee Pay Later — 0% for 1-month; installments up to 24mo with 1.5%–3%/mo interest",
    payLaterDetails: {
      splitOptions: [1, 3, 6, 12, 24],
      deferralDays: 30,
      serviceFeePercent: null,
      lateFeePerCycle: true,
      mechanicNote:
        "Built into the Shopee app. Choose 'Pay Later' at checkout: pay the full amount within 30 days (0% interest), or split into 3–24 monthly installments at 1.5%–3%/mo depending on tenure. Billing is tied to your monthly Shopee billing cycle. Late fee of ₱200 per missed cycle — outstanding balance rolls over and accumulates interest.",
    },
  },
  {
    id: "tiktok-paylater",
    name: "TikTok PayLater",
    type: "BNPL",
    interestRate: 0,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: 150,
    lastVerified: "2026-04",
    notes: "TikTok Shop PayLater — 0% for 3-month split; available at TikTok Shop checkout only",
    payLaterDetails: {
      splitOptions: [1, 3],
      deferralDays: 30,
      serviceFeePercent: null,
      lateFeePerCycle: true,
      mechanicNote:
        "Available only at TikTok Shop checkout (in-app). Choose 'Pay in 30 Days' (full amount, 0% interest) or split into 3 equal monthly payments at 0% interest. A virtual credit limit is assigned based on your TikTok account history. Late fee of ₱150 applies per missed billing cycle. Repayment via GCash, Maya, or bank transfer.",
    },
  },

  // ── LOAN ──────────────────────────────────────────────────────────────────
  {
    id: "sss",
    name: "SSS (Salary Loan)",
    type: "LOAN",
    interestRate: 0.83,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: null,
    lastVerified: "2025-01",
    notes: "10% annual = ~0.83%/mo; check SSS portal for exact amount",
  },
  {
    id: "pagibig",
    name: "Pag-IBIG (Multi-Purpose Loan)",
    type: "LOAN",
    interestRate: 0.5,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: null,
    lastVerified: "2025-01",
    notes: "6% annual for MPL; housing loans differ",
  },
  {
    id: "homecredit",
    name: "Home Credit",
    type: "LOAN",
    interestRate: 3.5,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: 500,
    lastVerified: "2025-01",
    notes: "Add-on rate; effective rate is higher — verify on contract",
  },
  {
    id: "juanhand",
    name: "JuanHand",
    type: "LOAN",
    interestRate: 4,
    processingFeePercent: 5,
    processingFeeFlat: null,
    lateFee: null,
    lastVerified: "2025-01",
    notes: "Rate and fees vary; verify in app before borrowing",
  },
  {
    id: "gloan",
    name: "GLoan (GCash)",
    type: "LOAN",
    interestRate: 3,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: null,
    lastVerified: "2025-01",
    notes: "Rate varies by user profile; check GCash app",
  },
  {
    id: "robinsons-bank",
    name: "Robinsons Bank (Personal Loan)",
    type: "LOAN",
    interestRate: 1.3,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: null,
    lastVerified: "2025-01",
    notes: "Add-on rate; effective rate ~2.5%/mo",
  },
  {
    id: "cimb",
    name: "CIMB (Personal Loan)",
    type: "LOAN",
    interestRate: 1,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: null,
    lastVerified: "2025-01",
    notes: "Starting at 1%/mo; rate depends on credit assessment",
  },

  // ── CREDIT_CARD ────────────────────────────────────────────────────────────
  {
    id: "bpi",
    name: "BPI",
    type: "CREDIT_CARD",
    interestRate: 2,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: 850,
    lastVerified: "2025-01",
    notes: "BPI standard installment rate; 0% promos available — check promo terms",
  },
  {
    id: "bdo",
    name: "BDO",
    type: "CREDIT_CARD",
    interestRate: 2,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: 850,
    lastVerified: "2025-01",
    notes: "BDO standard rate; 0% installments at partner merchants",
  },
  {
    id: "metrobank",
    name: "Metrobank",
    type: "CREDIT_CARD",
    interestRate: 2,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: 850,
    lastVerified: "2025-01",
    notes: "Standard card rate; verify actual rate on your statement",
  },
  {
    id: "security-bank",
    name: "Security Bank",
    type: "CREDIT_CARD",
    interestRate: 2,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: 850,
    lastVerified: "2025-01",
    notes: "Standard installment rate; 0% promos may apply",
  },
  {
    id: "unionbank",
    name: "UnionBank",
    type: "CREDIT_CARD",
    interestRate: 2,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: 850,
    lastVerified: "2025-01",
    notes: "Standard rate; check UnionBank app for current promotions",
  },
  {
    id: "rcbc",
    name: "RCBC",
    type: "CREDIT_CARD",
    interestRate: 2,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: 850,
    lastVerified: "2025-01",
    notes: "Standard card rate",
  },
  {
    id: "eastwest",
    name: "EastWest Bank",
    type: "CREDIT_CARD",
    interestRate: 2,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: 850,
    lastVerified: "2025-01",
    notes: "Standard card rate",
  },
  {
    id: "pnb",
    name: "PNB",
    type: "CREDIT_CARD",
    interestRate: 2,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: 850,
    lastVerified: "2025-01",
    notes: "Standard card rate",
  },
  {
    id: "chinabank",
    name: "Chinabank",
    type: "CREDIT_CARD",
    interestRate: 2,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: 850,
    lastVerified: "2025-01",
    notes: "Standard card rate",
  },

  // ── Fallback ──────────────────────────────────────────────────────────────
  {
    id: "other",
    name: "Other / Not listed",
    type: "ALL",
    interestRate: 0,
    processingFeePercent: null,
    processingFeeFlat: null,
    lateFee: null,
    lastVerified: "2025-01",
    notes: null,
  },
];

/** Returns providers matching a given installment type (plus ALL-type entries). */
export function getProvidersForType(
  type: "CREDIT_CARD" | "LOAN" | "BNPL"
): ProviderEntry[] {
  return PROVIDER_REGISTRY.filter((p) => p.type === type || p.type === "ALL");
}

/** Calculates the flat processing fee amount given a total amount. */
export function calcProcessingFee(
  provider: ProviderEntry,
  totalAmount: number
): number {
  if (provider.processingFeePercent != null) {
    return (provider.processingFeePercent / 100) * totalAmount;
  }
  return provider.processingFeeFlat ?? 0;
}
