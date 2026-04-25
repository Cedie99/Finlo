"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  Calendar,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/installments", label: "My Debt", icon: CreditCard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/payoff-race", label: "Strategy", icon: Trophy },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/[0.07] bg-[#0a0a0f]/95 backdrop-blur-md lg:hidden">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors",
                isActive ? "text-[#b4f03a]" : "text-white/30"
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
              {isActive && (
                <span className="mt-0.5 h-0.5 w-4 rounded-full bg-[#b4f03a]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
