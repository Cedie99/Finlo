"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  ListChecks,
  PiggyBank,
  ArrowLeftRight,
  BarChart3,
  Settings,
  Trophy,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FinloLogo } from "@/components/layout/FinloLogo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/credit-cards", label: "Credit Cards", icon: CreditCard },
  { href: "/installments", label: "Installments", icon: ListChecks },
  { href: "/payoff-race", label: "Payoff Race", icon: Trophy },
  { href: "/budget", label: "Budget", icon: PiggyBank },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 border-r border-[#dbe3f9] bg-white/85 backdrop-blur-md z-40 transition-transform duration-300 flex flex-col",
          "lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-[#e1e7f9]">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <FinloLogo size="md" />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[#eef3ff] text-[#6e7ca0]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#245bff] text-white shadow-[0_12px_26px_rgba(36,91,255,0.25)]"
                    : "text-[#5d6b8c] hover:bg-[#edf2ff] hover:text-[#1e355f]"
                )}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom hint */}
        <div className="p-4 border-t border-[#e1e7f9]">
          <div className="rounded-xl border border-[#d8e1ff] bg-[#edf2ff] p-3 text-xs text-[#2d53c9] font-medium text-center">
            Your finances, under control.
          </div>
        </div>
      </aside>
    </>
  );
}
