"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, CheckCircle2, Sparkles } from "lucide-react";
import { FinloLogo } from "@/components/layout/FinloLogo";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "FAQ", href: "#faq" },
];

const metricPills = [
  {
    label: "500 Goal",
    value: "₱24,000",
    sub: "₱14,000 paid",
    dot: "bg-red-400",
    textColor: "text-red-400",
    bg: "bg-red-500/8",
    border: "border-red-500/15",
  },
  {
    label: "Safe to Spend",
    value: "₱4,300",
    sub: "This week",
    dot: "bg-emerald-400",
    textColor: "text-emerald-400",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/15",
  },
  {
    label: "Health Score",
    value: "4.1",
    sub: "Good standing",
    dot: "bg-indigo-400",
    textColor: "text-indigo-400",
    bg: "bg-indigo-500/8",
    border: "border-indigo-500/15",
  },
];

const capabilities = [
  {
    title: "Smart Installment Tracking",
    description:
      "Track every due date in one timeline so you always know what is coming next and what is already paid.",
    dropdown: [
      "Unified timeline across credit cards, BNPL, and personal installment plans.",
      "Automatic monthly view so users can quickly spot payment pileups.",
      "Status tracking that makes it clear what is upcoming, due, or already paid.",
    ],
  },
  {
    title: "Safe-to-Spend Guidance",
    description:
      "Get a clear weekly budget ceiling based on upcoming obligations, recurring bills, and your available balance.",
    dropdown: [
      "Daily and weekly spending allowance based on real obligations and cash flow.",
      "Early risk indicators when planned spending may collide with due dates.",
      "Actionable guardrails that help users avoid overdrafts and missed payments.",
    ],
  },
  {
    title: "Debt Payoff Simulation",
    description:
      "Test payment scenarios and compare payoff timelines before making a decision so you can pay smarter.",
    dropdown: [
      "Scenario testing for extra payments, delayed income, and budget changes.",
      "Timeline comparison to see which repayment strategy closes debt faster.",
      "Clear impact preview on monthly cash flow before committing to a plan.",
    ],
  },
];

const howItWorks = [
  {
    step: "Connect your money view",
    detail: "Set your monthly income, recurring bills, cards, and installment commitments in one place.",
    color: "border-indigo-500/30 bg-indigo-500/5",
    label: "text-indigo-400",
  },
  {
    step: "Track upcoming obligations",
    detail: "Finlo organizes due dates and highlights overlaps so you know what needs attention first.",
    color: "border-amber-500/30 bg-amber-500/5",
    label: "text-amber-400",
  },
  {
    step: "Make safer spending decisions",
    detail: "Use safe-to-spend signals and what-if planning to spend confidently without breaking your budget.",
    color: "border-emerald-500/30 bg-emerald-500/5",
    label: "text-emerald-400",
  },
];

const useCases = [
  {
    title: "Credit card installment tracking",
    detail: "Ideal for people managing multiple installment purchases across one or more cards.",
    icon: "💳",
  },
  {
    title: "BNPL and recurring bill planning",
    detail: "Great for balancing BNPL commitments with utilities, subscriptions, and monthly essentials.",
    icon: "📅",
  },
  {
    title: "Paycheck-to-paycheck cash flow",
    detail: "Useful for planning spending between salary dates and avoiding end-of-month surprises.",
    icon: "💰",
  },
];

const faqs = [
  {
    question: "Do I need to connect a bank account?",
    answer: "No. You can manually add your income, bills, and installments and still get full planning features.",
  },
  {
    question: "Can I track multiple cards and plans?",
    answer: "Yes. Finlo is built to support multiple credit cards, BNPL plans, and recurring expenses together.",
  },
  {
    question: "How is safe-to-spend calculated?",
    answer:
      "Finlo uses your available balance, expected income, and upcoming obligations to estimate a safer spending amount.",
  },
];

const riseIn = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

