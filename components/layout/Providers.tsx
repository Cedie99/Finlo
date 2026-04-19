"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { Toaster } from "sileo";
import Lenis from "lenis";
import "sileo/styles.css";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
            refetchOnWindowFocus: true,
            refetchOnMount: true,
            retry: 1,
          },
        },
      })
  );

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.1,
      lerp: 0.09,
      allowNestedScroll: true,
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
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-center" theme="system" />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
