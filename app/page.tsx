"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronDown, PlayCircle, Sparkles } from "lucide-react";
import { FinloLogo } from "@/components/layout/FinloLogo";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "FAQ", href: "#faq" },
];
const metrics = [
  { label: "Installments tracked", value: "120K+", detail: "Across cards, BNPL, and personal plans." },
  { label: "Average safe-to-spend", value: "PHP 48K", detail: "Calculated from your real commitments." },
  { label: "On-time payment confidence", value: "95%", detail: "With alerts and overlap detection." },
  { label: "Debt payoff plans created", value: "50K+", detail: "Built by users reducing financial stress." },
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
  },
  {
    step: "Track upcoming obligations",
    detail: "Finlo organizes due dates and highlights overlaps so you know what needs attention first.",
  },
  {
    step: "Make safer spending decisions",
    detail: "Use safe-to-spend signals and what-if planning to spend confidently without breaking your budget.",
  },
];

const useCases = [
  {
    title: "Credit card installment tracking",
    detail: "Ideal for people managing multiple installment purchases across one or more cards.",
  },
  {
    title: "BNPL and recurring bill planning",
    detail: "Great for balancing BNPL commitments with utilities, subscriptions, and monthly essentials.",
  },
  {
    title: "Paycheck-to-paycheck cash flow",
    detail: "Useful for planning spending between salary dates and avoiding end-of-month surprises.",
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
    answer: "Finlo uses your available balance, expected income, and upcoming obligations to estimate a safer spending amount.",
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
      className="rounded-2xl border border-[#d8dff5] bg-white/85 p-6 backdrop-blur-sm"
    >
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2ff] text-[#245bff]">
        <Sparkles size={18} />
      </div>
      <h3 className="font-heading text-xl font-semibold text-[#0f1a34]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#5b6785]">{description}</p>

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#245bff] transition-colors hover:text-[#1640c4]"
      >
        {expanded ? "Hide details" : "Read more"}
        <ChevronDown size={14} className={`transition-transform duration-250 ${expanded ? "rotate-180" : "rotate-0"}`} />
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${expanded ? "mt-4 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="rounded-xl border border-[#e4e9fb] bg-[#f7f9ff] p-4">
            <ul className="space-y-2">
              {dropdown.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-[#4b5b83]">
                  <span className="mt-[0.42rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#3c66ea]" />
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

export default function HomePage() {
  const { data: session } = useSession();
  const userName = session?.user?.name;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f6f8ff] text-[#151d34]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(45,95,255,0.15),transparent_42%),radial-gradient(circle_at_10%_70%,rgba(64,186,255,0.16),transparent_38%)]" />

      <header className="relative z-20 px-4 pt-5 sm:px-8">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between rounded-full border border-[#d8dff5] bg-white/85 px-6 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2">
            <FinloLogo size="sm" />
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-[#536082] transition-colors hover:text-[#1f3568]"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {userName ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-[#245bff] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1947cd]"
              >
                Enter dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden text-sm font-medium text-[#546288] sm:inline-block">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-[#245bff] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1947cd]"
                >
                  Explore <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-8 sm:pt-16">
        <section className="grid items-start gap-10 lg:grid-cols-[1.35fr_0.8fr]">
          <motion.div custom={0} variants={riseIn} initial="hidden" animate="visible">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d7def4] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#245bff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#245bff]" />
              Built for real-life budgeting
            </p>
            <h1 className="font-heading text-[clamp(2.2rem,7vw,4.7rem)] leading-[0.95] tracking-tight text-[#111a31]">
              Turn Monthly Chaos
              <br />
              into <span className="bg-linear-to-r from-[#2158ff] to-[#2ba8ff] bg-clip-text text-transparent">Financial Clarity</span>
            </h1>
          </motion.div>

          <motion.div custom={0.08} variants={riseIn} initial="hidden" animate="visible" className="pt-2">
            <p className="max-w-sm text-sm leading-relaxed text-[#5f6a89]">
              Finlo helps you track installments, plan bills, and decide what is safe to spend so you can stay in control every month.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-[#245bff] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1a47cc]"
              >
                Start free <ArrowRight size={14} />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-[#cfd8f4] bg-white px-5 py-2.5 text-sm font-semibold text-[#24406d] transition-colors hover:bg-[#f3f6ff]"
              >
                <PlayCircle size={15} /> View dashboard
              </Link>
            </div>
          </motion.div>
        </section>

        <motion.section
          custom={0.16}
          variants={riseIn}
          initial="hidden"
          animate="visible"
          className="relative mt-10 h-68 overflow-hidden rounded-[2.2rem] border border-[#dae1f5] bg-white/80 shadow-[0_18px_60px_rgba(40,72,170,0.14)] sm:h-80"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(72,130,255,0.2),transparent_45%),radial-gradient(circle_at_10%_90%,rgba(106,205,255,0.25),transparent_45%)]" />

          <motion.div
            animate={{ y: [0, -7, 0], rotate: [-0.45, 0.45, -0.45], scale: [1, 1.008, 1] }}
            transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: [0.42, 0, 0.18, 1] }}
            className="absolute left-1/2 top-1/2 h-[74%] max-h-72 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative h-full aspect-[1.586/1] overflow-hidden rounded-[1.5rem] border border-[#d0dafb] bg-[linear-gradient(130deg,#0f224f_0%,#173883_38%,#1f4ead_72%,#2a67d0_100%)] p-4 pb-11 text-white shadow-[0_24px_40px_rgba(21,47,122,0.5),inset_0_1px_0_rgba(255,255,255,0.55)] sm:p-5 sm:pb-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.33),transparent_34%),radial-gradient(circle_at_88%_92%,rgba(120,204,255,0.25),transparent_36%)]" />
              <div className="absolute inset-0 opacity-12 [background:repeating-linear-gradient(145deg,rgba(255,255,255,0.22)_0px,rgba(255,255,255,0.22)_1px,transparent_1px,transparent_8px)]" />
              <motion.div
                aria-hidden
                animate={{ x: [-230, 260] }}
                transition={{ duration: 5.8, repeat: Number.POSITIVE_INFINITY, ease: "linear", repeatDelay: 1.4 }}
                className="pointer-events-none absolute inset-y-0 w-20 -skew-x-12 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.03)_30%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.03)_70%,transparent_100%)]"
              />
              <div className="pointer-events-none absolute inset-0 opacity-18 bg-[radial-gradient(circle_at_50%_-18%,rgba(255,255,255,0.2),transparent_56%)]" />
              <div className="pointer-events-none absolute inset-0 opacity-24 [background:repeating-radial-gradient(circle_at_50%_-18%,rgba(255,255,255,0.34)_0px,rgba(255,255,255,0.34)_0.95px,transparent_0.95px,transparent_8.6px)]" />

              <div className="relative flex items-center justify-between">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#0f172a] sm:h-6 sm:w-6" aria-hidden>
                  <path
                    d="M12 3.5v7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7.2 6.6A7 7 0 1 0 16.8 6.6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-[#0f172a]/85 sm:h-5 sm:w-5" aria-hidden>
                  <path
                    d="M4.5 12c2.1-2.9 4.3-4.3 6.8-4.3M4.5 16c3-4.1 6-6.1 9.4-6.1M4.5 8.1c1.2-1.6 2.5-2.6 4-3.2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <p className="relative mt-17 font-heading text-base tracking-[0.22em] text-[#f2f6ff] drop-shadow-[0_2px_1px_rgba(0,0,0,0.25)] sm:mt-19 sm:text-[1.2rem]">
                **** 5678
              </p>

              <div className="relative mt-3 flex items-end justify-between sm:mt-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-[#d3defd]">JOHN DOE  05/24</p>
                </div>
              </div>

              <div className="absolute bottom-2 right-3 flex items-center sm:bottom-3 sm:right-4">
                <span className="h-6 w-6 rounded-full bg-[#0f172a]/92 sm:h-7 sm:w-7" />
                <span className="-ml-2 h-6 w-6 rounded-full bg-[#d4d4d8]/75 sm:h-7 sm:w-7" />
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute left-6 top-6 rounded-full border border-[#d6def7] bg-white/85 px-3 py-1 text-[11px] font-semibold text-[#2f5ae2]"
          >
            95% Faster
          </motion.div>

          <motion.div
            animate={{ x: [0, -8, 0] }}
            transition={{ duration: 8, delay: 1.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute bottom-6 right-6 rounded-full border border-[#d6def7] bg-white/85 px-3 py-1 text-[11px] font-semibold text-[#2f5ae2]"
          >
            2x Growth
          </motion.div>
        </motion.section>

        <motion.section
          custom={0.2}
          variants={riseIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-10 overflow-hidden rounded-[1.6rem] border border-[#2953dd] bg-[linear-gradient(130deg,#1134aa_0%,#245bff_50%,#2985ff_100%)] text-white"
        >
          <div className="grid gap-px bg-[#3f65de] sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="bg-transparent p-6">
                <p className="font-heading text-[2rem] leading-none">{metric.value}</p>
                <p className="mt-2 text-sm font-semibold">{metric.label}</p>
                <p className="mt-1 text-xs text-[#d8e4ff]">{metric.detail}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <section id="features" className="scroll-mt-24 mt-20 grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <motion.div custom={0.05} variants={riseIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#2b59e8]">Our capabilities</p>
            <h2 className="mt-3 font-heading text-[clamp(1.9rem,5vw,3.2rem)] leading-tight text-[#111c36]">
              Designed for people managing real expenses.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#5f6b89]">
              From installment calendars to payoff planning, Finlo gives you practical tools to avoid missed due dates and reduce money stress.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e9efff] px-4 py-2 text-xs font-semibold text-[#264dc6]">
              <CheckCircle2 size={14} /> Private by default with encrypted account data
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

        <section id="how-it-works" className="scroll-mt-24 mt-20">
          <motion.div custom={0.08} variants={riseIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#2b59e8]">How it works</p>
            <h2 className="mt-3 font-heading text-[clamp(1.8rem,4.6vw,2.8rem)] leading-tight text-[#111c36]">
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
                className="rounded-2xl border border-[#d8dff5] bg-white/85 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3a63e6]">Step {index + 1}</p>
                <h3 className="mt-2 font-heading text-lg font-semibold text-[#132040]">{item.step}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6785]">{item.detail}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="use-cases" className="scroll-mt-24 mt-20">
          <motion.div custom={0.1} variants={riseIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#2b59e8]">Use cases</p>
            <h2 className="mt-3 font-heading text-[clamp(1.8rem,4.6vw,2.8rem)] leading-tight text-[#111c36]">
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
                className="rounded-2xl border border-[#d8dff5] bg-white/85 p-5"
              >
                <h3 className="font-heading text-lg font-semibold text-[#132040]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6785]">{item.detail}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 mt-20">
          <motion.div custom={0.12} variants={riseIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#2b59e8]">FAQ</p>
            <h2 className="mt-3 font-heading text-[clamp(1.8rem,4.6vw,2.8rem)] leading-tight text-[#111c36]">
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
                className="group rounded-2xl border border-[#d8dff5] bg-white/85 p-5"
              >
                <summary className="cursor-pointer list-none font-semibold text-[#12213f] marker:content-none">
                  <span className="inline-flex items-center gap-2">
                    <ChevronDown size={14} className="text-[#3a63e6] transition-transform group-open:rotate-180" />
                    {item.question}
                  </span>
                </summary>
                <p className="mt-3 pl-6 text-sm leading-relaxed text-[#5b6785]">{item.answer}</p>
              </motion.details>
            ))}
          </div>
        </section>

        <footer className="mt-20 border-t border-[#d8dff5] pt-10">
          <div className="grid gap-8 pb-8 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.75fr_0.75fr]">
            <div>
              <FinloLogo size="sm" />
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#5f6b89]">
                Financial flow for everyday life. Track installments, manage cash flow, and spend with more confidence.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#315ce4]">Explore</p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-[#4d5c82] transition-colors hover:text-[#1f3568]"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#315ce4]">Account</p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link href="/register" className="text-[#4d5c82] transition-colors hover:text-[#1f3568]">
                  Create account
                </Link>
                <Link href="/login" className="text-[#4d5c82] transition-colors hover:text-[#1f3568]">
                  Login
                </Link>
                <Link href="/dashboard" className="text-[#4d5c82] transition-colors hover:text-[#1f3568]">
                  Dashboard preview
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-[#e4e9fb] py-5 text-xs text-[#7380a1] sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Finlo. All rights reserved.</p>
            <p>Built for practical budgeting and installment planning.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
