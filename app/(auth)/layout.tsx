import Link from "next/link";
import { ArrowRight, ShieldCheck, BarChart3, CreditCard } from "lucide-react";
import { RouteTransition } from "@/components/layout/RouteTransition";
import { FinloLogo } from "@/components/layout/FinloLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f8ff] text-[#151d34]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_8%,rgba(45,95,255,0.14),transparent_40%),radial-gradient(circle_at_15%_92%,rgba(64,186,255,0.14),transparent_44%)]" />

      <div className="relative z-10 flex min-h-screen lg:gap-8 xl:gap-10">
        <div className="hidden lg:flex lg:w-[48%] flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <FinloLogo size="lg" />
          </Link>

          <div className="max-w-lg rounded-[2rem] border border-[#d8dff5] bg-white/80 p-10 backdrop-blur-md shadow-[0_24px_70px_rgba(45,78,175,0.13)] lg:ml-auto">
            <h2 className="font-heading text-4xl leading-tight text-[#111c36]">
              Budget better,
              <br />
              pay smarter.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#5f6b89]">
              Stay on top of installments, avoid due-date pileups, and get a daily safe-to-spend signal based on your actual commitments.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: CreditCard, text: "Track cards, loans, and BNPL in one timeline" },
                { icon: BarChart3, text: "See cash flow and payment risk before it happens" },
                { icon: ShieldCheck, text: "Private by default with encrypted financial records" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3 rounded-xl border border-[#e1e7f9] bg-white/85 p-3">
                  <div className="mt-0.5 h-8 w-8 rounded-lg bg-[#ebf0ff] text-[#2b59e8] flex items-center justify-center shrink-0">
                    <Icon size={15} />
                  </div>
                  <span className="text-sm text-[#324367] leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#65739a]">© {new Date().getFullYear()} Finlo. All rights reserved.</p>
        </div>

        <div className="flex-1 flex flex-col lg:pr-10">
          <div className="flex items-center justify-end px-6 py-5 sm:px-8">
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <FinloLogo size="sm" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-14 sm:px-8 lg:items-start lg:pl-2">
            <div className="w-full max-w-md">
              <RouteTransition>{children}</RouteTransition>
            </div>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-[#667598] transition-colors hover:text-[#24406d]"
            >
              Home <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
