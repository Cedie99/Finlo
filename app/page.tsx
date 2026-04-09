"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  ListChecks,
  PiggyBank,
  BarChart3,
  ArrowLeftRight,
  TrendingUp,
  ShieldCheck,
  Bell,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Zap,
  Users,
  Star,
} from "lucide-react";

/* ─── Animation variants ─────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Data ────────────────────────────────────────────── */
const navLinks = ["Features", "How It Works", "FAQ"];

const features = [
  {
    icon: CreditCard,
    color: "bg-indigo-100 text-indigo-600",
    title: "Credit Card Tracking",
    desc: "Manage multiple credit cards, monitor balances, billing cycles, and due dates — all in one dashboard.",
    mockup: <CreditMockup />,
  },
  {
    icon: ListChecks,
    color: "bg-violet-100 text-violet-600",
    title: "Installment Plans",
    desc: "Track every BNPL, loan, and installment plan with real-time progress bars and upcoming due alerts.",
    mockup: <InstallmentMockup />,
  },
  {
    icon: PiggyBank,
    color: "bg-purple-100 text-purple-600",
    title: "Budget & Spending",
    desc: "Set category limits, visualize spending, and stay within your budget every single month.",
    mockup: <BudgetMockup />,
  },
];

const whyTrust = [
  { icon: ShieldCheck, title: "Secure & Private", desc: "Your financial data is encrypted and never shared with third parties." },
  { icon: BarChart3, title: "Real-Time Insights", desc: "Up-to-date reports and dashboard charts that reflect every transaction instantly." },
  { icon: Bell, title: "Stay on Top of Budgets", desc: "Set smart budget limits and get a clear picture before you overspend." },
];

const steps = [
  { icon: Users, step: "01", title: "Create Your Free Account", desc: "Sign up instantly and securely. No credit card required — start in seconds." },
  { icon: TrendingUp, step: "02", title: "See Smart Reports, Instantly", desc: "Automated reports and charts that help you understand your finances at a glance." },
  { icon: PiggyBank, step: "03", title: "Track Spending & Stay on Budget", desc: "Visualize your expenses, set clear budget goals, and never lose track of where money goes." },
];

const faqs = [
  { q: "Is Finlo free to use?", a: "Yes, Finlo is completely free. Create an account and start tracking your finances right away with no hidden fees." },
  { q: "What kinds of installments can I track?", a: "You can track credit card installments, personal loans, buy-now-pay-later (BNPL) plans, and any recurring payment split over time." },
  { q: "Can I manage multiple credit cards?", a: "Absolutely. Add as many credit cards as you need, each with their own billing cycle, limit, and balance tracking." },
  { q: "Is my financial data safe?", a: "Yes. Your data is stored securely with industry-standard encryption. We never sell or share your personal information." },
  { q: "Do I need technical skills to use Finlo?", a: "Not at all. Finlo is designed to be simple and intuitive — if you can use a notes app, you can use Finlo." },
];

const trustedLogos = ["Metrobank", "BDO", "BPI", "GCash", "Maya", "UnionBank"];

/* ─── Mockup components ───────────────────────────────── */
function CreditMockup() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white shadow-lg shadow-indigo-200 w-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-indigo-200 text-xs mb-1">Credit Limit</p>
          <p className="text-2xl font-bold">₱50,000</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <CreditCard size={16} />
        </div>
      </div>
      <div className="flex gap-1 mb-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full bg-white/30" />
        ))}
        <div className="h-1.5 flex-1 rounded-full bg-white/10" />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-indigo-200">BDO Visa Platinum</span>
        <span>•••• 4821</span>
      </div>
    </div>
  );
}