// ─── Phone mockup ─────────────────────────────────────────────────────────────
function AppMockup() {
  const bars = [0.3, 0.5, 0.7, 0.4, 0.8, 0.6, 0.55, 0.75, 0.45, 0.65, 1, 0.88];
  const items = [
    { name: "iPhone 16 Pro", amount: "₱2,500", color: "bg-blue-400" },
    { name: "Macbook Air", amount: "₱4,100", color: "bg-amber-400" },
    { name: "Airpods Pro", amount: "₱1,200", color: "bg-[#b4f03a]" },
    { name: "Samsung TV", amount: "₱1,800", color: "bg-violet-400" },
  ];

  return (
    <div className="relative w-[220px] sm:w-[248px]">
      <div className="pointer-events-none absolute inset-0 scale-110 rounded-[3rem] bg-indigo-500/8 blur-3xl" />
      <div className="relative rounded-[2.8rem] border-2 border-white/[0.08] bg-[#0a0a10] p-[4px] shadow-[0_48px_120px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="overflow-hidden rounded-[2.4rem] bg-[#09090b]">
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-[20px] w-[80px] rounded-full bg-[#0a0a10]" />
          </div>
          <div className="flex flex-col px-5 pt-3 pb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">Safe to Spend</p>
            <p className="mt-1 font-heading text-[2rem] font-bold leading-none text-white">₱18,450</p>
            <p className="mt-1 text-[10px] text-white/40">Updated just now</p>
            <div className="my-4 h-px bg-white/[0.06]" />
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">Monthly Spend</p>
            <div className="flex h-14 items-end gap-[3px]">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${h * 100}%`,
                    background:
                      i === bars.length - 2 ? "#b4f03a"
                        : i === bars.length - 1 ? "#8ab82c"
                          : "rgba(255,255,255,0.08)",
                  }}
                />
              ))}
            </div>
            <div className="my-4 h-px bg-white/[0.06]" />
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">Active Plans</p>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.color}`} />
                    <span className="text-sm text-white/60">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{item.amount}</span>
                </div>
              ))}
            </div>
            <div className="mt-6" />
          </div>
          <div className="flex justify-center pb-3">
            <span className="h-[3px] w-16 rounded-full bg-white/[0.08]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Capability card ──────────────────────────────────────────────────────────
