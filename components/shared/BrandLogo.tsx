"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const BRAND_LOGO_SOURCES: Array<{ keywords: string[]; sources: string[] }> = [
  {
    keywords: ["bpi", "bank of the philippine islands", "bpi bank"],
    sources: [
      "https://logo.clearbit.com/bpi.com.ph",
      "https://logo.clearbit.com/www.bpi.com.ph",
      "https://icons.duckduckgo.com/ip3/bpi.com.ph.ico",
    ],
  },
  {
    keywords: ["bdo", "banco de oro", "bdo bank", "bdounibank"],
    sources: [
      "https://logo.clearbit.com/bdo.com.ph",
      "https://logo.clearbit.com/www.bdo.com.ph",
      "https://icons.duckduckgo.com/ip3/bdo.com.ph.ico",
    ],
  },
  {
    keywords: ["metrobank", "metropolitan bank", "metro bank"],
    sources: [
      "https://logo.clearbit.com/metrobank.com.ph",
      "https://icons.duckduckgo.com/ip3/metrobank.com.ph.ico",
    ],
  },
  {
    keywords: ["rcbc", "rizal commercial banking"],
    sources: [
      "https://logo.clearbit.com/rcbc.com",
      "https://icons.duckduckgo.com/ip3/rcbc.com.ico",
    ],
  },
  {
    keywords: ["unionbank", "union bank", "ubp"],
    sources: [
      "https://logo.clearbit.com/unionbankph.com",
      "https://icons.duckduckgo.com/ip3/unionbankph.com.ico",
    ],
  },
  {
    keywords: ["security bank", "securitybank"],
    sources: [
      "https://logo.clearbit.com/securitybank.com",
      "https://icons.duckduckgo.com/ip3/securitybank.com.ico",
    ],
  },
  {
    keywords: ["atome"],
    sources: [
      "https://logo.clearbit.com/atome.ph",
      "https://icons.duckduckgo.com/ip3/atome.ph.ico",
    ],
  },
  {
    keywords: ["billease", "bill ease"],
    sources: [
      "https://logo.clearbit.com/billease.ph",
      "https://icons.duckduckgo.com/ip3/billease.ph.ico",
    ],
  },
  {
    keywords: ["spaylater", "spay", "shopee"],
    sources: [
      "https://logo.clearbit.com/shopee.ph",
      "https://icons.duckduckgo.com/ip3/shopee.ph.ico",
    ],
  },
  {
    keywords: ["home credit"],
    sources: [
      "https://logo.clearbit.com/homecredit.ph",
      "https://icons.duckduckgo.com/ip3/homecredit.ph.ico",
    ],
  },
  {
    keywords: ["maya"],
    sources: [
      "https://logo.clearbit.com/maya.ph",
      "https://icons.duckduckgo.com/ip3/maya.ph.ico",
    ],
  },
  {
    keywords: ["gcash", "g cash"],
    sources: [
      "https://logo.clearbit.com/gcash.com",
      "https://icons.duckduckgo.com/ip3/gcash.com.ico",
    ],
  },
];

function normalizeBrandText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function resolveBrandLogos(name: string): string[] {
  const normalized = normalizeBrandText(name);

  const match = BRAND_LOGO_SOURCES.find((item) =>
    item.keywords.some((kw) => normalized.includes(normalizeBrandText(kw)))
  );

  return match?.sources ?? [];
}

function getInitials(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "");

  return parts.join("") || "?";
}

interface BrandLogoProps {
  name: string;
  size?: number;
  className?: string;
}

export function BrandLogo({ name, size = 16, className }: BrandLogoProps) {
  const sources = resolveBrandLogos(name);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [hasImage, setHasImage] = useState(true);
  const activeSource = hasImage ? (sources[sourceIndex] ?? null) : null;

  useEffect(() => {
    setSourceIndex(0);
    setHasImage(true);
  }, [name]);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/8 text-[9px] font-bold text-white/75",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span>{getInitials(name)}</span>
      {activeSource && (
        <img
          src={activeSource}
          alt={`${name} logo`}
          className="absolute inset-0 h-full w-full rounded-full bg-white object-cover"
          loading="lazy"
          onError={() => {
            if (sourceIndex < sources.length - 1) {
              setSourceIndex((prev) => prev + 1);
            } else {
              setHasImage(false);
            }
          }}
        />
      )}
    </span>
  );
}
