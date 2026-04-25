# Finlo Feature Architecture

## Problem-Centric Design

Each feature directly addresses one of the 10 core debt problems.

**Core Mission:** Help users understand their debt, manage payment timing, and see the true cost of their obligations.

---

## 🎯 Problem-to-Feature Mapping

### Problem 1: "I didn't realize how much I owe in total"

**Goal:** Unified, unmissable view of all obligations

| Feature                         | Status   | Description                                           |
| ------------------------------- | -------- | ----------------------------------------------------- |
| **Total Outstanding Dashboard** | ✅ Built | Shows total debt across credit cards, BNPL, and loans |
| **Debt Breakdown by Source**    | ✅ Built | Donut chart showing debt by lender/source             |
| **Monthly Commitment Display**  | ✅ Built | Shows total monthly payment obligation                |
| **Debt-Free Projection**        | ✅ Built | Calculates payoff date at current rate                |

---

### Problem 2: Missed or late payments

**Goal:** Never miss a due date

| Feature                    | Status   | Description                                            |
| -------------------------- | -------- | ------------------------------------------------------ |
| **Payment Calendar**       | ✅ Built | Visual calendar showing all due dates                  |
| **Upcoming Payments List** | ✅ Built | Shows next 60 days of payments with urgency indicators |
| **Payment Notifications**  | ✅ Built | Daily digest + urgent alerts                           |

---

### Problem 3: "Minimum payment trap"

**Goal:** Show the true cost of paying minimum only

| Feature                  | Status   | Description                               |
| ------------------------ | -------- | ----------------------------------------- |
| **Debt Payoff Race**     | ✅ Built | Shows payoff timeline with extra payments |
| **Payoff Strategy Page** | ✅ Built | Visualizes different payoff approaches    |

---

### Problem 4: Hidden fees & interest confusion

**Goal:** Transparent true cost of every purchase

| Feature                     | Status   | Description                             |
| --------------------------- | -------- | --------------------------------------- |
| **Installment Detail View** | ✅ Built | Shows monthly amount, total months, APR |
| **Credit Card Details**     | ✅ Built | Shows balance, limit, utilization       |

---

### Problem 5: Overspending due to psychological effects

**Goal:** Bring back the "pain of paying"

| Feature                | Status   | Description                               |
| ---------------------- | -------- | ----------------------------------------- |
| **Safe-to-Spend**      | ✅ Built | Daily spending limit based on obligations |
| **Afford It? Checker** | ✅ Built | Quick check if a purchase is affordable   |

---

### Problem 6: Cash flow mismatch

**Goal:** Align income and payment schedules

| Feature              | Status   | Description                              |
| -------------------- | -------- | ---------------------------------------- |
| **Overlap Detector** | ✅ Built | Alerts when payments collide             |
| **Cash Flow Plan**   | ✅ Built | Shows income vs payment timing           |
| **Payment Calendar** | ✅ Built | Visual alignment of paydays vs due dates |

---

### Problem 7: Lack of prioritization

**Goal:** Clear guidance on which bill to pay first

| Feature                   | Status   | Description                        |
| ------------------------- | -------- | ---------------------------------- |
| **Smart Priority Widget** | ✅ Built | "Pay this first" card on dashboard |
| **Debt Payoff Race**      | ✅ Built | Prioritizes by interest rate       |

---

### Problem 8: No forecasting

**Goal:** See future commitments clearly

| Feature                | Status   | Description                             |
| ---------------------- | -------- | --------------------------------------- |
| **Commitment Density** | ✅ Built | 12-month heatmap of payment load        |
| **Payment Schedule**   | ✅ Built | Shows all upcoming payments for 60 days |

---

### Problem 9: Fragmented platforms

**Goal:** Single source of truth

| Feature                      | Status   | Description                             |
| ---------------------------- | -------- | --------------------------------------- |
| **Unified Dashboard**        | ✅ Built | All obligations in one view             |
| **Manual Entry (all types)** | ✅ Built | Credit cards, BNPL, loans all trackable |

---

### Problem 10: Emotional stress & anxiety

**Goal:** Make finance feel manageable and rewarding

| Feature                    | Status   | Description                       |
| -------------------------- | -------- | --------------------------------- |
| **Progress Visualization** | ✅ Built | Progress rings showing % paid off |
| **Debt Payoff Race**       | ✅ Built | Gamified repayment tracking       |

---

## 🗂️ Current Navigation

```
Dashboard (Overview) - Shows total debt, upcoming payments, smart priorities
My Debt - Manage credit cards and installment plans
Payment Calendar - Visual view of due dates and paydays
Payoff Strategy - Compare payoff approaches
Settings - Configure payday dates and preferences
```

---

## 🎨 Dashboard Layout

The dashboard is organized around the core problems:

```
┌─────────────────────────────────────────────────────────────┐
│  💰  TOTAL OUTSTANDING (Problem 1)                           │
│  You owe ₱XXX,XXX total across X sources                      │
│  [Donut chart breakdown by source]                           │
│  Monthly commitment: ₱XX,XXX · Debt-free: MMM YYYY           │
├─────────────────────────────────────────────────────────────┤
│  🎯  PAY THIS FIRST (Problem 7)                              │
│  Smart prioritization based on interest rate                 │
├─────────────────────────────────────────────────────────────┤
│  �  UPCOMING PAYMENTS (Problem 2)                           │
│  21-day calendar strip with payment indicators              │
├─────────────────────────────────────────────────────────────┤
│  �  PAYMENT SCHEDULE (Problem 2, 8)                         │
│  Next 60 days of payments with urgency labels               │
├─────────────────────────────────────────────────────────────┤
│  💳  YOUR ACCOUNTS (Problem 9)                               │
│  Quick access to all credit cards and installment plans      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 What Was Removed

The following features were removed because they don't solve the core debt problems:

- **Budget tracking** - Expense categorization doesn't help with debt visibility
- **Transaction logging** - General expense tracking isn't debt-focused
- **Income templates** - Full income management is overkill for debt timing
- **Spending reports** - Analytics on past spending doesn't solve debt problems

---

## 📁 Core Components

### Dashboard Components:

- `TotalDebtView` - Unified debt summary with breakdown
- `UpcomingPayments` - Calendar strip and payment list
- `SmartPriorityList` - Which to pay first
- `OverlapDetector` - Cash flow collision alerts

### Debt Management:

- `CreditCardForm` - Add/edit credit cards
- `InstallmentForm` - Add/edit installment plans
- `PaymentSchedule` - Timeline of payments

### Strategy:

- `DebtPayoffRace` - Compare payoff strategies
- `AffordItChecker` - Check if purchase is affordable
- `CashFlowPlan` - Income vs payment alignment
