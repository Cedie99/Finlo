import Link from "next/link";
import { ArrowLeft, ShieldCheck, BarChart3, CreditCard } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute top-40 -right-16 w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 left-20 w-80 h-80 rounded-full bg-white/5" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2 w-fit">
          <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-bold text-xl">Finlo</span>
        </Link>

        {/* Middle content */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-bold leading-tight mb-3">
              Take control of your financial future
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Track installments, manage budgets, and monitor spending — all in one clean dashboard.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: CreditCard, text: "Track all your credit cards & installments" },
              { icon: BarChart3, text: "Real-time reports and spending insights" },
              { icon: ShieldCheck, text: "Secure and private — your data stays yours" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={15} />
                </div>
                <span className="text-sm text-indigo-100">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative text-indigo-300 text-xs">
          © {new Date().getFullYear()} Finlo. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Top nav */}
        <div className="flex items-center justify-between px-8 py-5">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span className="font-bold text-sm">Finlo</span>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 pb-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
