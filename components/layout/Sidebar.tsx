"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  Trophy,
  Calendar,
  ChevronDown,
  LogOut,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FinloLogo } from "@/components/layout/FinloLogo";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AffordItChecker } from "@/components/dashboard/AffordItChecker";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/installments", label: "My Debt", icon: CreditCard },
  { href: "/calendar", label: "Payment Calendar", icon: Calendar },
  { href: "/payoff-race", label: "Payoff Strategy", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const name = session?.user?.name || "User";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r border-white/[0.06] bg-[#0c0c10] transition-transform duration-300",
          "lg:static lg:z-auto lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-5">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <FinloLogo
              size="md"
              markClassName="[filter:brightness(0)_invert(1)]"
              wordmarkClassName="text-white"
            />
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
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
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#b4f03a]/10 text-[#b4f03a]"
                    : "text-white/45 hover:bg-white/[0.05] hover:text-white"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[#b4f03a]" />
                )}
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/[0.06]">
          <DropdownMenu>
            <DropdownMenuTrigger className="mb-3 flex w-full items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-2.5 py-2 outline-none transition-colors hover:border-white/[0.12] hover:bg-white/[0.05]">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#b4f03a]/15 text-xs font-bold text-[#b4f03a]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-semibold text-white leading-tight">{name}</p>
                <p className="truncate text-[10px] text-white/35 leading-tight">Finlo Member</p>
              </div>
              <ChevronDown size={13} className="text-white/25" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="top"
              align="start"
              className="w-52 rounded-xl border-white/[0.06] bg-[#111118] p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
            >
              <DropdownMenuItem disabled className="rounded-lg px-3 text-xs text-white/35">
                <User size={13} className="mr-2" />
                {session?.user?.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-white/[0.06]" />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-lg px-3 text-sm text-red-400 focus:bg-red-500/10 focus:text-red-400"
              >
                <LogOut size={13} className="mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bottom tagline */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-center text-xs font-medium text-white/40">
            Your finances, under control.
          </div>
        </div>
      </aside>
    </>
  );
}
