"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { RouteTransition } from "@/components/layout/RouteTransition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#f6f8ff] text-[#151d34]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_12%,rgba(45,95,255,0.12),transparent_40%),radial-gradient(circle_at_8%_90%,rgba(64,186,255,0.11),transparent_44%)]" />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="relative z-10 flex flex-col flex-1 min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 pb-24 lg:pb-5">
          <div className="max-w-6xl mx-auto">
            <RouteTransition>{children}</RouteTransition>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
