"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { RouteTransition } from "@/components/layout/RouteTransition";
import { FinanceCalculator } from "@/components/shared/FinanceCalculator";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mainRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mainRef.current || !contentRef.current) return;

    const hasNativeScrollableAncestor = (node: EventTarget | null): boolean => {
      let current = node instanceof HTMLElement ? node : null;

      while (current && current !== mainRef.current) {
        const style = window.getComputedStyle(current);
        const canScrollY =
          (style.overflowY === "auto" || style.overflowY === "scroll") &&
          current.scrollHeight > current.clientHeight;
        const canScrollX =
          (style.overflowX === "auto" || style.overflowX === "scroll") &&
          current.scrollWidth > current.clientWidth;

        if (canScrollX || canScrollY) return true;
        current = current.parentElement;
      }

      return false;
    };

    const lenis = new Lenis({
      wrapper: mainRef.current,
      content: contentRef.current,
      eventsTarget: mainRef.current,
      prevent: (node) => hasNativeScrollableAncestor(node),
      autoRaf: false,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.1,
      lerp: 0.09,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };

    rafId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#09090b] text-white">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_75%_10%,rgba(99,102,241,0.07),transparent_55%)]" />

      <Sidebar />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <main ref={mainRef} className="flex-1 overflow-auto pb-24 lg:pb-0">
          <div ref={contentRef} className="w-full px-5 py-6 sm:px-8">
            <RouteTransition>{children}</RouteTransition>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