function InstallmentMockup() {
  const items = [
    { label: "iPhone 16 Pro", amount: "₱4,166", progress: 60, color: "bg-violet-500" },
    { label: "Laptop Loan", amount: "₱2,500", progress: 35, color: "bg-indigo-500" },
    { label: "Appliance BNPL", amount: "₱1,800", progress: 80, color: "bg-purple-500" },
  ];
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm w-full space-y-3">
      {items.map(({ label, amount, progress, color }) => (
        <div key={label}>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium text-gray-700">{label}</span>
            <span className="text-gray-500">{amount}/mo</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${progress}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function BudgetMockup() {
  const cats = [
    { label: "Food & Dining", used: 70, color: "bg-amber-400" },
    { label: "Shopping", used: 45, color: "bg-indigo-400" },
    { label: "Transport", used: 90, color: "bg-red-400" },
  ];
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm w-full space-y-3">
      {cats.map(({ label, used, color }) => (
        <div key={label}>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium text-gray-700">{label}</span>
            <span className="text-gray-500">{used}% used</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${used}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── FAQ Item ────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-gray-100 rounded-2xl overflow-hidden cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <span className="font-medium text-gray-800 dark:text-gray-100 text-sm">{q}</span>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-4 transition-colors ${open ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}`}>
          {open ? <Minus size={12} /> : <Plus size={12} />}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────── */
export default function LandingPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name;
  const initials = userName
    ? userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : null;

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── Navbar ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-lg">Finlo</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {userName ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-semibold">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{userName}</span>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full transition-colors"
                >
                  Dashboard <ChevronRight size={14} />
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full transition-colors"
                >
                  Get Started <ChevronRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-indigo-50/60 to-white pt-20 pb-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={0}
              className="inline-flex items-center gap-2 bg-white border border-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 shadow-sm"
            >
              <Zap size={12} /> Your Money, Your Control
            </motion.div>

            <motion.h1
              variants={fadeUp} initial="hidden" animate="visible" custom={1}
              className="text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
            >
              Take Control of Your{" "}
              <span className="text-indigo-600">Financial Future</span>
            </motion.h1>

            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md"
            >
              Track your spending, manage installments, and save smarter — all in one easy-to-use app.
            </motion.p>

            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={3}
              className="flex flex-wrap gap-3 mb-10"
            >
              <Link
                href="/register"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-lg shadow-indigo-200"
              >
                Start for Free <ChevronRight size={16} />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 text-gray-700 border border-gray-200 hover:border-indigo-200 bg-white font-semibold px-6 py-3 rounded-full transition-colors"
              >
                Sign in
              </Link>
            </motion.div>

            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" custom={4}
              className="text-xs text-gray-400 flex items-center gap-1"
            >
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="ml-1">Trusted by thousands of users</span>
            </motion.p>
          </div>

          {/* Right — dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100 border border-gray-100 p-5 space-y-4">
              {/* Mock topbar */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                <span className="font-bold text-gray-800 text-sm">Dashboard</span>
                <span className="text-xs text-gray-400">April 2026</span>
              </div>
              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Income", value: "₱28,000", color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Expenses", value: "₱12,400", color: "text-red-500", bg: "bg-red-50" },
                  { label: "Savings", value: "₱15,600", color: "text-indigo-600", bg: "bg-indigo-50" },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-2xl p-3`}>
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className={`font-bold text-sm ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
              {/* Recent transactions */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent Transactions</p>
                {[
                  { name: "Grab Food", amount: "-₱350", date: "Today" },
                  { name: "Salary", amount: "+₱28,000", date: "Apr 1" },
                  { name: "Netflix", amount: "-₱549", date: "Mar 30" },
                  { name: "SM Installment", amount: "-₱2,500", date: "Mar 28" },
                ].map(({ name, amount, date }) => (
                  <div key={name} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        {name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">{name}</p>
                        <p className="text-xs text-gray-400">{date}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold ${amount.startsWith("+") ? "text-emerald-600" : "text-gray-700"}`}>
                      {amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2"
            >
              <div className="w-7 h-7 bg-emerald-50 rounded-full flex items-center justify-center">
                <TrendingUp size={14} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">Savings up 12%</p>
                <p className="text-xs text-gray-400">vs last month</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-indigo-600 rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-2"
            >
              <Bell size={14} className="text-white" />
              <p className="text-xs font-semibold text-white">Payment due in 3 days</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Trusted by ── */}
      <section className="border-y border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs text-gray-400 uppercase tracking-widest font-semibold mb-6">Works with your bank &amp; wallet</p>
          <div className="flex flex-wrap justify-center gap-8">
            {trustedLogos.map((name) => (
              <span key={name} className="text-gray-300 font-bold text-sm tracking-wide">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-indigo-600 text-xs font-semibold uppercase tracking-widest mb-3">Simple. Smart. Financial Control</p>
            <h2 className="text-4xl font-bold mb-4">Powerful Features to Take Control<br />of Your Finances</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-base">
              Manage your finances with Finlo. Monitor expenses, save efficiently — all within a user-friendly app.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, color, title, desc, mockup }, i) => (
              <motion.div
                key={title}
                variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} custom={i}
                whileHover={{ y: -4 }}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center mb-4`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{desc}</p>
                {mockup}
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-lg shadow-indigo-100"
            >
              Explore All Features <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Trust ── */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-indigo-600 text-xs font-semibold uppercase tracking-widest mb-3">Why Choose Finlo</p>
            <h2 className="text-4xl font-bold">Why Thousands Trust Finlo</h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto text-sm">Experience a smarter, more personal financial management tool built for simplicity.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {whyTrust.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} custom={i}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                  <Icon size={22} className="text-indigo-600" />
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-8 text-white"
          >
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-4">How It Works</p>
            <div className="space-y-4">
              {[
                { label: "Transactions", items: ["Parents  +₱50.00", "Peet's Coffee  -₱6.80", "Ali & Nino  -₱21.40"] },
              ].map(({ label, items }) => (
                <div key={label} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <p className="font-semibold text-sm mb-3">{label}</p>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const isPos = item.includes("+");
                      return (
                        <div key={item} className="flex justify-between text-xs">
                          <span className="text-indigo-100">{item.split("  ")[0]}</span>
                          <span className={isPos ? "text-emerald-300" : "text-red-300"}>{item.split("  ")[1]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-xs text-indigo-200 mb-1">Monthly Budget Used</p>
                <p className="text-2xl font-bold mb-2">68%</p>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full w-[68%]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — steps */}
          <div>
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              <p className="text-indigo-600 text-xs font-semibold uppercase tracking-widest mb-3">How It Works</p>
              <h2 className="text-4xl font-bold mb-3">Manage Your Finances in<br />3 Simple Steps</h2>
              <p className="text-gray-500 text-sm mb-10">It&apos;s quick, easy, and stress-free to stay on top of your money — no technical skills required.</p>
            </motion.div>

            <div className="space-y-6">
              {steps.map(({ icon: Icon, step, title, desc }, i) => (
                <motion.div
                  key={step}
                  variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }} custom={i}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base mb-1">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-gray-50 py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-indigo-600 text-xs font-semibold uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-4xl font-bold mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-sm">Got questions? We&apos;ve got answers to help you make the most out of Finlo.</p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <motion.div
                key={q}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              >
                <FaqItem q={q} a={a} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl px-10 py-16 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute rounded-full bg-white" style={{ width: `${80 + i * 40}px`, height: `${80 + i * 40}px`, top: `${10 + i * 8}%`, left: `${5 + i * 15}%`, opacity: 0.3 }} />
              ))}
            </div>
            <div className="relative">
              <ShieldCheck size={40} className="mx-auto mb-4 text-indigo-200" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Ready to Take Control?</h2>
              <p className="text-indigo-200 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                Join Finlo and stop stressing about missed payments and overspending. It&apos;s free to get started.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-8 py-3.5 rounded-full transition-colors shadow-xl"
              >
                Create Your Free Account <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-xs">F</span>
                </div>
                <span className="font-bold">Finlo</span>
              </Link>
              <p className="text-gray-400 text-xs leading-relaxed">Your personal finance companion for installments, budgets, and more.</p>
            </div>

            {[
              { heading: "Features", links: ["Credit Cards", "Installments", "Budget", "Reports"] },
              { heading: "Resources", links: ["How It Works", "FAQ"] },
              { heading: "Company", links: ["About", "Contact"] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p className="font-semibold text-sm mb-3 text-gray-700">{heading}</p>
                <ul className="space-y-2">
                  {links.map((l) => (
                    <li key={l}>
                      <Link href="/register" className="text-gray-400 hover:text-gray-700 text-sm transition-colors">{l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} Finlo. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Sign in</Link>
              <Link href="/register" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
