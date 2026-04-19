"use client";

import { Menu, LogOut, User } from "lucide-react";
import { NotificationBell } from "@/components/layout/NotificationBell";
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
    <header className="h-16 border-b border-[#d8e3df] bg-white/75 backdrop-blur-md flex items-center justify-between px-5 sticky top-0 z-100">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-[#edf5f2] text-[#5c726d]"
      >
        <Menu size={18} />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 hover:bg-[#edf5f2] outline-none transition-colors border border-transparent hover:border-[#d5e6e2]">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-xs bg-linear-to-br from-[#2f7f76] to-[#6aaea7] text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-[#1f5c55] hidden sm:block">{name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl border-[#d1e3df] bg-white shadow-[0_20px_35px_rgba(24,73,67,0.12)] p-1.5">
            <DropdownMenuItem disabled className="rounded-lg text-xs text-[#6b807b] px-3">
              <User size={13} className="mr-2" />
              {session?.user?.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-lg text-red-500 focus:text-red-600 focus:bg-red-50 text-sm px-3"
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