function CapabilityCard({
  title,
  description,
  dropdown,
  index,
}: {
  title: string;
  description: string;
  dropdown: string[];
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.article
      custom={0.1 + index * 0.08}
      variants={riseIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="rounded-2xl border border-white/[0.07] bg-[#111118] p-6"
    >
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
        <Sparkles size={18} />
      </div>
      <h3 className="font-heading text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/60">{description}</p>

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#b4f03a] transition-colors hover:text-[#c8f55a]"
      >
        {expanded ? "Hide details" : "Read more"}
        <ChevronDown size={14} className={`transition-transform duration-250 ${expanded ? "rotate-180" : ""}`} />
      </button>

      <div className={`grid transition-all duration-300 ease-out ${expanded ? "mt-4 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <ul className="space-y-2">
              {dropdown.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-white/55">
                  <span className="mt-[0.42rem] h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { data: session } = useSession();
  const userName = session?.user?.name;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#09090b] text-white">
      {/* ── Navigation ── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-5 sm:px-8 bg-[#09090b]/90 backdrop-blur-md border-b border-white/[0.06]">
        <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between mb-2 ">
          <Link href="/" className="flex items-center gap-2">
            <FinloLogo size="sm" markClassName="[filter:brightness(0)_invert(1)]" wordmarkClassName="text-white" />
          </Link>
          <div className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <a key={item.label} href={item.href}
                className="text-sm text-white/60 transition-colors hover:text-white">
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {userName ? (
              <Link href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-[#b4f03a] px-4 py-2 text-sm font-semibold text-[#09090b] transition-colors hover:bg-[#c8f55a]">
                Enter dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link href="/login"
                  className="hidden text-sm text-white/45 transition-colors hover:text-white sm:block">
                  Login
                </Link>
                <Link href="/register"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#b4f03a] px-4 py-2 text-sm font-semibold text-[#09090b] transition-colors hover:bg-[#c8f55a]">
                  Create an account
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ── Hero (centered) ── */}
      <section className="relative px-4 pb-24 pt-20 sm:px-8 lg:pt-28">
        {/* Background glows — multi-color */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-600/6 blur-[120px]" />
        <div className="pointer-events-none absolute left-1/4 top-20 h-64 w-64 rounded-full bg-[#b4f03a]/4 blur-[80px]" />
        <div className="pointer-events-none absolute right-1/4 top-32 h-48 w-48 rounded-full bg-violet-600/5 blur-[80px]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.p
            custom={0}
            variants={riseIn}
            initial="hidden"
            animate="visible"
            className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#b4f03a]"
          >
            # Built for real-life budgeting
          </motion.p>

          <motion.h1
            custom={0.06}
            variants={riseIn}
            initial="hidden"
            animate="visible"
            className="font-heading text-[clamp(2.8rem,7vw,5rem)] font-bold leading-[0.92] tracking-tight text-white"
          >
            Manage the chaos
            <br />
            <span className="bg-gradient-to-r from-[#b4f03a] via-[#34d399] to-[#6366f1] bg-clip-text text-transparent">
              of your installments
            </span>
          </motion.h1>

          <motion.p
            custom={0.12}
            variants={riseIn}
            initial="hidden"
            animate="visible"
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/50"
          >
            Finlo tracks every due date, calculates your safe-to-spend, and helps you
            pay off debt faster — all in one clear, focused dashboard.
          </motion.p>

          <motion.div
            custom={0.17}
            variants={riseIn}
            initial="hidden"
            animate="visible"
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-[#b4f03a] px-7 py-3 text-sm font-bold text-[#09090b] transition-colors hover:bg-[#c8f55a]">
              Get Started
            </Link>
            <Link href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white/70 transition-colors hover:border-white/20 hover:text-white">
              View dashboard <ArrowRight size={14} />
            </Link>
          </motion.div>

          {/* Metric pills — centered row */}
          <motion.div
            custom={0.22}
            variants={riseIn}
            initial="hidden"
            animate="visible"
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            {metricPills.map((pill) => (
              <div
                key={pill.label}
                className={`inline-flex items-center gap-3 rounded-2xl border px-4 py-2.5 ${pill.bg} ${pill.border}`}
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${pill.dot}`} />
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] text-white/40">{pill.label}</span>
                  <span className={`text-sm font-bold ${pill.textColor}`}>{pill.value}</span>
                </div>
                <span className="text-[10px] text-white/30">{pill.sub}</span>
              </div>
            ))}
          </motion.div>

          {/* Phone mockup — centered below */}
          <motion.div
            custom={0.28}
            variants={riseIn}
            initial="hidden"
            animate="visible"
            className="mt-14 flex justify-center"
          >
            <AppMockup />
          </motion.div>
        </div>
      </section>

      {/* ── Metrics band ── */}
      <section className="border-y border-white/[0.05] bg-[#0c0c10]">
        <div className="mx-auto grid max-w-7xl gap-px bg-white/[0.04] sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: "120K+", label: "Installments tracked", sub: "Across cards, BNPL, and personal plans.", color: "text-indigo-400" },
            { value: "PHP 48K", label: "Average safe-to-spend", sub: "Calculated from your real commitments.", color: "text-[#b4f03a]" },
            { value: "95%", label: "On-time payment confidence", sub: "With alerts and overlap detection.", color: "text-emerald-400" },
            { value: "50K+", label: "Debt payoff plans created", sub: "Built by users reducing financial stress.", color: "text-amber-400" },
          ].map((m) => (
            <div key={m.label} className="bg-[#0c0c10] px-8 py-7">
              <p className={`font-heading text-[2rem] leading-none ${m.color}`}>{m.value}</p>
              <p className="mt-2 text-sm font-semibold text-white">{m.label}</p>
              <p className="mt-1 text-xs text-white/35">{m.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        {/* ── Features ── */}
        <section id="features" className="scroll-mt-24 mt-20 grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <motion.div
            custom={0.05}
            variants={riseIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-indigo-400">Our capabilities</p>
            <h2 className="mt-3 font-heading text-[clamp(1.9rem,5vw,3.2rem)] leading-tight text-white">
              Designed for people managing real expenses.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
              From installment calendars to payoff planning, Finlo gives you practical tools to avoid missed due dates
              and reduce money stress.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/60">
              <CheckCircle2 size={14} className="text-emerald-400" /> Private by default with encrypted account data
            </div>
          </motion.div>

          <div className="space-y-4">
            {capabilities.map((item, index) => (
              <CapabilityCard
                key={item.title}
                title={item.title}
                description={item.description}
                dropdown={item.dropdown}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="scroll-mt-24 mt-20">
          <motion.div custom={0.08} variants={riseIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-400">How it works</p>
            <h2 className="mt-3 font-heading text-[clamp(1.8rem,4.6vw,2.8rem)] leading-tight text-white">
              Three steps to clearer financial flow.
            </h2>
          </motion.div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {howItWorks.map((item, index) => (
              <motion.article
                key={item.step}
                custom={0.08 + index * 0.06}
                variants={riseIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`rounded-2xl border p-5 ${item.color}`}
              >
                <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${item.label}`}>Step {index + 1}</p>
                <h3 className="mt-2 font-heading text-base font-semibold text-white">{item.step}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{item.detail}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* ── Use cases ── */}
        <section id="use-cases" className="scroll-mt-24 mt-20">
          <motion.div custom={0.1} variants={riseIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-violet-400">Use cases</p>
            <h2 className="mt-3 font-heading text-[clamp(1.8rem,4.6vw,2.8rem)] leading-tight text-white">
              Built for real budgeting situations.
            </h2>
          </motion.div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {useCases.map((item, index) => (
              <motion.article
                key={item.title}
                custom={0.1 + index * 0.06}
                variants={riseIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="rounded-2xl border border-white/[0.07] bg-[#111118] p-6"
              >
                <span className="text-2xl">{item.icon}</span>
                <h3 className="mt-3 font-heading text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{item.detail}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="scroll-mt-24 mt-20">
          <motion.div custom={0.12} variants={riseIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#b4f03a]">FAQ</p>
            <h2 className="mt-3 font-heading text-[clamp(1.8rem,4.6vw,2.8rem)] leading-tight text-white">
              Common questions, quick answers.
            </h2>
          </motion.div>

          <div className="mt-8 space-y-3">
            {faqs.map((item, index) => (
              <motion.details
                key={item.question}
                custom={0.12 + index * 0.05}
                variants={riseIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group rounded-2xl border border-white/[0.07] bg-[#111118] p-5"
              >
                <summary className="cursor-pointer list-none font-semibold text-white marker:content-none">
                  <span className="inline-flex items-center gap-2">
                    <ChevronDown size={14} className="text-[#b4f03a] transition-transform group-open:rotate-180" />
                    {item.question}
                  </span>
                </summary>
                <p className="mt-3 pl-6 text-sm leading-relaxed text-white/60">{item.answer}</p>
              </motion.details>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="mt-20 border-t border-white/[0.06] pt-10">
          <div className="grid gap-8 pb-8 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.75fr_0.75fr]">
            <div>
              <FinloLogo size="sm" markClassName="[filter:brightness(0)_invert(1)]" wordmarkClassName="text-white" />
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
                Financial flow for everyday life. Track installments, manage cash flow, and spend with more confidence.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Explore</p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                {navItems.map((item) => (
                  <a key={item.label} href={item.href}
                    className="text-white/60 transition-colors hover:text-white">
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Account</p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link href="/register" className="text-white/60 transition-colors hover:text-white">Create account</Link>
                <Link href="/login" className="text-white/60 transition-colors hover:text-white">Login</Link>
                <Link href="/dashboard" className="text-white/60 transition-colors hover:text-white">Dashboard preview</Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-white/[0.05] py-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Finlo. All rights reserved.</p>
            <p>Built for practical budgeting and installment planning.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
