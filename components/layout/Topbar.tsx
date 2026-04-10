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
    <header className="h-14 border-b border-gray-100 bg-white flex items-center justify-between px-5 sticky top-0 z-100">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-gray-50 text-gray-500"
      >
        <Menu size={18} />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-2xl px-3 py-1.5 hover:bg-gray-50 outline-none transition-colors">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-2xl border-gray-100 shadow-lg p-1.5">
            <DropdownMenuItem disabled className="rounded-xl text-xs text-gray-400 px-3">
              <User size={13} className="mr-2" />
              {session?.user?.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-xl text-red-500 focus:text-red-600 focus:bg-red-50 text-sm px-3"
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
