"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, PlayCircle, Sparkles } from "lucide-react";

const navItems = ["Features", "How It Works", "Use Cases", "FAQ"];
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
  },
  {
    title: "Safe-to-Spend Guidance",
    description:
      "Get a clear weekly budget ceiling based on upcoming obligations, recurring bills, and your available balance.",
  },
  {
    title: "Debt Payoff Simulation",
    description:
      "Test payment scenarios and compare payoff timelines before making a decision so you can pay smarter.",
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

function CapabilityCard({ title, description, index }: { title: string; description: string; index: number }) {
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
      <Link
        href="/register"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#245bff] transition-colors hover:text-[#1640c4]"
      >
        Read more <ArrowRight size={14} />
      </Link>
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
            <div className="h-7 w-7 rounded-full bg-linear-to-br from-[#245bff] to-[#5f8cff]" />
            <span className="font-heading text-sm font-semibold tracking-wide">FINLO</span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <a
                key={item}
                href="#capabilities"
                className="text-sm font-medium text-[#536082] transition-colors hover:text-[#1f3568]"
              >
                {item}
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
          className="relative mt-10 h-55 overflow-hidden rounded-[2.2rem] border border-[#dae1f5] bg-white/80 shadow-[0_18px_60px_rgba(40,72,170,0.14)] sm:h-65"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(72,130,255,0.2),transparent_45%),radial-gradient(circle_at_10%_90%,rgba(106,205,255,0.25),transparent_45%)]" />

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute left-1/2 top-1/2 h-20 w-[92%] max-w-230 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-[999px] border border-[#dce5ff] bg-[linear-gradient(130deg,#ffffff_10%,#e6ebff_38%,#f8f9ff_56%,#cbd7ff_86%)] shadow-[0_18px_35px_rgba(53,84,175,0.2),inset_0_8px_14px_rgba(255,255,255,0.8),inset_0_-8px_14px_rgba(144,163,220,0.25)] sm:h-24"
          >
            <div className="absolute right-[18%] top-[42%] h-7 w-20 -translate-y-1/2 rounded-full bg-white/70 blur-sm sm:h-9 sm:w-28" />
            <div className="absolute left-[22%] top-[45%] h-6 w-18 -translate-y-1/2 rounded-full bg-[#b9c9ff]/50 blur-md sm:h-8 sm:w-24" />
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

        <section id="capabilities" className="mt-20 grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
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
              <CapabilityCard key={item.title} title={item.title} description={item.description} index={index} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
