"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { getProvidersForType, type ProviderEntry } from "@/lib/data/providerRegistry";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { cn } from "@/lib/utils";

interface ProviderSelectorProps {
  type: "CREDIT_CARD" | "LOAN" | "BNPL";
  value: string;
  onChange: (value: string) => void;
  onProviderSelect: (provider: ProviderEntry | null) => void;
  placeholder?: string;
  className?: string;
}

export function ProviderSelector({
  type,
  value,
  onChange,
  onProviderSelect,
  placeholder,
  className,
}: ProviderSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value ?? "");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const providers = getProvidersForType(type);
  const filtered = query.trim()
    ? providers.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      )
    : providers;

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (value === "" || value == null) setQuery("");
  }, [value]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    onChange(v);
    onProviderSelect(null);
    setOpen(true);
  }

  function handleSelect(provider: ProviderEntry) {
    setQuery(provider.name);
    onChange(provider.name);
    onProviderSelect(provider);
    setOpen(false);
  }

  function handleClear() {
    setQuery("");
    onChange("");
    onProviderSelect(null);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={
            placeholder ??
            (type === "BNPL" ? "Search: Atome, SPayLater, TikTok…" : type === "LOAN" ? "Search: BDO, Pag-IBIG…" : "Search: BPI, BDO…")
          }
          className="dashboard-input h-10 text-sm w-full pl-8 pr-8"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1.5 w-full rounded-2xl border border-white/10 bg-[#0e0e16] shadow-2xl overflow-hidden">
          <div className="max-h-56 overflow-y-auto divide-y divide-white/[0.04]">
            {filtered.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(provider);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-white/[0.05] transition-colors text-left group"
              >
                {/* Logo */}
                <BrandLogo
                  name={provider.id === "other" ? "?" : provider.name}
                  size={28}
                  className="shrink-0 bg-white/[0.06] rounded-lg"
                />

                {/* Name + notes */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white leading-tight">{provider.name}</p>
                  {provider.payLaterDetails ? (
                    <p className="text-[10px] text-white/50 truncate mt-0.5 leading-tight">
                      {provider.payLaterDetails.splitOptions.length > 1
                        ? `${provider.payLaterDetails.splitOptions.join("/")}mo splits`
                        : `${provider.payLaterDetails.splitOptions[0]}mo`}
                      {provider.payLaterDetails.deferralDays != null &&
                        ` · ${provider.payLaterDetails.deferralDays}-day 0% option`}
                    </p>
                  ) : provider.notes ? (
                    <p className="text-[10px] text-white/50 truncate mt-0.5 leading-tight">{provider.notes}</p>
                  ) : null}
                </div>

                {/* Rate badges */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {provider.interestRate > 0 ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-medium whitespace-nowrap">
                      {provider.interestRate}%/mo
                    </span>
                  ) : provider.id !== "other" ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                      0% interest
                    </span>
                  ) : null}
                  {provider.processingFeePercent != null && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium whitespace-nowrap">
                      +{provider.processingFeePercent}% fee
                    </span>
                  )}
                  {provider.payLaterDetails?.serviceFeePercent != null && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium whitespace-nowrap">
                      +{provider.payLaterDetails.serviceFeePercent}% svc fee
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="px-3.5 py-2 border-t border-white/[0.06] text-[10px] text-white/45 flex items-center gap-1.5">
            <Sparkles size={9} />
            Selecting a provider auto-fills rates — always verify with your provider
          </div>
        </div>
      )}
    </div>
  );
}

export function AutoFilledBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 text-[#b4f03a]/70 text-[10px]">
      <Sparkles size={9} />
      <span className="font-normal tracking-tight">auto</span>
    </span>
  );
}
