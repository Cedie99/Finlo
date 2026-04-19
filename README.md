# Finlo — Installment & Budget Tracker

**Finlo** is a personal finance web app built for real-life budgeting. It helps you track installments, manage cash flow, and decide what is safe to spend so you can stay in control every month.

---

## Features

### Core

| Feature | Description |
|---|---|
| **Installment Tracking** | Track credit card installments, BNPL plans, and personal loans in a unified timeline |
| **Credit Card Management** | Manage multiple cards with billing cycles, credit limits, and due dates |
| **Budget Categories** | Set monthly spending limits per category and monitor progress |
| **Transactions** | Log income and expense transactions, with recurring transaction support |
| **Income Templates** | Define income sources and expected payday dates for planning |
| **Reports** | Monthly spending charts, category pie charts, cash flow charts, and installment timelines |
| **Simulator** | Stress-test your finances — model salary delays, unexpected expenses, or income drops |
| **Settings** | Configure cash buffer, buffer percentage, payday schedule, and daily digest notifications |

### Smart Dashboard Features

| Feature | Description |
|---|---|
| **Safe-to-Spend** | Daily spending allowance based on real obligations and available balance, with 14-day cash outlook |
| **"Afford It?" Checker** | Floating instant-check tool — enter any amount and get a YES / TIGHT / NO verdict with post-purchase balance |
| **Financial Health Score** | 0–100 score (grade A–F) broken into Debt-to-Income (DTI), Cash Buffer, Payment Consistency, and Debt Load |
| **Commitment Density Calendar** | 12-month heatmap showing LOW / MEDIUM / HIGH / CRITICAL payment load per month |
| **Installment Overlap Detector** | Alert banner that surfaces when 3+ installments collide in the same period |
| **Paycheck Allocation Wizard** | Priority-ordered breakdown showing exactly how to allocate your next paycheck |
| **Debt Payoff Race** | Gamified SVG progress rings with an inline extra-payment calculator showing months saved |
| **Cash Flow Planner** | DTI ratio, income vs. obligations view, and payday calendar per month |
| **Payment Notifications** | Daily digest and urgent payment alerts for due dates within 7 days |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, Framer Motion, Recharts, lucide-react |
| Forms | React Hook Form, Zod |
| Data Fetching | TanStack React Query 5 |
| Auth | NextAuth v5 (credentials) |
| Database | PostgreSQL + Prisma 7 |
| Precision Math | Decimal.js |
| Toasts | sileo |

---

## Project Structure

```
app/
  (auth)/         # Login, register pages
  (dashboard)/    # Protected app pages
    dashboard/    # Main overview
    installments/ # Installment list & detail
    credit-cards/ # Card management
    budget/       # Budget categories & limits
    transactions/ # Transaction log
    reports/      # Charts & analytics
    simulator/    # What-if scenario planner
    payoff-race/  # Debt payoff race page
    settings/     # User preferences

components/
  dashboard/      # Dashboard widgets
  installments/   # Installment form, schedule, progress ring
  credit-cards/   # Credit card grid & form
  budget/         # Budget category cards
  transactions/   # Transaction & recurring forms
  reports/        # Chart components
  layout/         # Sidebar, topbar, mobile nav, providers
  ui/             # shadcn/ui primitives

lib/
  hooks/          # React Query hooks for every feature
  utils/          # Currency, dates, health score, payoff math, density
  generated/      # Prisma client output

prisma/
  schema.prisma   # Database schema
```

---

## Data Models

- **User** — auth + preferences (payday days, cash buffer, daily digest)
- **CreditCard** — bank name, limit, billing cycle day, due day offset
- **InstallmentPlan** — type (CREDIT_CARD / LOAN / BNPL), status, monthly amount, total months, paid months
- **InstallmentPayment** — individual monthly payment records
- **BudgetCategory / BudgetLimit** — per-category monthly spending limits
- **Transaction** — income or expense entries, linked to category or installment
- **RecurringTransaction** — weekly / monthly / yearly auto-bills
- **Income / IncomeTemplate** — actual income records and expected payday templates

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Setup

1. **Clone and install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Create a `.env` file:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/finlo"
   AUTH_SECRET="your-nextauth-secret"
   ```

3. **Push the database schema**

   ```bash
   npm run db:push
   ```

4. **Seed initial data (optional)**

   ```bash
   npm run db:seed
   ```

5. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Other Scripts

| Script | Description |
|---|---|
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:push` | Sync Prisma schema to database |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## How It Works

1. **Connect your money view** — Set your monthly income, recurring bills, credit cards, and installment commitments.
2. **Track upcoming obligations** — Finlo organizes due dates and highlights overlaps so you know what needs attention first.
3. **Make safer spending decisions** — Use safe-to-spend signals, the "Afford It?" checker, and what-if planning to spend confidently.

---

## API Overview

All routes are under `/api/` and require authentication.

| Route | Description |
|---|---|
| `GET/POST /api/installments` | List and create installment plans |
| `GET/PATCH/DELETE /api/installments/[id]` | Manage a single plan |
| `POST /api/installments/early-payoff` | Calculate early payoff with extra payments |
| `GET/POST /api/credit-cards` | List and create credit cards |
| `GET/POST /api/transactions` | Transaction log |
| `GET /api/dashboard` | Main dashboard data (stats, upcoming payments, budget summary) |
| `GET /api/dashboard/safe-to-spend` | Safe-to-spend calculation and 14-day outlook |
| `GET /api/dashboard/cash-flow-plan` | Income vs. obligations, DTI, payday calendar |
| `POST /api/dashboard/afford-it` | Instant afford-it check |
| `GET /api/dashboard/health-score` | Financial health score breakdown |
| `GET /api/dashboard/commitment-density` | 12-month density heatmap data |
| `GET /api/dashboard/overlap-detector` | Installment overlap detection |
| `GET /api/dashboard/paycheck-allocation` | Paycheck allocation breakdown |
| `GET /api/reports/*` | Charts and analytics data |
| `GET/PATCH /api/user/preferences` | User settings |
