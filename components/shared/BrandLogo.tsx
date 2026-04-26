"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Google Favicon Service is the most reliable free source.
// Format: https://www.google.com/s2/favicons?domain=DOMAIN&sz=64
// Fallback: DuckDuckGo favicon proxy
function g(domain: string): string[] {
  return [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  ];
}

const BRAND_LOGO_SOURCES: Array<{ keywords: string[]; sources: string[] }> = [
  // ── Credit Cards ─────────────────────────────────────────────────────────
  { keywords: ["bpi", "bank of the philippine islands"], sources: g("bpi.com.ph") },
  { keywords: ["bdo", "banco de oro", "bdounibank"],     sources: g("bdo.com.ph") },
  { keywords: ["metrobank", "metropolitan bank"],         sources: g("metrobank.com.ph") },
  { keywords: ["rcbc", "rizal commercial banking"],       sources: g("rcbc.com") },
  { keywords: ["unionbank", "union bank", "ubp"],         sources: g("unionbankph.com") },
  { keywords: ["security bank", "securitybank"],          sources: g("securitybank.com") },
  { keywords: ["eastwest", "east west bank"],             sources: g("eastwestbanker.com") },
  { keywords: ["pnb", "philippine national bank"],        sources: g("pnb.com.ph") },
  { keywords: ["chinabank", "china bank", "cbc"],         sources: g("chinabank.ph") },

  // ── BNPL ─────────────────────────────────────────────────────────────────
  { keywords: ["atome"],                sources: g("atome.ph") },
  { keywords: ["billease", "bill ease"], sources: g("billease.ph") },
  { keywords: ["akulaku"],              sources: g("akulaku.com") },
  { keywords: ["tendopay", "tendo pay"], sources: g("tendopay.ph") },
  { keywords: ["cashalo"],              sources: g("cashalo.com") },
  { keywords: ["tala"],                 sources: g("tala.co") },
  { keywords: ["tonik"],                sources: g("tonikbank.com") },

  // ── Loans ────────────────────────────────────────────────────────────────
  { keywords: ["sss", "social security system"],      sources: g("sss.gov.ph") },
  { keywords: ["pag-ibig", "pagibig", "hdmf"],        sources: g("pagibigfund.gov.ph") },
  { keywords: ["home credit"],                        sources: g("homecredit.ph") },
  { keywords: ["juanhand", "juan hand"],              sources: g("juanhand.com") },
  { keywords: ["gcash", "g cash", "gloan"],           sources: g("gcash.com") },
  { keywords: ["robinsons bank", "robinson bank"],    sources: g("robinsonsbank.com.ph") },
  { keywords: ["cimb"],                               sources: g("cimbbank.com.ph") },

  // ── Others ───────────────────────────────────────────────────────────────
  { keywords: ["maya"],                sources: g("maya.ph") },
  { keywords: ["spaylater", "shopee"], sources: g("shopee.ph") },
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
