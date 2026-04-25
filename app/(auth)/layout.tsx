import Link from "next/link";
import { ArrowLeft, ShieldCheck, BarChart3, CreditCard } from "lucide-react";
import { RouteTransition } from "@/components/layout/RouteTransition";
import { FinloLogo } from "@/components/layout/FinloLogo";

const features = [
  { icon: CreditCard, text: "Track cards, loans, and BNPL in one unified timeline" },
  { icon: BarChart3, text: "See cash flow and payment risk before it hits you" },
  { icon: ShieldCheck, text: "Private by default — your data stays encrypted" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09090b] text-white">
      {/* Subtle radial glow — matches dashboard */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_75%_10%,rgba(99,102,241,0.07),transparent_55%)]" />

      <div className="relative z-10 flex min-h-screen">
        {/* ── Left panel: branding ── */}
        <div className="hidden lg:flex lg:w-[52%] shrink-0 flex-col justify-between border-r border-white/[0.07] p-12 xl:p-16">
          <Link href="/" className="flex w-fit items-center gap-2.5">
            <FinloLogo
              size="lg"
              markClassName="[filter:brightness(0)_invert(1)]"
              wordmarkClassName="text-white"
            />
          </Link>

          <div className="max-w-md">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#b4f03a]">
              Your financial command center
            </p>
            <h2 className="font-heading text-[3.2rem] leading-[1.0] text-white">
              Budget better,
              <br />
              pay{" "}
              <span className="text-[#b4f03a]">smarter</span>.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/50">
              Stay on top of every installment, avoid due-date pileups, and get a daily
              safe-to-spend signal based on your actual commitments.
            </p>

            <div className="mt-10 space-y-3">
              {features.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-[#111118] p-4"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#b4f03a]/10 text-[#b4f03a]">
                    <Icon size={16} />
                  </div>
                  <span className="text-sm leading-relaxed text-[#b0c8b0]">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/30">© {new Date().getFullYear()} Finlo. All rights reserved.</p>
        </div>

        {/* ── Right panel: form ── */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4 sm:px-10">
            {/* Mobile logo */}
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <FinloLogo
                size="sm"
                markClassName="[filter:brightness(0)_invert(1)]"
                wordmarkClassName="text-white"
              />
            </Link>
            <div className="hidden lg:block" />

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50 transition-colors hover:text-white"
            >
              <ArrowLeft size={12} />
              Back to home
            </Link>
          </div>

          {/* Centered form */}
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
            <div className="w-full max-w-[420px]">
              <RouteTransition>{children}</RouteTransition>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
