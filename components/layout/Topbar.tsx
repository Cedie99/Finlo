"use client";

import { Menu, LogOut, User, Search, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { data: session } = useSession();
  const name = session?.user?.name || "User";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center border-b border-white/[0.06] bg-[#0c0c10]/90 px-5 backdrop-blur-md">
      {/* Mobile hamburger — left */}
      <button
        onClick={onMenuClick}
        className="mr-3 rounded-xl p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
      >
        <Menu size={18} />
      </button>

      {/* Search bar — left on desktop */}
      <div className="hidden lg:flex items-center gap-2.5 w-64 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2 transition-colors focus-within:border-white/[0.12]">
        <Search size={14} className="shrink-0 text-white/30" />
        <input
          type="text"
          placeholder="Search anything..."
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
        />
        <kbd className="inline-flex items-center rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-xs font-semibold text-white/40">
          ⌘K
        </kbd>
      </div>

      {/* Spacer — always pushes right items to the edge */}
      <div className="flex-1" />

      {/* Right side: add button + notification + user — always top-right */}
      <div className="flex items-center gap-2">
        <Link href="/installments?add=true">
          <button className="hidden items-center gap-1.5 rounded-full bg-[#b4f03a] px-3.5 py-1.5 text-xs font-bold text-black transition-colors hover:bg-[#ccff52] sm:flex">
            <Plus size={14} strokeWidth={2.5} />
            Add installment
          </button>
        </Link>
        <NotificationCenter />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl border border-transparent px-2.5 py-1.5 outline-none transition-colors hover:border-white/[0.06] hover:bg-white/[0.04]">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#b4f03a]/15 text-xs font-bold text-[#b4f03a]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start sm:flex">
              <span className="text-sm font-semibold text-white leading-tight">{name}</span>
              <span className="text-xs text-white/50 leading-tight">Finlo Member</span>
            </div>
            <ChevronDown size={13} className="hidden text-white/40 sm:block" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-52 rounded-xl border-white/[0.06] bg-[#111118] p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
          >
            <DropdownMenuItem disabled className="rounded-lg px-3 text-xs text-white/50">
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
      </div>
    </header>
  );
}
